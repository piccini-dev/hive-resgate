// Serviço de CONTEÚDOS SEQUENCIAIS (Fase 4 · etapa A — docs/identidade/Hive_Conteudos_Sequenciais_v1.md).
// post_units é a fonte canônica da peça; rendered_slides/carousel_fabric_json são projeção
// (sync_unit_projection). Roteiro aprovado antes do visual; produção página a página com
// retomada (só pendentes/desatualizadas/falhas); mudanças depois do roteiro aprovado viram
// CANDIDATOS (apply_unit_candidate valida escopo e preservação no banco); aprovação final só com a
// sequência completa (approve_sequence); exportação = o MESMO pacote aprovado (versão).
import JSZip from 'jszip';
import { organizeLayerDiagram } from '@/lib/hive/diagramConnections';
import type { EditorSnapshot } from '@/lib/editorSnapshot';
import { jsPDF } from 'jspdf';
import { db } from '@/lib/db';
import { needsSequenceRender, sequenceReviewSnapshot } from './visual-state';
import { edge, type HiveSeed } from '@/lib/edge';
import { generateHiveImage } from '@/lib/hive/runVisual';
import { loadHiveDesign } from '@/lib/hive/loadDesign';
import { composeSequencePage, DEFAULT_DIRECTION, type SequenceDirection } from '@/lib/hive/composeSequence';
import { renderFabricToDataUrl } from '@/lib/templates/renderPost';
import { uploadAssetImage } from '@/lib/storage';
import { MEDIA_BUCKET, supabase } from '@/lib/supabase';
import { imageKind } from '@/lib/campaign/produce';
import type { CampaignCycle, Content, FormatCapability, PiecePlan, PostUnit, SequenceExport, UserPost } from '@/types';
import { registerManualPublication } from '@/lib/approval';
import { pageTextFromCanvas, reflowEditedPage } from './editing';
import { pageElements, revisePagePart } from './pageRevision';
import { partFields, readRevision, revisionText, type PartRequest } from './assistedRevision';

export const ARCHITECTURE_LABELS: Record<string, string> = {
  historia: 'História e aprendizagem', perspectiva: 'Mudança de perspectiva', conceito: 'Exploração de conceito',
  caso: 'Caso e leitura sistêmica', experimento: 'Experimentação',
};
export const FORMAT_LABELS: Record<string, string> = { image: 'Imagem única', carousel: 'Carrossel', story: 'Stories', reel: 'Reels' };

let _caps: FormatCapability[] | null = null;
export async function capabilities(): Promise<FormatCapability[]> {
  if (!_caps) _caps = await db.select<FormatCapability>('format_capabilities', {});
  return _caps;
}
export const capOf = (caps: FormatCapability[], platform: string, format: string) => caps.find((c) => c.platform === platform && c.format === format);

export const directionOf = (p: UserPost): SequenceDirection => ({ ...DEFAULT_DIRECTION, ...((p.visual_direction ?? {}) as Partial<SequenceDirection>) });

// ---------------- plano de peças ----------------
export const planApi = {
  async byCycle(cycleId: string): Promise<PiecePlan[]> {
    return db.select<PiecePlan>('content_piece_plans', { cycle_id: `eq.${cycleId}`, order: 'position.asc,created_at.asc' });
  },
  async add(userId: string, content: Content, p: Pick<PiecePlan, 'account_id' | 'platform' | 'format'> & Partial<Pick<PiecePlan, 'approach' | 'purpose' | 'architecture' | 'origin'>>): Promise<PiecePlan> {
    const [row] = await db.insert<PiecePlan>('content_piece_plans', {
      user_id: userId, content_id: content.id, campaign_id: content.campaign_id ?? null, cycle_id: content.cycle_id ?? null,
      account_id: p.account_id, platform: p.platform, format: p.format, approach: p.approach ?? null, purpose: p.purpose ?? null,
      architecture: p.architecture ?? null, origin: p.origin ?? 'user', status: 'planned',
    });
    if (!row) throw new Error('Não foi possível planejar a peça.');
    return row;
  },
  // Remover: peça ainda não aprovada é arquivada; aprovada/agendada/publicada não some do plano.
  async remove(plan: PiecePlan, piece?: UserPost | null): Promise<void> {
    if (piece && ['approved', 'scheduled', 'published'].includes(piece.status)) throw new Error('Esta peça já foi aprovada: desfaça a aprovação/agendamento antes de remover do plano.');
    if (piece) await db.update('user_posts', { id: `eq.${piece.id}` }, { status: 'archived' });
    await db.update('content_piece_plans', { id: `eq.${plan.id}` }, { status: 'removed' });
  },
  async recommend(contentId: string) {
    return (await edge.sequenceScript<{ plans: Array<Pick<PiecePlan, 'account_id' | 'platform' | 'format' | 'approach' | 'purpose' | 'architecture'>> }>({ action: 'recommend_plan', content_id: contentId })).plans;
  },
};

