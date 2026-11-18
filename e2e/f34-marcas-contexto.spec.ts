// F34 · Contexto de marca — mocks REST isolados, sem escrever em marcas reais.
// Estes cenários serão executados após integrar a página (#106) e a rota (#107).
import { expect, test, type Page } from '@playwright/test';
import { e2eUser } from './helpers/env';

const brands = [
  { id: 'A', workspace_id: 'W', name: 'Marca A', slug: 'marca-a', essence: null, status: 'active', is_default: true },
  { id: 'B', workspace_id: 'W', name: 'Marca B', slug: 'marca-b', essence: null, status: 'active', is_default: false },
];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, prefer',
};

interface MockAnswer {
  rows?: typeof brands;
  status?: number;
  message?: string;
}

async function mockBrandReads(
  page: Page,
  onContextRead: (request: number) => MockAnswer | Promise<MockAnswer> = () => ({ rows: brands }),
) {
  const writes: string[] = [];
  let contextReads = 0;

  await page.route('**/rest/v1/brands**', async (route) => {
    const method = route.request().method();
    if (method === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }
    if (method !== 'GET') {
      writes.push(method);
      await route.fulfill({ status: 403, headers: cors, contentType: 'application/json', body: '{"message":"Mock: escrita bloqueada"}' });
      return;
    }
    const url = new URL(route.request().url());
    const contextLoad = url.searchParams.get('status') === 'neq.archived';
    const answer = contextLoad ? await onContextRead(++contextReads) : { rows: brands };
    await route.fulfill({
      status: answer.status ?? 200,
      contentType: 'application/json',
      headers: cors,
      body: answer.status && answer.status >= 400
        ? JSON.stringify({ code: 'MOCK_READ', message: answer.message ?? 'Erro de leitura simulado' })
        : JSON.stringify(answer.rows ?? []),
    });
  });

  await page.route('**/rest/v1/workspace_members**', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }
    await route.fulfill({
      status: 200, headers: cors, contentType: 'application/json',
      body: JSON.stringify([{
        workspace_id: 'W', role: 'owner', workspaces: { id: 'W', name: 'Workspace E2E' },
      }]),
    });
  });

  // Proteções extras: não permitir criação de workspace nem mutações por RPC nos cenários.
  await page.route('**/rest/v1/rpc/create_my_workspace', async (route) => {
    writes.push('create_my_workspace');
    await route.fulfill({ status: 403, headers: cors, body: 'Operação bloqueada pelo mock' });
  });
  await page.route('**/rest/v1/rpc/set_brand_archived', async (route) => {
    writes.push('set_brand_archived');
    await route.fulfill({ status: 403, headers: cors, body: 'Operação bloqueada pelo mock' });
  });

  return { writes, reads: () => contextReads };
}

async function switchMockUser(page: Page, id: string) {
  // Muda só o estado em memória do cliente; não faz login, logout ou chamada de auth.
  await page.evaluate(async (nextId) => {
    const { useAuthStore } = await import('/src/store/authStore.ts');
    const current = useAuthStore.getState().currentUser;
    if (!current) throw new Error('Perfil E2E não carregado.');
    useAuthStore.setState({ currentUser: { ...current, id: nextId } });
  }, id);
}

