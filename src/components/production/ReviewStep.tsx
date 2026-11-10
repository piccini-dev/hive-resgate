// Etapa 6 — TELAS 12, 12A, 12B, 12C: produção visual do ciclo, galeria, escolha
// da proposta, edição/aprovação da peça e conclusão (→ programação).
import { MarcosPhotoReview } from '@/components/hive/MarcosPhotoReview';
import { AcjChip } from '@/components/acj/AcjChip';
import { PieceActionsPanel, type ExternalRequest } from '@/components/pieces/PieceActionsPanel';
import { PiecePlanPanel } from '@/components/sequence/PiecePlanPanel';
import { SequenceWorkspace } from '@/components/sequence/SequenceWorkspace';
import { planApi } from '@/lib/sequence/service';
import { isoToLocalInput, localInputToIso, nowLocalInput } from '@/lib/schedule';
import { isAvulso } from '@/lib/campaign/avulso';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, ExternalLink, ImageIcon, Instagram, Linkedin, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { baseApi } from '@/lib/campaign/bases';
import { canReviewProduction, editorialPieces } from '@/lib/campaign/production-plan';
import { ideaApi, pieceApi } from '@/lib/campaignApi';
import { formatRange } from '@/lib/campaign/dates';
import {
  AI_IMAGE_VARIANT, approvePiece, choosePiece, createAlternatives, reschedulePiece, finishProduction, imageKind, loadProductionVisuals, produceCycle, productionTodo,
} from '@/lib/campaign/produce';
import { loadHiveDesign } from '@/lib/hive/loadDesign';
import { useAuthStore } from '@/store/authStore';
import type { BeeEditorial, Campaign, CampaignCycle, Content, Idea, PiecePlan, PostUnit, SocialAccount, UserPost } from '@/types';
import { needsSequenceRender } from '@/lib/sequence/visual-state';
import { visualReviewState } from '@/lib/sequence/editing';

// Uma produção por ciclo, com ASSINANTES: se a tela remontar no meio (StrictMode,
// troca de etapa, navegação), a nova montagem se inscreve na produção em curso —
// recebe o progresso e o aviso de fim — em vez de iniciar outra (duplicaria peças)
// ou ficar presa esperando uma execução que não fala mais com ela.
type Prog = { done: number; total: number } | null;
const RUNS = new Map<string, { progress: Prog; listeners: Set<(p: Prog) => void> }>();

type View = { kind: 'overview' } | { kind: 'gallery' } | { kind: 'choose'; group: string } | { kind: 'edit'; pieceId: string } | { kind: 'approved'; pieceId: string };

// Unidade revisável: a peça de validação OU um grupo de alternativas de um desdobramento.
interface Unit { key: string; content: Content; pieces: UserPost[]; main: UserPost; approved: boolean }

const PlatformIcon = ({ p, className = 'h-4 w-4' }: { p: string; className?: string }) =>
  p === 'linkedin' ? <Linkedin className={`${className} text-[#0A66C2]`} /> : <Instagram className={`${className} text-[#E1306C]`} />;
function ProductionDetails({compact,children}:{compact:boolean;children:ReactNode}) {
  return compact?<details className="text-xs text-muted-foreground"><summary className="cursor-pointer py-2">Ver detalhes da proposta</summary><div className="space-y-2">{children}</div></details>:<div>{children}</div>;
}

function Preview({ piece, className = '', units = [] }: { piece: UserPost; className?: string; units?: PostUnit[] }) {
  if(['carousel','story'].includes(piece.format)) {
    const pages=units.length?[...units].sort((a,b)=>a.position-b.position).map(u=>({position:u.position,url:u.rendered_url})):Object.entries(piece.rendered_slides??{}).sort(([a],[b])=>Number(a.replace('slide',''))-Number(b.replace('slide',''))).map(([,url],i)=>({position:i+1,url}));
    return <div className="flex w-full gap-3 overflow-x-auto pb-2" data-testid="gallery-pages-strip">{pages.length?pages.map(p=><div key={p.position} className="w-48 shrink-0 space-y-1"><div className={`overflow-hidden rounded-lg border bg-secondary/40 ${piece.format==='story'?'aspect-[9/16]':'aspect-[4/5]'}`}>{p.url?<img src={p.url} alt={`Página ${p.position}`} className="h-full w-full object-contain" loading="lazy"/>:<div className="flex h-full items-center justify-center text-xs text-muted-foreground">Imagem a produzir</div>}</div><p className="text-xs text-muted-foreground">{p.position} / {pages.length}</p></div>):<span className="p-5 text-sm text-muted-foreground">As páginas ainda precisam ser produzidas.</span>}</div>;
  }
  const src = piece.rendered_slides?.slide1;
  return (
    <div className={`overflow-hidden rounded-xl border bg-secondary/40 ${className}`}>
      {src ? <img src={src} alt={(piece.carousel_text?.quote as string | undefined) ?? 'Prévia da peça'} className="h-full w-full object-cover" loading="lazy" />
        : <div className="flex h-full min-h-[160px] items-center justify-center text-muted-foreground"><ImageIcon className="h-6 w-6" /></div>}
    </div>
  );
}