// Peça de sequência a partir do plano: nasce com roteiro em rascunho (visual só depois do roteiro aprovado).
export async function createSequencePiece(cycle: CampaignCycle, plan: PiecePlan, content: Content, signature?: string | null): Promise<UserPost> {
  const [piece] = await db.insert<UserPost>('user_posts', {
    user_id: cycle.user_id, platform: plan.platform, format: plan.format, status: 'pending_approval', title: content.title, caption: '',
    content_id: content.id, campaign_id: content.campaign_id, cycle_id: content.cycle_id, account_id: plan.account_id, piece_role: 'unfold',
    plan_id: plan.id, script_status: 'draft', narrative_architecture: plan.architecture, source_content_at: content.updated_at,
    visual_direction: { ...DEFAULT_DIRECTION, signature: signature ?? null }, text_approved: false,
    metadata: { editorial_slug: content.editorial_slug, review_stage: 'script' },
  });
  if (!piece) throw new Error('Não foi possível criar a peça.');
  await db.update('content_piece_plans', { id: `eq.${plan.id}` }, { status: 'produced', post_id: piece.id });
  await edge.sequenceScript({ action: 'script', post_id: piece.id });
  return (await db.selectOne<UserPost>('user_posts', { id: `eq.${piece.id}` })) ?? piece;
}

// ---------------- páginas ----------------
export const unitApi = {
  async list(postId: string): Promise<PostUnit[]> { return db.select<PostUnit>('post_units', { post_id: `eq.${postId}`, order: 'position.asc' }); },
  async update(id: string, patch: Partial<PostUnit>): Promise<PostUnit> {
    const [u] = await db.update<PostUnit>('post_units', { id: `eq.${id}` }, patch);
    if (!u) throw new Error('Página não encontrada.');
    return u;
  },
  // Rascunho do roteiro: inserir/remover reposiciona sem trocar IDs.
  async insertAfter(post: UserPost, units: PostUnit[], afterPos: number): Promise<PostUnit[]> {
    // Desloca de trás para frente (posição única por peça), depois insere no buraco.
    const shift = units.filter((u) => u.position > afterPos).sort((a, b) => b.position - a.position);
    for (const u of shift) await db.update('post_units', { id: `eq.${u.id}` }, { position: u.position + 1 });
    await db.insert('post_units', { user_id: post.user_id, post_id: post.id, position: afterPos + 1, layout: 'text', function: 'nova página', title: '', body: '' });
    return unitApi.list(post.id);
  },
  async remove(post: UserPost, units: PostUnit[], unit: PostUnit): Promise<PostUnit[]> {
    await db.delete('post_units', { id: `eq.${unit.id}` });
    for (const u of units.filter((x) => x.position > unit.position).sort((a, b) => a.position - b.position)) await db.update('post_units', { id: `eq.${u.id}` }, { position: u.position - 1 });
    return unitApi.list(post.id);
  },
  async reorder(postId: string, ids: string[]): Promise<UserPost> {
    const r = await db.rpc<UserPost | UserPost[]>('reorder_units', { pid: postId, unit_ids: ids });
    return (Array.isArray(r) ? r[0] : r) as UserPost;
  },
};

async function patchPost(id: string, patch: Partial<UserPost>): Promise<UserPost> {
  const [p] = await db.update<UserPost>('user_posts', { id: `eq.${id}` }, patch);
  if (!p) throw new Error('Peça não encontrada.');
  return p;
}
export const approveScript = (p: UserPost) => patchPost(p.id, { script_status: 'approved', metadata: { ...p.metadata, review_stage: 'visual' } });
// Reabrir o roteiro: volta a rascunho, invalida a aprovação final; visuais de páginas idênticas são preservados.
export const reopenScript = (p: UserPost) => patchPost(p.id, {
  script_status: 'draft', version: (p.version ?? 1) + 1, metadata: { ...p.metadata, review_stage: 'script' },
  ...(p.status === 'approved' ? { status: 'pending_approval' as const, approved_version: null } : {}),
});

