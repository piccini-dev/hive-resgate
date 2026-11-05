// Edge function: linkedin-import — histórico e métricas PÚBLICAS do LinkedIn via Apify
// (sem login no LinkedIn; a API oficial não deixa ler posts passados nem métricas).
//   start  { account_id, profile }  → dispara o scraper (assíncrono) e guarda o run
//   status { account_id }           → quando terminar, importa, indexa na memória e grava
//                                     reações/comentários/compartilhamentos em post_metrics
//                                     (source 'linkedin_apify'; impressões só o autor vê)
//   tick   (cron, service sem x-bee-user-id) → para cada conta com perfil: acompanha o run
//          em andamento ou dispara um novo — 40 posts recentes por dia, histórico inteiro
//          a cada 7 dias (os números de post antigo quase não mudam; o Apify cobra por post).
// Idempotente: posts já na base (mesmo URN/link) não duplicam; métricas fazem upsert.
import { checkRateLimit, errorResponse, getUserGeminiKey, internalUserId, isServiceCall, jsonResponse, preflight, userIdFromAuth } from '../_shared/security.ts';
import { svcHeaders } from '../_shared/gemini.ts';
import { liMapPost, liMatchPlatform, liNormText, liStats, liUsername, type LiScraped } from '../_shared/linkedin-map.ts';
import { syncMemory } from '../_shared/content-memory.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const APIFY = 'https://api.apify.com/v2';
const ACTOR = Deno.env.get('APIFY_LINKEDIN_ACTOR') ?? 'apimaestro~linkedin-profile-posts';
const MAX_POSTS = Number(Deno.env.get('LINKEDIN_IMPORT_MAX') ?? '1000');
const DAILY_POSTS = 40;
const DAY = 86_400_000;
// deno-lint-ignore no-explicit-any
type Row = Record<string, any>;

