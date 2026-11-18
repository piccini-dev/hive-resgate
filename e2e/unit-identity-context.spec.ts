import { expect, test } from '@playwright/test';
import { brandContextUrl, brandStorageKey, resolveBrandSelection } from '../src/lib/identity/brand-context';
import type { Brand } from '../src/types/identity';

const brand = (id: string, patch: Partial<Brand> = {}): Brand => ({
  id,
  workspace_id: 'workspace-de-teste',
  name: id,
  slug: id.toLowerCase(),
  essence: null,
  status: 'active',
  is_default: false,
  ...patch,
});

test('seleção explícita prevalece sobre preferência e padrão', () => {
  const a = brand('A', { is_default: true });
  const b = brand('B');
  expect(resolveBrandSelection([a, b], 'B', 'A')).toEqual({ brand: b, invalidRequested: false });
});

test('marca explícita desconhecida, vazia ou arquivada não provoca fallback', () => {
  const a = brand('A', { is_default: true });
  const archived = brand('B', { status: 'archived' });
  for (const requested of ['X', '', 'B']) {
    expect(resolveBrandSelection([a, archived], requested, 'A')).toEqual({ brand: null, invalidRequested: true });
  }
});

test('marca lembrada disponível tem prioridade sobre o padrão', () => {
  const a = brand('A', { is_default: true });
  const b = brand('B');
  expect(resolveBrandSelection([a, b], null, 'B')).toEqual({ brand: b, invalidRequested: false });
});

test('preferência inválida ou arquivada usa padrão disponível e depois primeira ativa', () => {
  const a = brand('A', { is_default: true });
  const b = brand('B');
  const archived = brand('X', { status: 'archived', is_default: true });
  expect(resolveBrandSelection([a, b], null, 'inexistente')).toEqual({ brand: a, invalidRequested: false });
  expect(resolveBrandSelection([archived, b], null, 'X')).toEqual({ brand: b, invalidRequested: false });
  expect(resolveBrandSelection([b, archived], null, null)).toEqual({ brand: b, invalidRequested: false });
});

test('sem marcas disponíveis, retorna contexto vazio sem pedido inválido', () => {
  expect(resolveBrandSelection([], null, null)).toEqual({ brand: null, invalidRequested: false });
  expect(resolveBrandSelection([brand('A', { status: 'archived' })], null, 'A'))
    .toEqual({ brand: null, invalidRequested: false });
});

test('URL acrescenta marca mantendo todos os parâmetros sem alterar a entrada', () => {
  const params = new URLSearchParams('aba=ativas&modo=novo');
  const before = params.toString();
  expect(brandContextUrl('/identidade/marcas', params, 'B'))
    .toBe('/identidade/marcas?aba=ativas&modo=novo&marca=B');
  expect(params.toString()).toBe(before);

  const withBrand = new URLSearchParams('aba=arquivadas&marca=A&from=%2Fidentidade');
  const original = withBrand.toString();
  const url = brandContextUrl('/identidade/marcas', withBrand, 'B');
  expect(url).toBe('/identidade/marcas?aba=arquivadas&marca=B&from=%2Fidentidade');
  expect(withBrand.toString()).toBe(original);
});

test('URL externa, //, query ou hash embutidos são recusados', () => {
  const params = new URLSearchParams('aba=ativas');
  for (const path of [
    'https://example.com/identidade',
    '//example.com/identidade',
    '/identidade//marcas',
    '/identidade?aba=ativas',
    '/identidade#marcas',
    '/https:example.com',
    '/identidade\\marcas',
  ]) {
    expect(() => brandContextUrl(path, params, 'B')).toThrow('Caminho de contexto inválido.');
  }
  expect(params.toString()).toBe('aba=ativas');
});

