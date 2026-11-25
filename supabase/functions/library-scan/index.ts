// Edge function: library-scan — varredura da Biblioteca (estoque vivo, docs/plano/CONTRATO-ESTOQUE.md §3).
//   tick            {}             → cron (service role, sem x-bee-user-id): até 3 lotes no total, documentos mais antigos primeiro
//   scan            { document_id } → próximo lote de 12 trechos daquele documento do usuário
//   propose_mothers {}             → agrupa descobertas soltas e propõe até 2 conteúdos-mãe (pending_validation)
// Toda escrita é por REST com service role e sempre filtrada pelo user_id do dono.
import { checkRateLimit, errorResponse, getUserGeminiKey, internalUserId, isServiceCall, jsonResponse, logUsage, preflight, userIdFromAuth } from '../_shared/security.ts';
import { callGeminiJson, svcHeaders } from '../_shared/gemini.ts';
import { embedText } from '../_shared/embed.ts';
import { hashText } from '../_shared/memory-text.ts';
import { SCAN_BATCH, groupLoose, motherPrompt, parseDiscoveries, parseMother, parseVector, pickMother, scanPrompt } from '../_shared/discovery.ts';

// deno-lint-ignore no-explicit-any
type Row = Record<string, any>;
interface Result { processed: number; found: number; linked: number; proposed: number }
interface Doc { id: string; user_id: string; brand_id: string | null; title: string; chunk_count: number }

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const CLAIM_TTL_MS = 10 * 60_000;
const TICK_BATCHES = 3;
const DOC_COLS = 'id,user_id,brand_id,title,chunk_count';

