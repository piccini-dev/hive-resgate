import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProfilePicker } from '@/components/identity/ProfilePicker';
import { LoadError } from '@/components/shared/LoadState';
import { baseApi, type BaseVersion } from '@/lib/campaign/bases';
import { startAvulso } from '@/lib/campaign/avulso';
import { developIdeas, reviseWithHive } from '@/lib/campaign/develop';
import { campaignApi, contentApi, cycleApi, ideaApi } from '@/lib/campaignApi';
import { identityApi } from '@/lib/identityApi';
import { db } from '@/lib/db';
import { discoveryApi } from '@/lib/discoveryApi';
import { freeDiscoveries, motherStock } from '@/lib/campaign/stock';
import type { Content, ContentBody, Idea } from '@/types';
import type { DiscoveryAvailability, DiscoveryState, KnowledgeDiscovery } from '@/types/discovery';

type Entry = { content: Content; version: BaseVersion | null };
type Stock = { discoveries: KnowledgeDiscovery[]; availability: DiscoveryAvailability[] };
const STATE_LABEL: Record<DiscoveryState, string> = { livre: 'Ainda não usado', reservada: 'Reservado numa produção', usada: 'Já usado' };
// Proposta da Hive: conteúdo-mãe que a varredura escreveu a partir do material solto e ainda não foi validado.
const isProposal = (c: Content) => c.metadata?.origin === 'discovery' && c.status !== 'validated';
export function MotherContents() {
  const [params, setParams] = useSearchParams();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false), [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState<Content | null>(null);
  const [body, setBody] = useState<ContentBody | null>(null);
  const [creating, setCreating] = useState(false), [title, setTitle] = useState(''), [summary, setSummary] = useState('');
  const [instruction, setInstruction] = useState(''), [profile, setProfile] = useState<string | null>(null);
  const [history, setHistory] = useState<BaseVersion[]>([]), [uses, setUses] = useState<Array<{ campaign_id: string; version_id: string }>>([]);
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>({});
  const [stock, setStock] = useState<Stock | null>(null), [stockFailed, setStockFailed] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  // O material é complementar: se falhar, o acervo continua utilizável.
  async function load() {
    setFailed(false); setStockFailed(false);
    await Promise.all([
      baseApi.catalog().then(setEntries, () => setFailed(true)),
      Promise.all([discoveryApi.list(), discoveryApi.availability()]).then(([discoveries, availability]) => setStock({ discoveries, availability }), () => setStockFailed(true)),
    ]);
  }
  useEffect(() => { void load(); void identityApi.profiles().then(ps => setProfile(current => current ?? ps.find(p => p.is_default)?.id ?? ps[0]?.id ?? null)).catch(() => {}); }, []);
  async function act(fn: () => Promise<void>) { if (busy) return; setBusy(true); try { await fn(); } catch(e) { toast.error((e as Error).message); } finally { setBusy(false); } }
  async function open(content: Content) {
    const [versions, usages, container, campaigns] = await Promise.all([
      db.select<BaseVersion>('content_base_versions', { content_id: `eq.${content.id}`, order: 'ordinal.desc' }),
      db.select<{ campaign_id: string; version_id: string }>('content_base_uses', { content_id: `eq.${content.id}`, select: 'campaign_id,version_id' }),
      campaignApi.getAvulso(),
      campaignApi.list(),
    ]);
    const cycles = container ? await cycleApi.listByCampaign(container.id) : [];
    const workspaceIds = new Set(cycles.map(c => c.id));
    const draft = versions.find(v => v.status === 'draft' && v.draft_cycle_id && workspaceIds.has(v.draft_cycle_id));
    const working = draft ? (await baseApi.listByCycle(draft.draft_cycle_id!)).find(c => c.id === content.id) ?? content : content;
    setCurrent(working); setBody(null); setInstruction(''); setHistory(versions); setUses(usages.filter(u => campaigns.some(c => c.id === u.campaign_id))); setCampaignNames(Object.fromEntries(campaigns.map(c => [c.id, c.name]))); setCreating(false);
    setParams({ content: content.id }, { replace: true });
  }
  useEffect(() => {
    const id = params.get('content');
    if (entries && id && current?.id !== id) { const e = entries.find(e => e.content.id === id); if (e) void act(() => open(e.content)); }
  // A abertura por link ocorre somente quando o conteúdo solicitado muda.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, params.get('content')]);
  // Uma proposta nasce fora de campanha: ganha um ciclo avulso, o mesmo caminho de "Novo conteúdo mãe", antes de revisar ou validar.
  async function attach(c: Content): Promise<Content> {
    if (c.cycle_id || !isProposal(c)) return c;
    const r = await startAvulso({ title: c.title, summary: c.body.frase ?? '', strategic_function: c.strategic_function ?? 'autoridade', editorial_slug: c.editorial_slug ?? '', channels: [] }, [], c.profile_id);
    return contentApi.update(c.id, { campaign_id: r.campaign.id, cycle_id: r.cycle.id, idea_id: r.idea.id });
  }
  async function validateProposals(ids: string[]) {
    let ok = 0; const failures: string[] = [];
    for (const id of ids) {
      const e = entries?.find(x => x.content.id === id);
      if (!e) continue;
      try { await baseApi.validate(await attach(e.content)); ok++; } catch (err) { failures.push(`${e.content.title}: ${(err as Error).message}`); }
    }
    setPicked([]); await load();
    if (ok) toast.success(ok === 1 ? '1 conteúdo mãe validado. Nenhum post foi criado.' : `${ok} conteúdos mãe validados. Nenhum post foi criado.`);
    if (failures.length) toast.error(`Não foi possível validar: ${failures.join(' · ')}`);
  }
  async function discard(c: Content) {
    if (!confirm(`Descartar a proposta "${c.title}"? O material dela volta a ficar solto para novas propostas.`)) return;
    // Primeiro devolve o material: se a segunda escrita falhar, a proposta continua visível e pode ser descartada de novo.
    await db.update('knowledge_discoveries', { content_id: `eq.${c.id}`, status: 'neq.dismissed' }, { status: 'active', content_id: null, updated_at: new Date().toISOString() });
    await contentApi.update(c.id, { status: 'discarded' });
    setPicked(p => p.filter(id => id !== c.id));
    if (current?.id === c.id) { setCurrent(null); setParams({}); }
    toast.success('Proposta descartada. O material voltou a ficar solto.');
    await load();
  }
  async function propose() {
    const r = await discoveryApi.proposeMothers();
    if (r.proposed) toast.success(r.proposed === 1 ? 'A Hive propôs 1 conteúdo mãe.' : `A Hive propôs ${r.proposed} conteúdos mãe.`);
    else toast.info('Ainda não há material solto parecido o bastante para propor um conteúdo mãe.');
    await load();
  }
  function stockLabel(contentId: string): string {
    const s = motherStock(contentId, stock!.discoveries, stock!.availability);
    if (s.estado === 'vivo') return s.livres === 1 ? '1 material ainda não usado' : `${s.livres} materiais ainda não usados`;
    return s.reservadas + s.usadas === 0 ? 'Esgotado · nenhum material ligado ainda' : 'Esgotado';
  }
  async function workspace(c: Content): Promise<Content> {
    if (isProposal(c) && !c.cycle_id) { const attached = await attach(c); setCurrent(attached); return attached; }
    const container = await campaignApi.getAvulso();
    if (container && c.campaign_id === container.id) return c;
    const version = history.find(v => v.status === 'validated');
    if (!version) throw new Error('Esta base ainda não tem uma versão validada para revisão independente.');
    const r = await startAvulso({ title: c.title, summary: c.body.frase ?? '', strategic_function: c.strategic_function ?? 'autoridade', editorial_slug: c.editorial_slug ?? '', channels: [] }, [], c.profile_id);
    await baseApi.adopt(version.id, r.cycle.id, r.idea.id);
    const adopted = (await baseApi.listByCycle(r.cycle.id)).find(b => b.id === c.id);
    if (!adopted) throw new Error('Não foi possível abrir a base para revisão.');
    setCurrent(adopted);
    return adopted;
  }
  async function save(next: ContentBody) {
    const c = await workspace(current!);
    const saved = await baseApi.saveDraft(c, next, 'Revisão no acervo de conteúdos mãe');
    setCurrent(saved); setBody(null); toast.success('Rascunho salvo. As versões usadas nas campanhas permanecem preservadas.');
    await load();
  }
  if (failed) return <LoadError what="os conteúdos mãe" onRetry={() => void load()} />;
  const proposals = entries?.filter(e => isProposal(e.content)) ?? [];
  const regular = entries?.filter(e => !isProposal(e.content)) ?? null;
  const state = new Map(stock?.availability.map(a => [a.discovery_id, a.state]));
  const material = current && stock ? [...freeDiscoveries(current.id, stock.discoveries, stock.availability),
    ...stock.discoveries.filter(d => d.content_id === current.id && d.status !== 'dismissed' && state.get(d.id) !== 'livre')] : [];
  return <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-8" data-testid="mother-contents">
    <header><p className="text-xs uppercase text-muted-foreground">Voz da Hive · Acervo</p><h1 className="mt-1 font-display text-2xl font-bold">Conteúdos mãe</h1>
      <p className="mt-2 text-sm text-muted-foreground">Desenvolva e valide pensamentos amplos. Campanhas utilizam essas bases para propor recortes; produzir e aprovar posts são etapas posteriores.</p></header>
    <nav className="flex flex-wrap gap-3 text-sm"><Link to="/conhecimento" className="underline">Materiais de conhecimento</Link><Link to="/campanhas" className="underline">Campanhas</Link>
      <Button size="sm" disabled={busy} onClick={() => { setCurrent(null); setCreating(true); setParams({}); }}><Plus className="h-4 w-4"/>Novo conteúdo mãe</Button></nav>
    {busy && <p role="status" className="flex gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin"/>Preparando o conteúdo…</p>}
    {creating ? <section className="space-y-4 rounded-xl border bg-card p-5">
      <h2 className="font-semibold">Qual pensamento vamos desenvolver?</h2>
      <ProfilePicker value={profile} onChange={setProfile} label="Perfil de comunicação"/>
      <label className="block space-y-1 text-sm">Tema do conteúdo mãe<Input value={title} onChange={e => setTitle(e.target.value)} disabled={busy}/></label>
      <label className="block space-y-1 text-sm">Pensamento e referências<Textarea rows={6} value={summary} onChange={e => setSummary(e.target.value)} disabled={busy} placeholder="Descreva a tese, as relações e o que merece aprofundamento."/></label>
      <div className="flex flex-wrap gap-2">{[false, true].map(hive => <Button key={String(hive)} variant={hive ? 'outline' : 'accent'} disabled={busy || !title.trim() || !summary.trim()} onClick={() => void act(async () => {
        const r = await startAvulso({ title, summary, strategic_function: 'autoridade', editorial_slug: '', channels: [] }, [], profile);
        let content: Content;
        if (hive) { const result = await developIdeas(r.cycle, [r.idea], []); content = result.contents[0]; }
        else content = await contentApi.create({ title, campaign_id: r.campaign.id, cycle_id: r.cycle.id, idea_id: r.idea.id, profile_id: profile, validation_format: 'knowledge_base', body: { frase: title, texto: summary }, status: 'pending_validation', metadata: { purpose: 'knowledge_base' }, position: 0, versions: [] });
        await load(); await open(content); setTitle(''); setSummary('');
      })}>{hive ? 'Aprofundar com a Hive' : 'Guardar como rascunho'}</Button>)}<Button variant="ghost" disabled={busy} onClick={() => setCreating(false)}>Cancelar</Button></div>
    </section> : current ? <section className="space-y-4 rounded-xl border bg-card p-5" data-testid="mother-detail">
      <Button variant="ghost" disabled={busy} onClick={() => { setCurrent(null); setParams({}); }}>Voltar ao acervo</Button>
      <h2 className="font-display text-xl font-semibold">{current.title}</h2>
      <p className="text-xs text-muted-foreground">{current.status === 'validated' ? 'Validado' : isProposal(current) ? 'Proposto pela Hive · aguardando validação' : 'Rascunho · aguardando validação'}</p>
      {body ? <><div className="space-y-1 text-sm"><label htmlFor="mother-summary">Síntese</label><Textarea id="mother-summary" value={body.frase ?? ''} disabled={busy} onChange={e => setBody({ ...body, frase: e.target.value })}/></div>
        <div className="space-y-1 text-sm"><label htmlFor="mother-development">Desenvolvimento</label><Textarea id="mother-development" rows={16} value={body.texto ?? ''} disabled={busy} onChange={e => setBody({ ...body, texto: e.target.value })}/></div>
        <Button disabled={busy || !body.texto?.trim()} onClick={() => void act(() => save(body))}>Salvar rascunho</Button><Button variant="ghost" disabled={busy} onClick={() => setBody(null)}>Cancelar edição</Button></> : <>
        <p className="font-semibold">{current.body.frase}</p><p className="whitespace-pre-wrap leading-relaxed">{current.body.texto}</p>
        <Button variant="outline" disabled={busy} onClick={() => setBody({ ...current.body })}>Editar conteúdo mãe</Button>
        <details className="rounded-lg border p-3"><summary className="cursor-pointer text-sm">Aprofundar com a Hive</summary><div className="mt-3 space-y-3"><Textarea aria-label="Pedido de aprofundamento" value={instruction} disabled={busy} onChange={e => setInstruction(e.target.value)} placeholder="O que aprofundar neste pensamento?"/>
          <Button disabled={busy || !instruction.trim()} onClick={() => void act(async () => {
            const c = await workspace(current);
            const idea = (await ideaApi.listByCycle(c.cycle_id!)).find(i => i.id === c.idea_id);
            if (!idea) throw new Error('Não foi possível localizar a origem desta revisão.');
            const saved = await reviseWithHive(c, idea as Idea, 'adjust', instruction); setCurrent(saved); setInstruction(''); await load();
          })}><Sparkles className="h-4 w-4"/>Propor aprofundamento</Button></div></details>
        {current.status !== 'validated' && <Button variant="accent" disabled={busy} onClick={() => void act(async () => { const c = await baseApi.validate(await attach(current)); setCurrent(c); await load(); await open(c); toast.success('Conteúdo mãe validado. Nenhum post foi criado.'); })}>Validar conteúdo mãe</Button>}
        {isProposal(current) && <Button variant="ghost" disabled={busy} onClick={() => void act(() => discard(current))}>Descartar proposta</Button>}
      </>}
      <section className="space-y-2 border-t pt-3" aria-labelledby="mother-material" data-testid="mother-material">
        <h3 id="mother-material" className="text-sm font-semibold">Material desta base{stock && ` · ${stockLabel(current.id)}`}</h3>
        {stockFailed ? <LoadError compact what="o material desta base" onRetry={() => void load()} />
          : !stock ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Carregando o material" />
          : material.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum trecho da Biblioteca foi ligado a esta base ainda. A varredura liga o material parecido sozinha.</p>
          : <ul className="space-y-2">{material.map(d => <li key={d.id} className="rounded-lg border p-3 text-sm">
            <p className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{d.title}</span><span className={`rounded-full px-2 py-0.5 text-xs ${state.get(d.id) === 'livre' ? 'bg-accent/15 text-foreground' : 'bg-secondary text-secondary-foreground'}`}>{STATE_LABEL[state.get(d.id) ?? 'usada']}</span></p>
            {d.excerpt && <p className="mt-1 line-clamp-2 text-xs italic text-muted-foreground">“{d.excerpt}”</p>}</li>)}</ul>}
        <Link to="/biblioteca/descobertas" className="inline-block text-xs underline">Ver todas as descobertas</Link>
      </section>
      <details className="border-t pt-3"><summary className="cursor-pointer text-sm">Histórico e utilizações</summary><p className="mt-2 text-sm">{history.filter(v => v.status === 'validated').length} versões validadas · {new Set(uses.map(u => u.campaign_id)).size} campanhas.</p>
        <ul className="mt-2 space-y-2 text-xs">{history.filter(v => v.status === 'validated').map(v => <li key={v.id}>Versão {v.ordinal} · {v.validated_at ? new Date(v.validated_at).toLocaleDateString('pt-BR') : ''}<p className="text-muted-foreground">{v.body.frase}</p></li>)}</ul>
        <ul className="mt-3 space-y-2 text-xs">{[...new Set(uses.map(u => u.campaign_id))].map(id => <li key={id}><Link className="underline" to={`/campanhas/${id}`}>{campaignNames[id]}</Link> · versões {uses.filter(u => u.campaign_id === id).map(u => history.find(v => v.id === u.version_id)?.ordinal).filter(Boolean).filter((v,i,all) => all.indexOf(v) === i).join(', ')}</li>)}</ul></details>
    </section> : <>
    {entries && <section className="space-y-3 rounded-xl border bg-card p-4" aria-labelledby="hive-proposals" data-testid="mother-proposals">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="hive-proposals" className="font-semibold">Propostos pela Hive ({proposals.length})</h2>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => void act(propose)}><Sparkles className="h-4 w-4"/>Pedir propostas</Button></div>
      <p className="text-xs text-muted-foreground">A Hive junta material solto da Biblioteca que fala do mesmo assunto e escreve um conteúdo mãe. Nada entra no acervo sem a sua validação.</p>
      {proposals.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma proposta esperando por você.</p> : <>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="accent" disabled={busy || picked.length === 0} onClick={() => void act(() => validateProposals(picked))}>Validar selecionadas ({picked.length})</Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => setPicked(picked.length === proposals.length ? [] : proposals.map(e => e.content.id))}>{picked.length === proposals.length ? 'Limpar seleção' : 'Selecionar todas'}</Button>
        </div>
        <ul className="space-y-2">{proposals.map(({ content }) => <li key={content.id} className="flex flex-wrap items-start gap-3 rounded-lg border p-3" data-testid="mother-proposal">
          <input type="checkbox" className="mt-1 h-4 w-4" id={`pick-${content.id}`} checked={picked.includes(content.id)} disabled={busy}
            onChange={e => setPicked(p => e.target.checked ? [...p, content.id] : p.filter(id => id !== content.id))}/>
          <label htmlFor={`pick-${content.id}`} className="min-w-0 flex-1 cursor-pointer space-y-1"><span className="block font-medium">{content.title}</span>
            <span className="line-clamp-2 block text-sm text-muted-foreground">{content.body.frase}</span>
            {stock && <span className="block text-xs text-muted-foreground">{stock.discoveries.filter(d => d.content_id === content.id && d.status !== 'dismissed').length} trechos da Biblioteca</span>}</label>
          <div className="flex gap-2"><Button size="sm" variant="outline" disabled={busy} onClick={() => void act(() => open(content))}>Abrir e editar</Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void act(() => discard(content))}>Descartar</Button></div>
        </li>)}</ul></>}
    </section>}
    {stockFailed && <LoadError compact what="o material dos conteúdos mãe" onRetry={() => void load()} />}
    <div className="grid gap-3 md:grid-cols-2">{regular === null ? <Loader2 className="h-5 w-5 animate-spin" aria-label="Carregando o acervo"/> : regular.length === 0 ? <p className="text-sm text-muted-foreground">Seu acervo está pronto para receber o primeiro conteúdo mãe.</p> : regular.map(({content,version}) => <button key={content.id} disabled={busy} className="space-y-2 rounded-xl border bg-card p-4 text-left hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="mother-card" onClick={() => void act(() => open(content))}>
      <p className="font-semibold">{content.title}</p><p className="text-xs text-muted-foreground">{version ? `Validado · versão ${version.ordinal}` : 'Em elaboração'}</p><p className="line-clamp-3 text-sm text-muted-foreground">{version?.body.frase ?? content.body.frase}</p>
      {stock && <p className={`text-xs font-medium ${motherStock(content.id, stock.discoveries, stock.availability).estado === 'vivo' ? 'text-accent' : 'text-muted-foreground'}`} data-testid="mother-stock">{stockLabel(content.id)}</p>}</button>)}</div></>}
  </div>;
}