test('chave de preferência é isolada por usuário', () => {
  expect(brandStorageKey('usuario-1')).toBe('hive.identity.brand:usuario-1');
  expect(brandStorageKey('usuario-2')).toBe('hive.identity.brand:usuario-2');
  expect(brandStorageKey('usuario-1')).not.toBe(brandStorageKey('usuario-2'));
});

 
// Gateway em memória: permite testar contrato e erros sem importar db/Supabase.
import { createBrandApi, type BrandGateway } from '../src/lib/identity/brand-context';

type Method = 'select' | 'insert' | 'update' | 'rpc';
interface GatewayCall {
  method: Method;
  table: string;
  params?: Record<string, string>;
  row?: object;
  where?: Record<string, string>;
  patch?: object;
  args?: object;
}

function withFakeGateway() {
  const state = {
    uid: 'usuario-1' as string | null,
    invalidations: 0,
    calls: [] as GatewayCall[],
    failure: null as { method: Method; error: Error } | null,
    empty: null as 'insert' | 'update' | 'rpc' | null,
    members: [
      { user_id: 'usuario-1', workspace_id: 'W', role: 'owner', workspaces: { id: 'W', name: 'Principal' } },
      { user_id: 'usuario-1', workspace_id: 'W', role: 'owner', workspaces: { id: 'W', name: 'Principal' } },
      { user_id: 'usuario-1', workspace_id: 'Q', role: 'editor', workspaces: { id: 'Q', name: 'Outro permitido' } },
      { user_id: 'usuario-1', workspace_id: 'V', role: 'viewer', workspaces: { id: 'V', name: 'Somente leitura' } },
      { user_id: 'usuario-2', workspace_id: 'X', role: 'owner', workspaces: { id: 'X', name: 'Alheio' } },
    ],
    brands: [brand('A', { workspace_id: 'W', name: 'Marca inicial' })],
  };
  const fail = (method: Method) => {
    if (state.failure?.method === method) throw state.failure.error;
  };
  const gateway: BrandGateway = {
    async select<T>(table, params = {}): Promise<T[]> {
      state.calls.push({ method: 'select', table, params });
      fail('select');
      if (table === 'workspace_members') {
        return state.members.filter((member) => params.user_id === `eq.${member.user_id}`) as T[];
      }
      if (table === 'brands') {
        return state.brands.filter((entry) => params.status !== 'neq.archived' || entry.status !== 'archived') as T[];
      }
      throw new Error('Tabela inesperada no teste.');
    },
    async insert<T>(table, row): Promise<T[]> {
      state.calls.push({ method: 'insert', table, row });
      fail('insert');
      if (table !== 'brands') throw new Error('INSERT fora de brands.');
      if (state.empty === 'insert') return [];
      const entry = { id: `marca-${state.brands.length + 1}`, ...row } as Brand;
      state.brands.push(entry);
      return [entry] as T[];
    },
    async update<T>(table, where, patch): Promise<T[]> {
      state.calls.push({ method: 'update', table, where, patch });
      fail('update');
      if (table !== 'brands') throw new Error('PATCH fora de brands.');
      if (state.empty === 'update') return [];
      const entry = state.brands.find((b) => where.id === `eq.${b.id}` && where.workspace_id === `eq.${b.workspace_id}`);
      if (!entry) return [];
      Object.assign(entry, patch);
      return [entry] as T[];
    },
    async rpc<T>(name, args): Promise<T> {
      state.calls.push({ method: 'rpc', table: name, args });
      fail('rpc');
      if (name !== 'set_brand_archived') throw new Error('RPC inesperado.');
      if (state.empty === 'rpc') return {} as T;
      const params = args as { p_brand: string; p_archived: boolean };
      const entry = state.brands.find((b) => b.id === params.p_brand);
      if (!entry) return {} as T;
      entry.status = params.p_archived ? 'archived' : 'active';
      return entry as T;
    },
  };
  const api = createBrandApi(gateway, () => state.uid, () => { state.invalidations++; },
    () => 'a1b2c3d4-1111-2222-3333-444455556666');
  return { api, state };
}

