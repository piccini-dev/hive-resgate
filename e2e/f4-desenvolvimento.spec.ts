import { test, expect, type Page } from '@playwright/test';
import { cleanupE2EData, sql } from './helpers/admin';
import { mockDevelop } from './helpers/mocks';
import { seedAccounts, seedApprovedPauta, seedCampaign, seedValidatedContents } from './helpers/fixtures';

// F4 (09/11): conhecimento reutilizável. Validação da base não cria nem aprova post.
// Substitui a expectativa antiga de que toda validação gerava uma peça LinkedIn.
test.describe('F4 · conteúdos-base e versões', () => {
  test.beforeEach(async () => { await cleanupE2EData(); });
  test.afterAll(async () => { await cleanupE2EData(); });

  async function setup(page: Page) {
    const calls: Array<Record<string, unknown>> = [];
    await mockDevelop(page, calls);
    const acc = await seedAccounts();
    const camp = await seedCampaign({ weeks: 2, accountIds: [acc.linkedin, acc.instagram] });
    await seedApprovedPauta(camp.id, camp.cycleIds[0], [
      { title: 'Pensamento da pauta A', fn: 'autoridade', channels: [{ platform: 'linkedin', account_id: acc.linkedin }] },
      { title: 'Pensamento da pauta B', fn: 'posicionamento', channels: [{ platform: 'instagram', account_id: acc.instagram }] },
    ]);
    await page.goto(`/producao?campaign=${camp.id}&cycle=${camp.cycleIds[0]}`);
    await page.getByRole('button', { name: 'Desenvolver conteúdos-base', exact: true }).click();
    await expect(page.getByTestId('base-card')).toHaveCount(2);
    return { calls, acc, camp, cycleId: camp.cycleIds[0] };
  }
  async function openFirst(page: Page) {
    await page.getByTestId('base-card').filter({ hasText: 'Pensamento da pauta A' }).getByRole('button').click();
    await expect(page.getByTestId('content-texto')).toBeVisible();
  }

  test('desenvolve bases sem escolher destino e valida sem criar peça (T01/T02)', async ({ page }) => {
    const { calls, cycleId } = await setup(page);
    expect(calls.filter((c) => c.mode === 'develop')).toHaveLength(2);
    expect(calls.every((c) => c.purpose === 'knowledge_base')).toBe(true);
    await openFirst(page);
    await page.getByRole('button', { name: 'Validar conteúdo-base', exact: true }).click();
    await expect(page.getByTestId('content-approved')).toContainText('Nenhum post foi criado');
    expect(await sql(`select id from user_posts where cycle_id='${cycleId}'`)).toHaveLength(0);
    expect(await sql(`select id from content_base_versions where draft_cycle_id='${cycleId}' and status='validated'`)).toHaveLength(1);
    await page.getByRole('button', { name: 'Voltar à visão geral', exact: true }).click();
    await expect(page.getByTestId('base-progress')).toContainText('1 bases validadas');
    await expect(page.getByRole('button', { name: 'Seguir para criação dos posts' })).toBeEnabled();
  });

  test('edição de base validada cria rascunho sem alterar versão já utilizada (T04/T10)', async ({ page }) => {
    const { cycleId } = await setup(page);
    await openFirst(page);
    await page.getByRole('button', { name: 'Validar conteúdo-base', exact: true }).click();
    const [before] = await sql<{ id: string; body: { texto: string } }>(`select id,body from content_base_versions where draft_cycle_id='${cycleId}' and status='validated'`);
    await page.getByRole('button', { name: 'Voltar à visão geral', exact: true }).click();
    await openFirst(page);
    await page.getByRole('button', { name: 'Editar diretamente', exact: true }).click();
    await page.getByLabel('Desenvolvimento', { exact: true }).fill('Uma nova nuance que complementa o pensamento.');
    await page.getByRole('button', { name: 'Salvar versão', exact: true }).click();
    await expect(page.getByTestId('content-texto')).toHaveText('Uma nova nuance que complementa o pensamento.');
    const [original] = await sql<{ body: { texto: string } }>(`select body from content_base_versions where id='${before.id}'`);
    expect(original.body).toEqual(before.body);
    const [use] = await sql<{ version_id: string }>(`select version_id from content_base_uses where cycle_id='${cycleId}'`);
    expect(use.version_id).toBe(before.id);
    await page.reload();
    await openFirst(page);
    await expect(page.getByTestId('content-texto')).toContainText('nova nuance');
    await page.getByRole('button', { name: 'Validar conteúdo-base', exact: true }).click();
    const versions = await sql(`select id from content_base_versions where draft_cycle_id='${cycleId}' and status='validated'`);
    expect(versions).toHaveLength(2);
    expect(await sql(`select id from user_posts where cycle_id='${cycleId}'`)).toHaveLength(0);
  });

  test('ajuste com IA mantém finalidade de base e salva nova versão em elaboração (T01/T04)', async ({ page }) => {
    const { calls, cycleId } = await setup(page);
    await openFirst(page);
    await page.getByRole('button', { name: 'Ajustar com a Hive', exact: true }).click();
    await page.getByLabel('O que vamos aprofundar ou ajustar?').fill('Amplie as relações e indique lacunas.');
    await page.getByRole('button', { name: 'Ajustar base com a Hive', exact: true }).click();
    await expect(page.getByTestId('content-texto')).toContainText('(ajustado)');
    expect(calls.find((c) => c.mode === 'adjust')).toMatchObject({ purpose: 'knowledge_base', instruction: 'Amplie as relações e indique lacunas.' });
    expect(await sql(`select id from content_base_versions where draft_cycle_id='${cycleId}' and status='draft'`)).toHaveLength(1);
    expect(await sql(`select id from user_posts where cycle_id='${cycleId}'`)).toHaveLength(0);
  });

  test('nove bases legadas continuam validadas sem regeneração e sem reaprovação (T14/T17)', async ({ page }) => {
    const calls: Array<Record<string, unknown>> = [];
    await mockDevelop(page, calls);
    const acc = await seedAccounts();
    const camp = await seedCampaign({ weeks: 2, accountIds: [acc.instagram] });
    const cycleId = camp.cycleIds[0];
    const originals = await seedValidatedContents(camp.id, cycleId, Array.from({ length: 9 }, (_, n) => ({ title: `Base preservada ${n + 1}`, channels: [{ platform: 'instagram', account_id: acc.instagram }] })));
    await page.goto(`/producao?campaign=${camp.id}&cycle=${cycleId}&step=4`);
    await expect(page.getByTestId('base-card')).toHaveCount(9);
    await expect(page.getByTestId('base-progress')).toContainText('9 bases validadas');
    await expect(page.getByRole('button', { name: 'Seguir para criação dos posts' })).toBeEnabled();
    expect(calls).toHaveLength(0);
    const saved = await sql<{ id: string; status: string }>(`select id,status from contents where cycle_id='${cycleId}'`);
    expect(saved.map((r) => r.id).sort()).toEqual(originals.map((r) => r.contentId).sort());
    expect(saved.every((r) => r.status === 'validated')).toBe(true);
  });
});