// ---------------- produção visual ----------------
const seedForVariant = (variant: string, decision?: Record<string, unknown>): HiveSeed => ({
  variant, manifestation: variant.split('-')[0], highlight: (decision?.highlight as HiveSeed['highlight'])??null, subtitle: (decision?.subtitle as string)??null,
  poles: decision?.diagram ? {a:(decision.diagram as {poleA?:string}).poleA,b:(decision.diagram as {poleB?:string}).poleB}:null, image_scene_hint: '',
  human_presence_adds_meaning: variant.startsWith('M02-'), mode_reason: '', variant_reason: 'capa da sequência',
});
const needsRender = needsSequenceRender;

interface Rendered { fabric_json: unknown; rendered_url: string; assets: PostUnit['assets'] }

async function renderOne(post: UserPost, u: PostUnit, total: number, dir: SequenceDirection, opts: { fileTag: string; newImage?: boolean; coverVariant?: string | null; instruction?: string }): Promise<Rendered> {
  // Stories (9:16): todas as telas, inclusive a capa, pelo compositor da sequência no tamanho da capacidade.
  const story = post.format === 'story';
  const canvas = story ? { w: 1080, h: 1920 } : { w: 1080, h: 1350 };
  if(u.assets?.manual_canvas&&u.fabric_json&&!opts.coverVariant&&!opts.newImage){
    const slide=reflowEditedPage(u);
    const dataUrl=await renderFabricToDataUrl(slide,{width:canvas.w,height:canvas.h,format:'jpeg'});
    if(!dataUrl)throw new Error('Não foi possível renderizar a arte editada.');
    const {publicUrl}=await uploadAssetImage({immutable:true,userId:post.user_id,assetId:post.id,dataUrl,filename:`unit-${u.id}-${opts.fileTag}.jpg`});
    return {fabric_json:slide,rendered_url:publicUrl,assets:{...u.assets}};
  }
  if (u.layout === 'cover' && (!story || post.metadata?.production_flow === 'base_v2')) {
    const variant = opts.coverVariant ?? u.assets?.variant ?? dir.cover_variant ?? null;
    const asset = (u.assets?.asset ?? null) as { url?: string; width?: number; height?: number; espaco_texto?: string; texto_cor?: string; origin?: string; photo_generation_id?: string } | null;
    const kind = imageKind(variant);
    // Reacomodar o texto NÃO troca a imagem: mantém o mesmo recurso, salvo pedido explícito.
    const keep = !opts.newImage && variant && kind !== 'none' && (asset?.url || u.assets?.image_ref)
      ? (kind === 'photo' ? { url: (asset?.url ?? u.assets!.image_ref)!, kind: 'photo' as const, width: asset?.width ?? null, height: asset?.height ?? null, espaco_texto: asset?.espaco_texto ?? null, texto_cor: asset?.texto_cor ?? null, origin: asset?.origin, photo_generation_id: asset?.photo_generation_id }
        : { url: u.assets!.image_ref!, kind: 'bg' as const })
      : null;
    const r = await generateHiveImage({
      userId: post.user_id, postId: post.id, canvas, text: [u.title, u.body].filter(Boolean).join(' — ') || post.title || '',
      platform: post.platform as 'linkedin' | 'instagram', editorialSlug: post.metadata?.editorial_slug as string | undefined,
      seed: variant ? seedForVariant(variant, u.assets?.decision as Record<string,unknown>|undefined) : undefined, forceBg: !!opts.newImage, keepAsset: keep, persistDecision: false,
      context: post.caption ?? undefined, previousDecision: {...u.assets?.decision as Record<string,unknown>,...u.assets}, photoAdjust: opts.instruction, fileName: `unit-${u.id}-${opts.fileTag}.jpg`,
    });
    const d = r.decision as Record<string, unknown>;
    return { fabric_json: r.slide, rendered_url: `${r.publicUrl.split('?')[0]}?v=${Date.now()}`,
      assets: { variant: (d.variant as string) ?? variant, image_ref: (d.image_ref as string | null) ?? null, asset: (d.asset as Record<string, unknown>) ?? null, decision: d } };
  }
  const design = await loadHiveDesign();
  const localDir={...dir,...((u.assets?.page_direction??{}) as Partial<SequenceDirection>)};
  const slide = composeSequencePage({ layout: u.layout, title: u.title ?? '', body: u.body ?? '', position: u.position, total, direction: localDir, colors: design.colors, spiralUrl: design.spiralUrl, canvas });
  const dataUrl = await renderFabricToDataUrl(slide, { width: canvas.w, height: canvas.h, format: 'jpeg' });
  if (!dataUrl) throw new Error(`Falha ao renderizar a página ${u.position}.`);
  const { publicUrl } = await uploadAssetImage({ immutable: true, userId: post.user_id, assetId: post.id, dataUrl, filename: `unit-${u.id}-${opts.fileTag}.jpg` });
  return { fabric_json: slide, rendered_url: `${publicUrl.split('?')[0]}?v=${Date.now()}`, assets: { ...u.assets } };
}

