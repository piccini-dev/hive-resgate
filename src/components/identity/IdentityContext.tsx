// Contexto de marca restrito à rota Marcas; as outras áreas seguem com seus contratos atuais.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Brand } from '@/types/identity';
import { brandApi } from '@/lib/brandApi';
import { brandContextUrl, resolveBrandSelection } from '@/lib/identity/brand-context';
import { useAuthStore } from '@/store/authStore';

export interface IdentityContextValue {
  brands: Brand[];
  brand: Brand | null;
  loading: boolean;
  error: string | null;
  invalidRequested: boolean;
  dirty: boolean;
  selectBrand(id: string): boolean;
  setDirty(dirty: boolean): void;
  refresh(): Promise<void>;
}

const IdentityContext = createContext<IdentityContextValue | null>(null);

interface LoadState {
  userId: string | null;
  brands: Brand[];
  loading: boolean;
  error: string | null;
}

export function IdentityProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const uid = useAuthStore((s) => s.currentUser?.id ?? null);
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState<LoadState>({ userId: null, brands: [], loading: false, error: null });
  const [editing, setEditing] = useState<{ userId: string | null; value: boolean }>({ userId: null, value: false });
  const generation = useRef(0);
  const mounted = useRef(false);
  const currentUid = useRef(uid);
  currentUid.current = uid;

  const refresh = useCallback(async (): Promise<void> => {
    const request = ++generation.current;
    if (!uid) {
      setLoad({ userId: null, brands: [], loading: false, error: null });
      return;
    }
    setLoad({ userId: uid, brands: [], loading: true, error: null });
    try {
      const brands = await brandApi.list();
      if (mounted.current && currentUid.current === uid && generation.current === request) {
        setLoad({ userId: uid, brands, loading: false, error: null });
      }
    } catch (e) {
      if (mounted.current && currentUid.current === uid && generation.current === request) {
        setLoad({
          userId: uid, brands: [], loading: false,
          error: e instanceof Error ? e.message : 'Não foi possível carregar as marcas.',
        });
      }
    }
  }, [uid]);

  useEffect(() => {
    mounted.current = true;
    setEditing({ userId: uid, value: false });
    void refresh();
    return () => {
      mounted.current = false;
      generation.current++;
    };
  }, [uid, refresh]);

  // A troca de sessão nunca reaproveita lista, erro ou rascunho de outro usuário.
  const belongsToUser = load.userId === uid;
  const brands = belongsToUser ? load.brands : [];
  const loading = Boolean(uid) && (!belongsToUser || load.loading);
  const error = belongsToUser ? load.error : null;
  const dirty = editing.userId === uid && editing.value;
  const setDirty = useCallback((value: boolean) => {
    setEditing({ userId: uid, value });
  }, [uid]);

  const requestedId = new URLSearchParams(location.search).get('marca');
  const selection = !loading && !error && uid
    ? resolveBrandSelection(brands, requestedId, null)
    : { brand: null, invalidRequested: false };

  const selectBrand = (id: string): boolean => {
    if (!uid || loading || error || !brands.some((item) => item.id === id && item.status !== 'archived')) {
      return false;
    }
    navigate(brandContextUrl(location.pathname, new URLSearchParams(location.search), id));
    return true;
  };

  const value: IdentityContextValue = {
    brands, brand: selection.brand, loading, error, invalidRequested: selection.invalidRequested,
    dirty, selectBrand, setDirty, refresh,
  };

  return (
    <IdentityContext.Provider value={value}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3">
          <label htmlFor="identity-brand-select" className="text-sm font-semibold">Marca em uso</label>
          <select
            id="identity-brand-select"
            aria-label="Marca em uso"
            data-testid="identity-brand-select"
            className="min-w-40 rounded-md border bg-background px-3 py-2 text-sm"
            value={selection.brand?.id ?? ''}
            disabled={!uid || loading || !!error || brands.length === 0}
            onChange={(event) => { selectBrand(event.target.value); }}
          >
            <option value="">Escolha uma marca</option>
            {brands.filter((item) => item.status !== 'archived').map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        {loading && <p data-testid="identity-context-loading" role="status">Carregando marcas...</p>}
        {error && (
          <div data-testid="identity-context-error" role="alert" className="rounded-lg border p-3 text-sm">
            <p>{error}</p>
            <button type="button" className="mt-2 underline" onClick={() => { void refresh(); }}>Tentar novamente</button>
          </div>
        )}
        {!loading && !error && uid && brands.length === 0 && (
          <p data-testid="identity-context-empty" role="status">Nenhuma marca disponível.</p>
        )}
        {!loading && !error && selection.invalidRequested && (
          <p data-testid="identity-context-unavailable" role="alert">
            Marca não disponível. Escolha outra marca.
          </p>
        )}
        {children}
      </div>
    </IdentityContext.Provider>
  );
}

export function useIdentityContext(): IdentityContextValue {
  const context = useContext(IdentityContext);
  if (!context) throw new Error('useIdentityContext deve ser usado dentro de IdentityProvider.');
  return context;
}
