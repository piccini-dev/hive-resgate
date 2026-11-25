import { test, expect, type Page } from '@playwright/test';
import { cleanupE2EData, cleanupE2EStorage, lit, seed, sql } from './helpers/admin';
import { seedAccounts, seedCampaign, seedValidatedContents } from './helpers/fixtures';
import { e2eUser } from './helpers/env';
import { loginAs } from './helpers/tenant';
import { mockEdge } from './helpers/mocks';

// Estoque vivo (docs/plano/CONTRATO-ESTOQUE.md): descobertas da Biblioteca viram material dos
// conteúdos-mãe; a produção do acervo escolhe mães e material, reserva o escolhido e recusa o já usado.
const BEE = '0b000000-0000-4000-8000-000000000002';
const DOC_TITLE = 'E2E F35 · Documento de liderança';

// Helpers locais: e2e/helpers está sendo alterado por outra frente.
// knowledge_documents não está em E2E_OWNED_TABLES; o spec apaga só os documentos dele.
async function cleanupDocs() {
  await sql(`delete from public.knowledge_documents where user_id=${lit(e2eUser().id)} and title like 'E2E F35%'`);
}
async function seedDoc(): Promise<string> {
  return seed('knowledge_documents', { title: DOC_TITLE, brand_id: BEE, chunk_count: 24 });
}
type DiscoverySeed = { title: string; kind: string; tags: string[]; content_id?: string; status?: 'active' | 'drafted'; chunk?: number };
// Mesmo formato que a varredura grava (sources com o documento e o trecho). tags é text[]: seed() só sabe jsonb.
async function seedDiscovery(doc: string, d: DiscoverySeed): Promise<string> {
  const sources = [{ document_id: doc, chunk_id: null, chunk_index: d.chunk ?? 0, title: DOC_TITLE }];
  const [r] = await sql<{ id: string }>(`insert into public.knowledge_discoveries
      (user_id, brand_id, document_id, title, summary, excerpt, kind, tags, sources, status, content_id)
    values (${lit(e2eUser().id)}, ${lit(BEE)}, ${lit(doc)}, ${lit(d.title)}, ${lit(`Resumo: ${d.title}.`)}, ${lit(`Trecho literal sobre ${d.title.toLowerCase()}.`)},
      ${lit(d.kind)}, array[${d.tags.map(lit).join(',')}]::text[], ${lit(JSON.stringify(sources))}::jsonb, ${lit(d.status ?? 'active')}, ${lit(d.content_id ?? null)})
    returning id`);
  return r.id;
}
// Conteúdos-mãe validados de verdade (versão em content_base_versions), numa campanha de origem.
async function seedMothers(titles: string[]) {
  const accounts = await seedAccounts();
  const source = await seedCampaign({ weeks: 1, accountIds: [accounts.instagram] });
  const bases = await seedValidatedContents(source.id, source.cycleIds[0], titles.map((title) => ({ title, channels: [] })));
  const user = e2eUser(), client = await loginAs(user.email, user.password, user.id);
  const mothers: Array<{ id: string; version: string }> = [];
  for (const b of bases) {
    const [c] = await sql<{ body: object }>(`select body from contents where id='${b.contentId}'`);
    const r = await client.rpc<{ version: { id: string } }>('validate_content_base', { p_content: b.contentId, p_cycle: source.cycleIds[0], p_expected_body: c.body });
    expect(r.status).toBe(200);
    mothers.push({ id: b.contentId, version: r.data.version.id });
  }
  return { accounts, source, mothers };
}
// Peça já produzida em outra campanha com este material: a view passa a marcá-lo como 'usada'.
async function seedProducedPlan(contentId: string, campaignId: string, cycleId: string, discoveryIds: string[]) {
  await sql(`insert into public.content_piece_plans (user_id, content_id, campaign_id, cycle_id, platform, format, origin, status, position, discovery_ids)
    values (${lit(e2eUser().id)}, ${lit(contentId)}, ${lit(campaignId)}, ${lit(cycleId)}, 'instagram', 'image', 'hive', 'produced', 0,
      array[${discoveryIds.map(lit).join(',')}]::uuid[])`);
}
// Campanha do acervo (sem bases escolhidas) e um mãe com dois materiais livres.
async function stockSetup() {
  const f = await seedMothers(['E2E Mãe com estoque']);
  const mother = f.mothers[0];
  const doc = await seedDoc();
  const d1 = await seedDiscovery(doc, { title: 'Reunião que terminou sem decisão', kind: 'caso', tags: ['decisao'], content_id: mother.id, chunk: 0 });
  const d2 = await seedDiscovery(doc, { title: 'Autonomia pede contexto', kind: 'conceito', tags: ['autonomia'], content_id: mother.id, chunk: 1 });
  const target = await seedCampaign({ weeks: 1, name: 'Campanha do estoque', accountIds: [f.accounts.instagram] });
  await sql(`update campaigns set metadata='{"content_source":"archive"}' where id='${target.id}'`);
  return { ...f, mother, doc, d1, d2, target, cycle: target.cycleIds[0] };
}
// sequence-script no formato do fluxo do estoque. A geração da peça ('image') falha de propósito:
// o plano continua 'planned' (material reservado) e o teste não depende de render real.
async function mockStockScript(page: Page, item: { content_id: string; discovery_ids: string[]; version_id: string }, calls: Array<Record<string, unknown>> = []) {
  await mockEdge(page, 'sequence-script', (b) => {
    if (b.action === 'production_context') return { success: true, snapshot_id: null, profile_id: null };
    if (b.action === 'recommend_cycle_plan') return {
      success: true, summary: 'Uma peça a partir do material novo do estoque.',
      items: [{ ...item, platform: 'instagram', format: 'image', approach: 'Transformar o material em princípio', purpose: 'Abrir a conversa sobre decisões no time.', template_family: 'M01', editorial_slug: 'diagnostico-sistemico', architecture: null }],
    };
    return { success: true };
  }, calls);
  // Registrada depois do mockEdge, roda antes dele; o resto segue para o mock.
  await page.route('**/functions/v1/sequence-script', (route) => {
    const req = route.request();
    if (req.method() === 'POST' && (req.postDataJSON() as { action?: string } | null)?.action === 'image') {
      return route.fulfill({ status: 503, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Produção pausada pelo teste.' }) });
    }
    return route.fallback();
  });
  return calls;
}

test.describe('F35 · estoque vivo', () => {
  test.beforeEach(async () => { await cleanupE2EData(); await cleanupDocs(); });
  test.afterAll(async () => { await cleanupE2EData(); await cleanupDocs(); await cleanupE2EStorage(); });

  test('Biblioteca › Ver descobertas lista tipo, tags e origem; filtra soltas, descarta e varre agora', async ({ page }) => {
    const doc = await seedDoc();
    const mother = await seed('contents', { title: 'E2E Mãe ligada', status: 'validated', validation_format: 'knowledge_base', body: { frase: 'Frase da mãe.', texto: 'Texto da mãe.' }, metadata: { purpose: 'knowledge_base' } });
    await seedDiscovery(doc, { title: 'Reunião que terminou sem decisão', kind: 'caso', tags: ['lideranca', 'conflito'], content_id: mother, chunk: 2 });
    const loose = await seedDiscovery(doc, { title: 'Pergunta que o time evita', kind: 'pergunta', tags: ['decisao'], chunk: 4 });
    await seedDiscovery(doc, { title: 'Rotatividade no primeiro ano', kind: 'dado', tags: ['pessoas'], chunk: 5 });
    const scans = [] as Array<Record<string, unknown>>;
    await mockEdge(page, 'library-scan', () => ({ success: true, processed: 12, found: 2, linked: 1, proposed: 0 }), scans);
    page.on('dialog', (d) => void d.accept());

    await page.goto('/biblioteca');
    await page.getByRole('link', { name: 'Ver descobertas', exact: true }).click();
    await expect(page).toHaveURL(/\/biblioteca\/descobertas$/);
    const cards = page.getByTestId('discovery-card');
    await expect(cards).toHaveCount(3);
    const linked = cards.filter({ hasText: 'Reunião que terminou sem decisão' });
    await expect(linked).toContainText('Caso');
    await expect(linked).toContainText('lideranca');
    await expect(linked).toContainText('conflito');
    await expect(linked).toContainText('Trecho literal sobre reunião que terminou sem decisão.');
    await expect(linked).toContainText(`De “${DOC_TITLE}” · trecho 3`);
    await expect(linked).toContainText('ligada a E2E Mãe ligada');
    await expect(cards.filter({ hasText: 'Pergunta que o time evita' })).toContainText('solta, ainda sem conteúdo-mãe');

    const onlyLoose = page.getByRole('checkbox', { name: 'Só soltas (sem conteúdo-mãe)' });
    await onlyLoose.check();
    await expect(cards).toHaveCount(2);
    await expect(cards.filter({ hasText: 'Reunião que terminou sem decisão' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Descartar "Pergunta que o time evita"', exact: true }).click();
    await expect(page.getByText('Descoberta descartada.', { exact: true })).toBeVisible();
    await expect(cards).toHaveCount(1);
    await expect.poll(async () => (await sql<{ status: string }>(`select status from knowledge_discoveries where id='${loose}'`))[0].status).toBe('dismissed');
    await onlyLoose.uncheck();
    await expect(cards).toHaveCount(2);

    await page.locator('summary', { hasText: 'varrer agora' }).click();
    await page.getByRole('button', { name: `Varrer agora o documento ${DOC_TITLE}`, exact: true }).click();
    await expect(page.getByText('Li 12 trechos e encontrei 2 descobertas, 1 já ligadas a conteúdos-mãe.', { exact: true })).toBeVisible();
    expect(scans).toEqual([{ action: 'scan', document_id: doc }]);
  });

  test('conteúdos-mãe mostram o estoque; validar propostas da Hive em lote devolve o material', async ({ page }) => {
    const f = await seedMothers(['E2E Mãe com material', 'E2E Mãe esgotada']);
    const [alive, empty] = f.mothers;
    const doc = await seedDoc();
    await seedDiscovery(doc, { title: 'Pergunta sobre metas', kind: 'pergunta', tags: ['metas'], content_id: alive.id, chunk: 0 });
    await seedDiscovery(doc, { title: 'Dado sobre rotatividade', kind: 'dado', tags: ['pessoas'], content_id: alive.id, chunk: 1 });
    const used = await seedDiscovery(doc, { title: 'História já contada', kind: 'historia', tags: ['historia'], content_id: empty.id, chunk: 2 });
    await seedProducedPlan(empty.id, f.source.id, f.source.cycleIds[0], [used]);
    // Proposta como a library-scan grava (propose_mothers): fora de campanha, aguardando validação.
    const proposal = await seed('contents', {
      title: 'E2E Proposta da Hive', status: 'pending_validation', validation_format: 'knowledge_base', position: 0, versions: [],
      body: { frase: 'Autonomia exige contexto compartilhado.', texto: 'Um pensamento amplo sobre autonomia, contexto e decisão, para sustentar vários recortes.' },
      metadata: { purpose: 'knowledge_base', origin: 'discovery' },
    });
    const p1 = await seedDiscovery(doc, { title: 'Caso de autonomia sem contexto', kind: 'caso', tags: ['autonomia'], content_id: proposal, status: 'drafted', chunk: 3 });
    const p2 = await seedDiscovery(doc, { title: 'Prática de alinhamento semanal', kind: 'pratica', tags: ['autonomia'], content_id: proposal, status: 'drafted', chunk: 4 });
    await sql(`update contents set metadata = metadata || jsonb_build_object('discovery_ids', jsonb_build_array('${p1}','${p2}')) where id='${proposal}'`);

    await page.goto('/conteudos-mae');
    const card = (title: string) => page.getByTestId('mother-card').filter({ hasText: title });
    await expect(card('E2E Mãe com material').getByTestId('mother-stock')).toHaveText('2 materiais ainda não usados');
    await expect(card('E2E Mãe esgotada').getByTestId('mother-stock')).toHaveText('Esgotado');
    await expect(card('E2E Proposta da Hive')).toHaveCount(0);

    const proposals = page.getByTestId('mother-proposals');
    await expect(proposals).toContainText('Propostos pela Hive (1)');
    const item = proposals.getByTestId('mother-proposal');
    await expect(item).toHaveCount(1);
    await expect(item).toContainText('E2E Proposta da Hive');
    await expect(item).toContainText('2 trechos da Biblioteca');
    await item.getByRole('checkbox').check();
    await proposals.getByRole('button', { name: 'Validar selecionadas (1)', exact: true }).click();
    await expect(page.getByText('1 conteúdo mãe validado. Nenhum post foi criado.', { exact: true })).toBeVisible();
    await expect(proposals).toContainText('Nenhuma proposta esperando por você.');
    await expect(card('E2E Proposta da Hive').getByTestId('mother-stock')).toHaveText('2 materiais ainda não usados');

    expect((await sql<{ status: string }>(`select status from contents where id='${proposal}'`))[0].status).toBe('validated');
    expect(await sql(`select id from content_base_versions where content_id='${proposal}' and status='validated'`)).toHaveLength(1);
    const material = await sql<{ status: string; content_id: string }>(`select status, content_id from knowledge_discoveries where id in ('${p1}','${p2}')`);
    expect(material).toEqual([{ status: 'active', content_id: proposal }, { status: 'active', content_id: proposal }]);
    expect(await sql(`select id from user_posts where content_id='${proposal}'`)).toHaveLength(0);
  });

  test('produção do acervo propõe recortes com material do estoque, troca o material e reserva o escolhido', async ({ page }) => {
    test.setTimeout(180000);
    const f = await stockSetup();
    const calls = await mockStockScript(page, { content_id: f.mother.id, discovery_ids: [f.d1], version_id: f.mother.version });
    await page.goto(`/producao?campaign=${f.target.id}&cycle=${f.cycle}`);
    const plan = page.getByTestId('production-plan');
    await expect(plan).toContainText('Você tem 1 conteúdos-mãe com material novo (2 materiais ainda não usados).');

    await page.getByRole('button', { name: 'Propor produção com a Hive', exact: true }).click();
    const item = page.getByTestId('production-plan-item');
    await expect(item).toHaveCount(1);
    // Fora do estoque cada peça tem o seletor "Base de conhecimento"; no acervo ele dá lugar ao recorte do mãe.
    await expect(item.getByLabel('Base de conhecimento')).toHaveCount(0);
    expect(calls.find((c) => c.action === 'recommend_cycle_plan')).toMatchObject({ cycle_id: f.cycle, stock: true });
    const stock = item.getByTestId('production-item-stock');
    await expect(stock).toContainText('E2E Mãe com estoque');
    await expect(stock).toContainText('Reunião que terminou sem decisão · caso');

    await stock.getByRole('button', { name: 'Trocar', exact: true }).click();
    await stock.getByRole('checkbox', { name: 'Autonomia pede contexto · conceito' }).check();
    await stock.getByRole('checkbox', { name: 'Reunião que terminou sem decisão · caso' }).uncheck();
    await stock.getByRole('button', { name: 'Fechar', exact: true }).click();
    await expect(stock.getByRole('listitem')).toHaveText(['Autonomia pede contexto · conceito']);

    await page.getByRole('button', { name: /Aprovar proposta e produzir/ }).click();
    await expect.poll(async () => sql<{ ids: string[] }>(`select to_jsonb(discovery_ids) ids from content_piece_plans where cycle_id='${f.cycle}' and status<>'removed'`), { timeout: 60000 })
      .toEqual([{ ids: [f.d2] }]);
    // approve adota o mãe do estoque no ciclo antes do RPC.
    expect(await sql(`select version_id, origin from content_base_uses where cycle_id='${f.cycle}' and content_id='${f.mother.id}'`))
      .toEqual([{ version_id: f.mother.version, origin: 'archive' }]);
    const states = await sql<{ discovery_id: string; state: string }>(`select discovery_id, state from discovery_availability where discovery_id in ('${f.d1}','${f.d2}')`);
    expect(Object.fromEntries(states.map((s) => [s.discovery_id, s.state]))).toEqual({ [f.d1]: 'livre', [f.d2]: 'reservada' });

    await page.goto(`/conteudos-mae?content=${f.mother.id}`);
    const material = page.getByTestId('mother-material');
    await expect(material).toContainText('1 material ainda não usado');
    await expect(material.getByRole('listitem').filter({ hasText: 'Autonomia pede contexto' })).toContainText('Reservado numa produção');
    await expect(material.getByRole('listitem').filter({ hasText: 'Reunião que terminou sem decisão' })).toContainText('Ainda não usado');
  });

  test('aprovar com material já usado em peça produzida é recusado (PT409) e a tela mostra a mensagem', async ({ page }) => {
    test.setTimeout(180000);
    const f = await stockSetup();
    await mockStockScript(page, { content_id: f.mother.id, discovery_ids: [f.d1], version_id: f.mother.version });
    await page.goto(`/producao?campaign=${f.target.id}&cycle=${f.cycle}`);
    await page.getByRole('button', { name: 'Propor produção com a Hive', exact: true }).click();
    await expect(page.getByTestId('production-plan-item')).toHaveCount(1);
    // Outra campanha produz uma peça com o mesmo material depois que a proposta foi aberta.
    await seedProducedPlan(f.mother.id, f.source.id, f.source.cycleIds[0], [f.d1]);

    await page.getByRole('button', { name: /Aprovar proposta e produzir/ }).click();
    await expect(page.getByText(/O material escolhido não está mais disponível\. Peça outra proposta\./).first()).toBeVisible();
    // A tela recarrega o estoque: o material usado deixa de valer para a peça.
    await expect(page.getByText('Peça 1: escolha material ainda não usado deste conteúdo-mãe.', { exact: true })).toBeVisible();
    expect(await sql(`select id from content_piece_plans where cycle_id='${f.cycle}'`)).toHaveLength(0);
    expect((await sql<{ production: unknown }>(`select plan->'production' production from campaign_cycles where id='${f.cycle}'`))[0].production).toBeNull();
  });
});