// Produz SÓ o que falta (pendente, desatualizado ou com falha); páginas prontas não são refeitas.
export async function renderPending(post0: UserPost, _units: PostUnit[], onProgress?: (done: number, total: number) => void, opts: { draftPreview?: boolean } = {}): Promise<{ units: PostUnit[]; failed: number }> {
  // Fonte de verdade = banco (a tela pode estar um passo atrás logo depois de aplicar uma proposta).
  const [post, units] = await Promise.all([db.selectOne<UserPost>('user_posts', { id: `eq.${post0.id}` }).then((p) => p ?? post0), unitApi.list(post0.id)]);
  const preview = opts.draftPreview && post.metadata?.production_flow === 'base_v2' && post.status === 'pending_approval' && post.script_status === 'draft';
  if (post.script_status !== 'approved' && !preview) throw new Error('Aprove o roteiro antes de produzir as páginas.');
  const dir = directionOf(post);
  const todo = units.filter(needsRender);
  let done = 0, failed = 0;
  onProgress?.(0, todo.length);
  const queue = [...todo];
  async function worker() {
    while (queue.length) {
      const u = queue.shift()!;
      await unitApi.update(u.id, { visual_status: 'rendering', error: null }).catch(() => {});
      try {
        const r = await renderOne(post, u, units.length, dir, { fileTag: `v${u.text_version}-${Date.now().toString(36)}` });
        await unitApi.update(u.id, { ...r, fabric_json: r.fabric_json as PostUnit['fabric_json'], rendered_text_version: u.text_version, visual_status: 'ready', review_status: u.layout === 'cover' && u.assets?.image_ref !== r.assets.image_ref ? 'needs_review' : 'pending', error: null });
      } catch (e) {
        failed++;
        await unitApi.update(u.id, { visual_status: 'failed', error: (e as Error).message.slice(0, 300) }).catch(() => {});
      }
      done++;
      onProgress?.(done, todo.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(2, todo.length) }, worker));
  await db.rpc('sync_unit_projection', { pid: post.id }).catch(() => {});
  return { units: await unitApi.list(post.id), failed };
}

export const approveUnit = (u: PostUnit, ok = true) => unitApi.update(u.id, { review_status: ok ? 'approved' : 'needs_review' });

export async function approveSequence(post: UserPost): Promise<UserPost> {
  const r = await db.rpc<UserPost | UserPost[]>('approve_sequence', { pid: post.id });
  return (Array.isArray(r) ? r[0] : r) as UserPost;
}
export async function approveVisualSequence(post: UserPost, units: PostUnit[]): Promise<UserPost> {
  const r=await db.rpc<UserPost|UserPost[]>('approve_sequence_review', { pid:post.id, p_expected:sequenceReviewSnapshot(post,units) });
  return Array.isArray(r)?r[0]:r;
}

// ---------------- candidatos de páginas/sequência (serviço comum de ajustes) ----------------
export interface UnitCandidate {
  id: string; action: string; scope: 'units' | 'sequence' | 'caption'; unit_ids: string[]; mutable_paths: string[]; base_version: number;
  proposal: { units?: Array<Partial<PostUnit> & { id: string }>; caption?: string; visual_direction?: SequenceDirection } | null;
  impact: string | null; status: string; error: string | null; instruction: string | null;
}

async function insertCandidate(post: UserPost, c: Omit<UnitCandidate, 'id' | 'status' | 'error' | 'base_version'> & { preserved?: unknown }): Promise<UnitCandidate> {
  const [row] = await db.insert<UnitCandidate>('piece_candidates', {
    user_id: post.user_id, post_id: post.id, operation_id: crypto.randomUUID(), base_version: post.version ?? 1, action: c.action, scope: c.scope,
    unit_ids: c.unit_ids, mutable_paths: c.mutable_paths, instruction: c.instruction, proposal: c.proposal, impact: c.impact, preserved: c.preserved ?? {}, status: 'ready',
  });
  if (!row) throw new Error('Não foi possível registrar a proposta.');
  return row;
}