test('cadastro usa workspace explícito e slug previsível pelo UUID injetado', async () => {
  const { api, state } = withFakeGateway();
  const created = await api.create({ workspaceId: 'Q', name: '  Bee Ácademy  ', essence: '  Formação  ' });
  const insert = state.calls.filter((call) => call.method === 'insert');
  expect(insert).toHaveLength(1);
  expect(insert[0].table).toBe('brands');
  expect(insert[0].row).toEqual({
    workspace_id: 'Q', name: 'Bee Ácademy', essence: 'Formação',
    slug: 'bee-academy-a1b2c3d4', status: 'active', is_default: false,
  });
  expect(created).toMatchObject(insert[0].row as object);
  expect(state.invalidations).toBe(1);
  expect(state.calls.some((call) => call.method === 'rpc')).toBe(false);
});

test('nome vazio/longo e workspace desconhecido, viewer ou alheio impedem INSERT', async () => {
  const { api, state } = withFakeGateway();
  for (const input of [
    { workspaceId: 'W', name: '  ' },
    { workspaceId: 'W', name: 'x'.repeat(121) },
    { workspaceId: 'desconhecido', name: 'Uma marca' },
    { workspaceId: 'V', name: 'Uma marca' },
    { workspaceId: 'X', name: 'Uma marca' },
  ]) {
    await expect(api.create(input)).rejects.toThrow();
  }
  expect(state.calls.filter((call) => call.method === 'insert')).toHaveLength(0);
  expect(state.invalidations).toBe(0);
});

test('workspaces são consultados pelo UID, sem viewer e sem duplicações', async () => {
  const { api, state } = withFakeGateway();
  expect(await api.workspaces()).toEqual([
    { id: 'W', name: 'Principal', role: 'owner' },
    { id: 'Q', name: 'Outro permitido', role: 'editor' },
  ]);
  expect(state.calls).toEqual([
    {
      method: 'select', table: 'workspace_members',
      params: { user_id: 'eq.usuario-1', select: 'workspace_id,role,workspaces(id,name)' },
    },
  ]);
});

test('edição envia somente name e essence, filtrando simultaneamente id e workspace', async () => {
  const { api, state } = withFakeGateway();
  await api.update('A', 'W', { name: '  Novo nome  ', essence: '  Essência  ' });
  const updates = state.calls.filter((call) => call.method === 'update');
  expect(updates).toHaveLength(1);
  expect(updates[0]).toMatchObject({
    table: 'brands',
    where: { id: 'eq.A', workspace_id: 'eq.W' },
    patch: { name: 'Novo nome', essence: 'Essência' },
  });
  expect(Object.keys(updates[0].patch!)).toEqual(['name', 'essence']);
  expect(state.invalidations).toBe(1);

  await api.update('A', 'W', { name: '  Só o nome  ' });
  expect(state.calls.filter((call) => call.method === 'update')[1].patch).toEqual({ name: 'Só o nome' });
  expect(state.invalidations).toBe(2);
});

test('edição em workspace não permitido ou marca inexistente não produz falso sucesso', async () => {
  const { api, state } = withFakeGateway();
  await expect(api.update('A', 'V', { name: 'Não pode' })).rejects.toThrow('Espaço de trabalho não disponível.');
  await expect(api.update('não-existe', 'W', { name: 'Válido' })).rejects.toThrow('Marca não disponível.');
  expect(state.calls.filter((call) => call.method === 'update')).toHaveLength(1);
  expect(state.invalidations).toBe(0);
});

test('respostas vazias de INSERT, PATCH e RPC são erros sem invalidação', async () => {
  const { api, state } = withFakeGateway();
  state.empty = 'insert';
  await expect(api.create({ workspaceId: 'W', name: 'Nova' })).rejects.toThrow('Marca não disponível.');
  state.empty = 'update';
  await expect(api.update('A', 'W', { name: 'Outro' })).rejects.toThrow('Marca não disponível.');
  state.empty = 'rpc';
  await expect(api.setArchived('A', true)).rejects.toThrow('Marca não disponível.');
  expect(state.invalidations).toBe(0);
});