async function rest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, { ...init, headers: { ...svcHeaders(), ...(init.headers ?? {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path.split('?')[0]} ${res.status}: ${text.slice(0, 200)}`);
  return (text ? JSON.parse(text) : null) as T;
}
async function apify<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${APIFY}${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`Apify ${res.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text) as T;
}
const saveMeta = (accountId: string, metadata: Row) => rest(`/social_accounts?id=eq.${accountId}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ metadata }) });

async function startRun(account: Row, token: string, username: string, maxPosts: number, mode: 'manual' | 'diario' | 'completo'): Promise<Row> {
  const meta: Row = { ...(account.metadata ?? {}) };
  const run = await apify<{ data: { id: string; defaultDatasetId: string; status: string } }>(`/acts/${ACTOR}/runs`, token, {
    method: 'POST', body: JSON.stringify({ username, total_posts: Math.max(1, Math.min(MAX_POSTS, Math.round(maxPosts))), limit: 100 }),
  });
  meta.li_import = { ...(meta.li_import ?? {}), profile: username, run_id: run.data.id, dataset_id: run.data.defaultDatasetId, status: run.data.status, mode, started_at: new Date().toISOString() };
  await saveMeta(account.id, meta);
  account.metadata = meta;
  return run.data;
}

// Métricas públicas de cada post do run → post_metrics (upsert por post+fonte).
async function saveMetrics(userId: string, accountId: string, items: LiScraped[]): Promise<number> {
  const posts = await rest<Row[]>(`/user_posts?user_id=eq.${userId}&platform=eq.linkedin&select=id,account_id,metadata,published_url&limit=5000`);
  const byKey = new Map<string, Row>();
  for (const p of posts) { if (p.metadata?.li_urn) byKey.set(p.metadata.li_urn, p); if (p.published_url) byKey.set(String(p.published_url).split('?')[0], p); }
  const now = new Date().toISOString();
  const rows: Row[] = [];
  const seen = new Set<string>();
  for (const raw of items) {
    const m = liMapPost(raw);
    const st = liStats(raw);
    if (!m || !st) continue;
    const post = byKey.get(m.key) ?? (m.url ? byKey.get(m.url) : undefined);
    if (!post || seen.has(post.id)) continue;
    seen.add(post.id);
    rows.push({ user_id: userId, post_id: post.id, account_id: post.account_id ?? accountId, source: 'linkedin_apify', captured_at: now,
      likes: st.likes, comments: st.comments, shares: st.shares, raw: { stats: st.raw, li_urn: m.key } });
  }
  for (let i = 0; i < rows.length; i += 200) {
    await rest(`/post_metrics?on_conflict=post_id,source`, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows.slice(i, i + 200)) });
  }
  return rows.length;
}

// Acompanha o run da conta; ao terminar, importa os posts novos e grava as métricas.
async function checkRun(account: Row, userId: string, token: string, opts: { memory: 'sempre' | 'se_novos' }): Promise<Row> {
  const meta: Row = { ...(account.metadata ?? {}) };
  const li = meta.li_import;
  if (!li?.run_id) throw new Error('Nenhuma importação em andamento');
  const run = await apify<{ data: { status: string; defaultDatasetId: string } }>(`/actor-runs/${li.run_id}`, token);
  const st = run.data.status;
  if (st === 'RUNNING' || st === 'READY') return { status: st, done: false };
  if (st !== 'SUCCEEDED') {
    meta.li_import = { ...li, status: st };
    await saveMeta(account.id, meta);
    return { status: st, done: true, failed: true };
  }
  const items = await apify<LiScraped[]>(`/datasets/${run.data.defaultDatasetId}/items?clean=true&format=json`, token);
  const known = await rest<Row[]>(`/user_posts?user_id=eq.${userId}&platform=eq.linkedin&select=id,metadata,published_url,caption,published_at,status&limit=5000`);
  // Posts que a PLATAFORMA publicou no LinkedIn: o scraper os devolve com outro link/URN.
  const platformPosts = known.filter((k) => !k.metadata?.imported_from && (k.status === 'published' || k.status === 'approved' || k.status === 'scheduled'));
  const seenText = new Set<string>(known.filter((k) => k.metadata?.imported_from === 'linkedin').map((k) => liNormText(k.caption)));
  const keys = new Set<string>();
  for (const k of known) { if (k.metadata?.li_urn) keys.add(k.metadata.li_urn); if (k.published_url) keys.add(String(k.published_url).split('?')[0]); }

  let inserted = 0, skipped = 0;
  let merged = 0;
  // Do mais antigo pro mais novo: num post repetido no LinkedIn, fica o primeiro.
  items.sort((a, b) => String(liMapPost(a)?.posted_at ?? '').localeCompare(String(liMapPost(b)?.posted_at ?? '')));
  for (const raw of items) {
    const p = liMapPost(raw);
    if (!p) { skipped++; continue; }
    if (keys.has(p.key) || (p.url && keys.has(p.url))) { skipped++; continue; }
    // Já publicado pela plataforma → não duplica: só liga o URN ao post existente.
    const platId = liMatchPlatform(p, platformPosts as Array<{ id: string; caption: string | null; published_at: string | null }>);
    if (platId) {
      const plat = known.find((k) => k.id === platId)!;
      await rest(`/user_posts?id=eq.${platId}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ metadata: { ...(plat.metadata ?? {}), li_urn: p.key, li_url: p.url }, ...(plat.status !== 'published' ? { status: 'published', published_at: p.posted_at } : {}) }) });
      plat.metadata = { ...(plat.metadata ?? {}), li_urn: p.key };
      keys.add(p.key); merged++; continue;
    }
    // O mesmo texto postado duas vezes no LinkedIn vira 1 só.
    const norm = liNormText(p.text);
    if (seenText.has(norm)) { skipped++; continue; }
    seenText.add(norm);
    const [content] = await rest<Row[]>(`/contents`, {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ user_id: userId, title: p.quote, body: { frase: p.quote, texto: p.text }, status: 'validated', metadata: { imported_from: 'linkedin', li_urn: p.key, account_id: account.id }, ...(p.posted_at ? { created_at: p.posted_at } : {}) }),
    });
    await rest(`/user_posts`, {
      method: 'POST', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        user_id: userId, platform: 'linkedin', format: 'text', status: 'published', title: p.quote, caption: p.text, carousel_text: { quote: p.quote },
        published_at: p.posted_at, published_date: p.posted_at, published_url: p.url, account_id: account.id, content_id: content.id,
        text_approved: true, image_approved: true, image_status: 'approved', acj_status: 'legacy_unassigned',
        metadata: { li_urn: p.key, imported_from: 'linkedin', post_type: p.post_type },
        ...(p.posted_at ? { created_at: p.posted_at } : {}),
      }),
    });
    keys.add(p.key);
    inserted++;
  }
  const metrics = await saveMetrics(userId, account.id, items);
  const agora = new Date().toISOString();
  meta.li_import = { ...li, status: 'SUCCEEDED', imported_at: agora, metrics_at: agora, ...(li.mode === 'completo' || li.mode === 'manual' ? { full_at: agora } : {}), found: items.length, inserted: (li.inserted ?? 0) + inserted, merged, metrics };
  await saveMeta(account.id, meta);
  account.metadata = meta;
  // Indexa o histórico na memória anti-repetição (o resto entra nas próximas pautas).
  const apiKey = opts.memory === 'sempre' || inserted > 0 ? await getUserGeminiKey(userId) : null;
  const mem = apiKey ? await syncMemory(apiKey, userId, 40).catch(() => null) : null;
  return { status: st, done: true, found: items.length, inserted, skipped, merged, metrics, memory: mem };
}

