// Descobertas: o que a varredura da Biblioteca encontrou nos documentos (contrato em docs/plano/CONTRATO-ESTOQUE.md §4).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Pencil, ScanSearch, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadError, Loading } from '@/components/shared/LoadState';
import { discoveryApi } from '@/lib/discoveryApi';
import { knowledgeApi } from '@/lib/api';
import { contentApi } from '@/lib/campaignApi';
import type { KnowledgeDocument } from '@/types';
import type { DiscoveryKind, KnowledgeDiscovery } from '@/types/discovery';

const KIND_LABEL: Record<DiscoveryKind, string> = { caso: 'Caso', conceito: 'Conceito', pergunta: 'Pergunta', dado: 'Dado', historia: 'História', pratica: 'Prática' };
const SELECT = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
// A coluna archived existe no banco, mas ainda não no tipo KnowledgeDocument.
type Doc = KnowledgeDocument & { archived?: boolean };

// Mesma regra da varredura: minúsculas, até 6 tags de até 40 caracteres, sem repetir.
function parseTags(text: string): string[] {
  return [...new Set(text.split(',').map(t => t.trim().toLowerCase()).filter(t => t && t.length <= 40))].slice(0, 6);
}

export function Descobertas() {
  const [items, setItems] = useState<KnowledgeDiscovery[] | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [mothers, setMothers] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState(false);
  const [tag, setTag] = useState(''), [kind, setKind] = useState(''), [doc, setDoc] = useState(''), [loose, setLoose] = useState(false);
  const [editing, setEditing] = useState<{ id: string; title: string; tags: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setFailed(false);
    try {
      const [found, documents] = await Promise.all([discoveryApi.list(), knowledgeApi.list()]);
      const live = found.filter(d => d.status !== 'dismissed');
      const contents = await contentApi.listByIds([...new Set(live.flatMap(d => d.content_id ? [d.content_id] : []))]);
      setMothers(Object.fromEntries(contents.map(c => [c.id, c.title])));
      setDocs((documents as Doc[]).filter(d => !d.archived));
      setItems(live);
    } catch { setFailed(true); }
  }
  useEffect(() => { void load(); }, []);

  async function act(key: string, fn: () => Promise<void>) {
    if (busy) return;
    setBusy(key);
    try { await fn(); } catch (e) { toast.error((e as Error).message); } finally { setBusy(null); }
  }

  const scan = (d: Doc) => act(`scan:${d.id}`, async () => {
    const r = await discoveryApi.scanNow(d.id);
    if (r.processed === 0) toast.info(`Nada novo para ler em "${d.title}" agora.`);
    else toast.success(`Li ${r.processed} trechos e encontrei ${r.found} ${r.found === 1 ? 'descoberta' : 'descobertas'}${r.linked ? `, ${r.linked} já ligadas a conteúdos-mãe` : ''}.`);
    await load();
  });

  const dismiss = (d: KnowledgeDiscovery) => act(d.id, async () => {
    if (!confirm(`Descartar "${d.title}"? Ela some da lista e não será usada em peças.`)) return;
    await discoveryApi.dismiss(d.id);
    setItems(list => list?.filter(x => x.id !== d.id) ?? null);
    toast.success('Descoberta descartada.');
  });

  const save = () => editing && act(editing.id, async () => {
    const title = editing.title.trim();
    if (!title || title.length > 240) throw new Error('O título precisa ter entre 1 e 240 caracteres.');
    const saved = await discoveryApi.update(editing.id, { title, tags: parseTags(editing.tags) });
    setItems(list => list?.map(x => x.id === saved.id ? saved : x) ?? null);
    setEditing(null);
    toast.success('Descoberta corrigida.');
  });

  if (failed) return <div className="mx-auto max-w-5xl p-4 lg:p-8"><LoadError what="as descobertas" onRetry={() => void load()} /></div>;

  const docTitle = (d: KnowledgeDiscovery) => docs.find(x => x.id === d.document_id)?.title ?? d.sources[0]?.title ?? 'Documento removido';
  const tags = [...new Set((items ?? []).flatMap(d => d.tags))].sort();
  const shown = (items ?? []).filter(d => (!tag || d.tags.includes(tag)) && (!kind || d.kind === kind) && (!doc || d.document_id === doc)
    && (!loose || (d.status === 'active' && !d.content_id)));

  return <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-8" data-testid="discoveries">
    <header>
      <p className="text-xs uppercase text-muted-foreground">Biblioteca · Descobertas</p>
      <h1 className="mt-1 font-display text-2xl font-bold">Descobertas</h1>
      <p className="mt-2 text-sm text-muted-foreground">A Hive lê os documentos da sua Biblioteca aos poucos e separa o que pode virar conteúdo: casos, conceitos, perguntas, dados, histórias e práticas. Cada descoberta é ligada a um conteúdo-mãe parecido ou fica solta até juntar material para um novo.</p>
    </header>
    <nav className="flex flex-wrap gap-3 text-sm"><Link to="/biblioteca" className="underline">Biblioteca</Link><Link to="/conteudos-mae" className="underline">Conteúdos mãe</Link><Link to="/conhecimento" className="underline">Materiais de conhecimento</Link></nav>

    <details className="rounded-xl border bg-card p-4">
      <summary className="cursor-pointer text-sm font-semibold">Documentos ({docs.length}) · varrer agora</summary>
      <p className="mt-2 text-xs text-muted-foreground">A varredura roda sozinha a cada poucos minutos. Para adiantar, leia agora o próximo pedaço de um documento.</p>
      {docs.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nenhum documento na Biblioteca. Envie um em <Link to="/conhecimento" className="underline">Materiais de conhecimento</Link>.</p>
        : <ul className="mt-3 divide-y">{docs.map(d => <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
          <span className="min-w-0 flex-1 text-sm"><span className="break-words font-medium">{d.title}</span><span className="block text-xs text-muted-foreground">{(items ?? []).filter(x => x.document_id === d.id).length} descobertas</span></span>
          <Button size="sm" variant="outline" disabled={!!busy} aria-label={`Varrer agora o documento ${d.title}`} onClick={() => void scan(d)}>
            {busy === `scan:${d.id}` ? <Loader2 className="animate-spin" /> : <ScanSearch />}Varrer agora</Button>
        </li>)}</ul>}
    </details>

    <section aria-label="Filtros" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="space-y-1 text-sm">Tag<select className={SELECT} value={tag} onChange={e => setTag(e.target.value)}><option value="">Todas</option>{tags.map(t => <option key={t} value={t}>{t}</option>)}</select></label>
      <label className="space-y-1 text-sm">Tipo<select className={SELECT} value={kind} onChange={e => setKind(e.target.value)}><option value="">Todos</option>{Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      <label className="space-y-1 text-sm">Documento<select className={SELECT} value={doc} onChange={e => setDoc(e.target.value)}><option value="">Todos</option>{docs.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}</select></label>
      <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={loose} onChange={e => setLoose(e.target.checked)} />Só soltas (sem conteúdo-mãe)</label>
    </section>

    {items === null ? <Loading what="as descobertas" />
      : items.length === 0 ? <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground" data-testid="discoveries-empty">A varredura ainda não chegou nos seus documentos. Ela roda sozinha; se quiser adiantar, abra "Documentos" acima e use "Varrer agora".</p>
      : shown.length === 0 ? <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Nenhuma descoberta com esses filtros.</p>
      : <ul className="space-y-3">{shown.map(d => <li key={d.id} className="space-y-2 rounded-xl border bg-card p-4" data-testid="discovery-card">
        {editing?.id === d.id ? <form className="space-y-3" onSubmit={e => { e.preventDefault(); void save(); }}>
          <label className="block space-y-1 text-sm">Título<Input value={editing.title} maxLength={240} disabled={!!busy} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label>
          <label className="block space-y-1 text-sm">Tags, separadas por vírgula<Input value={editing.tags} disabled={!!busy} onChange={e => setEditing({ ...editing, tags: e.target.value })} /></label>
          <div className="flex flex-wrap gap-2"><Button type="submit" size="sm" disabled={!!busy || !editing.title.trim()}>Salvar</Button><Button type="button" size="sm" variant="ghost" disabled={!!busy} onClick={() => setEditing(null)}>Cancelar</Button></div>
        </form> : <>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="min-w-0 flex-1 break-words font-semibold">{d.title}</p>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-9 w-9" disabled={!!busy} aria-label={`Corrigir "${d.title}"`} title="Corrigir título e tags" onClick={() => setEditing({ id: d.id, title: d.title, tags: d.tags.join(', ') })}><Pencil /></Button>
              <Button size="icon" variant="ghost" className="h-9 w-9" disabled={!!busy} aria-label={`Descartar "${d.title}"`} title="Descartar" onClick={() => void dismiss(d)}>{busy === d.id ? <Loader2 className="animate-spin" /> : <Trash2 />}</Button>
            </div>
          </div>
          <p className="flex flex-wrap gap-1.5 text-xs">
            {d.kind && <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">{KIND_LABEL[d.kind]}</span>}
            {d.tags.map(t => <span key={t} className="rounded-full border px-2 py-0.5">{t}</span>)}
          </p>
          <p className="text-sm">{d.summary}</p>
          {d.excerpt && <blockquote className="border-l-2 border-accent pl-3 text-sm italic text-muted-foreground">“{d.excerpt}”</blockquote>}
          <p className="text-xs text-muted-foreground">
            De “{docTitle(d)}”{d.sources[0]?.chunk_index != null ? ` · trecho ${d.sources[0].chunk_index + 1}` : ''} · {d.content_id
              ? <>{d.status === 'drafted' ? 'em proposta de ' : 'ligada a '}<Link className="underline" to={`/conteudos-mae?content=${d.content_id}`}>{mothers[d.content_id] ?? 'conteúdo-mãe'}</Link></>
              : 'solta, ainda sem conteúdo-mãe'}
          </p>
        </>}
      </li>)}</ul>}
  </div>;
}
