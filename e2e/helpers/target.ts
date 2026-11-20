// Destinos explícitos do E2E. Em modo local, nenhum endereço hospedado é aceito.
// Módulo puro: não lê arquivos, não obtém credenciais e não faz requisições.
export interface TestTargets {
  local: boolean;
  backend: string;
  management: string;
  project: string;
}
export type TargetEnv = Record<string, string | undefined>;
const PROJECT = 'djlorvdehedcupeykyes';

function loopback(value: string | undefined, name: string): URL {
  if (!value) throw new Error(`Falta ${name} para o teste local.`);
  let url: URL;
  try { url = new URL(value); } catch { throw new Error(`${name} inválida.`); }
  // IP literal evita DNS/rebinding; sem credencial embutida, query ou fragmento.
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port
    || url.username || url.password || url.search || url.hash) {
    throw new Error(`${name} deve usar somente http://127.0.0.1 com porta explícita.`);
  }
  return url;
}

export function testTargets(env: TargetEnv = process.env): TestTargets {
  if (env.HIVE_E2E_LOCAL !== undefined && !['0', '1'].includes(env.HIVE_E2E_LOCAL)) {
    throw new Error('HIVE_E2E_LOCAL deve ser 0 ou 1.');
  }
  if (env.HIVE_E2E_LOCAL !== '1') return {
    local: false, backend: env.VITE_SUPABASE_URL ?? `https://${PROJECT}.supabase.co`,
    management: 'https://api.supabase.com', project: PROJECT,
  };
  const backend = loopback(env.HIVE_E2E_BACKEND_URL, 'HIVE_E2E_BACKEND_URL');
  const management = loopback(env.HIVE_E2E_MANAGEMENT_URL, 'HIVE_E2E_MANAGEMENT_URL');
  if (backend.pathname !== '/' || management.pathname !== '/') throw new Error('Destinos locais não podem ter caminho.');
  if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_URL.replace(/\/$/, '') !== backend.origin) {
    throw new Error('VITE_SUPABASE_URL não corresponde ao backend local.');
  }
  if (env.SUPABASE_ACCESS_TOKEN?.trim().startsWith('sbp_')) throw new Error('Token hospedado não pode ser usado no teste local.');
  return { local: true, backend: backend.origin, management: management.origin, project: 'hive-local' };
}

export function managementUrl(resource: string, env: TargetEnv = process.env): string {
  if (!resource.startsWith('/') || resource.startsWith('//') || resource.includes('..')) {
    throw new Error('Recurso administrativo inválido.');
  }
  const target = testTargets(env);
  return `${target.management}/v1/projects/${target.project}${resource}`;
}

export function assertManagementTarget(value: string, env: TargetEnv = process.env): void {
  const target = testTargets(env);
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('Destino administrativo inválido.'); }
  const base = `/v1/projects/${target.local ? target.project + '/' : ''}`;
  if (url.origin !== target.management || !url.pathname.startsWith(base) || url.username || url.password) {
    throw new Error('Destino administrativo inválido.');
  }
}
