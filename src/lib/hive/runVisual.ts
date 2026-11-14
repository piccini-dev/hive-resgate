// Orquestrador da Hive (Etapa 3, ponta a ponta) para UM post:
//   texto aprovado -> hive-decide (manifestação M01/M02 + variante + destaque
//   + imagem na hierarquia) -> compositor (M01 gráfico/textura, M02 foto do
//   Marcos) -> render Fabric -> upload -> devolve slide + imagem + decisão.
//
// Quem chama (ex: PostEditor) grava no post: carousel_fabric_json, rendered_slides,
// visual_decision e image_status='pending' — e pode carregar o slide no editor.
//
// Canvas v1 = feed 1080x1350 (serve Instagram E LinkedIn).

import { edge, type HiveSeed } from '@/lib/edge';
import { loadHiveDesign } from './loadDesign';
import { composeM01, pickM01BgUrl, type ComposedSlide } from './composeM01';
import { analyzeTextZone, clearZoneCache } from './imageZone';
import { composeM02 } from './composeM02';
import { composeM03 } from './composeM03';
import { ensureM01Asset, clearM01AssetCache } from './marcosImage';
import { generateMarcosPhoto, TEXT_SPACE_TO_PLACE } from './marcosPhoto';
import { imageDims, listMarcosPhotos } from './assetLib';
import { generationUnavailable, photoUsage, requireNewImage } from './imagePolicy';
import { renderFabricToDataUrl } from '@/lib/templates/renderPost';
import { uploadAssetImage } from '@/lib/storage';

const CANVAS = { w: 1080, h: 1350 };

export interface HiveVisualResult {
  slide: ComposedSlide;
  dataUrl: string;
  publicUrl: string;
  decision: Awaited<ReturnType<typeof edge.hiveDecide>>['decision'];
}

