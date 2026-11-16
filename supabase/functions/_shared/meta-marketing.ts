// Escrita e buscas na Marketing API v26 para o módulo de Tráfego (traffic-meta).
// Separado do sync de leitura (_shared/meta-ads.ts). Sem Deno: só fetch.
export const GRAPH = 'https://graph.facebook.com/v26.0';

export interface MetaErr { code?: number; error_subcode?: number; message?: string; error_user_title?: string; error_user_msg?: string }

// Mensagem que o Marcos entende; o erro cru fica em `err` (vai em `details` da resposta).
export function metaErrorPt(e: MetaErr): string {
  const raw = e.error_user_msg || e.message || 'erro desconhecido';
  if (e.code === 190) return 'A conexão com o Facebook expirou. Reconecte em Configurações › Contas.';
  if (e.code === 200 || e.code === 10 || /ads_management|pages_manage_ads|permission/i.test(e.message ?? '')) {
    return 'Falta permissão de anúncios na conexão com o Facebook. Reconecte em Configurações › Contas.';
  }
  if ([4, 17, 32, 613].includes(e.code ?? -1)) return 'A Meta limitou as chamadas por agora. Tente de novo em alguns minutos.';
  return `A Meta recusou: ${raw.slice(0, 300)}`;
}

export class MetaApiError extends Error {
  constructor(public err: MetaErr) { super(metaErrorPt(err)); }
}

// Erro de rede do fetch traz a URL, e o GET/DELETE leva o access_token nela: nunca deixar o token sair no erro.
async function call(url: string, init?: RequestInit): Promise<Response> {
  try { return await fetch(url, init); } catch (e) {
    throw new Error(String((e as Error)?.message ?? e).replace(/access_token=[^&\s)"']+/g, 'access_token=***'));
  }
}

async function parse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new MetaApiError(json.error ?? { message: `HTTP ${res.status}` });
  return json as T;
}

export async function graphGet<T>(path: string, params: Record<string, string>, token: string): Promise<T> {
  const qs = new URLSearchParams({ ...params, access_token: token });
  return parse<T>(await call(`${GRAPH}/${path}?${qs.toString()}`));
}

// Corpo form-urlencoded (como a Graph espera); objeto/array vira JSON; null/undefined não vai.
export async function graphPost<T>(path: string, params: Record<string, unknown>, token: string): Promise<T> {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    body.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  body.set('access_token', token);
  return parse<T>(await call(`${GRAPH}/${path}`, { method: 'POST', body }));
}

export async function graphDelete(id: string, token: string): Promise<void> {
  await parse(await call(`${GRAPH}/${id}?access_token=${encodeURIComponent(token)}`, { method: 'DELETE' }));
}

// A Página do Facebook ligada ao Instagram que anuncia (o banco não guarda o id da Página).
export async function findPageForInstagram(igUserId: string, token: string): Promise<{ id: string; name: string } | null> {
  const r = await graphGet<{ data?: Array<{ id: string; name: string; instagram_business_account?: { id: string } }> }>(
    'me/accounts', { fields: 'id,name,instagram_business_account', limit: '100' }, token,
  );
  const p = (r.data ?? []).find((x) => x.instagram_business_account?.id === igUserId);
  return p ? { id: p.id, name: p.name } : null;
}

export interface LocationOption { key: string; name: string; type: string; country_code?: string; region?: string }
export async function searchLocations(q: string, token: string): Promise<LocationOption[]> {
  const r = await graphGet<{ data?: LocationOption[] }>(
    'search', { type: 'adgeolocation', q, location_types: JSON.stringify(['country', 'region', 'city']), limit: '10' }, token,
  );
  return (r.data ?? []).map(({ key, name, type, country_code, region }) => ({ key, name, type, country_code, region }));
}

export interface InterestOption { id: string; name: string; audience_size_lower_bound?: number; audience_size_upper_bound?: number; path?: string[] }
export async function searchInterests(q: string, token: string): Promise<InterestOption[]> {
  const r = await graphGet<{ data?: InterestOption[] }>('search', { type: 'adinterest', q, limit: '10' }, token);
  return (r.data ?? []).map(({ id, name, audience_size_lower_bound, audience_size_upper_bound, path }) => ({ id, name, audience_size_lower_bound, audience_size_upper_bound, path }));
}
