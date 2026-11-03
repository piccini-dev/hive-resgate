import { test, expect } from '@playwright/test';
import { cleanupE2EData, seed, sql } from './helpers/admin';
import { managementFetch } from './helpers/management';
import { mockEdge } from './helpers/mocks';
import { loadEnv } from './helpers/env';

// F27 — Olhar Bee · E2 (docs/olhar-bee/): a bancada de calibração roda o agente,
// mostra a resposta como o visitante veria e grava o veredito. IA sempre mockada;
// os testes de serviço chamam a função real só nos caminhos que não usam IA.

const BEE = '0b000000-0000-4000-8000-000000000002';
const REF = 'djlorvdehedcupeykyes';
let _svc: string | null = null;
async function chamarComoServico(body: unknown, semLogin = false): Promise<{ status: number; json: Record<string, unknown> }> {
  loadEnv();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (semLogin) headers.apikey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
  else {
    if (!_svc) {
      const keys = await managementFetch(`https://api.supabase.com/v1/projects/${REF}/api-keys?reveal=true`, {}).then((r) => r.json()) as Array<{ type: string; api_key: string }>;
      _svc = keys.find((k) => k.type === 'secret')?.api_key ?? null;
    }
    Object.assign(headers, { apikey: _svc!, Authorization: `Bearer ${_svc}`, 'x-bee-user-id': process.env.E2E_USER_ID! });
  }
  const r = await fetch(`https://${REF}.supabase.co/functions/v1/olhar-bee`, { method: 'POST', headers, body: JSON.stringify(body) });
  return { status: r.status, json: await r.json().catch(() => ({})) };
}

const LEITURA = {
  success: true, session_id: '00000000-0000-4000-8000-0000000000aa', type: 'reading',
  reading: {
    parece: { text: 'Há esforço contínuo para mudar comportamentos.' },
    invisivel: { text: 'Pode haver uma distância entre o que se ensina e o que o dia a dia recompensa.' },
    movimento: { text: 'Olhar para a semana seguinte ao treinamento.' },
    semelhantes: [{ area: 'Cultura', title: 'Novos comportamentos que não apareciam apesar dos investimentos em desenvolvimento.', text: '', href: null }],
    area_provavel: 'cultura', disclaimer: 'Uma primeira leitura, feita por IA a partir do que você contou.',
  },
  bancada: { motivo: 'Relato com padrão claro.', modelo: 'gemini-3.5-flash', barrado: false },
};

test.describe('F27 · Olhar Bee · bancada de calibração', () => {
  test.beforeEach(async () => { await cleanupE2EData(); });
  test.afterAll(async () => { await cleanupE2EData(); });

  test('roda um caso, mostra os 3 blocos e os cards, e aprova (olhar E2)', async ({ page }) => {
    const calls: Array<Record<string, unknown>> = [];
    await mockEdge(page, 'olhar-bee', (b) => (b.action === 'calibrate' ? { success: true, id: 'x' } : LEITURA), calls);
    await page.goto('/olhar/calibracao');
    await expect(page.getByTestId('calibracao-progresso')).toContainText(/\d+ de 14 casos aprovados/);
    await page.getByTestId('caso-C01').click();
    await page.getByTestId('olhar-rodar').click();
    const res = page.getByTestId('olhar-resultado');
    await expect(res).toHaveAttribute('data-tipo', 'reading');
    await expect(res).toContainText('O que talvez não esteja visível');
    await expect(res).toContainText('Pode haver uma distância');
    await expect(page.getByTestId('olhar-semelhantes')).toContainText('Novos comportamentos');
    expect(calls[0]).toMatchObject({ action: 'start', caso_codigo: 'C01' });
    expect(String(calls[0].desafio)).toContain('treinamentos de cultura');

    // "Ajustar" sem comentário não envia nada; "Aprovar" envia o veredito da conversa.
    await page.getByRole('button', { name: 'Ajustar', exact: true }).click();
    await expect(page.getByText('Diga no comentário o que ajustar.')).toBeVisible();
    expect(calls.filter((c) => c.action === 'calibrate')).toHaveLength(0);
    await page.getByRole('button', { name: 'Aprovar', exact: true }).click();
    await expect(page.getByTestId('olhar-veredito-salvo')).toContainText('Aprovada.');
    expect(calls.at(-1)).toMatchObject({ action: 'calibrate', session_id: LEITURA.session_id, veredito: 'aprovada' });
  });

  test('relato vago: pergunta primeiro, e "Pular" pede a leitura sem respostas (olhar E2)', async ({ page }) => {
    const calls: Array<Record<string, unknown>> = [];
    await mockEdge(page, 'olhar-bee', (b) => (b.action === 'start'
      ? { success: true, session_id: LEITURA.session_id, type: 'questions', can_skip: true, questions: [{ id: 'q1', text: 'Onde a bagunça aparece mais?' }] }
      : LEITURA), calls);
    await page.goto('/olhar/calibracao');
    await page.getByTestId('caso-C07').click();
    await page.getByTestId('olhar-rodar').click();
    await expect(page.getByTestId('olhar-resultado')).toHaveAttribute('data-tipo', 'questions');
    await expect(page.getByText('Onde a bagunça aparece mais?')).toBeVisible();
    await page.getByRole('button', { name: 'Pular e ver a leitura' }).click();
    await expect(page.getByTestId('olhar-resultado')).toHaveAttribute('data-tipo', 'reading');
    expect(calls.at(-1)).toMatchObject({ action: 'answer', session_id: LEITURA.session_id, skipped: true });
  });

  test('veredito real: grava no banco, exige comentário para ajustar e aparece na bancada (olhar E2)', async ({ page }) => {
    const sid = await seed('olhar_sessions', { brand_id: BEE, origem: 'teste', caso_codigo: 'C03', desafio: 'Planejamento que ninguém lembra.', tipo: 'reading' });
    const semComentario = await chamarComoServico({ action: 'calibrate', session_id: sid, veredito: 'ajustar' });
    expect(semComentario.status).toBe(400);
    expect(semComentario.json).toMatchObject({ success: false, code: 'invalid' });

    const ok = await chamarComoServico({ action: 'calibrate', session_id: sid, veredito: 'ajustar', comentario: '[teste E2E] menos abstração no movimento' });
    expect(ok.status).toBe(200);
    const rows = await sql<{ veredito: string; caso_codigo: string; ativo: boolean }>(`select veredito, caso_codigo, ativo from olhar_calibracao where session_id='${sid}'`);
    expect(rows).toEqual([{ veredito: 'ajustar', caso_codigo: 'C03', ativo: true }]);

    await page.goto('/olhar/calibracao');
    await expect(page.getByTestId('caso-C03')).toContainText('Ajustar');
    await expect(page.getByTestId('olhar-ajustes')).toContainText('[teste E2E] menos abstração no movimento');
  });

  test('fechado ao público e sem relatório/contato ainda (olhar E2)', async () => {
    const publico = await chamarComoServico({ action: 'start', desafio: 'Um desafio qualquer da empresa.' }, true);
    expect(publico.status).toBe(403);
    expect(publico.json).toMatchObject({ success: false, code: 'disabled' });
    const rel = await chamarComoServico({ action: 'report', session_id: null });
    expect(rel.json).toMatchObject({ success: false, code: 'disabled' });
    const sid = await chamarComoServico({ action: 'answer', session_id: 'nao-e-uuid' });
    expect(sid.json).toMatchObject({ success: false, code: 'not_found' });
  });
});
