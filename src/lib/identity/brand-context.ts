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