async function rest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, { ...init, headers: { ...svcHeaders(), ...(init.headers ?? {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path.split('?')[0]} ${res.status}: ${text.slice(0, 200)}`);
  return (text ? JSON.parse(text) : null) as T;
}
const RETURN_ROWS = { Prefer: 'return=representation' };
const is429 = (e: unknown) => /\b429\b/.test(String((e as Error)?.message ?? e));
// Erro de rede do fetch traz a URL do Gemini com `?key=`: nunca gravar nem devolver a chave.
const safeError = (e: unknown) => String((e as Error)?.message ?? e).replace(/key=[^&\s)]+/g, 'key=***').slice(0, 500);
// Claim ativo = lote em curso há menos de 10 min. `finished_at` preenchido com status running = lote
// terminou e o documento espera o próximo (o check só aceita running/completed/failed).
const claimActive = (r: Row) => r.status === 'running' && !r.finished_at && Date.parse(r.started_at) > Date.now() - CLAIM_TTL_MS;

async function claim(doc: Doc): Promise<Row | null> {
  const token = crypto.randomUUID();
  const base = `document_id=eq.${doc.id}&user_id=eq.${doc.user_id}`;
  const [existing] = await rest<Row[]>(`/knowledge_analysis_runs?${base}&select=*`);
  if (!existing) {
    const [row] = await rest<Row[]>(`/knowledge_analysis_runs?on_conflict=document_id,user_id`, {
      method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify({ document_id: doc.id, user_id: doc.user_id, brand_id: doc.brand_id, status: 'running', claim: token, found: 0, next_chunk: 0 }),
    });
    return row ?? null;
  }
  if (claimActive(existing) || existing.next_chunk >= doc.chunk_count) return null;
  // O filtro no próprio PATCH fecha a corrida entre dois chamadores (só um casa a condição).
  const free = `or=(status.neq.running,finished_at.not.is.null,started_at.lt.${new Date(Date.now() - CLAIM_TTL_MS).toISOString()})`;
  const [row] = await rest<Row[]>(`/knowledge_analysis_runs?${base}&${free}`, {
    method: 'PATCH', headers: RETURN_ROWS,
    body: JSON.stringify({ status: 'running', claim: token, started_at: new Date().toISOString(), finished_at: null, error: null }),
  });
  return row ?? null;
}

// Mães validados do usuário com embedding do texto atual (recalcula quando o texto mudou).
async function loadMothers(userId: string, apiKey: string): Promise<Array<{ id: string; vec: number[] }>> {
  const versions = await rest<Row[]>(`/content_base_versions?user_id=eq.${userId}&status=eq.validated&select=content_id,body,ordinal&order=ordinal.desc&limit=1000`);
  const latest = new Map<string, Row>();
  for (const v of versions) if (!latest.has(v.content_id)) latest.set(v.content_id, v.body ?? {});
  if (!latest.size) return [];
  const contents = await rest<Row[]>(`/contents?id=in.(${[...latest.keys()].join(',')})&user_id=eq.${userId}&status=neq.discarded&select=id,mother_embedding,mother_embedding_hash`);
  const out: Array<{ id: string; vec: number[] }> = [];
  for (const c of contents) {
    const body = latest.get(c.id)!;
    const text = `${String(body.frase ?? '').trim()}\n\n${String(body.texto ?? '').trim()}`.trim();
    if (!text) continue;
    const hash = hashText(text);
    let vec = parseVector(c.mother_embedding);
    if (!vec || c.mother_embedding_hash !== hash) {
      vec = await embedText(apiKey, text, 'RETRIEVAL_DOCUMENT');
      await rest(`/contents?id=eq.${c.id}&user_id=eq.${userId}`, {
        method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ mother_embedding: JSON.stringify(vec), mother_embedding_hash: hash }),
      });
    }
    out.push({ id: c.id, vec });
  }
  return out;
}

async function chunkVectors(userId: string, chunkIds: string[]): Promise<Map<string, number[]>> {
  if (!chunkIds.length) return new Map();
  const rows = await rest<Row[]>(`/knowledge_chunks?id=in.(${chunkIds.join(',')})&user_id=eq.${userId}&select=id,embedding`);
  return new Map(rows.flatMap((r) => { const v = parseVector(r.embedding); return v ? [[r.id as string, v] as [string, number[]]] : []; }));
}

// Um lote de um documento: claim → IA marca → grava → liga ao mãe → avança o cursor.
// Devolve null quando outro chamador está com o documento.
async function scanBatch(doc: Doc, apiKey: string, mothersCache: Map<string, Array<{ id: string; vec: number[] }>>): Promise<(Result & { done: boolean }) | null> {
  const run = await claim(doc);
  if (!run) return null;
  const u = doc.user_id;
  const runPath = `/knowledge_analysis_runs?document_id=eq.${doc.id}&user_id=eq.${u}&claim=eq.${run.claim}`;
  try {
    const next = Number(run.next_chunk ?? 0);
    const chunks = await rest<Array<{ id: string; chunk_index: number; content: string }>>(
      `/knowledge_chunks?document_id=eq.${doc.id}&user_id=eq.${u}&chunk_index=gte.${next}&select=id,chunk_index,content&order=chunk_index.asc&limit=${SCAN_BATCH}`,
    );
    let found = 0, linked = 0;
    if (chunks.length) {
      const { sys, usr } = scanPrompt(doc, chunks);
      const ai = await callGeminiJson<unknown>(apiKey, sys, usr, { temperature: 0.2, maxOutputTokens: 4000 });
      await logUsage({ userId: u, provider: 'gemini', product: 'text', model: ai.model_used, tokens_input: ai.usage.input, tokens_output: ai.usage.output, metadata: { fn: 'library-scan', action: 'scan', document_id: doc.id } });
      const items = parseDiscoveries(ai.data, chunks);
      // Conflito (user_id, document_id, title) é ignorado: volta só o que entrou de fato.
      const inserted = items.length ? await rest<Row[]>(`/knowledge_discoveries?on_conflict=user_id,document_id,title&select=id,chunk_id`, {
        method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
        body: JSON.stringify(items.map((d) => ({
          user_id: u, brand_id: doc.brand_id, document_id: doc.id, title: d.title, summary: d.summary, excerpt: d.excerpt,
          kind: d.kind, tags: d.tags, chunk_id: d.chunk_id, status: 'active',
          sources: [{ document_id: doc.id, chunk_id: d.chunk_id, chunk_index: d.chunk_index, title: doc.title }],
        }))),
      }) : [];
      found = inserted.length;
      // Ligação falhar não desfaz o lote: as descobertas já gravadas ficam soltas (viram proposta de mãe)
      // e o cursor avança, senão o próximo lote releria os mesmos trechos.
      if (found) try {
        if (!mothersCache.has(u)) mothersCache.set(u, await loadMothers(u, apiKey));
        const mothers = mothersCache.get(u)!;
        const vecs = mothers.length ? await chunkVectors(u, inserted.map((d) => d.chunk_id)) : new Map();
        for (const d of inserted) {
          const vec = vecs.get(d.chunk_id);
          const hit = vec ? pickMother(vec, mothers) : null;
          if (!hit) continue;
          await rest(`/knowledge_discoveries?id=eq.${d.id}&user_id=eq.${u}`, {
            method: 'PATCH', headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({ content_id: hit.content_id, link_similarity: hit.similarity, updated_at: new Date().toISOString() }),
          });
          linked++;
        }
      } catch (e) {
        console.warn('[library-scan] link', doc.id, safeError(e));
      }
    }
    // Lote incompleto = fim do documento (chunk_count pode estar acima do que existe).
    const last = chunks.at(-1)?.chunk_index ?? next - 1;
    const nextChunk = chunks.length < SCAN_BATCH ? Math.max(doc.chunk_count, last + 1) : Math.max(next + SCAN_BATCH, last + 1);
    const done = nextChunk >= doc.chunk_count;
    await rest(runPath, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ next_chunk: nextChunk, found: Number(run.found ?? 0) + found, status: done ? 'completed' : 'running', finished_at: new Date().toISOString(), error: null }),
    });
    return { processed: chunks.length, found, linked, proposed: 0, done };
  } catch (e) {
    await rest(runPath, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'failed', finished_at: new Date().toISOString(), error: safeError(e) }),
    }).catch((err) => console.warn('[library-scan] release', err));
    throw e;
  }
}

async function tick(): Promise<Result> {
  const total: Result = { processed: 0, found: 0, linked: 0, proposed: 0 };
  const docs = await rest<Doc[]>(`/knowledge_documents?archived=eq.false&chunk_count=gt.0&user_id=not.is.null&brand_id=not.is.null&select=${DOC_COLS}&order=created_at.asc&limit=1000`);
  const runs = await rest<Row[]>(`/knowledge_analysis_runs?select=document_id,user_id,status,next_chunk,started_at,finished_at&limit=5000`);
  const runOf = new Map(runs.map((r) => [`${r.document_id}:${r.user_id}`, r]));
  const pending = docs.filter((d) => { const r = runOf.get(`${d.id}:${d.user_id}`); return !r || (r.next_chunk < d.chunk_count && !claimActive(r)); });
  // Só varre quem tem chave Gemini própria: o fallback global de getUserGeminiKey
  // faria a plataforma pagar a varredura de todos (inclusive o usuário de teste).
  const owners = [...new Set(pending.map((d) => d.user_id))];
  const settings = owners.length ? await rest<Row[]>(`/user_settings?user_id=in.(${owners.join(',')})&gemini_api_key=not.is.null&select=user_id,gemini_api_key`) : [];
  const keys = new Map<string, string>(settings.map((s) => [s.user_id as string, s.gemini_api_key as string]));
  const mothers = new Map<string, Array<{ id: string; vec: number[] }>>();
  let batches = 0;
  for (const doc of pending) {
    if (batches >= TICK_BATCHES) break;
    const apiKey = keys.get(doc.user_id);
    if (!apiKey) continue;
    while (batches < TICK_BATCHES) {
      let r;
      try {
        r = await scanBatch(doc, apiKey, mothers);
      } catch (e) {
        batches++;
        console.error('[library-scan] tick', doc.id, safeError(e));
        if (is429(e)) return total; // cota da chave: para tudo e espera o próximo cron
        break;
      }
      if (!r) break; // outro chamador pegou o documento
      batches++;
      total.processed += r.processed; total.found += r.found; total.linked += r.linked;
      if (r.done) break;
    }
  }
  return total;
}

async function proposeMothers(userId: string, apiKey: string): Promise<Result> {
  const res: Result = { processed: 0, found: 0, linked: 0, proposed: 0 };
  const loose = await rest<Row[]>(`/knowledge_discoveries?user_id=eq.${userId}&status=eq.active&content_id=is.null&chunk_id=not.is.null&select=id,brand_id,title,summary,excerpt,kind,tags,chunk_id&order=created_at.asc&limit=120`);
  const vecs = await chunkVectors(userId, [...new Set(loose.map((d) => d.chunk_id as string))]);
  const items = loose.filter((d) => vecs.has(d.chunk_id)).map((d) => ({ id: d.id as string, brand: d.brand_id as string, vec: vecs.get(d.chunk_id)!, tags: (d.tags ?? []) as string[] }));
  res.processed = items.length;
  // Um mãe é de uma marca só (o perfil vem dela): agrupa dentro de cada marca.
  const brands = [...new Set(items.map((it) => it.brand))];
  for (const ids of brands.flatMap((b) => groupLoose(items.filter((it) => it.brand === b))).slice(0, 2)) {
    const group = ids.map((id) => loose.find((d) => d.id === id)!);
    const { sys, usr } = motherPrompt(group.map((d) => ({ title: d.title, summary: d.summary, excerpt: d.excerpt ?? '', kind: d.kind ?? '' })));
    const ai = await callGeminiJson<unknown>(apiKey, sys, usr, { temperature: 0.6, maxOutputTokens: 3000 });
    await logUsage({ userId, provider: 'gemini', product: 'text', model: ai.model_used, tokens_input: ai.usage.input, tokens_output: ai.usage.output, metadata: { fn: 'library-scan', action: 'propose_mothers' } });
    const mother = parseMother(ai.data);
    if (!mother) continue;
    const [profile] = await rest<Row[]>(`/communication_profiles?brand_id=eq.${group[0].brand_id}&select=id&order=is_default.desc,created_at.asc&limit=1`);
    const [content] = await rest<Row[]>(`/contents?select=id`, {
      method: 'POST', headers: RETURN_ROWS,
      body: JSON.stringify({
        user_id: userId, title: mother.title, status: 'pending_validation', validation_format: 'knowledge_base',
        body: { frase: mother.frase, texto: mother.texto }, profile_id: profile?.id ?? null, versions: [], position: 0,
        metadata: { purpose: 'knowledge_base', origin: 'discovery', discovery_ids: ids },
      }),
    });
    const taken = await rest<Row[]>(`/knowledge_discoveries?user_id=eq.${userId}&id=in.(${ids.join(',')})&status=eq.active&content_id=is.null&select=id`, {
      method: 'PATCH', headers: RETURN_ROWS,
      body: JSON.stringify({ status: 'drafted', content_id: content.id, updated_at: new Date().toISOString() }),
    });
    // Outra chamada levou o grupo inteiro (duplo clique): o mãe ficaria sem material.
    if (!taken.length) {
      await rest(`/contents?id=eq.${content.id}&user_id=eq.${userId}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
      continue;
    }
    res.proposed++;
  }
  return res;
}

