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
    // React.StrictMode pode iniciar duas leituras do usuário anterior.
    // Todas devem ficar retidas até que a sessão B carregue a própria lista.
    let switched = false;
    const mock = await mockBrandReads(page, async () => {
      if (switched) return { rows: [brands[1]] };
      await waitFirst;
      firstFinished();
      return { rows: [brands[0]] };
    });
    await page.goto('/identidade/marcas');
    await expect(page.getByTestId('identity-context-loading')).toBeVisible();
    await expect.poll(mock.reads).toBeGreaterThanOrEqual(1);
    switched = true;
    await switchMockUser(page, 'usuario-b-simulado');
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


// Administração: rede REST simulada em memória, nenhuma mutação em produção.
type FakeBrand = (typeof brands)[number];
interface MaintenanceOptions {
  initial?: FakeBrand[];
  workspaceIds?: string[];
}
async function mockMaintenance(page: Page, options: MaintenanceOptions = {}) {
  const state = {
    list: (options.initial ?? brands).map((item) => ({ ...item })),
    workspaceIds: options.workspaceIds ?? ['W'],
    inserts: [] as Array<Record<string, unknown>>,
    patches: [] as Array<{ id: string; workspace: string; data: Record<string, unknown> }>,
    archiveCalls: [] as Array<{ p_brand: string; p_archived: boolean }>,
    workspaceCreates: [] as Array<Record<string, unknown>>,
    setupPosts: [] as Array<Record<string, unknown>>,
    configuredLookups: [] as string[],
    failNextInsert: false,
    archiveConflict: false,
    holdInsert: null as Promise<void> | null,
    holdUpdate: null as Promise<void> | null,
  };
  const json = (value: unknown) => ({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify(value) });
  const fail = (status: number, message: string) => ({
    status, headers: cors, contentType: 'application/json',
    body: JSON.stringify({ code: status === 409 ? 'PT409' : 'SIMULADO', message }),
  });

  await page.route('**/rest/v1/brands**', async (route) => {
    const request = route.request();
    const method = request.method();
    const params = new URL(request.url()).searchParams;
    if (method === 'OPTIONS') { await route.fulfill({ status: 204, headers: cors }); return; }
    if (method === 'GET') {
      const byId = params.get('id');
      let result = [...state.list];
      if (byId?.startsWith('eq.')) {
        state.configuredLookups.push(byId.slice(3));
        result = result.filter((item) => item.id === byId.slice(3));
      }
      if (params.get('status') === 'neq.archived') result = result.filter((item) => item.status !== 'archived');
      await route.fulfill(json(result));
      return;
    }
    if (method === 'POST') {
      const data = request.postDataJSON() as Record<string, unknown>;
      state.inserts.push(data);
      if (state.holdInsert) await state.holdInsert;
      if (state.failNextInsert) {
        state.failNextInsert = false;
        await route.fulfill(fail(503, 'Falha simulada ao salvar'));
        return;
      }
      const created = {
        id: 'N' + state.inserts.length,
        workspace_id: String(data.workspace_id),
        name: String(data.name),
        slug: String(data.slug),
        essence: data.essence === null ? null : String(data.essence ?? ''),
        status: 'active', is_default: false,
      };
      state.list.push(created);
      await route.fulfill(json([created]));
      return;
    }
    if (method === 'PATCH') {
      const data = request.postDataJSON() as Record<string, unknown>;
      const id = (params.get('id') ?? '').replace(/^eq\./, '');
      const workspace = (params.get('workspace_id') ?? '').replace(/^eq\./, '');
      state.patches.push({ id, workspace, data });
      if (state.holdUpdate) await state.holdUpdate;
      const item = state.list.find((brand) => brand.id === id && brand.workspace_id === workspace);
      if (item) Object.assign(item, data);
      await route.fulfill(json(item ? [item] : []));
      return;
    }
    await route.fulfill(fail(403, 'Operação não permitida pelo mock'));
  });

  await page.route('**/rest/v1/workspace_members**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fulfill(fail(403, 'Alteração de membros proibida'));
      return;
    }
    const uid = new URL(route.request().url()).searchParams.get('user_id');
    const userId = e2eUser().id;
    await route.fulfill(json(uid === `eq.${userId}`
      ? state.workspaceIds.map((id) => ({
        workspace_id: id, role: 'owner',
        workspaces: { id, name: `Workspace ${id}` },
      }))
      : []));
  });

  await page.route('**/rest/v1/rpc/set_brand_archived**', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fulfill(fail(403, 'RPC apenas para POST'));
      return;
    }
    const args = route.request().postDataJSON() as { p_brand: string; p_archived: boolean };
    state.archiveCalls.push(args);
    if (state.archiveConflict) {
      await route.fulfill(fail(409, 'PT409: marca possui campanhas vinculadas'));
      return;
    }
    const item = state.list.find((brand) => brand.id === args.p_brand);
    if (!item) { await route.fulfill(fail(404, 'PT404: Marca não disponível.')); return; }
    item.status = args.p_archived ? 'archived' : 'active';
    await route.fulfill(json(item)); // RPC RETURNS brands é objeto, não array.
  });

  await page.route('**/rest/v1/rpc/create_my_workspace**', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fulfill(fail(403, 'RPC apenas para POST'));
      return;
    }
    const data = route.request().postDataJSON() as Record<string, unknown>;
    state.workspaceCreates.push(data);
    state.workspaceIds.push('W0');
    state.list.push({
      id: 'C', workspace_id: 'W0', name: String(data.p_brand),
      slug: 'brand-created', essence: null, status: 'active', is_default: true,
    });
    await route.fulfill(json('C')); // RPC de cadastro inicial é mock, não há escrita real.
  });

  // Configurar identidade consulta o estado completo. Devolver estado vazio de teste.
  for (const table of [
    'genesis_core', 'emitters', 'business_fronts', 'audiences',
    'communication_profiles', 'bee_editorials', 'bee_directives',
    'knowledge_documents', 'bee_products', 'setup_sessions',
  ]) {
    await page.route(`**/rest/v1/${table}**`, async (route) => {
      if (table === 'setup_sessions' && route.request().method() === 'POST') {
        state.setupPosts.push(route.request().postDataJSON() as Record<string, unknown>);
        await route.fulfill(fail(403, 'Cadastro de sessão bloqueado no teste'));
        return;
      }
      if (route.request().method() !== 'GET') {
        await route.fulfill(fail(403, 'Mutação bloqueada no teste'));
        return;
      }
      await route.fulfill(json([]));
    });
  }
  return state;
}