export function ReviewStep({ campaign, cycle, ideas, editorials, accounts, onCycleChange, allowAutoProduction = true, productionBatchId, onPreparePublication }: {
  campaign: Campaign; cycle: CampaignCycle; ideas: Idea[]; editorials: BeeEditorial[]; accounts: SocialAccount[];
  onCycleChange: (c: CampaignCycle) => void; allowAutoProduction?: boolean; productionBatchId?: string; onPreparePublication?: () => void;
}) {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [returnId,setReturnId]=useState<string|null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [contents, setContents] = useState<Content[] | null>(null);
  const [pieces, setPieces] = useState<UserPost[]>([]);
  const [plans, setPlans] = useState<PiecePlan[]>([]);
  const [pageUnits,setPageUnits]=useState<PostUnit[]>([]);
  const [visualPending,setVisualPending]=useState(0);
  const [runNonce, setRunNonce] = useState(0);
  const [view, setView] = useState<View>({ kind: productionBatchId ? 'gallery' : 'overview' });
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  // Só mostra o resumo depois de decidir se há algo a produzir (sem "piscar" um
  // resumo incompleto antes da produção começar).
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [variantNames, setVariantNames] = useState<Record<string, string>>({});
  // Pedido da revisão da foto ("gerar outra") → proposta de troca de imagem no painel de ações.
  const [photoRequest, setPhotoRequest] = useState<ExternalRequest | null>(null);

  const edName = useCallback((slug?: string | null) => editorials.find((e) => e.slug === slug)?.name, [editorials]);
  const accountLabel = (id?: string | null) => accounts.find((a) => a.id === id)?.label ?? 'Contas após aprovação';

  // Ideias vêm do BANCO junto com conteúdos e peças: a decisão do que produzir não
  // pode depender da lista da página ainda carregando (sem ideia → sem canais →
  // nenhum desdobramento produzido; era uma corrida intermitente).
  const load = useCallback(async () => {
    const [c, p, i, pl] = await Promise.all([baseApi.listByCycle(cycle.id, false), pieceApi.listByCycle(cycle.id), ideaApi.listByCycle(cycle.id), planApi.byCycle(cycle.id)]);
    const visuals=await loadProductionVisuals(p,pl,productionBatchId);
    setPageUnits(visuals.units);setVisualPending(visuals.todo.length);
    setLoadError(null); setContents(c); setPieces(editorialPieces(p).filter(x => !productionBatchId || x.metadata?.production_batch_id === productionBatchId)); setPlans(pl);
    return { c, p, i, pl, visuals };
  }, [cycle.id, productionBatchId]);

  useEffect(() => {
    loadHiveDesign().then((d) => setVariantNames(Object.fromEntries(d.variacoes.map((v) => [v.id, v.nome])))).catch(() => {});
  }, []);

  // Carrega e, se faltar produzir algo, a Hive produz (retoma de onde parou).
  useEffect(() => {
    let alive = true;
    const listener = (pr: Prog) => { if (!alive) return; setProgress(pr); if (pr === null) void load(); };
    void (async () => {
      const running = RUNS.get(cycle.id);
      if (running) { running.listeners.add(listener); setProgress(running.progress); await load(); setChecked(true); return; }
      const { c, p, i, pl, visuals } = await load();
      if (!allowAutoProduction) { setChecked(true); return; }
      if (!alive || !currentUser) return;
      const again = RUNS.get(cycle.id);
      if (again) { again.listeners.add(listener); setProgress(again.progress); setChecked(true); return; }
      const todo = productionTodo(c, i, p, pl, productionBatchId);
      const n = todo.validation.length + todo.unfold.length + todo.sequences.length + visuals.todo.length;
      if (n === 0) { setChecked(true); return; }
      const run = { progress: { done: 0, total: n } as Prog, listeners: new Set([listener]) };
      RUNS.set(cycle.id, run);
      const emit = (pr: Prog) => { run.progress = pr; run.listeners.forEach((l) => l(pr)); };
      emit(run.progress);
      setChecked(true);
      try {
        await produceCycle(currentUser.id, cycle, { contents: c, ideas: i, pieces: p, plans: pl }, edName, (done, total) => emit({ done, total }));
      } catch (e) {
        toast.error((e as Error).message.slice(0, 200));
      } finally {
        RUNS.delete(cycle.id);
        emit(null);
      }
    })().catch(e => { if (alive) { setLoadError((e as Error).message); setChecked(true); } });
    return () => { alive = false; RUNS.get(cycle.id)?.listeners.delete(listener); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle.id, runNonce, allowAutoProduction, productionBatchId]);

  const units: Unit[] = useMemo(() => {
    const out: Unit[] = [];
    const validated = (contents ?? []).filter((c) => c.status === 'validated').sort((a, b) => a.position - b.position);
    for (const c of validated) {
      const mine = pieces.filter((p) => p.content_id === c.id);
      for (const v of mine.filter((p) => p.piece_role === 'validation' && p.status !== 'archived')) {
        out.push({ key: v.id, content: c, pieces: [v], main: v, approved: v.status === 'approved' || v.status === 'scheduled' || v.status === 'published' });
      }
      const groups = new Map<string, UserPost[]>();
      for (const p of mine.filter((x) => x.piece_role === 'unfold')) {
        const g = p.alternative_group ?? p.id;
        groups.set(g, [...(groups.get(g) ?? []), p]);
      }
      for (const [g, ps] of groups) {
        const live = ps.filter((p) => p.status !== 'archived').sort((a, b) => (a.alternative_rank ?? 0) - (b.alternative_rank ?? 0));
        if (!live.length) continue;
        const approved = live.find((p) => ['approved', 'scheduled', 'published'].includes(p.status));
        out.push({ key: g, content: c, pieces: live, main: approved ?? live.find((p) => p.is_recommended) ?? live[0], approved: !!approved });
      }
    }
    return out;
  }, [contents, pieces]);

  const stateOf=(p:UserPost)=>visualReviewState(p,pageUnits.filter(u=>u.post_id===p.id));
  const approvedCount = units.filter((u) => u.approved).length;
  const pending = units.filter(u=>!u.approved&&canReviewProduction(u.main,plans,productionBatchId)&&(u.main.metadata?.production_flow!=='base_v2'||stateOf(u.main)==='ready'));
  const unfinishedPlans = productionBatchId ? plans.filter(p=>p.production_batch_id===productionBatchId&&p.status==='planned') : [];
  const fromValidation = units.filter((u) => u.main.piece_role === 'validation').length;
  const pieceById = (id: string) => pieces.find((p) => p.id === id);
  const replacePiece = (p: UserPost) => setPieces((ps) => ps.map((x) => (x.id === p.id ? p : x)));
  function approvedPiece(p:UserPost){
    replacePiece(p);
    if(p.metadata?.production_flow==='base_v2'){
      setReturnId(p.id);setView({kind:'gallery'});void load().catch(()=>setLoadError('Não foi possível atualizar a lista de peças.'));
      toast.success('Peça aprovada. A escolha de contas e o agendamento vêm depois.');
    }else setView({kind:'approved',pieceId:p.id});
  }
  useEffect(()=>{
    if(view.kind!=='gallery'||!returnId)return;
    const frame=requestAnimationFrame(()=>document.getElementById(`review-piece-${returnId}`)?.scrollIntoView({block:'center',behavior:'smooth'}));
    return()=>cancelAnimationFrame(frame);
  },[view.kind,returnId]);

  async function act<T>(key: string, fn: () => Promise<T>) {
    setBusy(key);
    try { return await fn(); } catch (e) { toast.error((e as Error).message.slice(0, 180)); return undefined; } finally { setBusy(null); }
  }

  function openUnit(u: Unit) {
    if(!canReviewProduction(u.main,plans,productionBatchId))return;
    setPhotoRequest(null);
    if (u.pieces.length > 1 && !u.approved) setView({ kind: 'choose', group: u.key });
    else setView({ kind: 'edit', pieceId: u.main.id });
  }

  function nextPending(exceptKey?: string) {
    const n = pending.find((u) => u.key !== exceptKey);
    if (n) openUnit(n); else setView({ kind: 'gallery' });
  }

  // Outras opções com a MESMA frase: só design, só imagem ou os dois (12B).
  function varyBar(base: UserPost, unitPieces: UserPost[]) {
    const v = (base.visual_decision as { variant?: string } | null)?.variant;
    const noImage = imageKind(v) === 'none';
    const run = (mode: 'design' | 'image' | 'both') => act(`vary-${mode}`, async () => {
      const news = await createAlternatives(currentUser!.id, base, unitPieces, mode);
      const groupId = news[0]?.alternative_group ?? base.alternative_group ?? base.id;
      setPieces((ps) => [...ps.map((x) => (x.id === base.id ? { ...x, alternative_group: groupId, alternative_rank: x.alternative_rank ?? 0 } : x)), ...news]);
      setView({ kind: 'choose', group: groupId });
      toast.success(`${news.length} opç${news.length === 1 ? 'ão nova' : 'ões novas'} com a mesma frase.`);
    });
    const label = (mode: string, text: string) => (busy === `vary-${mode}` ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Gerando…</> : text);
    return (
      <div className="flex flex-wrap items-center gap-2" data-testid="vary-bar">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ver outras opções (mesma frase):</span>
        <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('design')} data-testid="vary-design">{label('design', 'Outras opções de design')}</Button>
        <Button size="sm" variant="outline" disabled={!!busy || noImage} title={noImage ? 'Este design não usa imagem' : undefined} onClick={() => run('image')} data-testid="vary-image">{label('image', 'Outras opções de imagem')}</Button>
        <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('both')} data-testid="vary-both">{label('both', 'Variar os dois')}</Button>
      </div>
    );
  }

  if (loadError) return <div className="space-y-3"><p role="alert">Não foi possível carregar a produção.</p><Button variant="outline" onClick={() => { setLoadError(null); setRunNonce(n => n + 1); }}>Tentar novamente</Button></div>;
  if (!contents || !checked) return <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>;

  // ---------------- TELA 12 — produção (em andamento ou resumo) ----------------
  if (view.kind === 'overview') {
    return (
      <div className="space-y-5" data-testid="review-overview">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Conteúdos validados</p>
          <h1 className="mt-1 font-display text-2xl font-bold">{progress ? 'A Hive está produzindo os posts e suas imagens.' : unfinishedPlans.length||visualPending ? 'Parte da produção ainda precisa ser concluída.' : 'Seus posts estão disponíveis para revisão.'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">A produção segue as bases e a proposta aprovada. Revise cada peça uma vez; depois escolha em quais contas ela será usada.</p>
        </div>
        {progress ? (
          <div className="space-y-2 rounded-2xl border bg-card p-5" data-testid="produce-progress">
            <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin text-accent" /> Produzindo peças… {progress.done} de {progress.total}</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"><div className="h-full bg-accent transition-all" style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} /></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3" data-testid="production-summary">
              <div className="rounded-2xl border bg-card p-4"><p className="font-display text-3xl font-bold">{units.length}</p><p className="text-xs text-muted-foreground">peças previstas</p></div>
              <div className="rounded-2xl border bg-card p-4"><p className="font-display text-3xl font-bold">{productionBatchId ? approvedCount : fromValidation}</p><p className="text-xs text-muted-foreground">já aprovadas nesta revisão</p></div>
              <div className="rounded-2xl border bg-card p-4"><p className="font-display text-3xl font-bold">{pending.length}</p><p className="text-xs text-muted-foreground">novas peças para revisar</p></div>
            </div>
            {productionBatchId && (unfinishedPlans.length>0||visualPending>0) && <section className="space-y-2 rounded-xl border border-amber-500/30 p-4">
              <p className="text-sm">Há peças cuja produção ainda não terminou. O que já foi gerado será preservado.</p>
              <p className="text-sm">{unfinishedPlans.length} peças aguardam conteúdo; {visualPending} sequências têm imagens pendentes. {pending.length} posts já estão disponíveis para revisar.</p>
              {plans.filter(p => p.production_batch_id === productionBatchId && p.generation_error).map(p => <p key={p.id} className="text-xs text-muted-foreground">{p.format==='carousel'?'Carrossel':p.format==='story'?'Stories':'Imagem única'} · {p.approach}: {p.generation_error}</p>)}
              <Button variant="outline" disabled={!!progress} onClick={() => setRunNonce(n => n+1)}>Retomar produção pendente</Button>
            </section>}
            <div className="flex justify-end"><Button variant="accent" size="lg" onClick={() => setView({ kind: 'gallery' })}>Revisar produção <ArrowRight className="h-4 w-4" /></Button></div>
          </>
        )}
      </div>
    );
  }

  // ---------------- TELA 12A — galeria ----------------
  if (view.kind === 'gallery') {
    const allDone = units.length > 0 && units.every(u=>u.approved) && !unfinishedPlans.length;
    return (
      <div className="space-y-5" data-testid="gallery">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-semibold">{campaign.name}</p><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{isAvulso(campaign) ? 'Conteúdo avulso' : `Ciclo ${String(cycle.idx).padStart(2, '0')} · ${formatRange(cycle.start_date, cycle.end_date)}`}</p>
            <h1 className="font-display text-2xl font-bold" data-testid="gallery-counts">{units.length} peças · {approvedCount} aprovadas · {pending.length} para revisar</h1>
          </div>
        </div>
        {productionBatchId&&<section className="space-y-3 rounded-xl border bg-card p-4" data-testid={progress?'production-progress-summary':'production-summary'}>
          <p className="text-sm">{Math.max(units.length,plans.filter(p=>p.production_batch_id===productionBatchId&&p.status!=='removed').length)} peças previstas · {approvedCount} aprovadas · {pending.length} prontas para revisar</p>
          <p className="text-xs text-muted-foreground">Revise as peças abaixo. Aprovar não agenda: as contas e datas serão definidas depois.</p>
          {progress&&<div data-testid="produce-progress"><p role="status" className="flex gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin"/>Produzindo peças e imagens: {progress.done} de {progress.total}.</p></div>}
          {!progress&&(unfinishedPlans.length>0||visualPending>0)&&<div className="space-y-2">
            <p className="text-sm">{unfinishedPlans.length} peças aguardam conteúdo; {visualPending} sequências têm imagens pendentes. {pending.length} posts já estão disponíveis para revisar.</p>
            <Button variant="outline" onClick={()=>setRunNonce(n=>n+1)}>Retomar produção pendente</Button>
          </div>}
          {pending.length>0&&<Button size="sm" variant="outline" disabled={!!progress} onClick={()=>nextPending()}>Ir para a próxima pendente <ArrowRight className="h-4 w-4"/></Button>}
        </section>}
        {allDone && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5" data-testid="production-done">
            <div>
              <p className="flex items-center gap-2 font-display text-lg font-semibold"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Produção concluída</p>
              <p className="text-sm text-muted-foreground">{approvedCount} de {units.length} peças aprovadas. {isAvulso(campaign) ? 'Tudo pronto para programar.' : 'Todos os conteúdos previstos para este ciclo estão prontos.'}</p>
            </div>
            <Button variant="accent" onClick={() => act('finish', async () => {
              if (onPreparePublication) { onPreparePublication(); return; }
              const c = cycle.status === 'ready' ? cycle : await finishProduction(cycle);
              onCycleChange(c);
              navigate(isAvulso(campaign) ? '/agenda' : `/agenda?campaign=${campaign.id}`);
            })} disabled={!!busy}>{onPreparePublication ? 'Escolher contas e preparar publicação' : 'Seguir para programação'} <ArrowRight className="h-4 w-4" /></Button>
          </div>
        )}
        {(contents ?? []).filter((c) => c.status === 'validated').sort((a, b) => a.position - b.position).map((c, n) => {
          const us = units.filter((u) => u.content.id === c.id);
          if(productionBatchId&&!us.length)return null;
          return (
            <section key={c.id} className="space-y-3 rounded-2xl border bg-card p-4" data-testid="gallery-content">
              <p className="text-sm font-semibold"><span className="mr-2 text-muted-foreground">{String(n + 1).padStart(2, '0')}.</span>{c.title}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {us.map((u) => (
                  <div key={u.key} id={`review-piece-${u.main.id}`} className={`space-y-2 ${['carousel','story'].includes(u.main.format)?'sm:col-span-2 lg:col-span-3':''}`} data-testid="gallery-unit">
                    <button type="button" disabled={!canReviewProduction(u.main,plans,productionBatchId)} onClick={() => openUnit(u)} className="block w-full min-w-0 text-left"><Preview piece={u.main} units={pageUnits.filter(p=>p.post_id===u.main.id)} className="aspect-[4/5]" /></button>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-1.5"><PlatformIcon p={u.main.platform} className="h-3.5 w-3.5" />{u.main.platform === 'linkedin' ? 'LinkedIn' : 'Instagram'} · {accountLabel(u.main.account_id)}
                        {(u.main.format === 'carousel' || u.main.format === 'story') && <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px]" data-testid="unit-format">{u.main.format === 'story' ? 'Stories' : 'Carrossel'}{u.main.script_status === 'draft'&&u.main.metadata?.production_flow!=='base_v2' ? ' · roteiro' : ''}</span>}</span>
                      <span className={`font-semibold ${u.approved?'text-emerald-600':stateOf(u.main)==='failed'?'text-destructive':'text-accent'}`} data-testid="unit-status">{u.approved?'Aprovado':u.main.metadata?.production_flow==='base_v2'?({ready:'Pronta para revisar',producing:'Imagens em produção',failed:'Produção interrompida',pending:'Produção pendente',approved:'Aprovado'}[stateOf(u.main)]):'Para revisar'}</span>
                    </div>
                    {!u.approved&&stateOf(u.main)==='failed'&&<p className="text-xs text-muted-foreground">Há uma imagem que não ficou pronta. Abra a peça para ver o motivo e retomar sem refazer as demais.</p>}
                    <Button size="sm" variant="outline" className="w-full" disabled={!canReviewProduction(u.main,plans,productionBatchId)} onClick={()=>openUnit(u)}>{u.approved?'Ver peça aprovada':stateOf(u.main)==='failed'?'Ver falha e retomar':u.main.metadata?.production_flow==='base_v2'?'Revisar peça':'Revisar propostas'} <ArrowRight className="h-3.5 w-3.5"/></Button>
                  </div>
                ))}
              </div>
              {allowAutoProduction && !productionBatchId && !cycle.plan?.production && <PiecePlanPanel content={c} plans={plans.filter((pl) => pl.content_id === c.id)} pieces={pieces.filter((x) => x.content_id === c.id)}
                accounts={accounts.filter((a) => (campaign.account_ids ?? []).includes(a.id) || !(campaign.account_ids ?? []).length)}
                onChanged={async (produce) => { await load(); if (produce) { setChecked(false); setRunNonce((x) => x + 1); setView({ kind: 'overview' }); } }} />}
            </section>
          );
        })}
      </div>
    );
  }

  // ---------------- TELA 12B — escolha da proposta ----------------
  if (view.kind === 'choose') {
    const u = units.find((x) => x.key === view.group);
    if (!u) return <Button variant="outline" onClick={() => setView({ kind: 'gallery' })}><ArrowLeft className="h-4 w-4" /> Voltar para a galeria</Button>;
    const desc = (p: UserPost) => {
      const vd = p.visual_decision as { variant?: string; explanation?: { variant_reason?: string } } | null;
      const seed = p.metadata?.hive_seed as { variant_reason?: string } | undefined;
      const alt = p.metadata?.alt_mode as string | undefined;
      const altWhy = alt === 'design' ? 'Mesma frase, outro layout.' : alt === 'image' ? 'Mesma frase e mesmo design, imagem nova.' : alt === 'both' ? 'Mesma frase, design e imagem novos.' : '';
      return { variant: vd?.variant, name: vd?.variant ? `${vd.variant} · ${variantNames[vd.variant] ?? ''}` : '', why: altWhy || seed?.variant_reason || vd?.explanation?.variant_reason || '' };
    };
    return (
      <div className="space-y-5" data-testid="choose-view">
        <button type="button" onClick={() => setView({ kind: 'gallery' })} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Voltar para a galeria</button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conteúdo de origem</p>
          <h1 className="font-display text-2xl font-bold">{u.content.title}</h1>
          <p className="text-sm text-muted-foreground">{u.main.platform === 'linkedin' ? 'LinkedIn' : 'Instagram'} · {accountLabel(u.main.account_id)} · Imagem</p>
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider">Escolha a direção</p>
        {varyBar(u.main, u.pieces)}
        <div className="grid gap-4 md:grid-cols-3">
          {u.pieces.map((p, i) => {
            const d = desc(p);
            const rec = p.is_recommended || (i === 0 && !u.pieces.some((x) => x.is_recommended));
            return (
              <div key={p.id} className={`flex flex-col gap-3 rounded-2xl border p-3 ${rec ? 'border-accent bg-accent/5 md:col-span-1' : 'bg-card'}`} data-testid="proposal">
                <span className={`self-start rounded-full px-2 py-0.5 text-[11px] font-semibold ${rec ? 'bg-accent text-accent-foreground' : 'bg-secondary'}`} data-testid="proposal-tag">
                  {rec ? 'Recomendação da Hive' : ({ design: imageKind(d.variant) === 'none' ? 'Novo design' : 'Novo design · mesma imagem', image: 'Nova imagem · mesmo design', both: 'Design e imagem novos' } as Record<string, string>)[String(p.metadata?.alt_mode ?? '')] ?? `Alternativa ${String(i + 1).padStart(2, '0')}`}
                </span>
                <Preview piece={p} className="aspect-[4/5]" />
                <div className="flex-1 space-y-1 text-sm">
                  <p className="font-semibold">Opção {String(i + 1).padStart(2, '0')}{d.name ? ` · ${d.name}` : ''}</p>
                  {d.why && <p className="text-xs text-muted-foreground">{d.why}</p>}
                </div>
                <Button variant={rec ? 'accent' : 'outline'} onClick={() => act(`choose-${p.id}`, async () => {
                  await choosePiece(p, u.pieces);
                  setPieces((ps) => ps.map((x) => (u.pieces.some((y) => y.id === x.id) && x.id !== p.id ? { ...x, status: 'archived' as const } : x)));
                  setView({ kind: 'edit', pieceId: p.id });
                })} disabled={!!busy} aria-label={`Escolher opção ${i + 1}`}>{rec ? 'Escolher esta' : 'Escolher'}</Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------------- TELA 12C — edição e aprovação / após aprovação ----------------
  const piece = pieceById(view.pieceId);
  if (!piece) return <Button variant="outline" onClick={() => setView({ kind: 'gallery' })}><ArrowLeft className="h-4 w-4" /> Voltar para a galeria</Button>;
  const unit = units.find((u) => u.pieces.some((p) => p.id === piece.id));
  const variant = (piece.visual_decision as { variant?: string } | null)?.variant;
  const isApproved = ['approved', 'scheduled', 'published'].includes(piece.status);

  if (view.kind === 'approved') {
    const remaining = pending.filter((u) => u.key !== unit?.key);
    return (
      <div className="space-y-5" data-testid="piece-approved">
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-600" />
          <div><p className="font-display text-xl font-semibold">Peça aprovada!</p>
            <p className="text-sm text-muted-foreground">{piece.platform === 'linkedin' ? 'LinkedIn' : 'Instagram'} · {piece.format==='carousel'?'Carrossel':piece.format==='story'?'Stories':'Imagem'} — {unit?.content.title}</p></div>
        </div>
        <div className="space-y-2 rounded-2xl border bg-card p-4">
          <p className="text-sm font-medium">{isAvulso(campaign) ? 'Progresso' : 'Progresso do ciclo'}</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary"><div className="h-full bg-emerald-500" style={{ width: `${(approvedCount / Math.max(1, units.length)) * 100}%` }} /></div>
          <p className="text-xs text-muted-foreground" data-testid="cycle-progress">{approvedCount} de {units.length} peças aprovadas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {remaining.length > 0 && <Button variant="accent" onClick={() => nextPending(unit?.key)}>Próxima peça para revisar <ArrowRight className="h-4 w-4" /></Button>}
          <Button variant="outline" onClick={() => setView({ kind: 'gallery' })}>{isAvulso(campaign) ? 'Ver produção' : 'Ver produção do ciclo'}</Button>
        </div>
      </div>
    );
  }

  // Sequência (carrossel): roteiro → direção visual → páginas → aprovação e exportação.
  if (piece.format === 'carousel' || piece.format === 'story') {
    return (
      <div className="space-y-5" data-testid="edit-view">
        <button type="button" onClick={() => setView({ kind: 'gallery' })} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Voltar à lista de peças</button>
        <div>
          <h1 className="font-display text-2xl font-bold">{unit?.content.title}</h1>
          <p className="text-sm text-muted-foreground">{piece.platform === 'linkedin' ? 'LinkedIn' : 'Instagram'} · {piece.format === 'story' ? 'Stories' : 'Carrossel'}</p>
          {plans.find(pl=>pl.post_id===piece.id)?.approach?.trim()&&<ProductionDetails compact={piece.metadata?.production_flow==='base_v2'}>{plans.find(pl=>pl.post_id===piece.id)?.approach}</ProductionDetails>}
        </div>
        <SequenceWorkspace piece={piece} onChange={replacePiece} onApproved={approvedPiece} />
      </div>
    );
  }

  const quote = (piece.carousel_text?.quote as string | undefined) ?? '';
  const photoGenId = (piece.visual_decision as { asset?: { photo_generation_id?: string } } | null)?.asset?.photo_generation_id ?? null;
  return (
    <div className="space-y-5" data-testid="edit-view">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setView({ kind: 'gallery' })} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Voltar à lista de peças</button>
        <div className="flex flex-wrap gap-2">
          {unit && unit.pieces.length > 1 && !isApproved && <Button variant="outline" onClick={() => setView({ kind: 'choose', group: unit.key })}>Ver outras opções</Button>}
          {!isApproved && (
            <Button variant="accent" onClick={() => act('approve', async () => {
              const a = await approvePiece(piece);
              approvedPiece(a);
            })} disabled={!!busy || !piece.rendered_slides?.slide1}>
              {busy === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Aprovar peça
            </Button>
          )}
        </div>
      </div>
      {!isApproved && photoGenId && (
        <MarcosPhotoReview key={photoGenId} generationId={photoGenId} busy={!!busy} compact
          onApprove={() => act('approve', async () => { const a = await approvePiece(piece); approvedPiece(a); })}
          onRegenerate={(note) => setPhotoRequest({ action: 'swap_image', instruction: note || undefined, nonce: Date.now() })} />
      )}
      <div>
        <h1 className="font-display text-2xl font-bold">{unit?.content.title}</h1>
        <p className="text-sm text-muted-foreground">{piece.platform === 'linkedin' ? 'LinkedIn' : 'Instagram'} · Imagem{isApproved ? ' · Aprovada' : ''}</p>
        <ProductionDetails compact={piece.metadata?.production_flow==='base_v2'}><p>{accountLabel(piece.account_id)}{variant ? ` · ${variant}${variantNames[variant] ? ` ${variantNames[variant]}` : ''}` : ''}</p>
        {(piece.metadata as { repeat?: { verdict?: string; of_text?: string; of_date?: string; reason?: string } } | null)?.repeat?.verdict === 'repeat' && (() => {
          const r = (piece.metadata as { repeat: { of_text?: string; of_date?: string; reason?: string } }).repeat;
          return (
            <p className="mt-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-800 dark:text-amber-300" data-testid="piece-repeat">
              Parecida com um post de {r.of_date ? new Date(r.of_date).toLocaleDateString('pt-BR') : 'antes'}: “{(r.of_text ?? '').split(' — ')[0].slice(0, 120)}”. {r.reason}
            </p>
          );
        })()}
        {piece.acj_primary && (
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground" data-testid="piece-acj">
            <AcjChip id={piece.acj_primary} size="xs" /> herdada do conteúdo-mãe{piece.acj_frozen_at ? ' · congelada na publicação' : ''}
            {(piece.visual_decision as { explanation?: { acj_note?: string } } | null)?.explanation?.acj_note && (
              <span>· {(piece.visual_decision as { explanation: { acj_note: string } }).explanation.acj_note}</span>
            )}
          </p>
        )}
        </ProductionDetails>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="space-y-2">
          <Preview piece={piece} className="aspect-[4/5]" />
        </div>
        <div className="space-y-4">
          <section className="space-y-3 rounded-2xl border bg-card p-4" data-testid="piece-text">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Texto</p>
            <p className="font-display text-base font-semibold" data-testid="piece-quote">{quote}</p>
            <p className="line-clamp-6 whitespace-pre-line text-sm text-muted-foreground" data-testid="piece-caption">{piece.caption}</p>
            {(piece.version ?? 1) > 1 && <p className="text-[11px] text-muted-foreground" data-testid="piece-version">Versão v{piece.version}</p>}
          </section>
          {isApproved && piece.status !== 'published' && piece.metadata?.production_flow !== 'base_v2' && (
            <section className="space-y-2 rounded-2xl border bg-card p-4" data-testid="piece-schedule">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{piece.scheduled_date ? 'Reprogramar (data e hora)' : 'Agendar (data e hora)'}</p>
              <Input type="datetime-local" aria-label="Data e hora da publicação" min={nowLocalInput()} value={isoToLocalInput(piece.scheduled_date)}
                onChange={(e) => { const iso = localInputToIso(e.target.value); if (!iso) return; if (new Date(iso).getTime() < Date.now()) { toast.error('Escolha uma data futura.'); return; }
                  void act('schedule', async () => { replacePiece(await reschedulePiece(piece, iso)); toast.success('Reprogramado.'); }); }} />
            </section>
          )}
          <PieceActionsPanel piece={piece} userId={currentUser!.id} externalRequest={photoRequest}
            onApplied={(p) => { replacePiece(p); setPhotoRequest(null); }} />
          {piece.status !== 'published' && (
            <Button size="sm" variant="ghost" asChild><Link to={`/posts/${piece.id}`} state={{ from: `/producao?campaign=${campaign.id}&cycle=${cycle.id}` }}><ExternalLink className="h-3.5 w-3.5" /> Abrir no editor completo</Link></Button>
          )}
        </div>
      </div>
    </div>
  );
}
