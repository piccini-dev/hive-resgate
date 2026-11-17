import { test, expect, type Page } from '@playwright/test';
import { cleanupE2EData, seed, sql } from './helpers/admin';
import { e2eUser } from './helpers/env';
import { mockEdge } from './helpers/mocks';

// F33 — Wizard de Nova campanha do Tráfego (blocos 13 e 14). A traffic-meta é sempre
// interceptada (mockEdge ou rota própria): a Meta nunca é chamada.
const ART = { slide1: '/bee-spiral.png' };

async function seedConnection() {
  const { id: u } = e2eUser();
  await sql(`insert into meta_connections (user_id, access_token, scopes, ad_account_id, page_id, ig_user_id, monthly_cap)
    values ('${u}', 'e2e-token-falso', array['ads_read','ads_management'], 'act_e2e', 'page-e2e', 'ig-e2e', 1000)`);
}

const seedPost = (title: string, o: Record<string, unknown> = {}) =>
  seed('user_posts', { platform: 'linkedin', format: 'image', status: 'approved', title, rendered_slides: ART, caption: `Legenda de ${title}`, ...o });
const seedIgPost = (title: string) =>
  seed('user_posts', { platform: 'instagram', format: 'image', status: 'published', title, caption: `Legenda de ${title}`, metadata: { ig_media_id: '178f33' } });

function spDay(offset = 0) {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  return new Date(Date.parse(`${day}T12:00:00Z`) + offset * 86_400_000).toISOString().slice(0, 10);
}
function draft(targeting: Record<string, unknown> = {}) {
  return {
    budget_type: 'daily', amount: 20,
    starts_at: `${spDay(1)}T00:00:00-03:00`, ends_at: `${spDay(7)}T23:59:00-03:00`,
    targeting: { advantage_audience: true, countries: ['BR'], regions: [], cities: [], age_min: 18, age_max: 65, genders: 'all', interests: [], ...targeting },
    placements: { mode: 'auto', facebook: [], instagram: [] },
  };
}
// Rascunho de Engajamento com uma peça (post do Instagram por padrão), parado no passo `step`.
async function seedDraft(o: { name?: string; step?: number; targeting?: Record<string, unknown>; postId?: string; mode?: string } = {}) {
  const id = await seed('traffic_campaigns', {
    name: o.name ?? 'Campanha F33', objective: 'OUTCOME_ENGAGEMENT', status: 'draft', step: o.step ?? 7, draft: draft(o.targeting),
  });
  if (o.postId) await seed('traffic_ads', { campaign_id: id, post_id: o.postId, mode: o.mode ?? 'ig_post' });
  return id;
}

async function mockTraffic(page: Page, calls: Array<Record<string, unknown>>) {
  await mockEdge(page, 'traffic-meta', (b) => {
    if (b.action === 'search_locations') return { success: true, items: [{ key: '2430536', name: 'Campinas', type: 'city', region: 'São Paulo', country_code: 'BR' }] };
    if (b.action === 'search_interests') return { success: true, items: [{ id: '6003', name: 'Liderança' }] };
    if (b.action === 'estimate') return { success: true, estimate: { lower: 1200000, upper: 1400000 } };
    if (b.action === 'create') return { success: true, status: 'paused', fb_campaign_id: 'fb-f33', fb_adset_id: 'fb-f33-set' };
    return { success: false };
  }, calls);
}

const heading = (page: Page, name: string) => page.getByRole('heading', { level: 1, name, exact: true });
const next = (page: Page) => page.getByTestId('traffic-next');

async function startWizard(page: Page): Promise<string> {
  await page.goto('/trafego?aba=nova');
  await page.getByTestId('traffic-start').click();
  await expect(page).toHaveURL(/[?&]id=[0-9a-f-]{36}/);
  await expect(heading(page, 'Conteúdo')).toBeVisible();
  return new URL(page.url()).searchParams.get('id')!;
}

