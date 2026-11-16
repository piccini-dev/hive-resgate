import { test, expect } from '@playwright/test';
import {
  MetaApiError,
  findPageForInstagram,
  graphDelete,
  graphGet,
  graphPost,
  metaErrorPt,
  searchInterests,
  searchLocations,
} from '../supabase/functions/_shared/meta-marketing';

const originalFetch = globalThis.fetch;
test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test.describe('unit · Meta Marketing', () => {
  test('erro 190: pede reconexão do Facebook', () => {
    expect(metaErrorPt({ code: 190 })).toBe('A conexão com o Facebook expirou. Reconecte em Configurações › Contas.');
  });

  test('erros 200, 10 e pages_manage_ads: falta permissão', () => {
    const message = 'Falta permissão de anúncios na conexão com o Facebook. Reconecte em Configurações › Contas.';
    expect(metaErrorPt({ code: 200 })).toBe(message);
    expect(metaErrorPt({ code: 10 })).toBe(message);
    expect(metaErrorPt({ message: '(#200) Requires pages_manage_ads permission' })).toBe(message);
  });

  test('erro 17: limite temporário de chamadas da Meta', () => {
    expect(metaErrorPt({ code: 17 })).toBe('A Meta limitou as chamadas por agora. Tente de novo em alguns minutos.');
  });

  test('erro com mensagem para o usuário: prioriza error_user_msg', () => {
    expect(metaErrorPt({ code: 100, message: 'Invalid parameter', error_user_msg: 'Orçamento muito baixo' }))
      .toBe('A Meta recusou: Orçamento muito baixo');
  });

  test('erro sem mensagem para o usuário: usa message', () => {
    expect(metaErrorPt({ code: 100, message: 'Invalid parameter' })).toBe('A Meta recusou: Invalid parameter');
  });

  test('graphPost: envia formulário, serializa arrays e omite undefined', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ id: 'c1' }), { status: 200 });
    };

    const result = await graphPost<{ id: string }>(
      'act_1/campaigns',
      { name: 'X', special_ad_categories: [], skip: undefined, n: 3050 },
      'tok',
    );

    expect(result).toEqual({ id: 'c1' });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://graph.facebook.com/v26.0/act_1/campaigns');
    expect(calls[0].init?.method).toBe('POST');
    expect(calls[0].init?.body).toBeInstanceOf(URLSearchParams);
    const body = calls[0].init?.body as URLSearchParams;
    expect(body.get('name')).toBe('X');
    expect(body.get('special_ad_categories')).toBe('[]');
    expect(body.toString()).toContain('special_ad_categories=%5B%5D');
    expect(body.get('n')).toBe('3050');
    expect(body.get('access_token')).toBe('tok');
    expect(body.has('skip')).toBe(false);
  });

  test('graphGet: HTTP 400 com erro 190 lança MetaApiError com err preservado', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ error: { code: 190, message: 'expired' } }), { status: 400 });
    };

    const errors: unknown[] = [];
    try {
      await graphGet('search', { type: 'adinterest', q: 'liderança' }, 'tok');
    } catch (error) {
      errors.push(error);
    }

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(MetaApiError);
    const error = errors[0] as MetaApiError;
    expect(error.message).toBe('A conexão com o Facebook expirou. Reconecte em Configurações › Contas.');
    expect(error.err.code).toBe(190);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain('type=adinterest');
    expect(calls[0].url).toContain('q=lideran%C3%A7a');
    expect(calls[0].url).toContain('access_token=tok');
    expect(calls[0].init).toBeUndefined();
  });

  test('findPageForInstagram: encontra a Página vinculada ao Instagram', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ data: [
        { id: 'p1', name: 'A', instagram_business_account: { id: 'ig1' } },
        { id: 'p2', name: 'B', instagram_business_account: { id: 'ig2' } },
      ] }), { status: 200 });
    };

    expect(await findPageForInstagram('ig2', 'tok')).toEqual({ id: 'p2', name: 'B' });
    expect(calls).toHaveLength(1);
    const params = new URL(calls[0].url).searchParams;
    expect(new URL(calls[0].url).pathname).toBe('/v26.0/me/accounts');
    expect(params.get('fields')).toBe('id,name,instagram_business_account');
    expect(params.get('limit')).toBe('100');
    expect(params.get('access_token')).toBe('tok');
    expect(calls[0].init).toBeUndefined();
  });

  test('findPageForInstagram: retorna null quando a Página não existe', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ data: [
        { id: 'p1', name: 'A', instagram_business_account: { id: 'ig1' } },
        { id: 'p2', name: 'B', instagram_business_account: { id: 'ig2' } },
      ] }), { status: 200 });
    };

    expect(await findPageForInstagram('ig9', 'tok')).toBeNull();
    expect(calls).toHaveLength(1);
  });

  test('searchLocations: consulta adgeolocation e devolve apenas os campos do contrato', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ data: [
        { key: '2420605', name: 'São Paulo', type: 'city', country_code: 'BR', region: 'São Paulo', latitude: -23.55, extra: 'ignorar' },
      ] }), { status: 200 });
    };

    const result = await searchLocations('São Paulo', 'tok');

    expect(result).toEqual([{ key: '2420605', name: 'São Paulo', type: 'city', country_code: 'BR', region: 'São Paulo' }]);
    expect(Object.keys(result[0])).toEqual(['key', 'name', 'type', 'country_code', 'region']);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain('type=adgeolocation');
    expect(calls[0].url).toContain('location_types=%5B%22country%22%2C%22region%22%2C%22city%22%5D');
    const params = new URL(calls[0].url).searchParams;
    expect(params.get('q')).toBe('São Paulo');
    expect(params.get('limit')).toBe('10');
    expect(params.get('access_token')).toBe('tok');
    expect(calls[0].init).toBeUndefined();
  });

  test('graphDelete: usa DELETE com token na URL', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    };

    await expect(graphDelete('123', 'tok')).resolves.toBeUndefined();
    expect(calls).toEqual([{ url: 'https://graph.facebook.com/v26.0/123?access_token=tok', init: { method: 'DELETE' } }]);
  });

  test('erro de rede não carrega o token da URL', async () => {
    globalThis.fetch = async (url) => { throw new TypeError(`error sending request for url (${String(url)}): connection reset`); };
    const err = await graphGet('search', { q: 'x' }, 'segredo123').catch((e: Error) => e);
    expect(String(err)).toContain('access_token=***');
    expect(String(err)).not.toContain('segredo123');
    expect(String(await graphDelete('1', 'segredo123').catch((e: Error) => e))).not.toContain('segredo123');
  });

  test('searchInterests: consulta adinterest e retorna os campos de interesse', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ data: [
        { id: '100', name: 'Liderança', audience_size_lower_bound: 1000, audience_size_upper_bound: 5000, path: ['Negócios'], extra: 'ignorar' },
      ] }), { status: 200 });
    };

    const result = await searchInterests('liderança', 'tok');

    expect(result).toEqual([{ id: '100', name: 'Liderança', audience_size_lower_bound: 1000, audience_size_upper_bound: 5000, path: ['Negócios'] }]);
    expect(calls).toHaveLength(1);
    const params = new URL(calls[0].url).searchParams;
    expect(params.get('type')).toBe('adinterest');
    expect(params.get('q')).toBe('liderança');
    expect(params.get('limit')).toBe('10');
    expect(params.get('access_token')).toBe('tok');
    expect(calls[0].init).toBeUndefined();
  });
});
