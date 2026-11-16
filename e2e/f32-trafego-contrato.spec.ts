import { test, expect, type Page } from '@playwright/test';
import { cleanupE2EData, seed, sql } from './helpers/admin';
import { callEdge } from './helpers/edge';
import { e2eUser } from './helpers/env';

// F32 — Contrato do módulo de Tráfego com a Meta (bloco 12): recusas da traffic-meta
// e a trava do teto (ads_spend_guard). Token falso e page_id semeado: toda recusa
// acontece antes de qualquer escrita na Meta (o teto baixo garante isso no caminho válido).
type Res = { success?: boolean; code?: string; error?: string };

// Dia de hoje em São Paulo (a trava conta o mês nesse fuso) e dias até o fim do mês, contando hoje.
function spToday(): { day: string; daysLeft: number } {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  const [y, m, d] = day.split('-').map(Number);
  return { day, daysLeft: new Date(Date.UTC(y, m, 0)).getUTCDate() - d + 1 };
}
const plusDays = (day: string, n: number) => new Date(Date.parse(`${day}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

function draft(over: Record<string, unknown> = {}, targeting: Record<string, unknown> = {}) {
  const { day } = spToday();
  return {
    budget_type: 'daily', amount: 30,
    starts_at: `${day}T00:00:00-03:00`, ends_at: `${plusDays(day, 4)}T23:59:00-03:00`,
    targeting: { advantage_audience: false, countries: ['BR'], regions: [], cities: [], age_min: 25, age_max: 55, genders: 'all', interests: [], ...targeting },
    placements: { mode: 'auto', facebook: [], instagram: [] },
    ...over,
  };
}

async function seedConnection(cap: number | null = 10) {
  const { id: u } = e2eUser();
  await sql(`insert into meta_connections (user_id, access_token, scopes, ad_account_id, page_id, ig_user_id, monthly_cap)
    values ('${u}', 'e2e-token-falso', array['ads_read','ads_management'], 'act_e2e', 'page-e2e', 'ig-e2e', ${cap ?? 'null'})`);
}

// Campanha de Engajamento impulsionando 1 post publicado no Instagram.
async function seedCampaign(opts: { postStatus?: string; status?: string; fbCampaign?: string; draft?: Record<string, unknown> } = {}) {
  const postId = await seed('user_posts', {
    platform: 'instagram', format: 'image', status: opts.postStatus ?? 'published', title: 'Peça F32', metadata: { ig_media_id: '178f32' },
  });
  const campaignId = await seed('traffic_campaigns', {
    name: 'Campanha F32', objective: 'OUTCOME_ENGAGEMENT', status: opts.status ?? 'draft', draft: opts.draft ?? draft(),
    fb_campaign_id: opts.fbCampaign ?? null, fb_adset_id: opts.fbCampaign ? `${opts.fbCampaign}-set` : null,
  });
  await seed('traffic_ads', { campaign_id: campaignId, post_id: postId, mode: 'ig_post' });
  return campaignId;
}

const traffic = (page: Page, body: Record<string, unknown>) => callEdge<Res>(page, 'traffic-meta', body);
const campaignStatus = async (id: string) => (await sql<{ status: string }>(`select status from traffic_campaigns where id='${id}'`))[0].status;

test.describe('F32 · Tráfego · contrato com a Meta', () => {
  test.beforeEach(async () => { await cleanupE2EData(); });
  test.afterAll(async () => { await cleanupE2EData(); });

  test('ação desconhecida e falta de conexão são recusadas com 400', async ({ page }) => {
    await page.goto('/');
    expect((await traffic(page, { action: 'apagar_tudo' })).status).toBe(400);
    const sem = await traffic(page, { action: 'assets' });
    expect(sem.status).toBe(400);
    expect(sem.json.error).toContain('Conecte o Facebook');
  });

  test('create recusa peça não aprovada, rascunho inválido, teto estourado e campanha já criada', async ({ page }) => {
    await page.goto('/');
    await seedConnection(10);

    const pendente = await seedCampaign({ postStatus: 'pending_approval' });
    const r1 = await traffic(page, { action: 'create', campaign_id: pendente });
    expect([r1.status, r1.json.code]).toEqual([422, 'NOT_ELIGIBLE']);

    const semLocal = await seedCampaign({ draft: draft({}, { countries: [] }) });
    const r2 = await traffic(page, { action: 'create', campaign_id: semLocal });
    expect([r2.status, r2.json.code]).toEqual([400, 'INVALID']);
    expect(r2.json.error).toBe('Escolha ao menos um local.');

    // Teto R$ 10 e diária R$ 30 por 5 dias: a trava recusa antes de tocar na Meta e não trava a campanha.
    const caro = await seedCampaign();
    const r3 = await traffic(page, { action: 'create', campaign_id: caro });
    expect([r3.status, r3.json.code]).toEqual([402, 'PT402']);
    expect(r3.json.error).toContain('Passa do teto mensal');
    expect(await campaignStatus(caro)).toBe('draft');

    const pausada = await seedCampaign({ status: 'paused', fbCampaign: 'fb-f32' });
    expect((await traffic(page, { action: 'create', campaign_id: pausada })).status).toBe(409);

    // 'creating' recente = outro pedido em andamento; parado há 20 min = a função morreu e pode tentar de novo.
    const criando = await seedCampaign({ status: 'creating' });
    expect((await traffic(page, { action: 'create', campaign_id: criando })).status).toBe(409);
    await sql(`update traffic_campaigns set updated_at = now() - interval '20 minutes' where id = '${criando}'`);
    const r4 = await traffic(page, { action: 'create', campaign_id: criando });
    expect([r4.status, r4.json.code]).toEqual([402, 'PT402']);
    expect(await campaignStatus(criando)).toBe('failed');
  });

  test('set_status recusa status inválido, campanha fora da Meta e ACTIVE acima do teto', async ({ page }) => {
    await page.goto('/');
    await seedConnection(10);
    const rascunho = await seedCampaign();
    const pausada = await seedCampaign({ status: 'paused', fbCampaign: 'fb-f32' });

    expect((await traffic(page, { action: 'set_status', campaign_id: pausada, status: 'DELETED' })).status).toBe(400);
    expect((await traffic(page, { action: 'set_status', campaign_id: rascunho, status: 'PAUSED' })).status).toBe(409);

    const r = await traffic(page, { action: 'set_status', campaign_id: pausada, status: 'ACTIVE' });
    expect([r.status, r.json.code]).toEqual([402, 'PT402']);
    expect(await campaignStatus(pausada)).toBe('paused');
  });

  test('ads_spend_guard: conta o mês em São Paulo, recusa sem teto e só o servidor chama', async () => {
    const { id: u } = e2eUser();
    const { day, daysLeft } = spToday();
    await seedConnection(1000);
    const umDia = await seedCampaign({ draft: draft({ ends_at: `${day}T23:59:00-03:00` }) });
    const guard = async (c: string) => (await sql<{ g: { ok: boolean; cap: number; spent: number; committed: number; available: number } }>(
      `select ads_spend_guard('${u}', '${c}') as g`))[0].g;

    expect(await guard(umDia)).toEqual({ ok: true, cap: 1000, spent: 0, committed: 30, available: 970 });

    // Gasto do mês entra; campanha que vai até o mês que vem conta só até o último dia deste mês.
    await sql(`insert into meta_ad_insights_daily (user_id, fb_account_id, fb_ad_id, date, spend) values ('${u}', 'act_e2e', 'ad-f32', '${day}', 100)`);
    const longa = await seedCampaign({ draft: draft({ ends_at: `${plusDays(day, 40)}T23:59:00-03:00` }) });
    const g2 = await guard(longa);
    expect([g2.spent, g2.committed]).toEqual([100, 30 * daysLeft]);

    // Campanha ativa compromete verba das outras; orçamento total conta inteiro.
    await sql(`update traffic_campaigns set status = 'active' where id = '${longa}'`);
    const total = await seedCampaign({ draft: draft({ budget_type: 'lifetime', amount: 200 }) });
    expect((await guard(total)).committed).toBe(30 * daysLeft + 200);

    await sql(`update meta_connections set monthly_cap = 100 where user_id = '${u}'`);
    expect((await guard(umDia)).ok).toBe(false);
    await sql(`update meta_connections set monthly_cap = null where user_id = '${u}'`);
    expect((await guard(umDia)).ok).toBe(false);

    const [p] = await sql<{ auth: boolean; anon: boolean; svc: boolean }>(`select
      has_function_privilege('authenticated', 'public.ads_spend_guard(uuid,uuid)', 'execute') as auth,
      has_function_privilege('anon', 'public.ads_spend_guard(uuid,uuid)', 'execute') as anon,
      has_function_privilege('service_role', 'public.ads_spend_guard(uuid,uuid)', 'execute') as svc`);
    expect(p).toEqual({ auth: false, anon: false, svc: true });
  });
});