test.describe('F34 · manutenção de marcas com gateway HTTP simulado', () => {
  test('primeiro cliente usa entrada inicial neutra, sem herdar dados', async ({ page }) => {
    const state = await mockMaintenance(page, { initial: [], workspaceIds: [] });
    await page.goto('/identidade/marcas');
    await expect(page.getByTestId('identity-no-brand')).toBeVisible();
    await expect(page.getByTestId('brand-card')).toHaveCount(0);
    await page.getByTestId('identity-no-brand').getByLabel('Nome da marca').fill('Empresa Nova');
    await page.getByTestId('workspace-create').click();
    await expect.poll(() => state.workspaceCreates.length).toBe(1);
    expect(state.workspaceCreates).toEqual([{ p_workspace: 'Empresa Nova', p_brand: 'Empresa Nova' }]);
    await expect.poll(() => state.setupPosts.length).toBe(1);
    expect(state.setupPosts[0].brand_id).toBe('C');
  });

  test('nova marca no workspace existente usa INSERT de brands, nunca cria workspace/perfil', async ({ page }) => {
    const state = await mockMaintenance(page);
    await page.goto('/identidade/marcas');
    await page.getByTestId('brand-new').click();
    const form = page.getByTestId('brand-form');
    await form.getByLabel('Nome da marca').fill('  Bee Academy  ');
    await form.getByLabel('Essência (opcional)').fill('  Educação  ');
    await form.getByTestId('brand-save').click();
    await expect(page.getByTestId('brand-card').filter({ hasText: 'Bee Academy' })).toBeVisible();
    expect(state.inserts).toHaveLength(1);
    expect(state.inserts[0]).toMatchObject({
      workspace_id: 'W', name: 'Bee Academy', essence: 'Educação', status: 'active', is_default: false,
    });
    expect(state.inserts[0].slug).toMatch(/^bee-academy-[0-9a-f]{8}$/);
    expect(state.workspaceCreates).toHaveLength(0);
    expect(state.setupPosts).toHaveLength(0);
  });

  test('múltiplos workspaces exigem escolha explícita antes de cadastrar', async ({ page }) => {
    const state = await mockMaintenance(page, { workspaceIds: ['W', 'Q'] });
    await page.goto('/identidade/marcas');
    await page.getByTestId('brand-new').click();
    const form = page.getByTestId('brand-form');
    await form.getByLabel('Nome da marca').fill('Marca com escolha');
    await expect(form.getByLabel('Espaço de trabalho')).toHaveValue('');
    await expect(form.getByTestId('brand-save')).toBeDisabled();
    await form.getByLabel('Espaço de trabalho').selectOption('Q');
    await form.getByTestId('brand-save').click();
    await expect.poll(() => state.inserts.length).toBe(1);
    expect(state.inserts[0].workspace_id).toBe('Q');
    expect(state.workspaceCreates).toHaveLength(0);
  });

  test('edição preserva ID e workspace e só envia nome/essência', async ({ page }) => {
    const state = await mockMaintenance(page);
    await page.goto('/identidade/marcas?marca=A');
    const card = page.getByTestId('brand-card').filter({ hasText: 'Marca A' });
    await card.getByRole('button', { name: 'Editar' }).click();
    const form = page.getByTestId('brand-form');
    await expect(form).toContainText('Espaço de trabalho: Workspace W');
    await expect(form.getByLabel('Espaço de trabalho')).toHaveCount(0);
    await form.getByLabel('Nome da marca').fill('Marca A revisada');
    await form.getByLabel('Essência (opcional)').fill('Texto novo');
    await form.getByTestId('brand-save').click();
    await expect(page.getByTestId('brand-card').filter({ hasText: 'Marca A revisada' })).toBeVisible();
    expect(state.patches).toEqual([{
      id: 'A', workspace: 'W', data: { name: 'Marca A revisada', essence: 'Texto novo' },
    }]);
    expect(state.list.find((entry) => entry.id === 'A')?.workspace_id).toBe('W');
  });

  test('erro de cadastro preserva rascunho e permite tentar novamente', async ({ page }) => {
    const state = await mockMaintenance(page);
    state.failNextInsert = true;
    await page.goto('/identidade/marcas');
    await page.getByTestId('brand-new').click();
    const form = page.getByTestId('brand-form');
    await form.getByLabel('Nome da marca').fill('Rascunho intacto');
    await form.getByTestId('brand-save').click();
    await expect(page.getByTestId('brand-action-error')).toContainText('Falha simulada ao salvar');
    await expect(form.getByLabel('Nome da marca')).toHaveValue('Rascunho intacto');
    await expect(form.getByTestId('brand-save')).toBeEnabled();
    await form.getByTestId('brand-save').click();
    await expect(page.getByTestId('brand-card').filter({ hasText: 'Rascunho intacto' })).toBeVisible();
    expect(state.inserts).toHaveLength(2);
  });

  test('dois envios antes da resposta geram um único INSERT', async ({ page }) => {
    const state = await mockMaintenance(page);
    let release!: () => void;
    state.holdInsert = new Promise<void>((resolve) => { release = resolve; });
    await page.goto('/identidade/marcas');
    await page.getByTestId('brand-new').click();
    const form = page.getByTestId('brand-form');
    await form.getByLabel('Nome da marca').fill('Sem duplicação');
    await form.getByTestId('brand-save').click();
    await expect.poll(() => state.inserts.length).toBe(1);
    await page.evaluate(() => {
      const target = document.querySelector('[data-testid="brand-form"]');
      target?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      target?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(state.inserts).toHaveLength(1);
    release();
    await expect(page.getByTestId('brand-card').filter({ hasText: 'Sem duplicação' })).toBeVisible();
    expect(state.inserts).toHaveLength(1);
  });

  test('PT409 ao arquivar mantém marca ativa, sem fallback ou falso sucesso', async ({ page }) => {
    const state = await mockMaintenance(page);
    state.archiveConflict = true;
    await page.goto('/identidade/marcas');
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByTestId('brand-card').filter({ hasText: 'Marca A' })
      .getByTestId('brand-archive').click();
    await expect(page.getByTestId('brand-action-error')).toContainText('PT409');
    const card = page.getByTestId('brand-card').filter({ hasText: 'Marca A' });
    await expect(card).toContainText('Ativa');
    await expect(card.getByTestId('brand-archive')).toBeVisible();
    expect(state.archiveCalls).toEqual([{ p_brand: 'A', p_archived: true }]);
    expect(state.patches).toHaveLength(0);
  });

  test('restauração reativa a marca com o mesmo ID', async ({ page }) => {
    const state = await mockMaintenance(page, {
      initial: [...brands, { ...brands[1], id: 'C', name: 'Arquivada C', status: 'archived' }],
    });
    await page.goto('/identidade/marcas');
    await page.getByLabel('Mostrar arquivadas').check();
    const archived = page.getByTestId('brand-card').filter({ hasText: 'Arquivada C' });
    await expect(archived).toHaveAttribute('data-brand-id', 'C');
    await archived.getByTestId('brand-restore').click();
    await expect(archived).toContainText('Ativa');
    expect(state.archiveCalls).toEqual([{ p_brand: 'C', p_archived: false }]);
    expect(state.list.find((item) => item.id === 'C')?.status).toBe('active');
  });

  test('Configurar identidade usa a marca do cartão e o percurso já existente', async ({ page }) => {
    const state = await mockMaintenance(page);
    await page.goto('/identidade/marcas?marca=A');
    const card = page.getByTestId('brand-card').filter({ hasText: 'Marca B' });
    await card.getByTestId('brand-configure').click();
    await expect.poll(() => state.configuredLookups.filter((id) => id === 'B').length).toBeGreaterThan(0);
    await expect.poll(() => state.setupPosts.length).toBe(1);
    expect(state.setupPosts[0].brand_id).toBe('B');
    expect(state.workspaceCreates).toHaveLength(0);
  });

  test('resposta atrasada não muda o destino da edição após troca externa de contexto', async ({ page }) => {
    const state = await mockMaintenance(page);
    let release!: () => void;
    state.holdUpdate = new Promise<void>((resolve) => { release = resolve; });
    await page.goto('/identidade/marcas?marca=A');
    const first = page.getByTestId('brand-card').filter({ hasText: 'Marca A' });
    await first.getByRole('button', { name: 'Editar' }).click();
    await page.getByTestId('brand-form').getByLabel('Nome da marca').fill('Somente A');
    await page.getByTestId('brand-save').click();
    await expect.poll(() => state.patches.length).toBe(1);
    await expect(page.getByTestId('identity-brand-select')).toBeDisabled();
    // Navegação externa simulada, sem usar o seletor protegido durante a mutação.
    await page.evaluate(() => {
      window.history.pushState(null, '', '/identidade/marcas?marca=B');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    release();
    await expect(page.getByTestId('identity-brand-select')).toHaveValue('B');
    await expect.poll(() => state.list.find((item) => item.id === 'A')?.name).toBe('Somente A');
    expect(state.patches).toEqual([{
      id: 'A', workspace: 'W', data: { name: 'Somente A', essence: null },
    }]);
    expect(state.list.find((item) => item.id === 'B')?.name).toBe('Marca B');
  });
});


test.describe('F34 · navegação de marcas (desktop, celular e deep link)', () => {
  test('barra lateral abre Marcas usando o menu já existente', async ({ page }) => {
    const state = await mockMaintenance(page);
    await page.goto('/identidade?marca=A');
    await expect(page.getByTestId('identity-home')).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Menu principal' });
    await nav.getByRole('link', { name: 'Marcas', exact: true }).click();
    await expect(page).toHaveURL(/\/identidade\/marcas$/);
    await expect(page.getByTestId('brands-page')).toBeVisible();
    await expect(page.getByTestId('identity-brand-select')).toHaveValue('A');
    expect(state.inserts).toHaveLength(0);
    expect(state.workspaceCreates).toHaveLength(0);
    expect(state.archiveCalls).toHaveLength(0);
  });

  test('gaveta em 375px usa o mesmo link Marcas e fecha após navegar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await mockMaintenance(page);
    await page.goto('/identidade?marca=A');
    await page.getByTestId('mobile-menu').click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    const link = drawer.getByRole('navigation', { name: 'Menu principal' })
      .getByRole('link', { name: 'Marcas', exact: true });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/identidade\/marcas$/);
    await expect(page.getByTestId('brands-page')).toBeVisible();
    await expect(drawer).toHaveCount(0);
  });

  test('deep link mantém a marca explícita e os demais parâmetros após histórico', async ({ page }) => {
    await mockMaintenance(page);
    await page.goto('/identidade?marca=A');
    const nav = page.getByRole('navigation', { name: 'Menu principal' });
    await nav.getByRole('link', { name: 'Marcas', exact: true }).click();
    await expect(page).toHaveURL(/\/identidade\/marcas$/);
    await page.getByTestId('identity-brand-select').selectOption('B');
    await expect(page).toHaveURL(/\/identidade\/marcas\?marca=B/);
    await page.goBack();
    await expect(page).toHaveURL(/\/identidade\/marcas$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/identidade\?marca=A$/);
    await page.goto('/identidade/marcas?marca=B&aba=ativas');
    await expect(page.getByTestId('identity-brand-select')).toHaveValue('B');
    await expect(page).toHaveURL(/\/identidade\/marcas\?marca=B&aba=ativas$/);
  });

  test('Marcas é item ativo sem destacar indevidamente Minha identidade', async ({ page }) => {
    await mockMaintenance(page);
    await page.goto('/identidade/marcas?marca=A');
    const nav = page.getByRole('navigation', { name: 'Menu principal' });
    const marcas = nav.getByRole('link', { name: 'Marcas', exact: true });
    const identidade = nav.getByRole('link', { name: 'Minha identidade', exact: true });
    await expect(marcas).toBeVisible(); // Voz da Hive autoexpandido
    await expect(marcas).toHaveAttribute('aria-current', 'page');
    await expect(identidade).not.toHaveAttribute('aria-current', 'page');
    await identidade.click();
    await expect(page).toHaveURL(/\/identidade$/);
    await expect(identidade).toHaveAttribute('aria-current', 'page');
    await expect(marcas).not.toHaveAttribute('aria-current', 'page');
  });

  test('Minha identidade e configuração guiada continuam com suas rotas anteriores', async ({ page }) => {
    const state = await mockMaintenance(page);
    await page.goto('/identidade?marca=B');
    await expect(page.getByTestId('identity-home')).toBeVisible();
    await page.goto('/identidade/configurar?modo=setup&marca=B');
    await expect.poll(() => state.setupPosts.length).toBe(1);
    expect(state.setupPosts[0]).toMatchObject({ brand_id: 'B', mode: 'setup' });
    await expect(page).toHaveURL(/\/identidade$/); // mock recusa gravação; o fluxo existente retorna à origem
    expect(state.workspaceCreates).toHaveLength(0);
    expect(state.inserts).toHaveLength(0);
  });

  test('sem sessão, login recebe destino protegido com marca e filtros', async ({ browser }) => {
    // Contexto sem cookies nem storage autenticado, sem afetar o usuário E2E da suíte.
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
      baseURL: test.info().project.use.baseURL,
    });
    const page = await context.newPage();
    try {
      await page.goto('/identidade/marcas?marca=B&aba=ativas');
      await expect(page).toHaveURL(/\/login\?next=/);
      const destination = new URL(page.url()).searchParams.get('next');
      expect(destination).toBe('/identidade/marcas?marca=B&aba=ativas');
      await expect(page.getByTestId('brands-page')).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});

 
// Integração real: somente workspaces e2e-* criados por seedIdentityBrand e pelo usuário E2E.
import { seedIdentityBrand } from './helpers/fixtures';
import { sql, seed } from './helpers/admin';

test.describe('F34 · persistência real somente em workspaces E2E', () => {
  const createdWorkspaces: string[] = [];
  const own = async (empty = false) => {
    const fixture = await seedIdentityBrand({ empty });
    createdWorkspaces.push(fixture.workspaceId);
    return fixture;
  };

  test.afterEach(async () => {
    // Cleanup restrito aos IDs capturados; nunca remover workspaces Bee/outras suítes.
    const uid = e2eUser().id;
    for (const workspace of createdWorkspaces.splice(0)) {
      await sql(`
        delete from public.user_posts where user_id='${uid}'
          and profile_id in (select p.id from public.communication_profiles p
            join public.brands b on b.id=p.brand_id where b.workspace_id='${workspace}');
        delete from public.campaigns where user_id='${uid}'
          and profile_id in (select p.id from public.communication_profiles p
            join public.brands b on b.id=p.brand_id where b.workspace_id='${workspace}');
        delete from public.context_snapshots where user_id='${uid}'
          and brand_id in (select id from public.brands where workspace_id='${workspace}');
        delete from public.bee_editorials where brand_id in
          (select id from public.brands where workspace_id='${workspace}');
        delete from public.workspaces where id='${workspace}' and slug like 'e2e-%'
          and exists (select 1 from public.workspace_members
            where workspace_id='${workspace}' and user_id='${uid}');`);
    }
  });

  test('REST real: cadastro e edição persistem no workspace escolhido, sem criar outro espaço', async ({ page }) => {
    const b = await own(true);
    const countBefore = await sql<{ n: number }>(`
      select count(*)::int n from workspace_members where user_id='${e2eUser().id}'`);
    await page.goto(`/identidade/marcas?marca=${b.brandId}`);
    const original = page.locator(`[data-testid="brand-card"][data-brand-id="${b.brandId}"]`);
    await expect(original).toBeVisible();
    await page.getByTestId('brand-new').click();
    const form = page.getByTestId('brand-form');
    const name = `Academia E2E ${b.tag}`;
    await form.getByLabel('Nome da marca').fill(name);
    await form.getByLabel('Essência (opcional)').fill('Formação E2E');
    const wsPicker = form.getByLabel('Espaço de trabalho', { exact: true });
    if (await wsPicker.count()) {
      await expect(wsPicker).toHaveValue('');
      await wsPicker.selectOption(b.workspaceId);
    } else {
      await expect(form).toContainText(`E2E ${b.tag}`);
    }
    await form.getByTestId('brand-save').click();

    const createdQuery = `select id,workspace_id,name,essence,slug,status from public.brands
       where workspace_id='${b.workspaceId}' and name='${name}'`;
    await expect.poll(async () => (await sql<{ id: string }>(createdQuery)).length).toBe(1);
    const [created] = await sql<{
      id: string; workspace_id: string; name: string; essence: string; slug: string; status: string;
    }>(createdQuery);
    expect(created).toMatchObject({
      workspace_id: b.workspaceId, name, essence: 'Formação E2E', status: 'active',
    });
    expect(created.slug).toMatch(/^academia-e2e-[a-z0-9]+-[0-9a-f]{8}$/);
    await expect(page.locator(`[data-testid="brand-card"][data-brand-id="${created.id}"]`)).toBeVisible();
    const card = page.locator(`[data-testid="brand-card"][data-brand-id="${created.id}"]`);
    await card.getByRole('button', { name: 'Editar' }).click();
    const edit = page.getByTestId('brand-form');
    await expect(edit.getByLabel('Espaço de trabalho', { exact: true })).toHaveCount(0);
    await edit.getByLabel('Nome da marca').fill(`Academia revisada ${b.tag}`);
    await edit.getByLabel('Essência (opcional)').fill('Nova essência E2E');
    await edit.getByTestId('brand-save').click();
    await expect.poll(async () => sql<{ id: string; workspace_id: string; essence: string; name: string }>(`
      select id,workspace_id,essence,name from public.brands where id='${created.id}'`))
      .toEqual([{
        id: created.id, workspace_id: b.workspaceId,
        essence: 'Nova essência E2E', name: `Academia revisada ${b.tag}`,
      }]);
    const countAfter = await sql<{ n: number }>(`
      select count(*)::int n from workspace_members where user_id='${e2eUser().id}'`);
    expect(countAfter).toEqual(countBefore);
  });

  test('RPC real: PT409 com campanha ativa preserva perfis, snapshot e peça E2E', async ({ page }) => {
    const b = await own() as Awaited<ReturnType<typeof seedIdentityBrand>> & { profileA: string; profileB: string };
    const uid = e2eUser().id;
    const [campaign] = await sql<{ id: string }>(`
      insert into public.campaigns(user_id,name,type,status,profile_id,cadence,metadata)
      values ('${uid}','Campanha E2E ${b.tag}','organica','active','${b.profileA}','{}','{}') returning id`);
    const [snapshot] = await sql<{ id: string }>(`
      insert into public.context_snapshots(user_id,brand_id,profile_id,profile_version,summary)
      values ('${uid}','${b.brandId}','${b.profileA}',1,'Snapshot E2E ${b.tag}') returning id`);
    const postId = await seed('user_posts', {
      platform: 'linkedin', format: 'image', status: 'draft',
      caption: `Peça E2E ${b.tag}`, profile_id: b.profileA,
      context_snapshot_id: snapshot.id,
      rendered_slides: { slide1: 'https://example.com/e2e.jpg' },
      metadata: { sandbox: b.tag },
    });

    const before = await sql<{ brand: unknown; profiles: unknown; snapshot: unknown; post: unknown; campaign: unknown }>(`
      select (select to_jsonb(b) from brands b where b.id='${b.brandId}') brand,
        (select jsonb_agg(to_jsonb(p) order by p.id) from communication_profiles p
          where p.brand_id='${b.brandId}') profiles,
        (select to_jsonb(s) from context_snapshots s where s.id='${snapshot.id}') snapshot,
        (select to_jsonb(u) from user_posts u where u.id='${postId}') post,
        (select to_jsonb(c) from campaigns c where c.id='${campaign.id}') campaign`);
    await page.goto(`/identidade/marcas?marca=${b.brandId}`);
    await expect(page.locator(`[data-testid="brand-card"][data-brand-id="${b.brandId}"]`)).toBeVisible();
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator(`[data-testid="brand-card"][data-brand-id="${b.brandId}"]`)
      .getByTestId('brand-archive').click();
    await expect(page.getByTestId('brand-action-error')).toContainText('PT409');
    const after = await sql<typeof before[number]>(`
      select (select to_jsonb(b) from brands b where b.id='${b.brandId}') brand,
        (select jsonb_agg(to_jsonb(p) order by p.id) from communication_profiles p
          where p.brand_id='${b.brandId}') profiles,
        (select to_jsonb(s) from context_snapshots s where s.id='${snapshot.id}') snapshot,
        (select to_jsonb(u) from user_posts u where u.id='${postId}') post,
        (select to_jsonb(c) from campaigns c where c.id='${campaign.id}') campaign`);
    expect(after).toEqual(before);
    await expect(page.locator(`[data-testid="brand-card"][data-brand-id="${b.brandId}"]`))
      .toContainText('Ativa');
  });

  test('RPC real e tela em 375px: arquivar/restaurar mantém ID e não cria cópias', async ({ page }) => {
    const b = await own(true);
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(`/identidade/marcas?marca=${b.brandId}`);
    const card = page.locator(`[data-testid="brand-card"][data-brand-id="${b.brandId}"]`);
    await expect(card.getByTestId('brand-archive')).toBeVisible();
    page.once('dialog', (dialog) => dialog.accept());
    await card.getByTestId('brand-archive').click();
    await expect.poll(async () => sql<{ id: string; status: string }>(`
      select id,status from public.brands where id='${b.brandId}'`))
      .toEqual([{ id: b.brandId, status: 'archived' }]);
    await page.getByLabel('Mostrar arquivadas').check();
    const archived = page.locator(`[data-testid="brand-card"][data-brand-id="${b.brandId}"]`);
    await expect(archived.getByTestId('brand-restore')).toBeVisible();
    await archived.getByTestId('brand-restore').click();
    await expect.poll(async () => sql<{ id: string; status: string }>(`
      select id,status from public.brands where workspace_id='${b.workspaceId}'`))
      .toEqual([{ id: b.brandId, status: 'active' }]);
    await expect(archived.getByTestId('brand-archive')).toBeVisible();
  });
});
