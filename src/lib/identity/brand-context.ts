// Seleção de contexto da Identidade: regras puras, sem acessar storage ou banco.
import type { Brand } from '@/types/identity';

export interface BrandSelection {
  brand: Brand | null;
  invalidRequested: boolean;
}

export function resolveBrandSelection(
  brands: readonly Brand[],
  requestedId: string | null,
  rememberedId: string | null,
): BrandSelection {
  const available = brands.filter((brand) => brand.status !== 'archived');

  // Uma escolha explícita inválida não deve ser substituída silenciosamente.
  if (requestedId !== null) {
    const requested = requestedId ? available.find((brand) => brand.id === requestedId) : undefined;
    return { brand: requested ?? null, invalidRequested: !requested };
  }

  const remembered = rememberedId === null
    ? undefined
    : available.find((brand) => brand.id === rememberedId);

  return {
    brand: remembered ?? available.find((brand) => brand.is_default) ?? available[0] ?? null,
    invalidRequested: false,
  };
}

export function brandStorageKey(userId: string): string {
  return `hive.identity.brand:${userId}`;
}

// Preserva os filtros da rota de origem e troca apenas a marca de contexto.
export function brandContextUrl(path: string, params: URLSearchParams, brandId: string): string {
  if (!path.startsWith('/') || path.includes('//') || /[?#\\]/.test(path) || /^\/[a-z][a-z0-9+.-]*:/i.test(path)) {
    throw new Error('Caminho de contexto inválido.');
  }
  const nextParams = new URLSearchParams(params);
  nextParams.set('marca', brandId);
  return `${path}?${nextParams.toString()}`;
}

export interface BrandWorkspace { id: string; name: string; role: string }
export interface BrandWrite { workspaceId: string; name: string; essence?: string | null }
export interface BrandPatch { name: string; essence?: string | null }
export interface BrandGateway {
  select<T>(table: string, params?: Record<string, string>): Promise<T[]>;
  insert<T>(table: string, row: object): Promise<T[]>;
  update<T>(table: string, where: Record<string, string>, patch: object): Promise<T[]>;
  rpc<T>(name: string, body: object): Promise<T>;
}
export interface BrandApi {
  list(includeArchived?: boolean): Promise<Brand[]>;
  workspaces(): Promise<BrandWorkspace[]>;
  create(input: BrandWrite): Promise<Brand>;
  update(id: string, workspaceId: string, patch: BrandPatch): Promise<Brand>;
  setArchived(id: string, archived: boolean): Promise<Brand>;
}

// O gateway é injetado: esta fábrica não acessa API, sessão nem storage.
export function createBrandApi(
  gateway: BrandGateway,
  userId: () => string | null,
  invalidate: () => void,
  newId: () => string = () => crypto.randomUUID(),
): BrandApi {
  const currentUser = (): string => {
    const id = userId();
    if (!id) throw new Error('Entre novamente para continuar.');
    return id;
  };

  const normalizeName = (name: string): string => {
    const value = typeof name === 'string' ? name.trim() : '';
    if (value.length < 1 || value.length > 120) {
      throw new Error('Informe um nome de marca entre 1 e 120 caracteres.');
    }
    return value;
  };
  const normalizeEssence = (essence: string | null | undefined): string | null =>
    typeof essence === 'string' ? essence.trim() || null : null;

  const workspaces = async (): Promise<BrandWorkspace[]> => {
    const uid = currentUser();
    const members = await gateway.select<{
      workspace_id: string;
      role: string;
      workspaces: { id: string; name: string } | { id: string; name: string }[] | null;
    }>('workspace_members', {
      user_id: `eq.${uid}`,
      select: 'workspace_id,role,workspaces(id,name)',
    });
    const available = new Map<string, BrandWorkspace>();
    for (const member of members) {
      if (member.role !== 'owner' && member.role !== 'editor') continue;
      const workspace = Array.isArray(member.workspaces) ? member.workspaces[0] : member.workspaces;
      if (!workspace || workspace.id !== member.workspace_id) continue;
      if (!available.has(workspace.id)) {
        available.set(workspace.id, { id: workspace.id, name: workspace.name, role: member.role });
      }
    }
    return [...available.values()];
  };

  const requireWorkspace = async (workspaceId: string): Promise<void> => {
    if (!workspaceId || !(await workspaces()).some((workspace) => workspace.id === workspaceId)) {
      throw new Error('Espaço de trabalho não disponível.');
    }
  };

  return {
    async list(includeArchived = false): Promise<Brand[]> {
      currentUser();
      return gateway.select<Brand>('brands', {
        ...(includeArchived ? {} : { status: 'neq.archived' }),
        order: 'is_default.desc,created_at.asc',
      });
    },
    workspaces,
    async create(input: BrandWrite): Promise<Brand> {
      currentUser();
      const name = normalizeName(input.name);
      const essence = normalizeEssence(input.essence);
      await requireWorkspace(input.workspaceId);
      const base = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'marca';
      const suffix = newId().replace(/-/g, '').slice(0, 8);
      const [created] = await gateway.insert<Brand>('brands', {
        workspace_id: input.workspaceId,
        name,
        essence,
        slug: `${base}-${suffix}`,
        status: 'active',
        is_default: false,
      });
      if (!created?.id) throw new Error('Marca não disponível.');
      invalidate();
      return created;
    },
    async update(id: string, workspaceId: string, patch: BrandPatch): Promise<Brand> {
      currentUser();
      const name = normalizeName(patch.name);
      await requireWorkspace(workspaceId);
      const changes: { name: string; essence?: string | null } = { name };
      if (patch.essence !== undefined) changes.essence = normalizeEssence(patch.essence);
      const [updated] = await gateway.update<Brand>('brands', {
        id: `eq.${id}`,
        workspace_id: `eq.${workspaceId}`,
      }, changes);
      if (!updated?.id) throw new Error('Marca não disponível.');
      invalidate();
      return updated;
    },
    async setArchived(id: string, archived: boolean): Promise<Brand> {
      currentUser();
      const updated = await gateway.rpc<Brand>('set_brand_archived', {
        p_brand: id,
        p_archived: archived,
      });
      if (!updated?.id) throw new Error('Marca não disponível.');
      invalidate();
      return updated;
    },
  };
}
