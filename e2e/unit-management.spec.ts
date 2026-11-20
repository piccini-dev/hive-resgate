import { test, expect } from '@playwright/test';
import { managementToken, createManagementFetch } from './helpers/management';
import { testTargets, managementUrl } from './helpers/target';

test('Linux usa token do ambiente sem decodificar token cru', () => {
  expect(managementToken({ SUPABASE_ACCESS_TOKEN: 'sbp-exemplo' }, 'linux')).toBe('sbp-exemplo');
});
test('macOS decodifica somente prefixo do keyring', () => {
  expect(managementToken({}, 'darwin', () => 'go-keyring-base64:' + Buffer.from('exemplo').toString('base64'))).toBe('exemplo');
  expect(managementToken({}, 'darwin', () => 'token-cru')).toBe('token-cru');
});
test('Linux sem token não tenta keychain', () => {
  expect(() => managementToken({}, 'linux', () => { throw new Error('não chamar'); })).toThrow('SUPABASE_ACCESS_TOKEN');
});
test('erro do keychain não expõe saída do comando', () => {
  expect(() => managementToken({}, 'darwin', () => { throw new Error('SEGREDO'); })).toThrow('Token administrativo indisponível no keychain.');
});
test('403 impede novas requisições sem trocar token', async () => {
  let calls = 0;
  const client = createManagementFetch(() => 'teste', async () => { calls++; return new Response('', { status: 403 }); });
  await expect(client('https://api.supabase.com/v1/projects/test/database/query')).rejects.toThrow('403');
  await expect(client('https://api.supabase.com/v1/projects/test/api-keys')).rejects.toThrow('bloqueado');
  expect(calls).toBe(1);
});
test('erro do banco chega com o motivo (regras PTxxx/CHECK são conferidas pela mensagem)', async () => {
  const client = createManagementFetch(() => 'teste', async () => new Response('{"message":"ERROR: pacote imutável"}', { status: 400 }));
  await expect(client('https://api.supabase.com/v1/projects/test/database/query')).rejects.toThrow(/HTTP 400: .*imutável/);
});
test('recusa destino externo antes de obter token', async () => {
  const client = createManagementFetch(() => { throw new Error('não obter'); });
  await expect(client('https://example.com')).rejects.toThrow('Destino administrativo inválido');
});

const localEnv = {
  HIVE_E2E_LOCAL: '1', HIVE_E2E_BACKEND_URL: 'http://127.0.0.1:54321',
  HIVE_E2E_MANAGEMENT_URL: 'http://127.0.0.1:54322',
};
test('modo local exige todos os destinos explícitos e não aceita URL de produção', () => {
  expect(() => testTargets({ HIVE_E2E_LOCAL: '1' })).toThrow('HIVE_E2E_BACKEND_URL');
  expect(() => testTargets({ ...localEnv, HIVE_E2E_BACKEND_URL: 'https://example.supabase.co' })).toThrow('127.0.0.1');
  expect(() => testTargets({ ...localEnv, VITE_SUPABASE_URL: 'https://example.supabase.co' })).toThrow('não corresponde');
  expect(() => testTargets({ ...localEnv, SUPABASE_ACCESS_TOKEN: ' sbp_nao_utilizar ' })).toThrow('Token hospedado');
});
test('modo local não usa DNS, credencial na URL, caminho, query, fragmento ou porta implícita', () => {
  for (const url of ['http://localhost:54321', 'http://127.0.0.1', 'http://u:p@127.0.0.1:54321',
    'http://127.0.0.1:54321/rest', 'http://127.0.0.1:54321/?host=outro', 'http://127.0.0.1:54321/#outro']) {
    expect(() => testTargets({ ...localEnv, HIVE_E2E_BACKEND_URL: url })).toThrow();
  }
  expect(() => testTargets({ ...localEnv, HIVE_E2E_LOCAL: 'true' })).toThrow('0 ou 1');
});
test('modo local forma Management URL com projeto local e mantém destinos separados', () => {
  expect(testTargets(localEnv)).toEqual({ local: true, backend: 'http://127.0.0.1:54321', management: 'http://127.0.0.1:54322', project: 'hive-local' });
  expect(managementUrl('/database/query', localEnv)).toBe('http://127.0.0.1:54322/v1/projects/hive-local/database/query');
  expect(() => managementUrl('//outro', localEnv)).toThrow('Recurso');
  expect(() => managementUrl('/../outro', localEnv)).toThrow('Recurso');
});
test('modo local recusa Management de produção e outra porta antes de obter token ou chamar rede', async () => {
  let credentials = 0, requests = 0;
  const client = createManagementFetch(() => { credentials++; return 'local-only'; }, async () => {
    requests++; return new Response('[]');
  }, localEnv);
  await expect(client('https://api.supabase.com/v1/projects/test/database/query')).rejects.toThrow('Destino');
  await expect(client('http://127.0.0.1:60000/v1/projects/hive-local/database/query')).rejects.toThrow('Destino');
  await expect(client('http://127.0.0.1:54322/v1/projects/outro/database/query')).rejects.toThrow('Destino');
  expect(credentials).toBe(0); expect(requests).toBe(0);
  await client(managementUrl('/database/query', localEnv));
  expect(credentials).toBe(1); expect(requests).toBe(1);
});