test.describe('F34 · seleção de marca no contexto da Identidade', () => {
  test('URL explícita prevalece sobre preferência e preserva filtros', async ({ page }) => {
    const mock = await mockBrandReads(page);
    const { id } = e2eUser();
    await page.addInitScript((uid) => {
      sessionStorage.setItem(`hive.identity.brand:${uid}`, 'A');
    }, id);
    await page.goto('/identidade/marcas?aba=ativas&marca=B');
    const picker = page.getByTestId('identity-brand-select');
    await expect(picker).toBeVisible();
    await expect(picker).toHaveValue('B');
    await expect(page.getByTestId('identity-context-unavailable')).toHaveCount(0);
    await picker.selectOption('A');
    await expect(page).toHaveURL(/\/identidade\/marcas\?aba=ativas&marca=A/);
    expect(mock.writes).toHaveLength(0);
  });

  test('marca explícita inexistente não usa padrão e permite recuperar por escolha', async ({ page }) => {
    await mockBrandReads(page);
    await page.goto('/identidade/marcas?marca=inexistente');
    await expect(page.getByTestId('identity-context-unavailable'))
      .toHaveText('Marca não disponível. Escolha outra marca.');
    const picker = page.getByTestId('identity-brand-select');
    await expect(picker).toHaveValue('');
    await picker.selectOption('B');
    await expect(picker).toHaveValue('B');
    await expect(page).toHaveURL(/marca=B/);
    await expect(page.getByTestId('identity-context-unavailable')).toHaveCount(0);
  });

  test('falha de leitura não vira primeira configuração; botão permite tentar novamente', async ({ page }) => {
    let fail = true;
    const mock = await mockBrandReads(page, () => fail
      ? { status: 503, message: 'Falha de leitura simulada' }
      : { rows: brands });
    await page.goto('/identidade/marcas');
    await expect(page.getByTestId('identity-context-error')).toContainText('Falha de leitura simulada');
    await expect(page.getByTestId('identity-context-empty')).toHaveCount(0);
    await expect(page.getByTestId('identity-no-brand')).toHaveCount(0);
    fail = false;
    await page.getByTestId('identity-context-error').getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByTestId('identity-brand-select')).toHaveValue('A');
    await expect(page.getByTestId('identity-context-error')).toHaveCount(0);
    expect(mock.reads()).toBeGreaterThanOrEqual(2);
    expect(mock.writes).toHaveLength(0);
  });

  test('troca cancelada mantém marca, URL e rascunho do formulário', async ({ page }) => {
    const mock = await mockBrandReads(page);
    await page.goto('/identidade/marcas?marca=A&aba=ativas');
    await expect(page.getByTestId('identity-brand-select')).toHaveValue('A');
    await page.getByTestId('brand-card').filter({ hasText: 'Marca A' })
      .getByRole('button', { name: 'Editar' }).click();
    const name = page.getByTestId('brand-form').getByLabel('Nome da marca');
    await name.fill('Rascunho protegido');
    const messages: string[] = [];
    page.once('dialog', async (dialog) => {
      messages.push(dialog.message());
      await dialog.dismiss();
    });
    await page.getByTestId('identity-brand-select').selectOption('B');
    await expect(page).toHaveURL(/marca=A&aba=ativas/);
    await expect(page.getByTestId('identity-brand-select')).toHaveValue('A');
    await expect(name).toHaveValue('Rascunho protegido');
    expect(messages).toEqual(['Você tem alterações não salvas. Trocar de marca?']);
    expect(mock.writes).toHaveLength(0);
  });

  test('carga atrasada de outro usuário não substitui o contexto atual', async ({ page }) => {
    let allowFirst!: () => void;
    let firstFinished!: () => void;
    const waitFirst = new Promise<void>((resolve) => { allowFirst = resolve; });
    const finishedFirst = new Promise<void>((resolve) => { firstFinished = resolve; });
    const mock = await mockBrandReads(page, async (request) => {
      if (request !== 1) return { rows: [brands[1]] };
      await waitFirst;
      firstFinished();
      return { rows: [brands[0]] };
    });
    await page.goto('/identidade/marcas');
    await expect(page.getByTestId('identity-context-loading')).toBeVisible();
    await expect.poll(mock.reads).toBe(1);
    await switchMockUser(page, 'usuario-b-simulado');
    await expect.poll(mock.reads).toBe(2);
    await expect(page.getByTestId('identity-brand-select')).toHaveValue('B');
    allowFirst();
    await finishedFirst;
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    await expect(page.getByTestId('identity-brand-select')).toHaveValue('B');
    await expect(page.getByTestId('identity-context-unavailable')).toHaveCount(0);
    expect(mock.writes).toHaveLength(0);
  });

  test('preferência é distinta para dois usuários, sem transferir a seleção', async ({ page }) => {
    const mock = await mockBrandReads(page);
    const { id: originalUser } = e2eUser();
    await page.addInitScript((uid) => {
      sessionStorage.setItem(`hive.identity.brand:${uid}`, 'A');
    }, originalUser);
    await page.goto('/identidade/marcas');
    await expect(page.getByTestId('identity-brand-select')).toHaveValue('A');

    const secondUser = 'outro-usuario-simulado';
    await switchMockUser(page, secondUser);
    await expect(page.getByTestId('identity-brand-select')).toHaveValue('A'); // padrão, sem preferência própria
    await page.getByTestId('identity-brand-select').selectOption('B');
    await expect(page).toHaveURL(/marca=B/);
    const preferences = await page.evaluate(({ first, second }) => ({
      first: sessionStorage.getItem(`hive.identity.brand:${first}`),
      second: sessionStorage.getItem(`hive.identity.brand:${second}`),
    }), { first: originalUser, second: secondUser });
    expect(preferences).toEqual({ first: 'A', second: 'B' });

    // Remove somente a escolha da URL para observar novamente a preferência de cada usuário.
    await page.evaluate(() => {
      window.history.pushState(null, '', '/identidade/marcas');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await switchMockUser(page, originalUser);
    await expect(page.getByTestId('identity-brand-select')).toHaveValue('A');
    expect(mock.writes).toHaveLength(0);
  });

  test('seletor permanece visível com apenas uma marca', async ({ page }) => {
    await mockBrandReads(page, () => ({ rows: [brands[0]] }));
    await page.goto('/identidade/marcas');
    const picker = page.getByTestId('identity-brand-select');
    await expect(picker).toBeVisible();
    await expect(picker.locator('option')).toHaveCount(2); // escolha vazia + marca
    await expect(picker).toHaveValue('A');
  });
});
