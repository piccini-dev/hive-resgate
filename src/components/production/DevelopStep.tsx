// Conteúdos-base: desenvolver o pensamento e preservar versões antes de criar posts.
import { BaseContextSummary } from './BaseContextSummary';
import { AcjContractSummary } from '@/components/acj/AcjContractSummary';
import { acjContractApi } from '@/lib/acj/api';
import type { AcjContentContract } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Pencil, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadError } from '@/components/shared/LoadState';
import { baseApi } from '@/lib/campaign/bases';
import { developIdeas, editContent, finishValidation, reviseWithHive, validateContent } from '@/lib/campaign/develop';
import type { BeeEditorial, Campaign, CampaignCycle, Content, ContentBody, Idea, SocialAccount } from '@/types';

export function DevelopStep({ campaign, cycle, ideas, editorials, onIdeasChange, onCycleChange, onDone, focusContentId }: {
  campaign: Campaign; cycle: CampaignCycle; ideas: Idea[]; editorials: BeeEditorial[]; accounts: SocialAccount[]; focusContentId?: string;
  onIdeasChange: (i: Idea[]) => void; onCycleChange: (c: CampaignCycle) => void; onDone: (c: CampaignCycle) => void;
}) {
  const [contract, setContract] = useState<AcjContentContract | null>(null);
  const [contents, setContents] = useState<Content[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(focusContentId ?? null);
  const [justApproved, setJustApproved] = useState(false);
  const [editing, setEditing] = useState<ContentBody | null>(null);
  const [adjusting, setAdjusting] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const load = useCallback(async () => {
    setFailed(false);
    try { setContents(await baseApi.listByCycle(cycle.id)); } catch { setFailed(true); }
  }, [cycle.id]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { let alive=true; setContract(null); if(focusId)void acjContractApi.listByContents([focusId]).then(cs=>{if(alive)setContract(cs.sort((a,b)=>b.version-a.version)[0]??null);}).catch(()=>{}); return()=>{alive=false;}; },[focusId]);
  const live = (contents ?? []).filter((c) => c.status !== 'discarded');
  const approvedIdeas = ideas.filter((i) => i.status === 'approved' || i.status === 'developed');
  const missing = approvedIdeas.filter((i) => i.status === 'approved' && !live.some((c) => c.idea_id === i.id));
  const validated = live.filter((c) => c.status === 'validated');
  const current = live.find((c) => c.id === focusId);
  const next = live.find((c) => c.status !== 'validated' && c.id !== focusId);
  const replace = (c: Content) => setContents((cs) => [...(cs ?? []).filter((x) => x.id !== c.id), c].sort((a, b) => a.position - b.position));
  const overview = () => { setFocusId(null); setEditing(null); setAdjusting(false); setJustApproved(false); };
  const open = (c: Content) => { setFocusId(c.id); setEditing(null); setAdjusting(false); setJustApproved(false); };
  async function act(key: string, fn: () => Promise<void>) {
    if (busy) return;
    setBusy(key);
    try { await fn(); } catch (e) { toast.error((e as Error).message); } finally { setBusy(null); }
  }
  const develop = () => act('develop', async () => {
    setProgress({ done: 0, total: missing.length });
    try {
      const r = await developIdeas(cycle, ideas, live, (done, total, content) => { setProgress({ done, total }); if (content) replace(content); });
      onCycleChange(r.cycle);
      onIdeasChange(ideas.map((i) => r.contents.some((c) => c.idea_id === i.id) ? { ...i, status: 'developed' } : i));
      await load();
    } finally { setProgress(null); }
  });
  const revise = (c: Content) => act('adjust', async () => {
    const idea = ideas.find((i) => i.id === c.idea_id);
    if (!idea) throw new Error('A pauta de origem não está disponível neste ciclo.');
    replace(await reviseWithHive(c, idea, 'adjust', instruction));
    setInstruction(''); setAdjusting(false);
    toast.success('Nova versão em elaboração. A versão validada anterior permanece preservada.');
  });
  if (failed) return <LoadError what="os conteúdos-base" onRetry={() => void load()} />;
  if (!contents) return <div className="p-10"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (!current) return (
    <div className="space-y-5" data-testid="base-overview">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Desenvolver conteúdos-base</p>
        <h1 className="mt-1 font-display text-2xl font-bold">O conhecimento que vai sustentar os posts.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Aprofunde e valide o pensamento. Na próxima etapa, a Hive propõe as peças, os formatos e as plataformas.</p>
      </div>
      <p className="text-sm" data-testid="base-progress">{validated.length} bases validadas · {live.length - validated.length} em elaboração · {missing.length} pautas para desenvolver</p>
      <div className="space-y-3">
        {live.map((c) => <section key={c.id} className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4" data-testid="base-card">
          <div className="min-w-0">
            <p className="font-semibold">{c.title}</p>
            <BaseContextSummary snapshotId={c.context_snapshot_id} />
            <p className="mt-1 text-xs text-muted-foreground">{c.metadata?.base_origin === 'archive' ? 'Do acervo' : 'Desenvolvimento desta pauta'} · {c.status === 'validated' ? 'Base validada' : 'Em elaboração'}{c.editorial_slug ? ' · ' + (editorials.find((e) => e.slug === c.editorial_slug)?.name ?? c.editorial_slug) : ''}</p>
          </div>
          <Button variant="outline" disabled={!!busy} onClick={() => open(c)}>{c.status === 'validated' ? 'Ver base' : 'Desenvolver / revisar'}</Button>
        </section>)}
        {missing.map((i) => <div key={i.id} className="rounded-xl border border-dashed p-4 text-sm"><span className="font-medium">{i.title}</span><p className="text-xs text-muted-foreground">{i.source_base_version_id ? 'Do acervo · a recuperar' : 'Nova proposta · a desenvolver'}</p></div>)}
      </div>
      {progress && <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Desenvolvendo {progress.done} de {progress.total}...</p>}
      <div className="flex flex-wrap justify-between gap-3">
        {missing.length > 0 && <Button variant="outline" onClick={develop} disabled={!!busy}><Sparkles className="h-4 w-4" />Desenvolver conteúdos-base</Button>}
        <Button variant="accent" disabled={!!busy || validated.length === 0} onClick={() => act('finish', async () => onDone(await finishValidation(cycle)))}>Seguir para criação dos posts <ArrowRight className="h-4 w-4" /></Button>
      </div>
      {live.some((c) => c.status !== 'validated') && validated.length > 0 && <p className="text-xs text-muted-foreground">Você pode seguir com as bases validadas. As demais continuam disponíveis para retomar depois.</p>}
    </div>
  );
  if (justApproved) return (
    <div className="space-y-5" data-testid="content-approved">
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <p className="flex items-center gap-2 font-display text-xl font-semibold"><CheckCircle2 className="h-5 w-5 text-emerald-600" />Conteúdo-base validado</p>
        <p className="mt-2 text-sm">O pensamento está salvo e pode sustentar diferentes peças. Nenhum post foi criado nesta aprovação.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {next && <Button variant="accent" onClick={() => open(next)}>Desenvolver próxima base <ArrowRight className="h-4 w-4" /></Button>}
        <Button variant="outline" onClick={overview}>Voltar à visão geral</Button>
      </div>
    </div>
  );
  const c = current;
  return (
    <div className="space-y-5" data-testid="base-development">
      <Button variant="ghost" onClick={overview} disabled={!!busy}><ArrowLeft className="h-4 w-4" />Voltar à visão geral</Button>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Conteúdos-base · {live.indexOf(c) + 1} de {live.length}</p>
        <h1 className="mt-1 font-display text-2xl font-bold">{c.title}</h1>
        <BaseContextSummary snapshotId={c.context_snapshot_id} />
        <p className="mt-2 text-sm text-muted-foreground">Uma base de pensamento reutilizável. Formatos, templates e destinos serão definidos ao criar os posts.</p>
      </div>
      {editing ? <section className="space-y-4 rounded-xl border bg-card p-5">
        <Label htmlFor="base-summary">Síntese do pensamento</Label><Textarea id="base-summary" value={editing.frase ?? ''} onChange={(e) => setEditing({ ...editing, frase: e.target.value })} />
        <Label htmlFor="base-text">Desenvolvimento</Label><Textarea id="base-text" rows={18} value={editing.texto ?? ''} onChange={(e) => setEditing({ ...editing, texto: e.target.value })} />
        <div className="flex gap-2"><Button variant="accent" disabled={!!busy || !editing.texto?.trim()} onClick={() => act('save', async () => { replace(await editContent(c, editing)); setEditing(null); })}>Salvar versão</Button><Button variant="ghost" disabled={!!busy} onClick={() => setEditing(null)}>Cancelar edição</Button></div>
      </section> : <article className="rounded-2xl border bg-card p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Síntese do pensamento</p>
        <p className="mt-2 font-display text-xl font-semibold" data-testid="content-frase">{c.body.frase}</p>
        <div className="mt-5 whitespace-pre-line leading-relaxed" data-testid="content-texto">{c.body.texto}</div>
      </article>}
      {contract && <section className="space-y-2"><p className="text-xs text-muted-foreground">Contrato e leitura anteriores, preservados como referência. Validar esta base não aprova o movimento de um post futuro.</p><AcjContractSummary contract={contract} onChange={setContract}/></section>}
      {c.considered?.base && <p className="text-sm text-muted-foreground">Apoios considerados: {c.considered.base}</p>}
      {c.status === 'validated' && <p className="text-sm text-emerald-700">Base validada. Editar cria uma nova versão em elaboração; utilizações anteriores continuam preservadas.</p>}
      {adjusting && <section className="space-y-3 rounded-xl border bg-accent/5 p-4">
        <Label htmlFor="base-adjust">O que vamos aprofundar ou ajustar?</Label>
        <Input id="base-adjust" value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Ex.: aprofunde as tensões e mostre o que ainda precisamos investigar." />
        <Button variant="accent" disabled={!!busy || !instruction.trim()} onClick={() => revise(c)}>Ajustar base com a Hive</Button>
      </section>}
      {!editing && <div className="flex flex-wrap justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={!!busy} onClick={() => setEditing({ ...c.body })}><Pencil className="h-4 w-4" />Editar diretamente</Button>
          <Button variant="outline" disabled={!!busy} onClick={() => act('new-version', async () => { const idea=ideas.find(i=>i.id===c.idea_id); if(!idea)throw new Error('Pauta de origem indisponível.'); replace(await reviseWithHive(c,idea,'new_version')); })}>Nova versão da base</Button>
          <Button variant="outline" disabled={!!busy} onClick={() => setAdjusting((v) => !v)}><Sparkles className="h-4 w-4" />Ajustar com a Hive</Button>
        </div>
        {c.status !== 'validated' && <Button variant="accent" disabled={!!busy} onClick={() => act('approve', async () => {
          const r = await validateContent(c, ideas.find((i) => i.id === c.idea_id), campaign); replace(r.content); setJustApproved(true); setAdjusting(false);
        })}>{busy === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Validar conteúdo-base</Button>}
      </div>}
    </div>
  );
}