export async function generateHiveImage(params: {
  userId: string;
  canvas?: { w: number; h: number };
  postId: string;
  text: string;                          // texto aprovado (frase da imagem)
  platform?: 'linkedin' | 'instagram';
  editorialSlug?: string;
  targetAvatar?: string;
  // Modo execução: mantém a variante já escolhida (não re-decide). Usado pra
  // "Regenerar fundo" — quer OUTRO fundo, mas o MESMO template.
  seed?: HiveSeed;
  // Força um fundo de IA novo (M01-D/E): ignora o pool e gera do zero.
  forceBg?: boolean;
  // Texto-mãe completo (legenda): o motor fotográfico lê o conteúdo inteiro, não só a frase.
  context?: string;
  // Decisão visual anterior do post: re-render sem forceBg reaproveita a foto do Marcos já gerada.
  previousDecision?: Record<string, unknown> | null;
  // Pedido de ajuste do revisor (motor fotográfico) — gera de novo aplicando a nota.
  photoAdjust?: string;
  // ---- Candidatos (ajustes com preservação) ----
  // Mantém EXATAMENTE este recurso de imagem (mesmo ID/URL): foto do emissor ou fundo M01.
  // Antes o fundo M01 era sorteado pelo texto → ajustar a frase trocava a imagem.
  keepAsset?: { url: string; kind: 'photo' | 'bg'; width?: number | null; height?: number | null; espaco_texto?: string | null; texto_cor?: string | null; origin?: string; photo_generation_id?: string } | null;
  // Prévia: grava a imagem em outro arquivo e NÃO persiste a decisão na peça ativa.
  uploadKey?: string;
  persistDecision?: boolean;
  // Sequências: arquivo próprio por página (ex.: unit-<id>-v3.jpg).
  fileName?: string;
}): Promise<HiveVisualResult> {
  const canvas = params.canvas ?? CANVAS;
  const text = params.text.trim();
  if (!text) throw new Error('Sem texto pra compor a imagem.');

  // 1) Decisão (a IA lê as regras da base e escolhe manifestação/variante/destaque
  //    + a imagem na hierarquia: foto real do Marcos primeiro, gerar só se preciso).
  //    Com seed, executa a variante fixa (sem re-decidir).
  const { decision: proposedDecision } = await edge.hiveDecide({
    text,
    platform: params.platform,
    editorial_slug: params.editorialSlug,
    target_avatar: params.targetAvatar,
    post_id: params.postId,
    seed: params.seed,
    persist: params.persistDecision !== false,
  });

  // A escolha explícita é autoridade; o servidor não pode substituir o modelo.
  const decision = { ...proposedDecision, ...(params.seed ? { variant: params.seed.variant, mode: params.seed.manifestation,
    highlight: params.seed.highlight?.target ? { target: params.seed.highlight.target, reason: params.seed.highlight.reason ?? '' } : null,
    subtitle: params.seed.subtitle, diagram: params.seed.poles ? { poleA: params.seed.poles.a, poleB: params.seed.poles.b } : null } : {}) };

  // 2) Composição: pega a receita frozen da variante escolhida (M01 ou M02).
  const design = await loadHiveDesign();
  const recipe = design.variacoes.find((v) => v.id === decision.variant);
  if (!recipe) throw new Error('O modelo visual escolhido não está disponível nesta marca. Escolha outro modelo ou revise o catálogo de templates.');

  const allowHl = Boolean(recipe.limites?.destaque_permitido) && decision.highlight?.target;
  const highlight = allowHl ? { target: decision.highlight!.target } : null;

  let slide: ComposedSlide;
  if (recipe.manifestacao_id === 'M03') {
    decision.asset = null; (decision as Record<string,unknown>).image_ref = null;
    slide = composeM03({
      recipe, colors: design.colors, spiralUrl: design.spiralUrl,
      text, highlight, canvas, diagram: decision.diagram ?? null,
    });
  } else if (recipe.manifestacao_id === 'M02') {
    // MOTOR FOTOGRÁFICO DO MARCOS (docs/fotografia/01–06): estilo F01–F04,
    // identidade travada pelas referências por nível, portões de qualidade e
    // aprovação humana. Menor fabricação: se o texto pede prova real (ou nenhum
    // estilo foi aprovado ainda), usa uma FOTO REAL dele — nunca inventa.
    const prev = (params.previousDecision?.asset ?? null) as { url?: string; photo_generation_id?: string; espaco_texto?: string; width?: number; height?: number; origin?: string } | null;
    let asset: { url: string; width: number | null; height: number | null; espaco_texto: string; texto_cor: string; origin: string; preComposed?: boolean };
    let photoMeta: Record<string, unknown> = {};
    const keep = params.keepAsset?.kind === 'photo' ? params.keepAsset : null;
    if (keep && !params.forceBg && !params.photoAdjust) {
      // Preservação: a MESMA foto (real ou gerada), só recomposta.
      asset = { url: keep.url, width: keep.width ?? null, height: keep.height ?? null, espaco_texto: keep.espaco_texto ?? 'esquerda', texto_cor: keep.texto_cor ?? 'claro',
        origin: keep.origin ?? 'real', preComposed: keep.origin === 'generated' && !!keep.photo_generation_id };
      photoMeta = keep.photo_generation_id ? { photo_generation_id: keep.photo_generation_id } : { photo_origin: keep.origin ?? 'real' };
    } else if (params.seed && !params.forceBg && !params.photoAdjust && prev?.url && prev.photo_generation_id) {
      asset = { url: prev.url, width: prev.width ?? null, height: prev.height ?? null, espaco_texto: prev.espaco_texto ?? 'esquerda', texto_cor: 'claro', origin: 'generated', preComposed: true };
      photoMeta = { photo_generation_id: prev.photo_generation_id };
    } else {
      const r = await generateMarcosPhoto({ text: [params.context, text].filter(Boolean).join('\n\n'), postId: params.postId, adjustNote: params.photoAdjust });
      if (r.status === 'generated' && r.generation.image_url) {
        const g = r.generation;
        if (g.auto_status === 'rejeitada') throw new Error('A nova foto foi rejeitada na verificação de qualidade. Peça outra proposta.');
        const previous = params.keepAsset?.url ?? prev?.url ?? params.previousDecision?.image_ref as string | undefined;
        const references = params.forceBg || params.photoAdjust ? (await listMarcosPhotos()).map(p => p.url) : [];
        const url = requireNewImage(g.image_url, params.forceBg || params.photoAdjust ? previous : null, references);
        const dims = await imageDims(url).catch(() => ({ w: 0, h: 0 }));
        asset = { url, width: dims.w || null, height: dims.h || null, espaco_texto: TEXT_SPACE_TO_PLACE[g.text_space] ?? 'esquerda', texto_cor: 'claro', origin: 'generated', preComposed: true };
        photoMeta = { photo_generation_id: g.id, photo_style: g.style_id, photo_variant: g.variant_id, photo_auto_status: g.auto_status, photo_attempts: r.attempts.length };
      } else {
        if (r.status === 'generated') throw new Error('O motor fotográfico não devolveu uma imagem completa.');
        if (params.forceBg || params.photoAdjust) throw generationUnavailable(r.status, r.reason);
        const photos = await listMarcosPhotos();
        const allowed = photos.filter(p => p.is_active !== false && photoUsage(p.semantic) === 'reusable' && (r.status !== 'needs_real_photo' || ['real','real_adapted'].includes(p.origin)));
        const real = allowed.find(p => p.id === decision.asset?.id || p.url === decision.asset?.url) ?? allowed[0];
        if (!real?.url) throw new Error('Não há foto autorizada para reutilização. Configure Fotos e geração em Templates ou aprove um estilo para gerar uma nova imagem.');
        const tags = (real as { semantic?: { espaco_texto?: string; texto_cor?: string } }).semantic;
        asset = { url: real.url, width: (real as { width?: number }).width ?? null, height: (real as { height?: number }).height ?? null,
          espaco_texto: (tags?.espaco_texto ?? 'esquerda') as string, texto_cor: (tags?.texto_cor ?? 'claro') as string, origin: real.origin };
        photoMeta = { photo_origin: real.origin, reused_library: true, photo_fallback: r.status === 'needs_real_photo' ? `prova real: ${r.reason}` : 'nenhum estilo fotográfico aprovado ainda' };
      }
    }
    if (!asset.width || !asset.height) { const dims = await imageDims(asset.url); asset.width = dims.w; asset.height = dims.h; }
    slide = composeM02({
      recipe, colors: design.colors, spiralUrl: design.spiralUrl,
      text, subtitle: decision.subtitle ?? null, highlight, canvas, asset,
    });
    (decision as Record<string, unknown>).asset = { ...asset, ...photoMeta };
    (decision as Record<string, unknown>).image_ref = asset.url;
  } else {
    // M01-D (Campo) e M01-E (Matéria) têm fundo de IA: se a biblioteca não tem
    // asset, gera um agora (senão fica placeholder). Demais M01 = sem imagem.
    // forceBg = "Regenerar fundo": ignora o pool e gera um novo do zero.
    decision.asset = null;
    let assets = design.assets;
    const isD = recipe.id === 'M01-D', isE = recipe.id === 'M01-E';
    const keepBg = params.keepAsset?.kind === 'bg' && !params.forceBg ? params.keepAsset : null;
    if (keepBg && (isD || isE)) {
      // Preservação: o MESMO fundo, independentemente do texto.
      const dims = await imageDims(keepBg.url);
      const a = { url: keepBg.url, width: keepBg.width ?? dims.w, height: keepBg.height ?? dims.h };
      assets = isD ? { ...design.assets, photos: [a] } : { ...design.assets, textures: [a] };
    } else if (params.forceBg && (isD || isE)) {
      clearM01AssetCache(params.postId);
      const a = await ensureM01Asset(isD ? 'photo' : 'texture', params.postId, [params.context, text, params.photoAdjust].filter(Boolean).join('\n\n'));
      requireNewImage(a?.url, params.previousDecision?.image_ref as string | undefined);
      if (a) { assets = isD ? { ...design.assets, photos: [a] } : { ...design.assets, textures: [a] }; clearZoneCache(a.url); }
    } else if (isD && design.assets.photos.length === 0) {
      const a = await ensureM01Asset('photo', params.postId);
      if (a) assets = { ...design.assets, photos: [a] };
    } else if (isE && design.assets.textures.length === 0) {
      const a = await ensureM01Asset('texture', params.postId);
      if (a) assets = { ...design.assets, textures: [a] };
    }
    // Posicionamento pós-imagem (D/E): leva o texto pra zona de espaço negativo.
    const bgUrl = pickM01BgUrl(recipe, assets, text);
    if ((isD || isE) && !bgUrl) throw new Error('Não foi possível preparar o fundo deste modelo. Tente gerar outra imagem ou escolha um formato sem fundo.');
    (decision as Record<string, unknown>).image_ref = bgUrl ?? null;
    const layout = bgUrl ? await analyzeTextZone(bgUrl) : null;
    slide = composeM01({
      recipe, colors: design.colors, spiralUrl: design.spiralUrl, assets,
      text, highlight, canvas, layout,
    });
  }

  // 3) Render (full-res, JPEG p/ publicar — Instagram exige, LinkedIn aceita) + upload.
  const dataUrl = await renderFabricToDataUrl(slide, { width: canvas.w, height: canvas.h, format: 'jpeg' });
  if (!dataUrl) throw new Error('Falha ao renderizar a imagem da Hive.');

  const { publicUrl } = await uploadAssetImage({ immutable: true,
    userId: params.userId,
    assetId: params.postId,
    dataUrl,
    filename: params.fileName ?? (params.uploadKey ? `candidato-${params.uploadKey}.png` : 'hive-render.png'),
  });

  return { slide, dataUrl, publicUrl, decision };
}