// Ajustar texto (Hive ou edição direta) em páginas selecionadas / sequência inteira / legenda.
export async function proposeText(post: UserPost, units: PostUnit[], req: { scope: 'units' | 'sequence' | 'caption'; unitIds: string[]; instruction?: string; manual?: { title: string; body: string } | { caption: string } }): Promise<UnitCandidate & { coherence?: string }> {
  let proposal: UnitCandidate['proposal'];
  let coherence: string | undefined;
  let ids = req.scope === 'sequence' ? units.map((u) => u.id) : req.unitIds;
  if (req.manual) {
    proposal = 'caption' in req.manual ? { caption: req.manual.caption } : { units: [{ id: ids[0], title: req.manual.title, body: req.manual.body }] };
  } else {
    const r = await edge.sequenceScript<{ proposal: UnitCandidate['proposal']; coherence?: string; unit_ids: string[] }>({ action: 'adjust_units', post_id: post.id, unit_ids: ids, instruction: req.instruction, scope: req.scope });
    proposal = r.proposal; coherence = r.coherence; ids = r.unit_ids ?? ids;
  }
  if (req.scope !== 'caption' && !(proposal?.units ?? []).length) throw new Error('A Hive não propôs mudança nessas páginas. Tente detalhar o pedido.');
  const preserved = { units: units.filter((u) => !ids.includes(u.id)).map((u) => ({ id: u.id, title: u.title, body: u.body })) };
  const c = await insertCandidate(post, { action: 'adjust_text', scope: req.scope, unit_ids: req.scope === 'caption' ? [] : ids, mutable_paths: req.scope === 'caption' ? ['caption'] : ['text'],
    instruction: req.instruction ?? (req.manual ? 'edição direta' : null), proposal, impact: req.scope === 'caption' ? null : 'As páginas alteradas terão o visual refeito no mesmo template, sem trocar imagens.', preserved });
  return { ...c, coherence };
}

// Trocar a imagem da CAPA: texto, template, ordem e demais páginas preservados.
export async function proposeCoverImage(post: UserPost, units: PostUnit[], instruction?:string): Promise<UnitCandidate> {
  const cover = units.find((u) => u.layout === 'cover');
  if (!cover?.assets?.variant || imageKind(cover.assets.variant) === 'none') throw new Error('A capa usa um template sem imagem. Para ter imagem, troque o template.');
  const cid = crypto.randomUUID().slice(0, 8);
  const r = await renderOne(post, cover, units.length, directionOf(post), { fileTag: `cand-${cid}`, newImage: true, instruction });
  return insertCandidate(post, { action: 'swap_image', scope: 'units', unit_ids: [cover.id], mutable_paths: ['image', 'visual'], instruction: null,
    proposal: { units: [{ id: cover.id, ...r, fabric_json: r.fabric_json as PostUnit['fabric_json'] }] }, impact: null, preserved: { title: cover.title, body: cover.body } });
}

// Trocar a direção visual / template da capa: roteiro e recursos preservados; todas as páginas refeitas.
export async function proposeDirection(post: UserPost, units: PostUnit[], next: Partial<SequenceDirection>, onProgress?: (d: number, t: number) => void): Promise<UnitCandidate> {
  const dir = { ...directionOf(post), ...next };
  const cover = units.find((u) => u.layout === 'cover');
  const from = cover?.assets?.variant ?? null, to = next.cover_variant ?? from;
  const incompatible = to && from && imageKind(from) !== imageKind(to);
  const cid = crypto.randomUUID().slice(0, 8);
  const out: Array<Partial<PostUnit> & { id: string }> = [];
  let i = 0;
  for (const u of units) {
    onProgress?.(i++, units.length);
    const r = await renderOne(post, u, units.length, dir, { fileTag: `cand-${cid}`, coverVariant: u.layout === 'cover' ? to : undefined, newImage: u.layout === 'cover' && !!incompatible });
    out.push({ id: u.id, ...r, fabric_json: r.fabric_json as PostUnit['fabric_json'] });
  }
  onProgress?.(units.length, units.length);
  return insertCandidate(post, { action: 'swap_template', scope: 'sequence', unit_ids: units.map((u) => u.id), mutable_paths: incompatible ? ['visual', 'image'] : ['visual'], instruction: null,
    proposal: { units: out, visual_direction: dir }, impact: incompatible ? (imageKind(to) === 'none' ? 'O novo template da capa não usa imagem: a imagem atual sai.' : 'O novo template da capa usa outro tipo de imagem: a capa ganha uma imagem nova.') : null });
}