test.describe('F33 · Tráfego · wizard de Nova campanha', () => {
  test.beforeEach(async () => { await cleanupE2EData(); await seedConnection(); });
  test.afterAll(async () => { await cleanupE2EData(); });

  test('seletor mostra só peças aprovadas, agendadas e publicadas com arte', async ({ page }) => {
    const aprovada = await seedPost('F33 Aprovada');
    const agendada = await seedPost('F33 Agendada', { status: 'scheduled' });
    const publicada = await seedIgPost('F33 Publicada');
    const pendente = await seedPost('F33 Pendente', { status: 'pending_approval' });
    const semArte = await seedPost('F33 Sem arte', { rendered_slides: null });
    const id = await seedDraft({ step: 1 });

    await page.goto(`/trafego?aba=nova&id=${id}`);
    await expect(heading(page, 'Conteúdo')).toBeVisible();
    for (const p of [aprovada, agendada, publicada]) await expect(page.getByTestId(`traffic-post-${p}`)).toBeVisible();
    for (const p of [pendente, semArte]) await expect(page.getByTestId(`traffic-post-${p}`)).toHaveCount(0);
    await expect(page.getByTestId(`traffic-post-card-${aprovada}`).getByRole('img')).toHaveAttribute('alt', 'F33 Aprovada');

    await page.getByTestId('traffic-filter-instagram').click();
    await expect(page.getByTestId(`traffic-post-${publicada}`)).toBeVisible();
    await expect(page.getByTestId(`traffic-post-${aprovada}`)).toHaveCount(0);
  });

  test('fluxo completo: 7 passos até Criar (pausada) chamando a traffic-meta', async ({ page }) => {
    const calls: Array<Record<string, unknown>> = [];
    await mockTraffic(page, calls);
    const arte = await seedPost('F33 Arte');
    const ig = await seedIgPost('F33 Instagram');
    const id = await startWizard(page);

    await page.getByTestId(`traffic-post-${arte}`).click();
    await page.getByTestId(`traffic-post-${ig}`).click();
    await expect(page.getByTestId('traffic-selected-count')).toHaveText('2 de 5 escolhidas');
    await next(page).click();

    await expect(heading(page, 'Campanha')).toBeVisible();
    await page.getByTestId('traffic-objective-OUTCOME_TRAFFIC').click();
    await expect(page.getByTestId('traffic-objective-link-note')).toBeVisible();
    await page.getByTestId('traffic-name').fill('Liderança · F33');
    await next(page).click();

    await expect(heading(page, 'Orçamento e programação')).toBeVisible();
    await expect(page.getByTestId('traffic-budget-summary')).toBeVisible();
    await next(page).click();

    await expect(heading(page, 'Público')).toBeVisible();
    await page.getByTestId('traffic-loc-search').fill('Camp');
    await page.getByTestId('traffic-loc-2430536').click();
    await page.getByTestId('traffic-int-search').fill('lider');
    await page.getByTestId('traffic-int-6003').click();
    await expect(page.getByTestId('traffic-loc-remove-2430536')).toBeVisible();
    await expect(page.getByTestId('traffic-int-remove-6003')).toBeVisible();
    await next(page).click();

    await expect(heading(page, 'Posicionamentos')).toBeVisible();
    await page.getByTestId('traffic-placements-manual').click();
    await page.getByTestId('traffic-fb-feed').uncheck();
    await page.getByTestId('traffic-ig-story').uncheck();
    await expect(page.getByTestId('traffic-ig-stream')).toBeChecked();
    await next(page).click();

    await expect(heading(page, 'Anúncio')).toBeVisible();
    await page.getByTestId('traffic-ad-1-text').fill('Conheça a mentoria de liderança.');
    await page.getByTestId('traffic-ad-1-link').fill('https://beeconsulting.com.br');
    await expect(page.getByTestId('traffic-ad-2-text')).toHaveCount(0); // post do Instagram vai como está
    await page.getByTestId('traffic-ad-2-link').fill('https://beeconsulting.com.br/mentoria');
    await next(page).click();

    await expect(heading(page, 'Revisão')).toBeVisible();
    await expect(page.getByTestId('traffic-review-errors')).toHaveCount(0);
    await page.getByTestId('traffic-create').click();
    await expect(page.getByTestId('traffic-campaigns-soon')).toBeVisible();
    await expect(page).toHaveURL(/\/trafego$/);
    expect(calls.filter((c) => c.action === 'create')).toEqual([{ action: 'create', campaign_id: id }]);

    const [c] = await sql<{ name: string; objective: string; step: number; draft: { targeting: { cities: Array<{ key: string }>; interests: Array<{ id: string }> }; placements: unknown } }>(
      `select name, objective, step, draft from traffic_campaigns where id = '${id}'`);
    expect([c.name, c.objective, c.step]).toEqual(['Liderança · F33', 'OUTCOME_TRAFFIC', 7]);
    expect(c.draft.targeting.cities.map((x) => x.key)).toEqual(['2430536']);
    expect(c.draft.targeting.interests.map((x) => x.id)).toEqual(['6003']);
    expect(c.draft.placements).toEqual({ mode: 'manual', facebook: [], instagram: ['stream'] });
    const ads = await sql<{ post_id: string; mode: string; link_url: string }>(`select post_id, mode, link_url from traffic_ads where campaign_id = '${id}' order by created_at`);
    expect(ads.map((a) => [a.post_id, a.mode])).toEqual([[arte, 'new_creative'], [ig, 'ig_post']]);
  });

  test('rascunho retomável: recarregar no passo 4 volta no passo 4 com o que foi preenchido', async ({ page }) => {
    await mockTraffic(page, []); // o passo Público pede a estimativa
    const arte = await seedPost('F33 Arte');
    const ig = await seedIgPost('F33 Instagram');
    const id = await startWizard(page);

    await page.getByTestId(`traffic-post-${ig}`).click();
    await page.getByTestId(`traffic-post-${arte}`).click();
    await next(page).click();
    await page.getByTestId('traffic-objective-OUTCOME_ENGAGEMENT').click();
    await page.getByTestId('traffic-name').fill('Retomar F33');
    await next(page).click();
    await page.getByTestId('traffic-amount').fill('35');
    await next(page).click();
    await expect(heading(page, 'Público')).toBeVisible();

    await page.reload();
    await expect(heading(page, 'Público')).toBeVisible();
    await page.getByRole('button', { name: 'Voltar' }).click();
    await expect(heading(page, 'Orçamento e programação')).toBeVisible();
    await expect(page.getByTestId('traffic-amount')).toHaveValue('35');

    const ads = await sql<{ post_id: string }>(`select post_id from traffic_ads where campaign_id = '${id}' order by created_at`);
    expect(ads.map((a) => a.post_id)).toEqual([ig, arte]);
    const [c] = await sql<{ name: string; step: number }>(`select name, step from traffic_campaigns where id = '${id}'`);
    expect(c).toEqual({ name: 'Retomar F33', step: 3 });
  });

  test('etapas clicáveis: do passo 4 volta ao 2 pela barra e o rascunho fica salvo', async ({ page }) => {
    await mockTraffic(page, []);
    const ig = await seedIgPost('F33 Instagram');
    const id = await seedDraft({ step: 4, postId: ig });

    await page.goto(`/trafego?aba=nova&id=${id}`);
    await expect(heading(page, 'Público')).toBeVisible();
    await expect(page.getByTestId('traffic-step-4')).toHaveAttribute('aria-current', 'step');
    await page.getByTestId('traffic-loc-search').fill('Camp');
    await page.getByTestId('traffic-loc-2430536').click();
    await page.getByTestId('traffic-step-2').click();

    await expect(heading(page, 'Campanha')).toBeVisible();
    await expect(page.getByTestId('traffic-step-2')).toHaveAttribute('aria-current', 'step');
    const [c] = await sql<{ step: number; draft: { targeting: { cities: Array<{ key: string }> } } }>(
      `select step, draft from traffic_campaigns where id = '${id}'`);
    expect(c.step).toBe(2);
    expect(c.draft.targeting.cities.map((x) => x.key)).toEqual(['2430536']);
  });

  test('tamanho do público: vazio sem local; com Campinas mostra a faixa da Meta', async ({ page }) => {
    const calls: Array<Record<string, unknown>> = [];
    await mockTraffic(page, calls);
    const ig = await seedIgPost('F33 Instagram');
    const id = await seedDraft({ step: 4, postId: ig, targeting: { countries: [] } });

    await page.goto(`/trafego?aba=nova&id=${id}`);
    await expect(heading(page, 'Público')).toBeVisible();
    await expect(page.getByTestId('traffic-estimate-empty')).toBeVisible();

    await page.getByTestId('traffic-loc-search').fill('Camp');
    await page.getByTestId('traffic-loc-2430536').click();
    await expect(page.getByTestId('traffic-estimate-size')).toHaveText('1.200.000 a 1.400.000 pessoas');
    await expect(page.getByTestId('traffic-estimate-empty')).toHaveCount(0);
    const est = calls.filter((c) => c.action === 'estimate');
    expect(est.length).toBeGreaterThan(0);
    expect(est.at(-1)).toMatchObject({ objective: 'OUTCOME_ENGAGEMENT', draft: { targeting: { cities: [{ key: '2430536' }] } } });
  });

  test('prévia do feed: legenda no Conteúdo e texto digitado no Anúncio', async ({ page }) => {
    await mockTraffic(page, []);
    const arte = await seedPost('F33 Arte');
    const conteudo = await seedDraft({ step: 1 });

    await page.goto(`/trafego?aba=nova&id=${conteudo}`);
    await expect(heading(page, 'Conteúdo')).toBeVisible();
    await expect(page.getByTestId(`traffic-post-card-${arte}`).getByTestId('ig-caption')).toContainText('Legenda de F33 Arte');

    const anuncio = await seedDraft({ step: 6, postId: arte, mode: 'new_creative' });
    await page.goto(`/trafego?aba=nova&id=${anuncio}`);
    await expect(heading(page, 'Anúncio')).toBeVisible();
    await page.getByTestId('traffic-ad-1-text').fill('Conheça a mentoria de liderança.');
    await expect(page.getByTestId('traffic-ad-preview-1').getByTestId('ig-caption')).toContainText('Conheça a mentoria de liderança.');
  });

  test('Continuar trava no que falta e Resolver leva ao passo certo', async ({ page }) => {
    await mockTraffic(page, []);
    const arte = await seedPost('F33 Arte');
    await startWizard(page);

    await expect(next(page)).toBeDisabled();
    await expect(page.getByTestId('traffic-step-problems')).toContainText('Escolha ao menos uma peça.');
    await page.getByTestId(`traffic-post-${arte}`).click();
    await next(page).click();
    await page.getByTestId('traffic-objective-OUTCOME_TRAFFIC').click();
    await page.getByTestId('traffic-name').fill('Trava F33');
    await next(page).click();
    await next(page).click();

    await page.getByTestId('traffic-loc-remove-BR').click();
    await expect(next(page)).toBeDisabled();
    await expect(page.getByTestId('traffic-step-problems')).toContainText('Escolha ao menos um local.');
    await page.getByTestId('traffic-loc-search').fill('Camp');
    await page.getByTestId('traffic-loc-2430536').click();
    await next(page).click();
    await next(page).click();

    await expect(heading(page, 'Anúncio')).toBeVisible();
    await page.getByTestId('traffic-ad-1-text').fill('Texto sem link.');
    await expect(next(page)).toBeDisabled();
    await expect(page.getByTestId('traffic-step-problems')).toContainText('informe o link (https)');

    // Rascunho parado na Revisão sem local: o "Resolver" leva ao Público.
    const ig = await seedIgPost('F33 Instagram');
    const semLocal = await seedDraft({ postId: ig, targeting: { countries: [] } });
    await page.goto(`/trafego?aba=nova&id=${semLocal}`);
    await expect(heading(page, 'Revisão')).toBeVisible();
    const erros = page.getByTestId('traffic-review-errors');
    await expect(erros).toContainText('Escolha ao menos um local.');
    await expect(page.getByTestId('traffic-create')).toBeDisabled();
    await erros.getByRole('button', { name: 'Resolver' }).click();
    await expect(heading(page, 'Público')).toBeVisible();
  });

  test('recusa do servidor aparece na Revisão sem sair dela', async ({ page }) => {
    await page.route('**/functions/v1/traffic-meta', (route) => route.request().method() === 'OPTIONS'
      ? route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } })
      : route.fulfill({
        status: 402, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, code: 'PT402', error: 'Passa do teto mensal: sobram R$ 10,00 este mês.' }),
      }));
    const ig = await seedIgPost('F33 Instagram');
    const id = await seedDraft({ postId: ig });

    await page.goto(`/trafego?aba=nova&id=${id}`);
    await expect(heading(page, 'Revisão')).toBeVisible();
    await page.getByTestId('traffic-create').click();
    await expect(page.getByTestId('traffic-create-error')).toHaveText('Passa do teto mensal: sobram R$ 10,00 este mês.');
    await expect(heading(page, 'Revisão')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`id=${id}`));
    await expect(page.getByTestId('traffic-create')).toBeEnabled();
  });

  test('rascunhos: continuar de onde parou e excluir em dois cliques', async ({ page }) => {
    const a = await seedDraft({ name: 'Rascunho A', step: 3 });
    const b = await seedDraft({ name: 'Rascunho B', step: 2 });

    await page.goto('/trafego?aba=nova');
    await expect(page.getByTestId(`traffic-draft-${a}`)).toContainText('Passo 3 de 7');
    await page.getByTestId(`traffic-draft-${a}`).getByRole('button', { name: 'Continuar' }).click();
    await expect(heading(page, 'Orçamento e programação')).toBeVisible();

    await page.getByRole('button', { name: 'Salvar e sair' }).click();
    const rowB = page.getByTestId(`traffic-draft-${b}`);
    await rowB.getByRole('button', { name: 'Excluir rascunho Rascunho B' }).click();
    await expect(page.getByTestId(`traffic-draft-delete-${b}`)).toHaveText('Confirmar exclusão');
    await page.getByTestId(`traffic-draft-delete-${b}`).click();
    await expect(rowB).toHaveCount(0);
    await expect(page.getByTestId(`traffic-draft-${a}`)).toBeVisible();
    expect(await sql(`select id from traffic_campaigns where id = '${b}'`)).toEqual([]);
  });
});