Deno.serve(async (req: Request) => {
  const cors = preflight(req);
  if (cors) return cors;
  if (req.method !== 'POST') return errorResponse('Use POST', 405);
  try {
    const appUser = userIdFromAuth(req);
    const userId = appUser ?? internalUserId(req);
    const input = (await req.json().catch(() => ({}))) as { action?: string; document_id?: string };

    if (input.action === 'tick') {
      // Só o cron: service role sem usuário. Um JWT de usuário nunca chega aqui.
      if (userId || !isServiceCall(req)) return errorResponse('tick é exclusivo do cron', 403);
      return jsonResponse({ success: true, ...(await tick()) });
    }
    if (!userId) return errorResponse('Nao autenticado', 401);
    if (appUser) {
      const rl = checkRateLimit(userId, 60_000, 10);
      if (!rl.ok) return errorResponse(`Rate limit. Tente em ${Math.ceil(rl.resetIn / 1000)}s`, 429);
    }
    const apiKey = await getUserGeminiKey(userId);
    if (!apiKey) return errorResponse('Chave Gemini nao configurada', 400);

    if (input.action === 'scan') {
      if (!input.document_id || !/^[0-9a-f-]{36}$/i.test(input.document_id)) return errorResponse('document_id obrigatório', 400);
      const [doc] = await rest<Doc[]>(`/knowledge_documents?id=eq.${input.document_id}&user_id=eq.${userId}&archived=eq.false&select=${DOC_COLS}`);
      if (!doc) return errorResponse('Documento não encontrado', 404);
      if (!doc.brand_id) return errorResponse('Documento sem marca', 400);
      const r = await scanBatch(doc, apiKey, new Map());
      if (!r) return jsonResponse({ success: true, processed: 0, found: 0, linked: 0, proposed: 0 });
      return jsonResponse({ success: true, processed: r.processed, found: r.found, linked: r.linked, proposed: 0 });
    }
    if (input.action === 'propose_mothers') return jsonResponse({ success: true, ...(await proposeMothers(userId, apiKey)) });
    return errorResponse('action inválida', 400);
  } catch (e) {
    console.error('[library-scan]', safeError(e));
    return errorResponse(is429(e) ? 'Limite da chave Gemini atingido. Tente mais tarde.' : 'Erro na varredura da Biblioteca', is429(e) ? 429 : 500, safeError(e));
  }
});

export {};
