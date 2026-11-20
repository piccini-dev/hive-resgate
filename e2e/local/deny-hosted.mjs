// Preload somente dos processos de teste locais. O backend real está no loopback.
const original = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
  if (url.hostname === 'api.supabase.com' || url.hostname.endsWith('.supabase.co')) {
    throw new Error('Teste local recusou acesso ao Supabase hospedado.');
  }
  return original(input, init);
};
