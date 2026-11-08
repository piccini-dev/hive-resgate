import { test, expect } from '@playwright/test';
import { cleanupE2EData } from './helpers/admin';

// F30 — Visual e resultados: "Fotos do Marcos" junta o motor fotográfico e as fotos reais;
// "Resultados" junta o Desempenho e a Jornada ACJ. /hive/marcos e /jornada viraram
// redirecionamento. O teste só lê: não envia foto, não gera prancha, não aprova estilo.
test.describe('F30 · Visual e resultados', () => {
  test.beforeEach(async () => { await cleanupE2EData(); });
  test.afterAll(async () => { await cleanupE2EData(); });

  test('Fotos do Marcos: abas seguem ?aba= e aba inválida cai em Motor fotográfico', async ({ page }) => {
    await page.goto('/hive/fotografia');
    await expect(page.getByRole('heading', { level: 1, name: 'Fotos do Marcos' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Motor fotográfico' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('level-A')).toBeVisible();

    await page.getByRole('tab', { name: 'Fotos reais' }).click();
    await expect(page).toHaveURL(/\/hive\/fotografia\?aba=reais$/);
    await expect(page.getByText('Clique pra escolher uma foto real do Marcos')).toBeVisible();

    await page.goto('/hive/fotografia?aba=xyz');
    await expect(page.getByRole('tab', { name: 'Motor fotográfico' })).toHaveAttribute('aria-selected', 'true');
  });

  test('Resultados: abas seguem ?aba= e aba inválida cai em Desempenho', async ({ page }) => {
    await page.goto('/desempenho');
    await expect(page.getByRole('heading', { level: 1, name: 'Resultados' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Desempenho', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('refresh-metrics')).toBeVisible();

    await page.getByRole('tab', { name: 'Jornada ACJ' }).click();
    await expect(page).toHaveURL(/\/desempenho\?aba=acj$/);
    await expect(page.getByRole('tab', { name: 'Resultados por ACJ' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Registro Vivo' })).toBeVisible();

    await page.goto('/desempenho?aba=xyz');
    await expect(page.getByRole('tab', { name: 'Desempenho', exact: true })).toHaveAttribute('aria-selected', 'true');
  });

  test('/hive/marcos e /jornada levam às abas novas', async ({ page }) => {
    await page.goto('/hive/marcos');
    await expect(page).toHaveURL(/\/hive\/fotografia\?aba=reais$/);
    await expect(page.getByRole('tab', { name: 'Fotos reais' })).toHaveAttribute('aria-selected', 'true');

    await page.goto('/jornada');
    await expect(page).toHaveURL(/\/desempenho\?aba=acj$/);
    await expect(page.getByRole('tab', { name: 'Jornada ACJ' })).toHaveAttribute('aria-selected', 'true');
  });

  test('menu: Resultados no topo e Fotos do Marcos no Visual; nomes antigos fora', async ({ page }) => {
    await page.goto('/hive/fotografia');                           // o grupo "Visual" abre com a rota ativa
    const nav = page.getByRole('navigation', { name: 'Menu principal' });
    for (const name of ['Resultados', 'Fotos do Marcos']) {
      await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
    }
    for (const name of ['Desempenho', 'Jornada relacional (ACJ)', 'Fotografia do Marcos']) {
      await expect(nav.getByRole('link', { name, exact: true })).toHaveCount(0);
    }
  });
});
