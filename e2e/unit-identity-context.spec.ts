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