// Cron diário: cada conta do LinkedIn com perfil configurado.
async function tick(token: string): Promise<Row[]> {
  const accounts = await rest<Row[]>(`/social_accounts?platform=eq.linkedin&metadata->li_import->>profile=not.is.null&select=id,user_id,metadata`);
  const out: Row[] = [];
  for (const acc of accounts) {
    const li = acc.metadata?.li_import ?? {};
    try {
      if (li.status === 'RUNNING' || li.status === 'READY') { out.push({ account_id: acc.id, ...(await checkRun(acc, acc.user_id, token, { memory: 'se_novos' })) }); continue; }
      const age = (iso?: string) => (iso ? Date.now() - new Date(iso).getTime() : Infinity);
      if (age(li.metrics_at ?? li.imported_at) < 20 * 3600_000) { out.push({ account_id: acc.id, skipped: 'atualizada há menos de 20h' }); continue; }
      const completo = age(li.full_at) > 6.5 * DAY;
      const run = await startRun(acc, token, li.profile, completo ? MAX_POSTS : DAILY_POSTS, completo ? 'completo' : 'diario');
      out.push({ account_id: acc.id, started: run.id, mode: completo ? 'completo' : 'diario' });
    } catch (e) { out.push({ account_id: acc.id, error: String(e).slice(0, 200) }); }
  }
  return out;
}

Deno.serve(async (req: Request) => {
  const cors = preflight(req);
  if (cors) return cors;
  if (req.method !== 'POST') return errorResponse('Use POST', 405);
  try {
    const token = Deno.env.get('APIFY_TOKEN');
    const svcUser = internalUserId(req);
    const input = (await req.json().catch(() => ({}))) as { action?: string; account_id?: string; profile?: string; max_posts?: number };
    if (input.action === 'tick') {
      if (!isServiceCall(req) || svcUser) return errorResponse('Só o agendador', 403);
      if (!token) return errorResponse('APIFY_TOKEN ausente', 400);
      return jsonResponse({ success: true, accounts: await tick(token) });
    }
    const userId = userIdFromAuth(req) ?? svcUser;
    if (!userId) return errorResponse('Nao autenticado', 401);
    const rl = checkRateLimit(userId, 60_000, 30);
    if (!rl.ok) return errorResponse(`Rate limit. Tente em ${Math.ceil(rl.resetIn / 1000)}s`, 429);
    if (!token) return errorResponse('A chave do Apify ainda não foi configurada no servidor (APIFY_TOKEN).', 400);
    if (!input.account_id) return errorResponse('account_id obrigatório', 400);
    const [account] = await rest<Row[]>(`/social_accounts?id=eq.${input.account_id}&user_id=eq.${userId}&platform=eq.linkedin&select=id,label,metadata&limit=1`);
    if (!account) return errorResponse('Conta do LinkedIn não encontrada', 404);

    if (input.action === 'start') {
      const username = liUsername(input.profile ?? account.metadata?.li_import?.profile ?? '');
      if (!username) return errorResponse('Informe a URL do perfil (linkedin.com/in/…)', 400);
      const run = await startRun(account, token, username, input.max_posts ?? MAX_POSTS, 'manual');
      return jsonResponse({ success: true, status: run.status, run_id: run.id });
    }

    // status: acompanha o run; ao terminar, importa.
    if (!account.metadata?.li_import?.run_id) return errorResponse('Nenhuma importação em andamento', 400);
    const r = await checkRun(account, userId, token, { memory: 'sempre' });
    if (r.failed) return errorResponse(`O scraper terminou com status ${r.status}.`, 502);
    return jsonResponse({ success: true, ...r });
  } catch (e) {
    console.error('[linkedin-import]', e);
    return errorResponse('Erro na importação do LinkedIn', 500, String(e));
  }
});

export {};
