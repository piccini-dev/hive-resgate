import { test, expect } from '@playwright/test';
import { cleanupE2EData, cleanupE2EStorage, seed, sql } from './helpers/admin';
import { seedAccounts, seedCampaign, seedValidatedContents } from './helpers/fixtures';
import { e2eUser } from './helpers/env';
import { loginAs } from './helpers/tenant';
import { mockDevelop, mockProduction } from './helpers/mocks';
import { legacyDiagram } from './helpers/diagram-fixture';

// Decisão Marcos 12/11: conteúdos mãe pertencem à Voz; campanhas usam versões
// validadas. A transição não reescreve peças agendadas nem suas origens.
test.describe('F30 · departamentos e recuperação do editor', () => {
  test.beforeEach(async () => { await cleanupE2EData(); });
  test.afterAll(async () => { await cleanupE2EData(); await cleanupE2EStorage(); });
  async function base() {
    const accounts = await seedAccounts();
    const camp = await seedCampaign({ weeks: 1, accountIds: [accounts.instagram] });
    const [base] = await seedValidatedContents(camp.id, camp.cycleIds[0], [{ title: 'Base ampla para aplicações diferentes', channels: [] }]);
    const user = e2eUser(), client = await loginAs(user.email, user.password, user.id);
    const [content] = await sql<{body: object}>(`select body from contents where id='${base.contentId}'`);
    const validated = await client.rpc<{version: {id: string}}>('validate_content_base', { p_content: base.contentId, p_cycle: camp.cycleIds[0], p_expected_body: content.body });
    expect(validated.status).toBe(200);
    return { accounts, camp, base, version: validated.data.version.id };
  }
  test('acervo mostra bases validadas, exclui posts importados e valida novo pensamento sem criar peças', async ({page}) => {
    const f = await base();
    await seed('contents', { title: 'Post importado não é base', status: 'validated', body: { texto: 'Texto histórico.' } });
    await page.goto('/conteudos-mae');
    await expect(page.getByTestId('mother-card')).toHaveCount(1);
    await expect(page.getByTestId('mother-card')).toContainText('Base ampla');
    await page.getByRole('button', { name: 'Novo conteúdo mãe', exact: true }).click();
    await page.getByLabel('Tema do conteúdo mãe', {exact: true}).fill('Uma segunda tese ampla');
    await page.getByLabel('Pensamento e referências', {exact: true}).fill('Um pensamento desenvolvido para sustentar várias aplicações, relações e diferentes recortes.');
    await page.getByRole('button', { name: 'Guardar como rascunho', exact: true }).click();
    await expect(page.getByTestId('mother-detail')).toContainText('Uma segunda tese ampla');
    await page.getByRole('button', { name: 'Validar conteúdo mãe', exact: true }).click();
    await expect(page.getByTestId('mother-detail')).toContainText('Validado');
    expect(await sql(`select id from user_posts where campaign_id='${f.camp.id}'`)).toHaveLength(0);
    const [created] = await sql<{id:string}>(`select id from contents where title='Uma segunda tese ampla'`);
    expect(await sql(`select id from content_base_versions where content_id='${created.id}' and status='validated'`)).toHaveLength(1);
  });
  test('revisar no acervo preserva o uso da campanha e todos os dados da publicação programada', async ({page}) => {
    const f = await base();
    const pid = await seed('user_posts', { campaign_id: f.camp.id, cycle_id: f.camp.cycleIds[0], content_id: f.base.contentId, platform: 'instagram', format: 'image', status: 'scheduled', account_id: f.accounts.instagram, scheduled_date: new Date(Date.now()+86400000).toISOString(), caption: 'Legenda programada', carousel_fabric_json: [legacyDiagram()], metadata: { source_base_version_id: f.version } });
    const [before] = await sql(`select * from user_posts where id='${pid}'`);
    await page.goto(`/conteudos-mae?content=${f.base.contentId}`);
    await expect(page.getByTestId('mother-detail')).toBeVisible();
    await page.getByRole('button', { name: 'Editar conteúdo mãe', exact: true }).click();
    await page.getByLabel('Desenvolvimento', {exact: true}).fill('Uma versão ampliada para os próximos usos, preservando as versões anteriores.');
    await page.getByRole('button', { name: 'Salvar rascunho', exact: true }).click();
    await expect(page.getByText('Rascunho salvo. As versões usadas nas campanhas permanecem preservadas.', {exact: true})).toBeVisible();
    await expect(page.getByTestId('mother-detail')).toContainText('Uma versão ampliada');
    await page.reload();
    await expect(page.getByTestId('mother-detail')).toContainText('Uma versão ampliada');
    await page.getByRole('button', { name: 'Validar conteúdo mãe', exact: true }).click();
    await expect(page.getByTestId('mother-detail')).toContainText('Validado');
    const [use] = await sql<{version_id: string}>(`select version_id from content_base_uses where cycle_id='${f.camp.cycleIds[0]}' and content_id='${f.base.contentId}'`);
    expect(use.version_id).toBe(f.version);
    expect((await sql(`select * from user_posts where id='${pid}'`))[0]).toEqual(before);
  });
  test('campanha usa base do acervo sem gerar ideias mãe ou desenvolver novas bases', async ({page}) => {
    const f = await base(), target = await seedCampaign({weeks: 1, name: 'Campanha com acervo', accountIds: [f.accounts.instagram]});
    await sql(`update campaigns set metadata='{"content_source":"archive"}' where id='${target.id}'`);
    const calls: Array<Record<string,unknown>> = []; await mockDevelop(page,calls); await mockProduction(page);
    const pauta: unknown[] = []; await page.route('**/functions/v1/cycle-pauta', route => { pauta.push(route.request().postDataJSON()); return route.abort(); });
    await page.goto(`/producao?campaign=${target.id}&cycle=${target.cycleIds[0]}`);
    await expect(page.getByTestId('campaign-base-picker')).toBeVisible();
    await page.getByRole('checkbox', {name: /Base ampla/}).check();
    await page.getByRole('button', {name: 'Usar bases e propor recortes'}).click();
    await expect(page.getByTestId('production-plan')).toContainText('1 bases validadas');
    expect(calls).toHaveLength(0); expect(pauta).toHaveLength(0);
    expect(await sql(`select id from ideas where campaign_id='${target.id}'`)).toHaveLength(0);
    expect(await sql(`select id from contents where campaign_id='${target.id}'`)).toHaveLength(0);
    expect((await sql<{version_id:string}>(`select version_id from content_base_uses where cycle_id='${target.cycleIds[0]}'`))[0].version_id).toBe(f.version);
  });
  test('editor libera a captura após abrir repetidamente e salva sem perder objetos', async ({page}) => {
    const art = legacyDiagram('Arte que precisa carregar por inteiro');
    const pid = await seed('user_posts', { platform: 'linkedin', format: 'image', status: 'pending_approval', title: 'Reabertura da arte', caption: 'Legenda preservada', carousel_text: {quote: 'Arte que precisa carregar por inteiro'}, carousel_fabric_json: [art], metadata: {editorial_slug:'diagnostico-sistemico'} });
    for (let n=0;n<3;n++) {
      await page.goto(`/posts/${pid}`);
      await expect(page.locator('[data-canvas-ready="true"]')).toBeVisible();
      await expect(page.getByText('Preparando arte…', {exact:true})).toHaveCount(0);
      if (n<2) await page.goto('/');
    }
    await page.getByRole('button', {name: 'Salvo',exact:true}).click();
    await expect(page.getByText('Texto e arte salvos',{exact:true})).toBeVisible();
    const [saved] = await sql<{art:{objects:unknown[]}; caption:string}>(`select carousel_fabric_json->0 art,caption from user_posts where id='${pid}'`);
    expect(saved.art.objects).toHaveLength(art.objects.length); expect(saved.caption).toBe('Legenda preservada');
  });
  test('imagem com falha oferece recuperação e não permite salvar uma arte incompleta', async ({page}) => {
    const art = {...legacyDiagram(),objects:[...legacyDiagram().objects,{type:'Image',src:'https://image.invalid/e2e-carga.png',left:0,top:0,width:100,height:100}]};
    const pid = await seed('user_posts', { platform: 'linkedin', format:'image', status:'pending_approval', title:'Recuperar carga',caption:'Preservar',carousel_fabric_json:[art] });
    let fail=true;
    await page.route('https://image.invalid/e2e-carga.png', route => fail ? route.abort() : route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jX1sAAAAASUVORK5CYII=','base64')}));
    await page.goto(`/posts/${pid}`);
    await expect(page.getByRole('alert')).toContainText('A arte não carregou por completo');
    await expect(page.getByRole('button',{name:'Salvo',exact:true})).toBeDisabled();
    expect((await sql<{art:unknown}>(`select carousel_fabric_json->0 art from user_posts where id='${pid}'`))[0].art).toEqual(art);
    fail=false; await page.getByRole('button',{name:'Tentar carregar arte novamente'}).click();
    await expect(page.locator('[data-canvas-ready="true"]')).toBeVisible();
    await expect(page.getByRole('button',{name:'Salvo',exact:true})).toBeEnabled();
  });
});
