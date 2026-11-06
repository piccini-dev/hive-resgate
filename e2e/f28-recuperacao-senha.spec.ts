import { test, expect, type Page } from '@playwright/test';

// F28 (06/11/2026): senha escolhida pelo próprio usuário. Todas as chamadas de Auth
// são simuladas; nenhum email é enviado e nenhuma senha/conta real é alterada.
test.use({ storageState: { cookies: [], origins: [] } });

const authUrl = process.env.VITE_SUPABASE_URL!;
const storageKey = `sb-${new URL(authUrl).hostname.split('.')[0]}-auth-token`;
const user = { id: '00000000-0000-4000-8000-000000000028', email: 'senha@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-11-06T00:00:00Z' };
const accessToken = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600, aud: 'authenticated', role: 'authenticated' })).toString('base64url')}.assinatura-falsa`;
const session = { user, access_token: accessToken, refresh_token: 'refresh-falso-f28', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer' };

async function mockAuth(page: Page, options: { tokenError?: boolean; updateError?: boolean; recoverError?: boolean; changedAccount?: boolean } = {}) {
  const calls = { recover: [] as Record<string, unknown>[], token: [] as Record<string, unknown>[], update: [] as Record<string, unknown>[], redirectTo: '', user: 0, data: 0 };
  await page.route(`${authUrl}/rest/v1/**`, async (route) => { calls.data++; await route.abort(); });
  await page.route(`${authUrl}/auth/v1/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const fulfill = (status: number, body: unknown) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname.endsWith('/recover')) {
      calls.recover.push(req.postDataJSON());
      calls.redirectTo = url.searchParams.get('redirect_to') ?? '';
      return fulfill(options.recoverError ? 500 : 200, options.recoverError ? { message: 'mailer unavailable' } : {});
    }
    if (url.pathname.endsWith('/token')) {
      calls.token.push(req.postDataJSON());
      return fulfill(options.tokenError ? 400 : 200, options.tokenError ? { error: 'invalid_grant', error_description: 'Code expired' } : session);
    }
    if (url.pathname.endsWith('/user') && req.method() === 'GET') {
      calls.user++;
      return fulfill(200, options.changedAccount && calls.user > 1 ? { ...user, id: '00000000-0000-4000-8000-000000000029' } : user);
    }
    if (url.pathname.endsWith('/user') && req.method() === 'PUT') {
      calls.update.push(req.postDataJSON());
      return fulfill(options.updateError ? 422 : 200, options.updateError ? { msg: 'Password too weak' } : user);
    }
    throw new Error(`F28: chamada inesperada de Auth: ${req.method()} ${url.pathname}`);
  });
  return calls;
}

async function seedSession(page: Page) {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: storageKey, value: session });
}

async function seedVerifier(page: Page) {
  await page.addInitScript((key) => localStorage.setItem(`${key}-code-verifier`, JSON.stringify('verificador-falso/recovery')), storageKey);
}

test.describe('F28 · recuperação e alteração de senha', () => {
  test('login oferece recuperação e solicita email com destino no mesmo site (F28/01)', async ({ page, baseURL }) => {
    const calls = await mockAuth(page);
    await page.goto('/login');
    await page.getByRole('link', { name: 'Esqueci minha senha' }).click();
    await page.getByLabel('Email', { exact: true }).fill('senha@example.test');
    await page.getByRole('button', { name: 'Enviar link de recuperação' }).click();
    await expect(page.getByRole('status')).toContainText('Se este email estiver cadastrado');
    expect(calls.recover).toHaveLength(1);
    expect(calls.recover[0]).toMatchObject({ email: user.email, code_challenge_method: 's256' });
    expect(calls.redirectTo).toBe(`${baseURL}/alterar-senha`);
    expect(calls.data).toBe(0);
  });

  test('falha de envio não afirma que o email foi enviado (F28/02)', async ({ page }) => {
    await mockAuth(page, { recoverError: true });
    await page.goto('/recuperar-senha');
    await page.getByLabel('Email', { exact: true }).fill(user.email);
    await page.getByRole('button', { name: 'Enviar link de recuperação' }).click();
    await expect(page.getByRole('alert')).toContainText('Não foi possível enviar o link');
    await expect(page.getByRole('button', { name: 'Enviar link de recuperação' })).toBeEnabled();
  });

  test('sem sessão não oferece troca de senha e permite pedir novo link (F28/03)', async ({ page }) => {
    const calls = await mockAuth(page);
    await page.goto('/alterar-senha');
    await expect(page.getByRole('alert')).toContainText('Entre na sua conta');
    await expect(page.getByLabel('Nova senha', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Solicitar novo link' })).toBeVisible();
    expect(calls.update).toHaveLength(0);
    expect(calls.data).toBe(0);
  });

  test('sessão existente valida confirmação e só mostra sucesso após gravar (F28/04)', async ({ page }) => {
    const calls = await mockAuth(page);
    await seedSession(page);
    await page.goto('/alterar-senha');
    await expect(page.getByText(`Conta: ${user.email}`)).toBeVisible();
    await page.getByLabel('Nova senha', { exact: true }).fill('Senha-falsa-f28!');
    await page.getByLabel('Confirmar nova senha').fill('Outra-senha-f28!');
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();
    await expect(page.getByRole('alert')).toContainText('As senhas precisam ser iguais');
    expect(calls.update).toHaveLength(0);
    await page.getByLabel('Confirmar nova senha').fill('Senha-falsa-f28!');
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();
    await expect(page.getByRole('status')).toHaveText('Sua senha foi alterada.');
    expect(calls.update).toHaveLength(1);
    expect(calls.update[0]).toMatchObject({ password: 'Senha-falsa-f28!' });
    expect(calls.data).toBe(0);
  });

  test('recuperação PKCE troca código uma vez e remove credencial da URL (F28/05)', async ({ page }) => {
    const calls = await mockAuth(page);
    await seedVerifier(page);
    await page.goto('/alterar-senha?code=codigo-falso-f28');
    await expect(page.getByLabel('Nova senha', { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/alterar-senha$/);
    expect(calls.token).toEqual([{ auth_code: 'codigo-falso-f28', code_verifier: 'verificador-falso' }]);
    expect(calls.user).toBe(1);
    expect(calls.data).toBe(0);
  });

  test('código inválido não permite trocar senha, mesmo com sessão anterior (F28/06)', async ({ page }) => {
    const calls = await mockAuth(page, { tokenError: true });
    await seedSession(page);
    await seedVerifier(page);
    await page.goto('/alterar-senha?code=codigo-expirado');
    await expect(page.getByRole('alert')).toContainText('expirou');
    await expect(page.getByLabel('Nova senha', { exact: true })).toHaveCount(0);
    await expect(page).toHaveURL(/\/alterar-senha$/);
    expect(calls.update).toHaveLength(0);
    expect(calls.data).toBe(0);
  });

  test('link administrativo de recuperação abre o formulário e remove tokens da URL (F28/07)', async ({ page }) => {
    const calls = await mockAuth(page);
    await page.goto(`/alterar-senha#access_token=${accessToken}&refresh_token=refresh-falso-f28&type=recovery`);
    await expect(page.getByLabel('Nova senha', { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/alterar-senha$/);
    expect(calls.data).toBe(0);
  });

  test('recusa de senha no servidor mantém formulário sem sucesso falso (F28/08)', async ({ page }) => {
    await mockAuth(page, { updateError: true });
    await seedSession(page);
    await page.goto('/alterar-senha');
    await page.getByLabel('Nova senha', { exact: true }).fill('Senha-falsa-f28!');
    await page.getByLabel('Confirmar nova senha').fill('Senha-falsa-f28!');
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();
    await expect(page.getByRole('alert')).toContainText('Não foi possível alterar a senha');
    await expect(page.getByText('Sua senha foi alterada.', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Salvar nova senha' })).toBeEnabled();
  });

  test('token de outro fluxo não é aceito como recuperação (F28/09)', async ({ page }) => {
    const calls = await mockAuth(page);
    await seedSession(page);
    await page.goto(`/alterar-senha#access_token=${accessToken}&refresh_token=refresh-falso-f28&type=signup`);
    await expect(page.getByRole('alert')).toContainText('expirou');
    await expect(page.getByLabel('Nova senha', { exact: true })).toHaveCount(0);
    await expect(page).toHaveURL(/\/alterar-senha$/);
    expect(calls.update).toHaveLength(0);
  });

  test('troca de conta em outra aba impede salvar senha na conta inesperada (F28/10)', async ({ page }) => {
    const calls = await mockAuth(page, { changedAccount: true });
    await seedSession(page);
    await page.goto('/alterar-senha');
    await page.getByLabel('Nova senha', { exact: true }).fill('Senha-falsa-f28!');
    await page.getByLabel('Confirmar nova senha').fill('Senha-falsa-f28!');
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();
    await expect(page.getByRole('alert')).toContainText('Entre na sua conta');
    expect(calls.update).toHaveLength(0);
  });
});