export async function applyUnitCandidate(c: UnitCandidate): Promise<UserPost> {
  try {
    const r = await db.rpc<UserPost | UserPost[]>('apply_unit_candidate', { cand_id: c.id });
    return (Array.isArray(r) ? r[0] : r) as UserPost;
  } catch (e) {
    const msg = (e as Error).message;
    const status = /conflito/i.test(msg) ? 'conflict' : /rejeitada/i.test(msg) ? 'rejected' : null;
    if (status) await db.update('piece_candidates', { id: `eq.${c.id}` }, { status, error: msg.slice(0, 400) }).catch(() => {});
    throw e;
  }
}
export const discardUnitCandidate = (c: UnitCandidate) => db.update('piece_candidates', { id: `eq.${c.id}` }, { status: 'discarded' });

export async function proposeSequenceText(post:UserPost,units:PostUnit[],texts:Array<{id:string;title:string;body:string}>):Promise<UnitCandidate>{
  if(texts.length!==units.length||new Set(texts.map(u=>u.id)).size!==units.length||texts.some(u=>!units.some(x=>x.id===u.id)||!(u.title.trim()||u.body.trim())))throw new Error('Mantenha todas as páginas com texto antes de conferir o roteiro.');
  return insertCandidate(post,{action:'adjust_text',scope:'sequence',unit_ids:units.map(u=>u.id),mutable_paths:['text'],instruction:'Reformulação do roteiro pelo produtor',proposal:{units:texts},impact:'Revise o roteiro e o conjunto antes de aprovar. Imagens e legenda serão preservadas; somente páginas cujo texto mudou precisam de nova renderização.'});
}

// Edição na arte usa o mesmo contrato de candidatos: uma página, versão esperada,
// histórico e aprovação invalidada. Nenhuma gravação paralela em rendered_slides.
async function prepareCanvasCandidate(post:UserPost,unit:PostUnit,state:EditorSnapshot,instruction:string,impact:string,preserveText=false):Promise<UnitCandidate>{
  if(['scheduled','published','archived'].includes(post.status))throw new Error('Este material já está na agenda, publicado ou arquivado. Abra o fluxo específico de revisão para alterá-lo.');
  const text=pageTextFromCanvas(state.fabricJson,unit);
  const canvas=post.format==='story'?{width:1080,height:1920}:{width:1080,height:1350};
  const jpeg=await renderFabricToDataUrl(state.fabricJson,{...canvas,format:'jpeg'});
  if(!jpeg)throw new Error('Não foi possível finalizar a arte com todos os elementos. Reabra a página e tente novamente.');
  const {publicUrl}=await uploadAssetImage({immutable:true,userId:post.user_id,assetId:post.id,dataUrl:jpeg,filename:`unit-${unit.id}-edit-${crypto.randomUUID()}.jpg`});
  return insertCandidate(post,{action:preserveText?'swap_template':'adjust_text',scope:'units',unit_ids:[unit.id],mutable_paths:preserveText?['visual']:['text','visual'],instruction,proposal:{units:[{id:unit.id,...text,fabric_json:state.fabricJson as PostUnit['fabric_json'],rendered_url:publicUrl,assets:{...unit.assets,manual_canvas:true}}]},impact});
}
export async function savePageCanvas(post:UserPost,unit:PostUnit,state:EditorSnapshot):Promise<UserPost>{
  if(!state.dataUrl)throw new Error('A arte ainda está carregando. Aguarde antes de salvar.');
  return applyUnitCandidate(await prepareCanvasCandidate(post,unit,state,'Edição direta na arte','Somente esta página muda. Revise a nova versão antes de aprovar.'));
}

/** Organização geométrica local: nenhuma chamada de IA e nenhuma mudança antes da prévia. */
export async function proposeDiagramOrganization(post:UserPost,unit:PostUnit,state:EditorSnapshot):Promise<UnitCandidate>{
  const width=1080,height=post.format==='story'?1920:1350;
  const fabricJson=organizeLayerDiagram(state.fabricJson,width,height,unit.assets?.variant as string|undefined);
  return prepareCanvasCandidate(post,unit,{...state,fabricJson},'Organizar este diagrama de camadas','Rótulos alinhados e conexões reorganizadas, preservando as palavras e os círculos. Confira a prévia. Outras páginas, fotografias e legenda serão preservadas.');
}

