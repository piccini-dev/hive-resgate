// Gestão das marcas do workspace, sem alterar a seleção global das campanhas.
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateWorkspaceCard } from '@/components/identity/CreateWorkspaceCard';
import { useIdentityContext } from '@/components/identity/IdentityContext';
import { brandApi } from '@/lib/brandApi';
import { identityApi } from '@/lib/identityApi';
import { useAuthStore } from '@/store/authStore';
import type { Brand } from '@/types/identity';
import type { BrandWorkspace } from '@/lib/identity/brand-context';

interface AdminState {
  userId: string | null;
  loading: boolean;
  error: string | null;
  brands: Brand[];
  workspaces: BrandWorkspace[];
}
interface BrandForm {
  kind: 'create' | 'edit';
  id: string | null;
  workspaceId: string;
  name: string;
  essence: string;
}

const emptyAdmin = (): AdminState => ({
  userId: null, loading: false, error: null, brands: [], workspaces: [],
});
const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Não foi possível concluir a operação.';

export function Brands(): JSX.Element {
  const navigate = useNavigate();
  const uid = useAuthStore((state) => state.currentUser?.id ?? null);
  const { brand, loading, error, refresh, setDirty } = useIdentityContext();
  const [admin, setAdmin] = useState<AdminState>(emptyAdmin);
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState<BrandForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const adminGeneration = useRef(0);
  const mounted = useRef(false);
  const formGeneration = useRef(0);
  const mutationLock = useRef(false);
  const operationGeneration = useRef(0);
  const previousContext = useRef<{ uid: string | null; brandId: string | null }>({ uid, brandId: null });
  const currentUid = useRef(uid);
  const currentBrandId = useRef(brand?.id ?? null);
  currentUid.current = uid;
  currentBrandId.current = brand?.id ?? null;

  const reloadAdmin = useCallback(async (): Promise<void> => {
    const request = ++adminGeneration.current;
    if (!uid) {
      setAdmin(emptyAdmin());
      return;
    }
    setAdmin({ userId: uid, loading: true, error: null, brands: [], workspaces: [] });
    try {
      const [allBrands, workspaces] = await Promise.all([brandApi.list(true), brandApi.workspaces()]);
      if (mounted.current && currentUid.current === uid && adminGeneration.current === request) {
        setAdmin({ userId: uid, loading: false, error: null, brands: allBrands, workspaces });
      }
    } catch (cause) {
      if (mounted.current && currentUid.current === uid && adminGeneration.current === request) {
        setAdmin({ userId: uid, loading: false, error: errorMessage(cause), brands: [], workspaces: [] });
      }
    }
  }, [uid]);

  useEffect(() => {
    mounted.current = true;
    if (!uid || loading || error) {
      ++adminGeneration.current;
      setAdmin(emptyAdmin());
    } else {
      void reloadAdmin();
    }
    return () => { mounted.current = false; ++adminGeneration.current; };
  }, [uid, loading, error, reloadAdmin]);

  useEffect(() => {
    // Ao mudar de conta, nunca reapresentar o formulário de outra pessoa.
    formGeneration.current++;
    operationGeneration.current++;
    mutationLock.current = false;
    setBusy(false);
    setForm(null);
    setActionError(null);
  }, [uid]);

  useEffect(() => {
    const before = previousContext.current;
    const now = { uid, brandId: brand?.id ?? null };
    previousContext.current = now;
    if (before.uid === uid && before.brandId !== null && before.brandId !== now.brandId
      && !mutationLock.current) {
      formGeneration.current++;
      setForm(null);
      setActionError(null);
      setDirty(false);
    }
  }, [brand?.id, uid, setDirty]);

  // O seletor pertence ao provider (#105, fora do escopo desta issue).
  // Durante a mutação, bloquear também a mudança de contexto pelo cabeçalho.
  useEffect(() => {
    const selector = document.querySelector<HTMLSelectElement>('[data-testid="identity-brand-select"]');
    if (!selector) return;
    if (busy) selector.disabled = true;
    return () => { selector.disabled = false; };
  }, [busy, loading, error, brand?.id]);

  const safeAdmin = admin.userId === uid ? admin : emptyAdmin();
  const adminLoading = Boolean(uid) && (!safeAdmin.userId || safeAdmin.loading);
  const ready = !loading && !error && !adminLoading && !safeAdmin.error;
  const writable = new Map(safeAdmin.workspaces.map((ws) => [ws.id, ws]));
  const cards = safeAdmin.brands.filter((item) => showArchived || item.status !== 'archived');
  const canEdit = (item: Brand) => writable.has(item.workspace_id);

  function openNew() {
    if (!ready || busy) return;
    formGeneration.current++;
    setActionError(null);
    setForm({
      kind: 'create', id: null,
      workspaceId: safeAdmin.workspaces.length === 1 ? safeAdmin.workspaces[0].id : '',
      name: '', essence: '',
    });
    setDirty(true);
  }

  function openEdit(item: Brand) {
    if (!ready || busy || !canEdit(item)) return;
    formGeneration.current++;
    setActionError(null);
    setForm({
      kind: 'edit', id: item.id, workspaceId: item.workspace_id,
      name: item.name, essence: item.essence ?? '',
    });
    setDirty(true);
  }

  function cancelForm() {
    if (busy || mutationLock.current) return;
    formGeneration.current++;
    setForm(null);
    setActionError(null);
    setDirty(false);
  }

  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!ready || !uid || !form || mutationLock.current) return;
    const input = { ...form }; // dados e destino congelados antes de qualquer await
    const atUser = uid;
    const atBrand = currentBrandId.current;
    const atForm = ++formGeneration.current;
    const operation = ++operationGeneration.current;
    mutationLock.current = true;
    setBusy(true);
    setActionError(null);
    try {
      if (input.kind === 'create') {
        await brandApi.create({ workspaceId: input.workspaceId, name: input.name, essence: input.essence });
      } else {
        if (!input.id) throw new Error('Marca não disponível.');
        await brandApi.update(input.id, input.workspaceId, { name: input.name, essence: input.essence });
      }
      // O adapter já invalida o cache. Atualizar as duas listas após o sucesso.
      await refresh();
      await reloadAdmin();
      if (mounted.current && operationGeneration.current === operation
        && formGeneration.current === atForm && currentUid.current === atUser
        && currentBrandId.current === atBrand) {
        setForm(null);
        setDirty(false);
      }
    } catch (cause) {
      if (mounted.current && operationGeneration.current === operation
        && formGeneration.current === atForm && currentUid.current === atUser) {
        setActionError(errorMessage(cause)); // preservar todo o rascunho no erro
      }
    } finally {
      if (mounted.current && operationGeneration.current === operation) {
        // Navegação externa durante a escrita não pode deixar um formulário
        // de uma marca anterior associado à nova marca.
        if (currentUid.current === atUser && currentBrandId.current !== atBrand) {
          formGeneration.current++;
          setForm(null);
          setDirty(false);
        }
        mutationLock.current = false;
        setBusy(false);
      }
    }
  }

  async function changeArchived(item: Brand, archived: boolean): Promise<void> {
    if (!ready || !uid || !canEdit(item) || mutationLock.current || form) return;
    if (archived && !window.confirm('Arquivar esta marca? Os conteúdos e o histórico serão preservados.')) return;
    const id = item.id;
    const atUser = uid;
    const operation = ++operationGeneration.current;
    mutationLock.current = true;
    setBusy(true);
    setActionError(null);
    try {
      await brandApi.setArchived(id, archived); // somente RPC, sem PATCH de status
      await refresh();
      await reloadAdmin();
    } catch (cause) {
      if (mounted.current && operationGeneration.current === operation && currentUid.current === atUser) {
        setActionError(errorMessage(cause)); // PT409/403, sem otimização de estado
      }
    } finally {
      if (mounted.current && operationGeneration.current === operation) {
        mutationLock.current = false;
        setBusy(false);
      }
    }
  }

  async function configure(item: Brand): Promise<void> {
    if (!ready || !uid || !canEdit(item) || item.status === 'archived'
      || mutationLock.current || form) return;
    const id = item.id;
    const atUser = uid;
    const atBrand = currentBrandId.current;
    const operation = ++operationGeneration.current;
    mutationLock.current = true;
    setBusy(true);
    setActionError(null);
    try {
      const state = await identityApi.state(id);
      if (mounted.current && operationGeneration.current === operation
        && currentUid.current === atUser && currentBrandId.current === atBrand) {
        const configured = state.profiles.length > 0 || state.emitters.length > 0;
        const url = configured
          ? `/identidade?marca=${encodeURIComponent(id)}`
          : `/identidade/configurar?modo=setup&marca=${encodeURIComponent(id)}`;
        navigate(url);
      }
    } catch (cause) {
      if (mounted.current && operationGeneration.current === operation && currentUid.current === atUser) {
        setActionError(errorMessage(cause));
      }
    } finally {
      if (mounted.current && operationGeneration.current === operation) {
        mutationLock.current = false;
        setBusy(false);
      }
    }
  }

  return (
    <section className="mx-auto max-w-6xl space-y-5 p-4 lg:p-8" data-testid="brands-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Marcas</h1>
          <p className="text-sm text-muted-foreground">Organize as marcas para as quais você produz conteúdo.</p>
        </div>
        <button
          type="button" data-testid="brand-new"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          onClick={openNew} disabled={!ready || busy || safeAdmin.workspaces.length === 0}
        >Nova marca</button>
      </div>

      {!loading && !error && adminLoading && <p role="status">Carregando manutenção de marcas...</p>}
      {!loading && !error && !adminLoading && safeAdmin.error && (
        <div role="alert" className="rounded-xl border border-destructive/40 p-4 text-sm" data-testid="brand-read-error">
          <p>{safeAdmin.error}</p>
          <button type="button" className="mt-2 underline" onClick={() => { void reloadAdmin(); }}>
            Tentar novamente
          </button>
        </div>
      )}
      {actionError && <p role="alert" className="rounded-lg border border-destructive/40 p-3 text-sm" data-testid="brand-action-error">{actionError}</p>}
      {ready && safeAdmin.error === null && (
        <>
          {safeAdmin.brands.length === 0 && safeAdmin.workspaces.length === 0 && (
            <CreateWorkspaceCard onCreated={(id) => {
              identityApi.resetCache();
              const atUser = uid;
              void refresh().then(() => {
                if (mounted.current && currentUid.current === atUser) {
                  navigate(`/identidade/configurar?modo=setup&marca=${encodeURIComponent(id)}`);
                }
              });
            }} />
          )}

          {safeAdmin.brands.length > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
              Mostrar arquivadas
            </label>
          )}

          {cards.length === 0 && safeAdmin.workspaces.length > 0 && (
            <p className="rounded-xl border p-4 text-sm">
              {safeAdmin.brands.length > 0
                ? 'Nenhuma marca ativa. Ative Mostrar arquivadas para ver as demais.'
                : 'Nenhuma marca cadastrada neste espaço de trabalho. Use Nova marca para começar.'}
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {cards.map((item) => (
              <article key={item.id} data-testid="brand-card" data-brand-id={item.id}
                className="space-y-2 rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-xl font-semibold">{item.name}</h2>
                  <span className="text-xs text-muted-foreground">{item.status === 'archived' ? 'Arquivada' : 'Ativa'}</span>
                </div>
                <p className="text-sm">{item.essence || 'Essência não definida.'}</p>
                <p className="text-xs text-muted-foreground">
                  Espaço de trabalho: {writable.get(item.workspace_id)?.name ?? 'Sem permissão de edição'}
                </p>
                {canEdit(item) && (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busy || !!form} onClick={() => openEdit(item)}
                      className="rounded-md border px-3 py-1.5 text-sm" >Editar</button>
                    {item.status === 'archived' ? (
                      <button type="button" data-testid="brand-restore" disabled={busy || !!form}
                        onClick={() => { void changeArchived(item, false); }}
                        className="rounded-md border px-3 py-1.5 text-sm">Restaurar</button>
                    ) : (
                      <button type="button" data-testid="brand-archive" disabled={busy || !!form}
                        onClick={() => { void changeArchived(item, true); }}
                        className="rounded-md border px-3 py-1.5 text-sm">Arquivar</button>
                    )}
                    <button type="button" data-testid="brand-configure"
                      disabled={busy || !!form || item.status === 'archived'}
                      onClick={() => { void configure(item); }}
                      className="rounded-md border px-3 py-1.5 text-sm">Configurar identidade</button>
                  </div>
                )}
              </article>
            ))}
          </div>

          {form && (
            <form data-testid="brand-form" className="space-y-3 rounded-xl border bg-card p-5"
              onSubmit={(event) => { void save(event); }}>
              <h2 className="font-display text-xl font-semibold">
                {form.kind === 'create' ? 'Nova marca' : 'Editar marca'}
              </h2>
              <label className="block space-y-1 text-sm">
                <span>Nome da marca</span>
                <input aria-label="Nome da marca" required maxLength={120} disabled={busy}
                  className="w-full rounded-md border bg-background px-3 py-2" value={form.name}
                  onChange={(event) => { setForm((prev) => prev && { ...prev, name: event.target.value }); setDirty(true); }}
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span>Essência (opcional)</span>
                <textarea aria-label="Essência (opcional)" rows={3} disabled={busy}
                  className="w-full rounded-md border bg-background px-3 py-2" value={form.essence}
                  onChange={(event) => { setForm((prev) => prev && { ...prev, essence: event.target.value }); setDirty(true); }}
                />
              </label>
              {form.kind === 'create' && safeAdmin.workspaces.length > 1 ? (
                <label className="block space-y-1 text-sm">
                  <span>Espaço de trabalho</span>
                  <select aria-label="Espaço de trabalho" required disabled={busy} value={form.workspaceId}
                    className="w-full rounded-md border bg-background px-3 py-2"
                    onChange={(event) => { setForm((prev) => prev && { ...prev, workspaceId: event.target.value }); setDirty(true); }}>
                    <option value="">Escolha um espaço de trabalho</option>
                    {safeAdmin.workspaces.map((ws) => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
                  </select>
                </label>
              ) : (
                <p className="text-sm">Espaço de trabalho: <strong>{writable.get(form.workspaceId)?.name ?? 'Não disponível'}</strong></p>
              )}
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={busy || !form.name.trim() || !form.workspaceId} data-testid="brand-save" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
                  Salvar
                </button>
                <button type="button" disabled={busy} data-testid="brand-cancel" onClick={cancelForm}
                  className="rounded-md border px-4 py-2 text-sm">Cancelar</button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}
