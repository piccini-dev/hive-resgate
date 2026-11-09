import {test,expect} from '@playwright/test';
import {cleanupE2EData,cleanupE2EStorage,seed,sql} from './helpers/admin';
import {seedAccounts,seedCampaign,seedValidatedContents} from './helpers/fixtures';
import {mockEdge,mockProduction} from './helpers/mocks';

test.describe('F29 · base reutilizável → proposta → post → destinos',()=>{
  test.beforeEach(async()=>{await cleanupE2EData();});
  test.afterAll(async()=>{await cleanupE2EData();await cleanupE2EStorage();});
  async function setup(){
    const accounts=await seedAccounts();
    const other=await seed('social_accounts',{platform:'instagram',label:'E2E segunda',status:'connected',instagram_access_token:'tok-falso',instagram_business_account_id:'17840000000000001'});
    const camp=await seedCampaign({weeks:1,accountIds:[accounts.instagram,other]});
    const [base]=await seedValidatedContents(camp.id,camp.cycleIds[0],[{title:'Conhecimento que sustenta vários recortes',channels:[{account_id:accounts.instagram,platform:'instagram'}]}]);
    return {camp,base,accounts,other,cycle:camp.cycleIds[0]};
  }
  test('abrir uma campanha legada preserva o conhecimento e não gera posts por conta própria',async({page})=>{
    const f=await setup();const calls=await mockProduction(page);
    await page.goto(`/producao?campaign=${f.camp.id}&cycle=${f.cycle}`);
    await expect(page.getByTestId('production-plan')).toBeVisible();
    await expect(page.getByTestId('production-plan')).toContainText('1 bases validadas');
    expect(calls.gen).toHaveLength(0);
    expect(await sql(`select id from user_posts where cycle_id='${f.cycle}'`)).toHaveLength(0);
    const [b]=await sql<{status:string;texto:string}>(`select status,body->>'texto' texto from contents where id='${f.base.contentId}'`);
    expect(b).toEqual({status:'validated',texto:'Texto validado.'});
  });
  test('proposta explícita substitui somente o rascunho confirmado; um post é revisado uma vez e usado em duas contas',async({page})=>{
    test.setTimeout(180000);
    const f=await setup();await mockProduction(page);
    const old=await seed('user_posts',{platform:'instagram',format:'image',status:'pending_approval',content_id:f.base.contentId,campaign_id:f.camp.id,cycle_id:f.cycle,caption:'Rascunho anterior'});
    const calls:Record<string,unknown>[]=[];
    await mockEdge(page,'sequence-script',b=>{
      calls.push(b);
      if(b.action==='production_context')return {success:true,snapshot_id:null,profile_id:null}; // Test voice context is covered independently by F17/F19.
      if(b.action==='recommend_cycle_plan')return {success:true,summary:'Uma peça concentrada para abrir a conversa.',items:[{content_id:f.base.contentId,platform:'instagram',format:'image',approach:'Investigar a relação',purpose:'Abrir uma reflexão na editoria.',template_family:'M01',editorial_slug:'diagnostico-sistemico',architecture:null}]};
      if(b.action==='image')return {success:true,quote:'O que esta relação está produzindo?',caption:'Um recorte específico do conhecimento validado.'};
      throw new Error('Ação inesperada: '+String(b.action));
    });
    await page.goto(`/producao?campaign=${f.camp.id}&cycle=${f.cycle}`);
    await page.getByRole('button',{name:'Propor produção com a Hive'}).click();
    await expect(page.getByTestId('production-plan-item')).toHaveCount(1);
    const approve=page.getByRole('button',{name:/Aprovar proposta e produzir/});
    await expect(approve).toBeDisabled();
    await page.getByRole('checkbox').check();await approve.click();
    await expect(page.getByTestId('production-summary')).toBeVisible({timeout:120000});
    expect(calls.filter(c=>c.action==='image')).toHaveLength(1);
    expect((await sql<{status:string}>(`select status from user_posts where id='${old}'`))[0].status).toBe('archived');
    let rows=await sql<{id:string;account_id:string|null;text_approved:boolean;status:string}>(`select id,account_id,text_approved,status from user_posts where cycle_id='${f.cycle}' and status<>'archived'`);
    expect(rows).toHaveLength(1);expect(rows[0]).toMatchObject({account_id:null,text_approved:false,status:'pending_approval'});
    await page.reload();await expect(page.getByTestId('production-summary')).toBeVisible({timeout:60000});
    expect(calls.filter(c=>c.action==='image')).toHaveLength(1);
    await page.getByRole('button',{name:'Revisar produção',exact:false}).click();
    await page.getByRole('button',{name:/Revisar propostas/}).click();
    await page.getByRole('button',{name:'Aprovar peça',exact:true}).click();
    await page.getByRole('button',{name:'Ver produção do ciclo'}).click();
    await page.getByRole('button',{name:/Escolher contas e preparar publicação/}).click();
    await expect(page.getByTestId('destination-piece')).toHaveCount(1);
    await page.getByRole('checkbox',{name:'E2E',exact:true}).check();
    await page.getByRole('checkbox',{name:'E2E segunda',exact:true}).check();
    await page.getByRole('button',{name:'Confirmar destinos'}).click();
    await expect(page.getByText('Destinos confirmados para este material')).toBeVisible();
    rows=await sql(`select id,account_id,text_approved,status from user_posts where cycle_id='${f.cycle}' and status<>'archived'`);
    expect(rows).toHaveLength(2);expect(rows.every(r=>r.status==='approved'&&r.text_approved)).toBe(true);
    expect(rows.map(r=>r.account_id).sort()).toEqual([f.accounts.instagram,f.other].sort());
    const editorial=await sql(`select id from user_posts where cycle_id='${f.cycle}' and status<>'archived' and metadata->>'delivery_of' is null`);
    expect(editorial).toHaveLength(1);
    await page.getByRole('button',{name:/Seguir para a agenda/}).click();
    await expect(page).toHaveURL(new RegExp(`/agenda\\?campaign=${f.camp.id}`));
  });
});