/** A mesma proposta versionada da edição direta, com escopo validado antes do render. */
export async function proposePagePart(post:UserPost,unit:PostUnit,state:EditorSnapshot,req:Parameters<typeof revisePagePart>[1]):Promise<UnitCandidate>{
  const fabricJson=revisePagePart(state.fabricJson,req);
  // Uma edição visual ainda não salva não pode entrar silenciosamente nesta revisão.
  const text=pageTextFromCanvas(fabricJson,unit);
  if(text.title!==(unit.title??'')||text.body!==(unit.body??''))throw new Error('Há alterações no texto principal feitas na arte. Salve-as primeiro ou reabra a página antes de revisar apenas o diagrama.');
  return prepareCanvasCandidate(post,unit,{...state,fabricJson},req.scope==='selected'?'Revisar elementos selecionados':'Revisar diagrama e textos ligados a ele','Texto principal, assinatura, fotografias, demais páginas e legenda preservados. Somente esta página precisará de nova revisão visual.',true);
}

export async function proposePageVisual(post:UserPost,units:PostUnit[],unit:PostUnit,next:{variant?:string;theme?:'claro'|'escuro';text?:{title:string;body:string};newImage?:boolean;instruction?:string}):Promise<UnitCandidate>{
  const dir={...directionOf(post),...(next.theme?{theme:next.theme}:{})};
  const from=unit.assets?.variant??null,to=next.variant??from;
  const incompatible=!!to&&!!from&&imageKind(from)!==imageKind(to);
  if(next.variant&&unit.layout!=='cover')throw new Error('As famílias de capa não se aplicam a páginas de leitura. Use a edição da arte para ajustar a composição.');
  if(next.text&&!(next.text.title.trim()||next.text.body.trim()))throw new Error('A página precisa ter texto.');
  const changedText=!!next.text&&(next.text.title!==(unit.title??'')||next.text.body!==(unit.body??''));
  const input={...unit,...next.text,assets:{...unit.assets,manual_canvas:false,...(next.theme?{page_direction:{theme:next.theme}}:{})}};
  const r=await renderOne(post,input,units.length,dir,{fileTag:`preview-${crypto.randomUUID()}`,coverVariant:next.variant,newImage:incompatible||next.newImage,instruction:next.instruction});
  return insertCandidate(post,{action:changedText?'adjust_text':'swap_template',scope:'units',unit_ids:[unit.id],mutable_paths:[...(incompatible||next.newImage)?['visual','image']:['visual'],...changedText?['text']:[]],instruction:'Refazer somente esta página',proposal:{units:[{id:unit.id,...next.text,...r,fabric_json:r.fabric_json as PostUnit['fabric_json'],assets:{...r.assets,...(next.theme?{page_direction:{theme:next.theme}}:{})}}]},impact:`${changedText?'O texto e a composição desta página serão alterados.':'O texto principal será preservado.'} ${incompatible?'Este modelo usa outro tipo de imagem. ':''}As demais páginas e a legenda permanecem preservadas. Confira antes de aplicar.`});
}


async function askPageRevision(post:UserPost,fields:Record<string,string>,instruction:string,allowUnchanged=false):Promise<Record<string,string>> {
  if(!instruction.trim())throw new Error('Descreva o que você quer diferente.');
  const r=await edge.editText({field:'titulo',text:revisionText(fields),post_id:post.id,counterpart:post.caption??'',
    editorial_slug:post.metadata?.editorial_slug as string|undefined,target_platform:post.platform as 'instagram'|'linkedin',max_chars:6000,
    instruction:`Estes são trechos de UMA página de uma peça, incluindo textos internos de um diagrama. Revise somente estes trechos. Preserve exatamente os marcadores [[identificador]], cada um em sua linha, e devolva todos eles com o texto em seguida. Não adicione marcadores, comentários, aspas nem cercas de código. Mantenha os textos curtos para caber nos mesmos espaços. Pedido do produtor: ${instruction}`});
  return readRevision(r.text,fields,allowUnchanged);
}

export async function proposePagePartWithHive(post:UserPost,unit:PostUnit,state:EditorSnapshot,req:PartRequest,instruction:string):Promise<UnitCandidate> {
  const fields=partFields(state.fabricJson,req),answer=await askPageRevision(post,fields,instruction);
  return proposePagePart(post,unit,state,{...req,...(req.representation==='diagram'?{texts:answer}:{content:answer.content})});
}

