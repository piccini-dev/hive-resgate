import { test, expect } from '@playwright/test';
import { cleanupE2EData, sql } from './helpers/admin';
import { e2eUser } from './helpers/env';

// F31 — Base do módulo de Tráfego (bloco 11): menu, abas por ?aba=, bloqueio sem
// configuração, aviso sem Facebook conectado e salvar conta + Instagram + teto.
// Token falso: nada aqui fala com a Meta.
test.describe('F31 · Tráfego · base do módulo', () => {
  test.beforeEach(async () => { await cleanupE2EData(); });
  test.afterAll(async () => { await cleanupE2EData(); });

  async function seedConnection() {
    const { id: u } = e2eUser();
    await sql(`insert into meta_connections (user_id, access_token, scopes) values ('${u}', 'e2e-token-falso', array['ads_read','ads_management'])`);
    await sql(`insert into meta_ad_accounts (user_id, fb_account_id, name, account_status, currency) values ('${u}', 'act_e2e', 'Conta E2E', 1, 'BRL')`);
    await sql(`insert into social_accounts (user_id, platform, label, status, instagram_business_account_id, metadata) values ('${u}', 'instagram', '@conta_e2e', 'connected', 'ig-e2e', '{}'::jsonb)`);
  }

  test('menu leva a /trafego; abas seguem ?aba= e aba inválida cai em Campanhas', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Menu principal' });
    await nav.getByRole('link', { name: 'Tráfego', exact: true }).click();
    await expect(page).toHaveURL(/\/trafego$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Tráfego' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Campanhas' })).toHaveAttribute('aria-selected', 'true');

    await page.getByRole('tab', { name: 'Resultados' }).click();
    await expect(page).toHaveURL(/\/trafego\?aba=resultados$/);
    await expect(page.getByTestId('paid-section')).toBeVisible({ timeout: 30_000 });

    await page.goto('/trafego?aba=xyz');
    await expect(page.getByRole('tab', { name: 'Campanhas' })).toHaveAttribute('aria-selected', 'true');
  });

  test('sem Facebook conectado: bloqueio nas campanhas e aviso nas configurações', async ({ page }) => {
    await page.goto('/trafego');
    await expect(page.getByTestId('traffic-gate')).toBeVisible();
    await page.getByRole('tab', { name: 'Nova campanha' }).click();
    await expect(page.getByTestId('traffic-gate')).toBeVisible();

    await page.getByTestId('traffic-gate').getByRole('button', { name: 'Configurar' }).click();
    await expect(page).toHaveURL(/\/trafego\?aba=configuracoes$/);
    const aviso = page.getByTestId('traffic-no-connection');
    await expect(aviso).toContainText('Conecte o Facebook');
    await expect(aviso.getByRole('link', { name: 'Ir para Contas' })).toHaveAttribute('href', '/configuracoes');
  });

  test('salvar conta, Instagram e teto libera as campanhas', async ({ page }) => {
    await seedConnection();
    await page.goto('/trafego?aba=configuracoes');
    const form = page.getByTestId('traffic-settings');
    await expect(form).toBeVisible();
    await expect(page.getByTestId('traffic-save')).toBeDisabled();

    await page.getByTestId('traffic-ad-account').click();
    await page.getByRole('option', { name: 'Conta E2E' }).click();
    await page.getByTestId('traffic-ig').click();
    await page.getByRole('option', { name: '@conta_e2e' }).click();
    await page.getByTestId('traffic-cap').fill('0');
    await expect(page.getByTestId('traffic-save')).toBeDisabled();
    await page.getByTestId('traffic-cap').fill('1000');
    await page.getByTestId('traffic-save').click();
    await expect(page.getByText('Configuração do tráfego salva.')).toBeVisible();

    const { id: u } = e2eUser();
    const [row] = await sql<{ ad_account_id: string; ig_user_id: string; monthly_cap: string; page_id: string | null }>(
      `select ad_account_id, ig_user_id, monthly_cap::text, page_id from meta_connections where user_id='${u}'`,
    );
    expect(row).toEqual({ ad_account_id: 'act_e2e', ig_user_id: 'ig-e2e', monthly_cap: '1000', page_id: null });

    await page.getByRole('tab', { name: 'Campanhas' }).click();
    await expect(page.getByTestId('traffic-campaigns-soon')).toBeVisible();
    await expect(page.getByTestId('traffic-gate')).toHaveCount(0);
  });

  test('o banco recusa teto zero e a view só mostra peças aprovadas com arte', async () => {
    const { id: u } = e2eUser();
    await sql(`insert into meta_connections (user_id, access_token) values ('${u}', 'e2e-token-falso')`);
    await expect(sql(`update meta_connections set monthly_cap = 0 where user_id='${u}'`)).rejects.toThrow(/monthly_cap_check/);

    await sql(`insert into user_posts (user_id, platform, format, status, title, rendered_slides) values
      ('${u}','instagram','image','pending_approval','Aguardando','{"slide1":"https://example.com/a.png"}'::jsonb),
      ('${u}','instagram','image','approved','Aprovada com arte','{"slide1":"https://example.com/b.png"}'::jsonb),
      ('${u}','linkedin','image','approved','Aprovada sem arte','{}'::jsonb),
      ('${u}','instagram','image','published','Publicada no IG',null)`);
    await sql(`update user_posts set metadata = '{"ig_media_id":"178e2e"}'::jsonb where user_id='${u}' and title='Publicada no IG'`);
    const rows = await sql<{ title: string }>(`select title from traffic_eligible_posts where user_id='${u}' order by title`);
    expect(rows.map((r) => r.title)).toEqual(['Aprovada com arte', 'Publicada no IG']);
  });

  test('comparativo de contas aponta para Tráfego › Resultados', async ({ page }) => {
    const { id: u } = e2eUser();
    await sql(`insert into social_accounts (user_id, platform, label, status, instagram_business_account_id, metadata) values
      ('${u}','instagram','@a','connected','ig-a','{"ig":{"imported_at":"2026-10-02","profile":{"username":"a","followers_count":1}}}'::jsonb),
      ('${u}','instagram','@b','connected','ig-b','{"ig":{"imported_at":"2026-10-02","profile":{"username":"b","followers_count":1}}}'::jsonb)`);
    await page.goto('/desempenho/contas');
    const moved = page.getByTestId('paid-moved');
    await expect(moved).toBeVisible({ timeout: 30_000 });
    await moved.getByRole('link', { name: 'Tráfego › Resultados' }).click();
    await expect(page).toHaveURL(/\/trafego\?aba=resultados$/);
    await expect(page.getByTestId('paid-section')).toBeVisible({ timeout: 30_000 });
  });
});
