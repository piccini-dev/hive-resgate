// Gestão das marcas do workspace, sem alterar a seleção global das campanhas.
import { useCallback, useEffect, useRef, useState } from 'react';
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
      {ready && safeAdmin.error === null && (
        <>
          {safeAdmin.brands.length === 0 && safeAdmin.workspaces.length === 0 && (
            <CreateWorkspaceCard onCreated={(id) => {
              identityApi.resetCache();
              void refresh().then(() => navigate(`/identidade/configurar?modo=setup&marca=${encodeURIComponent(id)}`));
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
              Nenhuma marca cadastrada neste espaço de trabalho. Use Nova marca para começar.
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
                    <button type="button" disabled={busy} onClick={() => openEdit(item)}
                      className="rounded-md border px-3 py-1.5 text-sm" >Editar</button>
                    {item.status === 'archived' ? (
                      <button type="button" data-testid="brand-restore" disabled
                        className="rounded-md border px-3 py-1.5 text-sm">Restaurar</button>
                    ) : (
                      <button type="button" data-testid="brand-archive" disabled
                        className="rounded-md border px-3 py-1.5 text-sm">Arquivar</button>
                    )}
                    <button type="button" data-testid="brand-configure" disabled
                      className="rounded-md border px-3 py-1.5 text-sm">Configurar identidade</button>
                  </div>
                )}
              </article>
            ))}
          </div>

          {form && (
            <form data-testid="brand-form" className="space-y-3 rounded-xl border bg-card p-5"
              onSubmit={(event) => event.preventDefault()}>
              <h2 className="font-display text-xl font-semibold">
                {form.kind === 'create' ? 'Nova marca' : 'Editar marca'}
              </h2>
              <label className="block space-y-1 text-sm">
                <span>Nome da marca</span>
                <input aria-label="Nome da marca" required maxLength={120}
                  className="w-full rounded-md border bg-background px-3 py-2" value={form.name}
                  onChange={(event) => { setForm((prev) => prev && { ...prev, name: event.target.value }); setDirty(true); }}
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span>Essência (opcional)</span>
                <textarea aria-label="Essência (opcional)" rows={3}
                  className="w-full rounded-md border bg-background px-3 py-2" value={form.essence}
                  onChange={(event) => { setForm((prev) => prev && { ...prev, essence: event.target.value }); setDirty(true); }}
                />
              </label>
              {form.kind === 'create' && safeAdmin.workspaces.length > 1 ? (
                <label className="block space-y-1 text-sm">
                  <span>Espaço de trabalho</span>
                  <select aria-label="Espaço de trabalho" required value={form.workspaceId}
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
                <button type="submit" disabled data-testid="brand-save" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
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
