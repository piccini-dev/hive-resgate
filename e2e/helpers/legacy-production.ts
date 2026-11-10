import {expect,type Page} from '@playwright/test';

// Fixture de compatibilidade: prepara material com o gerador legado para testar
// revisão/edição de registros que já existiam antes de E2. A jornada NOVA, sem
// produção automática ao entrar, é exercitada em F29. Isto não é um fluxo da UI.
export async function prepareLegacyReview(page:Page,campaignId:string,cycleId:string){
  await page.goto(`/producao?campaign=${campaignId}&cycle=${cycleId}`);
  await expect(page.getByTestId('production-plan')).toBeVisible();
  await page.evaluate(async({cycleId})=>{
    const root='/src/lib/';
    const {db}=await import(root+'db.ts');
    const {produceCycle}=await import(root+'campaign/produce.ts');
    const [cycle]=await db.select('campaign_cycles',{id:`eq.${cycleId}`});
    const [contents,ideas,pieces,plans]=await Promise.all([
      db.select('contents',{cycle_id:`eq.${cycleId}`}),db.select('ideas',{cycle_id:`eq.${cycleId}`}),
      db.select('user_posts',{cycle_id:`eq.${cycleId}`}),db.select('content_piece_plans',{cycle_id:`eq.${cycleId}`}),
    ]);
    if(!cycle||cycle.plan?.production)throw new Error('Fixture legada recusada: ciclo inexistente ou já migrado.');
    await produceCycle(cycle.user_id,cycle,{contents,ideas,pieces,plans},()=>undefined);
  },{cycleId});
  await page.reload();await openLegacyReview(page);
}
export async function openLegacyReview(page:Page){
  await expect(page.getByTestId('production-plan')).toBeVisible();
  await page.getByRole('button',{name:'Ver produção existente',exact:true}).click();
  await expect(page.getByTestId('review-overview')).toBeVisible();
}

// Base/contrato legados para exercitar a leitura histórica e a revisão versionada.
export async function prepareLegacyBase(page:Page,campaignId:string,cycleId:string){
  await page.goto(`/producao?campaign=${campaignId}&cycle=${cycleId}`);
  await expect(page.getByTestId('base-overview')).toBeVisible();
  await page.evaluate(async({campaignId,cycleId})=>{
    const root='/src/lib/';const {edge}=await import(root+'edge.ts');const {contentApi,ideaApi,cycleApi}=await import(root+'campaignApi.ts');
    const {acjContractApi}=await import(root+'acj/api.ts');
    const [idea]=await ideaApi.listByCycle(cycleId);if(!idea)throw new Error('Fixture sem pauta.');
    const r=await edge.contentDevelop({idea_id:idea.id,mode:'develop'});
    const content=await contentApi.create({idea_id:idea.id,campaign_id:campaignId,cycle_id:cycleId,title:idea.title,body:{frase:r.frase,texto:r.texto},status:'pending_validation',position:0});
    if(!r.acj?.contract)throw new Error('Fixture sem contrato legado.');
    await acjContractApi.create(content.id,r.acj.contract,{validation:r.acj.validation});
    await ideaApi.update(idea.id,{status:'developed'});await cycleApi.update(cycleId,{status:'developing'});
  },{campaignId,cycleId});
  await page.reload();await page.getByTestId('base-card').getByRole('button').click();
}
