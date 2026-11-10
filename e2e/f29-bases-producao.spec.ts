import {test,expect} from '@playwright/test';
import {cleanupE2EData,cleanupE2EStorage,seed,sql} from './helpers/admin';
import {seedAccounts,seedCampaign,seedValidatedContents,seedIdentityBrand} from './helpers/fixtures';
import {e2eUser} from './helpers/env';
import {loginAs} from './helpers/tenant';
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
  test('contratos autenticados: uma base gera imagem/carrossel/Stories; entregas preservam o material e exigem reconfirmação de conta',async()=>{
    test.setTimeout(180000);
    const f=await setup(),user=e2eUser(),client=await loginAs(user.email,user.password,user.id);
    const [cycle]=await sql<{updated_at:string}>(`select updated_at from campaign_cycles where id='${f.cycle}'`);
    const [base]=await sql<{body:object}>(`select body from contents where id='${f.base.contentId}'`);
    const formats=['image','carousel','story'];
    const approved=await client.rpc('approve_cycle_production',{p_cycle:f.cycle,p_command:crypto.randomUUID(),p_expected_updated:cycle.updated_at,p_bases:[{id:f.base.contentId,body:base.body}],
      p_items:formats.map(format=>({content_id:f.base.contentId,platform:'instagram',format,approach:`Contribuição ${format}`,purpose:`Percurso próprio para ${format}`,template_family:'M01',editorial_slug:'diagnostico-sistemico'})),p_replace:[]});
    expect(approved.status).toBe(200);
    const plans=await sql<{id:string;format:string}>(`select id,format from content_piece_plans where cycle_id='${f.cycle}' order by position`);
    expect(plans.map(p=>p.format)).toEqual(formats);
    const parents:string[]=[];
    for(const plan of plans){
      const races=await Promise.all([client.rpc<{piece:{id:string};claim:string}>('reserve_production_piece',{p_plan:plan.id}),client.rpc('reserve_production_piece',{p_plan:plan.id})]);
      expect(races.map(r=>r.status).sort()).toEqual([200,409]);
      const reservation=races.find(r=>r.status===200)!.data as {piece:{id:string};claim:string};
      const pid=reservation.piece.id;parents.push(pid);
      const sequence=plan.format!=='image';
      const saved=await client.rpc('save_production_progress',{p_plan:plan.id,p_claim:reservation.claim,p_done:true,
        p_patch:{caption:plan.format==='story'?'':`Legenda exclusiva ${plan.format}`,carousel_text:{quote:`Capa ${plan.format}`},...(!sequence?{rendered_slides:{slide1:`https://example.test/${pid}.jpg`},visual_decision:{variant:'M01-A'}}:{})},
        p_units:sequence?[{layout:'cover',title:`Capa ${plan.format}`,body:''},{layout:'text',title:'Desenvolvimento',body:`Contribuição ${plan.format}`},{layout:'closing',title:'Encerramento',body:'Pergunta para observar.'}]:null});
      expect(saved.status).toBe(200);
      if(sequence){
        await sql(`update post_units set rendered_url='https://example.test/'||id||'.jpg',visual_status='ready',review_status='approved',rendered_text_version=text_version where post_id='${pid}'; update user_posts set script_status='approved' where id='${pid}';`);
      }
      const ap=await client.rpc(sequence?'approve_sequence':'approve_piece',sequence?{pid}:{p_post:pid,p_rendered:`https://example.test/${pid}.jpg`,p_approve_ai:false});
      expect(ap.status).toBe(200);
      const material=await client.rpc<{hash:string}>('publication_material',{p_post:pid});
      const destinations=await client.rpc('prepare_piece_destinations',{p_post:pid,p_expected_hash:material.data.hash,p_accounts:[f.accounts.instagram,f.other]});
      expect(destinations.status).toBe(200);
      const resume=await client.rpc<{done:boolean;piece:{id:string}}>('reserve_production_piece',{p_plan:plan.id});
      expect(resume.data).toMatchObject({done:true,piece:{id:pid}});
    }
    const counts=await sql<{format:string;n:number}>(`select format,count(*)::int n from user_posts where cycle_id='${f.cycle}' and status='approved' group by format order by format`);
    expect(counts).toEqual([{format:'carousel',n:2},{format:'image',n:2},{format:'story',n:2}]);
    expect((await client.rpc('complete_cycle_production',{p_cycle:f.cycle})).status).toBe(200);
    const third=await seed('social_accounts',{platform:'instagram',label:'E2E terceiro',status:'connected'});
    const [delivery]=await sql<{id:string}>(`select id from user_posts where metadata->>'delivery_of'='${parents[0]}' and status='approved'`);
    await client.rest(`/user_posts?id=eq.${delivery.id}`,{method:'PATCH',body:JSON.stringify({account_id:third})});
    expect((await client.rpc('complete_cycle_production',{p_cycle:f.cycle})).status).toBe(422);
    const material=await client.rpc<{hash:string}>('publication_material',{p_post:parents[0]});
    expect((await client.rpc('prepare_piece_destinations',{p_post:parents[0],p_expected_hash:material.data.hash,p_accounts:[f.accounts.instagram,third]})).status).toBe(200);
    expect((await client.rpc('complete_cycle_production',{p_cycle:f.cycle})).status).toBe(200);
    const [source]=await sql<{body:object}>(`select body from contents where id='${f.base.contentId}'`);
    expect(source.body).toEqual(base.body);
  });

  test('servidor captura a voz da campanha sem IA e preserva snapshots quando a voz muda',async()=>{
    const brand=await seedIdentityBrand(),camp=await seedCampaign({weeks:1}),user=e2eUser();
    const client=await loginAs(user.email,user.password,user.id);
    await sql(`update campaigns set profile_id='${brand.profileA}' where id='${camp.id}'`);
    const first=await client.fn<{snapshot_id:string;profile_id:string}>('sequence-script',{action:'production_context',cycle_id:camp.cycleIds[0]});
    expect(first.status).toBe(200);expect(first.data.profile_id).toBe(brand.profileA);expect(first.data.snapshot_id).toBeTruthy();
    await sql(`update campaigns set profile_id='${brand.profileB}' where id='${camp.id}'`);
    const second=await client.fn<{snapshot_id:string;profile_id:string}>('sequence-script',{action:'production_context',cycle_id:camp.cycleIds[0]});
    expect(second.status).toBe(200);expect(second.data.profile_id).toBe(brand.profileB);expect(second.data.snapshot_id).not.toBe(first.data.snapshot_id);
    const snapshot=await client.rest<Array<{profile_id:string;campaign_id:string}>>(`/context_snapshots?id=eq.${first.data.snapshot_id}&select=profile_id,campaign_id`);
    expect(snapshot.data).toEqual([{profile_id:brand.profileA,campaign_id:camp.id}]);
  });

});
