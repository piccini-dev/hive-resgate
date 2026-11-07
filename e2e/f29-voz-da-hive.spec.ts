import { test, expect } from '@playwright/test';
import { cleanupE2EData } from './helpers/admin';
import { seedIdentityBrand } from './helpers/fixtures';

// F29 — Voz da Hive em 4 lugares: Minha identidade (com Produtos e ofertas), Como escrevo
// (Genesis + Diretrizes em abas), Editoriais (com a aba Arsenal) e Conhecimento.
// /diretrizes, /arsenal e /produtos viraram redirecionamento. O teste só lê o que é da Bee.
test.describe('F29 · Voz da Hive', () => {
  test.beforeEach(async () => { await cleanupE2EData(); });
  test.afterAll(async () => { await cleanupE2EData(); });

  test('Como escrevo: abas seguem ?aba= e aba inválida cai em Princípios', async ({ page }) => {
    await page.goto('/genesis');
    await expect(page.getByRole('heading', { level: 1, name: 'Como escrevo' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Princípios' })).toHaveAttribute('aria-selected', 'true');

    await page.getByRole('tab', { name: 'Ofício' }).click();
    await expect(page).toHaveURL(/\/genesis\?aba=oficio$/);
    await expect(page.getByRole('tab', { name: 'Ofício' })).toHaveAttribute('aria-selected', 'true');

    await page.getByRole('tab', { name: 'Princípios' }).click();
    await expect(page).toHaveURL(/\/genesis$/);

    await page.goto('/genesis?aba=xyz');
    await expect(page.getByRole('tab', { name: 'Princípios' })).toHaveAttribute('aria-selected', 'true');
  });

  test('/diretrizes, /arsenal e /produtos levam aos novos lugares', async ({ page }) => {
    await page.goto('/diretrizes');
    await expect(page).toHaveURL(/\/genesis\?aba=oficio$/);
    await expect(page.getByRole('tab', { name: 'Ofício' })).toHaveAttribute('aria-selected', 'true');

    await page.goto('/arsenal');
    await expect(page).toHaveURL(/\/editoriais\?aba=arsenal$/);
    await expect(page.getByTestId('editoriais-arsenal')).toBeVisible();

    await page.goto('/produtos');
    await expect(page).toHaveURL(/\/identidade$/);
  });

  test('Editoriais: "Novo editorial" só na aba Editoriais; na aba Arsenal aparece "Novo item"', async ({ page }) => {
    await page.goto('/editoriais');
    await expect(page.getByRole('button', { name: 'Novo editorial' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Novo item' })).toHaveCount(0);

    await page.getByRole('tab', { name: 'Arsenal' }).click();
    await expect(page).toHaveURL(/\/editoriais\?aba=arsenal$/);
    await expect(page.getByRole('button', { name: 'Novo item' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Novo editorial' })).toHaveCount(0);
  });

  test('Minha identidade mostra Produtos e ofertas e leva ao Ofício', async ({ page }) => {
    const b = await seedIdentityBrand();
    await page.goto(`/identidade?marca=${b.brandId}`);
    const produtos = page.getByTestId('identity-products');
    await expect(produtos).toBeVisible();
    await expect(produtos.getByRole('heading', { name: 'Produtos e ofertas' })).toBeVisible();

    await page.getByTestId('current-genesis').getByRole('link', { name: 'Ofício (diretrizes)' }).click();
    await expect(page).toHaveURL(/\/genesis\?aba=oficio$/);
    await expect(page.getByRole('tab', { name: 'Ofício' })).toHaveAttribute('aria-selected', 'true');
  });

  test('menu: Voz da Hive só com Minha identidade, Como escrevo, Editoriais e Conhecimento', async ({ page }) => {
    await page.goto('/genesis');                                   // o grupo "Voz da Hive" abre com a rota ativa
    const nav = page.getByRole('navigation', { name: 'Menu principal' });
    for (const name of ['Minha identidade', 'Como escrevo', 'Editoriais', 'Conhecimento']) {
      await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
    }
    for (const name of ['Genesis', 'Diretrizes de Criação', 'Arsenal', 'Produtos']) {
      await expect(nav.getByRole('link', { name, exact: true })).toHaveCount(0);
    }
  });
});