export async function proposeWholePage(post:UserPost,units:PostUnit[],unit:PostUnit,state:EditorSnapshot,instruction:string):Promise<UnitCandidate> {
  const variant=unit.assets?.variant as string|undefined,diagram=pageElements(state.fabricJson,variant).some(e=>e.diagram&&e.text!==undefined);
  const withImage=imageKind(variant)!=='none';
  if(diagram&&withImage)throw new Error('Esta composição combina foto e diagrama. Revise a foto e o diagrama em pedidos separados para preservar o desenho manual.');
  const req:PartRequest={variant,scope:'diagram',selected:[],texts:{},representation:'diagram',content:'',height:post.format==='story'?1920:1350};
  const fields={title:unit.title??'',body:unit.body??'',...(diagram?partFields(state.fabricJson,req):{})};
  const answer=await askPageRevision(post,fields,instruction,withImage),text={title:answer.title,body:answer.body};
  if(!diagram)return proposePageVisual(post,units,unit,{variant:unit.layout==='cover'?variant:undefined,text,newImage:withImage,instruction});
  const labels=Object.fromEntries(Object.entries(answer).filter(([id])=>id!=='title'&&id!=='body'));
  const fabricJson=revisePagePart(state.fabricJson,{...req,texts:labels});
  const final=reflowEditedPage({...unit,...text,fabric_json:fabricJson as PostUnit['fabric_json']});
  return prepareCanvasCandidate(post,unit,{...state,fabricJson:final},instruction,'Somente os textos desta página e de seu diagrama mudam. Confira a composição. A legenda e as demais páginas permanecem preservadas.');
}

// ---------------- exportação (mesmo pacote aprovado) ----------------
async function fetchBlob(url: string): Promise<Blob> {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`Falha ao baixar a página (${r.status}).`);
  return r.blob();
}
async function uploadBlob(userId: string, postId: string, name: string, blob: Blob, type: string): Promise<string> {
  const path = `${userId}/assets/${postId}/${name}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, { upsert: true, contentType: type, cacheControl: '3600' });
  if (error) throw error;
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}
const blobToDataUrl = (b: Blob) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(b); });

export async function exportSequence(post: UserPost, units: PostUnit[], caps: FormatCapability[]): Promise<{ post: UserPost; pkg: SequenceExport }> {
  if (!['approved', 'scheduled', 'published'].includes(post.status) || post.approved_version !== post.version) throw new Error('Exporte só a versão aprovada: aprove a sequência completa antes.');
  const ordered = [...units].sort((a, b) => a.position - b.position);
  if (ordered.some((u) => !u.rendered_url)) throw new Error('Há páginas sem visual.');
  const cap = capOf(caps, post.platform, post.format);
  const blobs = await Promise.all(ordered.map((u) => fetchBlob(u.rendered_url!)));
  const base = `${(post.title ?? 'sequencia').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').slice(0, 40)}-v${post.version}`;
  let pkg: SequenceExport;
  if (cap?.export_kind === 'pdf') {
    const w = cap.width, h = cap.height;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [w, h], hotfixes: ['px_scaling'], compress: true });
    for (const [i, b] of blobs.entries()) {
      if (i > 0) pdf.addPage([w, h], 'portrait');
      pdf.addImage(await blobToDataUrl(b), 'JPEG', 0, 0, w, h);
    }
    const url = await uploadBlob(post.user_id, post.id, `${base}.pdf`, pdf.output('blob'), 'application/pdf');
    pkg = { version: post.version ?? 1, kind: 'pdf', files: ordered.map((u) => u.rendered_url!), pdf_url: url, exported_at: new Date().toISOString() };
  } else {
    const zip = new JSZip();
    blobs.forEach((b, i) => zip.file(`${String(i + 1).padStart(2, '0')}.jpg`, b));
    zip.file('legenda.txt', post.caption ?? '');
    const url = await uploadBlob(post.user_id, post.id, `${base}.zip`, await zip.generateAsync({ type: 'blob' }), 'application/zip');
    pkg = { version: post.version ?? 1, kind: 'images', files: ordered.map((u) => u.rendered_url!), zip_url: url, exported_at: new Date().toISOString() };
  }
  const p = await patchPost(post.id, { export_package: pkg as unknown as Record<string, unknown> });
  return { post: p, pkg };
}

// Publicação manual (etapa A): o autor publicou o pacote exportado; registra a ocorrência como
// resultado CONFIRMADO (register_manual_publication) — mesmo registro da publicação automática.
export const markPublishedManually = (post: UserPost, url?: string) => registerManualPublication(post.id, url || null);
