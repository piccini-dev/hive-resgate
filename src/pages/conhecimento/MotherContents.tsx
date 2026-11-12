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
import type { Content, ContentBody, Idea } from '@/types';

type Entry = { content: Content; version: BaseVersion | null };
export function MotherContents() {
  const [params, setParams] = useSearchParams();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false), [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState<Content | null>(null);
  const [body, setBody] = useState<ContentBody | null>(null);
  const [creating, setCreating] = useState(false), [title, setTitle] = useState(''), [summary, setSummary] = useState('');
  const [instruction, setInstruction] = useState(''), [profile, setProfile] = useState<string | null>(null);
  const [history, setHistory] = useState<BaseVersion[]>([]), [uses, setUses] = useState<Array<{ campaign_id: string; version_id: string }>>([]);
  async function load() { setFailed(false); try { setEntries(await baseApi.catalog()); } catch { setFailed(true); } }
  useEffect(() => { void load(); void identityApi.profiles().then(ps => setProfile(ps.find(p => p.is_default)?.id ?? ps[0]?.id ?? null)).catch(() => {}); }, []);
  async function act(fn: () => Promise<void>) { if (busy) return; setBusy(true); try { await fn(); } catch(e) { toast.error((e as Error).message); } finally { setBusy(false); } }
  async function open(content: Content) {
    const [versions, usages, container] = await Promise.all([
      db.select<BaseVersion>('content_base_versions', { content_id: `eq.${content.id}`, order: 'ordinal.desc' }),
      db.select<{ campaign_id: string; version_id: string }>('content_base_uses', { content_id: `eq.${content.id}`, select: 'campaign_id,version_id' }),
      campaignApi.getAvulso(),
    ]);
    const cycles = container ? await cycleApi.listByCampaign(container.id) : [];
    const workspaceIds = new Set(cycles.map(c => c.id));
    const draft = versions.find(v => v.status === 'draft' && v.draft_cycle_id && workspaceIds.has(v.draft_cycle_id));
    const working = draft ? (await baseApi.listByCycle(draft.draft_cycle_id!)).find(c => c.id === content.id) ?? content : content;
    setCurrent(working); setBody(null); setInstruction(''); setHistory(versions); setUses(usages); setCreating(false);
    setParams({ content: content.id }, { replace: true });
  }
  useEffect(() => {
    const id = params.get('content');
    if (entries && id && current?.id !== id) { const e = entries.find(e => e.content.id === id); if (e) void act(() => open(e.content)); }
  // A abertura por link ocorre somente quando o conteúdo solicitado muda.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, params.get('content')]);
  async function workspace(c: Content): Promise<Content> {
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
      <p className="text-xs text-muted-foreground">{current.status === 'validated' ? 'Validado' : 'Rascunho · aguardando validação'}</p>
      {body ? <><label className="block space-y-1 text-sm">Síntese<Textarea value={body.frase ?? ''} disabled={busy} onChange={e => setBody({ ...body, frase: e.target.value })}/></label>
        <label className="block space-y-1 text-sm">Desenvolvimento<Textarea rows={16} value={body.texto ?? ''} disabled={busy} onChange={e => setBody({ ...body, texto: e.target.value })}/></label>
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
        {current.status !== 'validated' && <Button variant="accent" disabled={busy} onClick={() => void act(async () => { const c = await baseApi.validate(current); setCurrent(c); await load(); await open(c); toast.success('Conteúdo mãe validado. Nenhum post foi criado.'); })}>Validar conteúdo mãe</Button>}
      </>}
      <details className="border-t pt-3"><summary className="cursor-pointer text-sm">Histórico e utilizações</summary><p className="mt-2 text-sm">{history.filter(v => v.status === 'validated').length} versões validadas · {new Set(uses.map(u => u.campaign_id)).size} contextos de utilização.</p>
        <ul className="mt-2 space-y-2 text-xs">{history.filter(v => v.status === 'validated').map(v => <li key={v.id}>Versão {v.ordinal} · {v.validated_at ? new Date(v.validated_at).toLocaleDateString('pt-BR') : ''}<p className="text-muted-foreground">{v.body.frase}</p></li>)}</ul></details>
    </section> : <div className="grid gap-3 md:grid-cols-2">{entries === null ? <Loader2 className="h-5 w-5 animate-spin"/> : entries.length === 0 ? <p className="text-sm text-muted-foreground">Seu acervo está pronto para receber o primeiro conteúdo mãe.</p> : entries.map(({content,version}) => <button key={content.id} disabled={busy} className="space-y-2 rounded-xl border bg-card p-4 text-left hover:border-accent" data-testid="mother-card" onClick={() => void act(() => open(content))}>
      <p className="font-semibold">{content.title}</p><p className="text-xs text-muted-foreground">{version ? `Validado · versão ${version.ordinal}` : 'Em elaboração'}</p><p className="line-clamp-3 text-sm text-muted-foreground">{version?.body.frase ?? content.body.frase}</p></button>)}</div>}
  </div>;
}
