// Edge function: traffic-meta — contrato único do módulo de Tráfego com a Meta
// (docs/plano/PLANO.md §7). O token fica no servidor; o app só manda a ação.
// Ações: assets, search_locations, search_interests (leitura) e create, set_status (escrita).
import { checkRateLimit, errorResponse, jsonResponse, preflight, userIdFromAuth } from '../_shared/security.ts';
import { svcHeaders } from '../_shared/gemini.ts';
import { MetaApiError, findPageForInstagram, searchInterests, searchLocations } from '../_shared/meta-marketing.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;

interface Conn { access_token: string; ad_account_id: string | null; page_id: string | null; ig_user_id: string | null; monthly_cap: number | string | null }
type Body = { action?: string; q?: string; campaign_id?: string; status?: string };
type Handler = (userId: string, conn: Conn, body: Body) => Promise<Response>;

async function rest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, { ...init, headers: { ...svcHeaders(), ...(init.headers ?? {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path.split('?')[0]} ${res.status}: ${text.slice(0, 200)}`);
  return (text ? JSON.parse(text) : null) as T;
}

async function loadConn(userId: string): Promise<Conn | null> {
  const rows = await rest<Conn[]>(`/meta_connections?user_id=eq.${userId}&select=access_token,ad_account_id,page_id,ig_user_id,monthly_cap&limit=1`);
  return rows[0] ?? null;
}

// Página ligada ao Instagram configurado; grava page_id na primeira vez.
async function ensurePage(userId: string, conn: Conn): Promise<{ id: string; name: string | null } | null> {
  if (conn.page_id) return { id: conn.page_id, name: null };
  if (!conn.ig_user_id) return null;
  const page = await findPageForInstagram(conn.ig_user_id, conn.access_token);
  if (!page) return null;
  await rest(`/meta_connections?user_id=eq.${userId}`, {
    method: 'PATCH', headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ page_id: page.id, updated_at: new Date().toISOString() }),
  });
  conn.page_id = page.id;
  return page;
}

const handlers: Record<string, Handler> = {
  async assets(userId, conn) {
    if (!conn.ig_user_id) return errorResponse('Escolha o Instagram em Tráfego › Configurações.', 400);
    const page = await ensurePage(userId, conn);
    if (!page) return errorResponse('O Instagram escolhido não está ligado a uma Página do Facebook.', 400);
    return jsonResponse({ success: true, page });
  },
  async search_locations(_userId, conn, body) {
    const q = (body.q ?? '').trim().slice(0, 80);
    if (q.length < 2) return jsonResponse({ success: true, items: [] });
    return jsonResponse({ success: true, items: await searchLocations(q, conn.access_token) });
  },
  async search_interests(_userId, conn, body) {
    const q = (body.q ?? '').trim().slice(0, 80);
    if (q.length < 2) return jsonResponse({ success: true, items: [] });
    return jsonResponse({ success: true, items: await searchInterests(q, conn.access_token) });
  },
};

Deno.serve(async (req: Request) => {
  const cors = preflight(req);
  if (cors) return cors;
  if (req.method !== 'POST') return errorResponse('Use POST', 405);
  const userId = userIdFromAuth(req);
  if (!userId) return errorResponse('Nao autenticado', 401);
  if (!checkRateLimit(userId, 60_000, 60).ok) return errorResponse('Muitas chamadas seguidas. Espere um minuto.', 429);
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const handler = handlers[body.action ?? ''];
    if (!handler) return errorResponse('Ação desconhecida.', 400);
    const conn = await loadConn(userId);
    if (!conn) return errorResponse('Conecte o Facebook em Configurações › Contas.', 400);
    return await handler(userId, conn, body);
  } catch (e) {
    if (e instanceof MetaApiError) return errorResponse(e.message, 502, e.err);
    console.error('[traffic-meta]', e);
    return errorResponse('Erro no tráfego.', 500, String(e));
  }
});