test('arquivar e restaurar só chamam RPC com os parâmetros exatos', async () => {
  const { api, state } = withFakeGateway();
  expect((await api.setArchived('A', true)).status).toBe('archived');
  expect((await api.setArchived('A', false)).status).toBe('active');
  expect(state.calls).toEqual([
    { method: 'rpc', table: 'set_brand_archived', args: { p_brand: 'A', p_archived: true } },
    { method: 'rpc', table: 'set_brand_archived', args: { p_brand: 'A', p_archived: false } },
  ]);
  expect(state.invalidations).toBe(2);
});

test('erros PT409 e 403 preservam motivo, sem fallback nem nova tentativa', async () => {
  const { api, state } = withFakeGateway();
  state.failure = { method: 'rpc', error: new Error('PT409: campanhas em andamento') };
  await expect(api.setArchived('A', true)).rejects.toThrow('PT409: campanhas em andamento');
  expect(state.calls).toHaveLength(1);
  expect(state.calls[0].method).toBe('rpc');
  expect(state.invalidations).toBe(0);

  state.failure = { method: 'insert', error: new Error('HTTP 403: sem permissão') };
  await expect(api.create({ workspaceId: 'W', name: 'Nova marca' })).rejects.toThrow('HTTP 403: sem permissão');
  expect(state.calls.filter((call) => call.method === 'insert')).toHaveLength(1);
  expect(state.calls.filter((call) => call.method === 'update')).toHaveLength(0);
  expect(state.invalidations).toBe(0);
});

test('consulta de marcas filtra arquivadas por padrão e não faz cache', async () => {
  const { api, state } = withFakeGateway();
  state.brands.push(brand('B', { workspace_id: 'W', status: 'archived' }));
  expect((await api.list()).map((b) => b.id)).toEqual(['A']);
  expect((await api.list(true)).map((b) => b.id)).toEqual(['A', 'B']);
  expect(state.calls).toEqual([
    { method: 'select', table: 'brands', params: { status: 'neq.archived', order: 'is_default.desc,created_at.asc' } },
    { method: 'select', table: 'brands', params: { order: 'is_default.desc,created_at.asc' } },
  ]);
  expect(state.invalidations).toBe(0);
});

test('cache invalida uma vez por sucesso de escrita, nunca em falha ou leitura', async () => {
  const { api, state } = withFakeGateway();
  await api.workspaces();
  await api.list();
  expect(state.invalidations).toBe(0);
  const newBrand = await api.create({ workspaceId: 'W', name: 'Nova marca' });
  expect(state.invalidations).toBe(1);
  await api.update(newBrand.id, 'W', { name: 'Outro nome' });
  expect(state.invalidations).toBe(2);
  await api.setArchived(newBrand.id, true);
  expect(state.invalidations).toBe(3);
  state.failure = { method: 'update', error: new Error('HTTP 403') };
  await expect(api.update(newBrand.id, 'W', { name: 'Bloqueado' })).rejects.toThrow('403');
  expect(state.invalidations).toBe(3);
});

test('todas as operações exigem usuário antes de consultar ou escrever', async () => {
  const { api, state } = withFakeGateway();
  state.uid = null;
  await expect(api.list()).rejects.toThrow('Entre novamente para continuar.');
  await expect(api.workspaces()).rejects.toThrow('Entre novamente para continuar.');
  await expect(api.create({ workspaceId: 'W', name: 'Nome' })).rejects.toThrow('Entre novamente para continuar.');
  await expect(api.update('A', 'W', { name: 'Nome' })).rejects.toThrow('Entre novamente para continuar.');
  await expect(api.setArchived('A', true)).rejects.toThrow('Entre novamente para continuar.');
  expect(state.calls).toHaveLength(0);
  expect(state.invalidations).toBe(0);
});
