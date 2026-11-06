import { test, expect } from '@playwright/test';
import { cleanupE2EData, seed, sql } from './helpers/admin';
import { mockEdge } from './helpers/mocks';
import { e2eUser } from './helpers/env';

// F28 — Ensinar a Hive num lugar só: /coach com as abas Conversa, Observações e Lições.
// /feedback e /aprendizado viraram redirecionamento para as abas.
test.describe('F28 · Coach com abas (Ensinar a Hive)', () => {
  test.beforeEach(async () => { await cleanupE2EData(); });
  test.afterAll(async () => { await cleanupE2EData(); });

  test('abas seguem ?aba= e aba inválida cai na Conversa', async ({ page }) => {
    await page.goto('/coach');
    await expect(page.getByRole('tab', { name: 'Conversa' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByPlaceholder('O que está saindo errado nas gerações?')).toBeVisible();

    await page.getByRole('tab', { name: 'Observações' }).click();
    await expect(page).toHaveURL(/\/coach\?aba=observacoes$/);
    await expect(page.getByTestId('coach-observacoes')).toBeVisible();

    await page.getByRole('tab', { name: 'Lições' }).click();
    await expect(page).toHaveURL(/\/coach\?aba=licoes$/);
    await expect(page.getByTestId('coach-licoes')).toBeVisible();

    await page.getByRole('tab', { name: 'Conversa' }).click();
    await expect(page).toHaveURL(/\/coach$/);

    await page.goto('/coach?aba=xyz');
    await expect(page.getByRole('tab', { name: 'Conversa' })).toHaveAttribute('aria-selected', 'true');
  });

  test('/feedback e /aprendizado levam às abas do Coach', async ({ page }) => {
    await page.goto('/feedback');
    await expect(page).toHaveURL(/\/coach\?aba=observacoes$/);
    await expect(page.getByTestId('coach-observacoes')).toBeVisible();

    await page.goto('/aprendizado');
    await expect(page).toHaveURL(/\/coach\?aba=licoes$/);
    await expect(page.getByTestId('coach-licoes')).toBeVisible();
  });

  test('Conversa: proposta do coach → Salvar lição → some da conversa', async ({ page }) => {
    const commits: Array<Record<string, unknown>> = [];
    await mockEdge(page, 'voice-coach', () => ({
      success: true, reply: 'Entendi: fechamentos repetidos cansam.',
      proposals: [{ texto: 'Varie o fechamento; não repita "Vê?".', categoria: 'estrutura', facet: 'legenda', scope: { editorial_slug: null, platform: null, target_avatar: null } }],
    }));
    await mockEdge(page, 'commit-learning', () => ({ success: true, reforcou: false }), commits);

    await page.goto('/coach');
    await page.getByPlaceholder('O que está saindo errado nas gerações?').fill('O fechamento "Vê?" se repete demais.');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Entendi: fechamentos repetidos cansam.')).toBeVisible();
    const proposta = page.getByText('Varie o fechamento; não repita "Vê?".');
    await expect(proposta).toBeVisible();

    await page.getByRole('button', { name: 'Salvar lição' }).click();
    await expect(page.getByText('Lição salva — já vale na próxima geração')).toBeVisible();
    await expect(proposta).toHaveCount(0);
    expect(commits[0]).toMatchObject({ texto: 'Varie o fechamento; não repita "Vê?".', facet: 'legenda' });
    // a conversa ficou gravada, com a proposta marcada como salva
    await expect.poll(async () => (await sql<{ s: boolean }>(
      `select (proposals->0->>'saved')::boolean s from ai_chat_messages where user_id='${e2eUser().id}' and role='assistant'`,
    )).map((r) => r.s)).toEqual([true]);
  });

  test('Observações: enviar → aparece em "Enviados agora" com o que a IA aprendeu', async ({ page }) => {
    const calls: Array<Record<string, unknown>> = [];
    await mockEdge(page, 'learn-from-feedback', () => ({
      success: true, learnings: [{ texto: 'Traga dados concretos na editoria de Diagnóstico.', categoria: 'conteudo', reforcou: false }],
    }), calls);

    await page.goto('/coach?aba=observacoes');
    await page.getByLabel('Sua observação').fill('Gosto mais quando o Diagnóstico traz dados.');
    await page.getByRole('button', { name: 'Enviar observação' }).click();

    const aba = page.getByTestId('coach-observacoes');
    await expect(aba.getByText('Enviados agora')).toBeVisible();
    await expect(aba.getByText('A IA aprendeu', { exact: true })).toBeVisible();
    await expect(aba.getByText('Traga dados concretos na editoria de Diagnóstico.')).toBeVisible();
    expect(calls[0]).toMatchObject({ feedback_text: 'Gosto mais quando o Diagnóstico traz dados.', facet_focus: 'ambos', platform: null, editorial_slug: null });
  });

  test('Lições: desligar a lição ativa grava no banco e atualiza o rodapé', async ({ page }) => {
    const ativa = await seed('ai_learnings', { texto: 'E2E lição ativa', categoria: 'voz', facet: 'texto', ativo: true });
    await seed('ai_learnings', { texto: 'E2E lição desligada', categoria: 'voz', facet: 'legenda', ativo: false });

    await page.goto('/coach?aba=licoes');
    const aba = page.getByTestId('coach-licoes');
    await expect(aba).toContainText('E2E lição ativa');
    await expect(aba).toContainText('E2E lição desligada');
    await expect(aba).toContainText('1 lição(ões) ativa(s)');

    await aba.getByRole('button', { name: 'Desligar lição' }).click();
    await expect(aba).toContainText('0 lição(ões) ativa(s)');
    await expect.poll(async () => (await sql<{ ativo: boolean }>(`select ativo from ai_learnings where id='${ativa}'`))[0].ativo).toBe(false);
  });

  test('menu: Ensinar a Hive só com Coach de voz e Curadoria', async ({ page }) => {
    await page.goto('/coach');
    const nav = page.getByRole('navigation', { name: 'Menu principal' });
    await expect(nav.getByRole('link', { name: 'Coach de voz' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Curadoria' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Feedback contínuo' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Aprendizado' })).toHaveCount(0);
  });
});
