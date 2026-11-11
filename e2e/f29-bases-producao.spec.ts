import {test,expect} from '@playwright/test';
import {cleanupE2EData,cleanupE2EStorage,seed,sql} from './helpers/admin';
import {seedAccounts,seedCampaign,seedValidatedContents,seedIdentityBrand} from './helpers/fixtures';
import {e2eUser} from './helpers/env';
import {createTenant,deleteTenant,loginAs} from './helpers/tenant';
import {mockEdge,mockProduction} from './helpers/mocks';
import {sequenceReviewSnapshot} from '../src/lib/sequence/visual-state';
import type {PostUnit,UserPost} from '../src/types';

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
    await expect(page.getByTestId('gallery')).toBeVisible();
    await page.getByRole('button',{name:'Revisar peça',exact:true}).click();
    await page.getByRole('button',{name:'Aprovar peça',exact:true}).click();
    await expect(page.getByTestId('gallery')).toBeVisible();
    await expect(page.getByTestId('unit-status')).toHaveText('Aprovado');
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
        // Incidente 10/11: o salvamento real envia metadata.script_notes; sem isso a regressão não exercitava o erro de precedência JSON.
        p_patch:{caption:plan.format==='story'?'':`Legenda exclusiva ${plan.format}`,carousel_text:{quote:`Capa ${plan.format}`},metadata:{script_notes:`Progressão ${plan.format}`,production_flow:'indevido',source_base_version_id:'indevido',destinations_confirmed:true},...(!sequence?{rendered_slides:{slide1:`https://example.test/${pid}.jpg`},visual_decision:{variant:'M01-A'}}:{})},
        p_units:sequence?[{layout:'cover',title:`Capa ${plan.format}`,body:''},{layout:'text',title:'Desenvolvimento',body:`Contribuição ${plan.format}`},{layout:'closing',title:'Encerramento',body:'Pergunta para observar.'}]:null});
      expect(saved.status).toBe(200);
      const [stored]=await sql<{metadata:Record<string,unknown>}>(`select metadata from user_posts where id='${pid}'`);
      expect(stored.metadata.script_notes).toBe(`Progressão ${plan.format}`);
      expect(stored.metadata.production_flow).toBe('base_v2');
      expect(stored.metadata.source_base_version_id).not.toBe('indevido');
      expect(stored.metadata.destinations_confirmed).not.toBe(true);
      if(sequence){
        const draft=(await client.rest<UserPost[]>(`/user_posts?id=eq.${pid}`)).data[0];
        const notRendered=(await client.rest<PostUnit[]>(`/post_units?post_id=eq.${pid}&order=position.asc`)).data;
        expect((await client.rpc('approve_sequence_review',{pid,p_expected:sequenceReviewSnapshot(draft,notRendered)})).status).toBe(422);
        await sql(`update post_units set rendered_url='https://example.test/'||id||'.jpg',visual_status='ready',review_status='pending',rendered_text_version=text_version where post_id='${pid}';`);
      }
      let ap;
      if(sequence){
        const post=(await client.rest<UserPost[]>(`/user_posts?id=eq.${pid}`)).data[0];
        const pages=(await client.rest<PostUnit[]>(`/post_units?post_id=eq.${pid}&order=position.asc`)).data;
        const snapshot=sequenceReviewSnapshot(post,pages);
        const stale=await client.rpc('approve_sequence_review',{pid,p_expected:{...snapshot,caption:'Outra versão'}});
        expect(stale.status).toBe(409);
        const [unchanged]=await sql<{script_status:string;n:number}>(`select script_status,(select count(*)::int from post_units where post_id='${pid}' and review_status='approved') n from user_posts where id='${pid}'`);
        expect(unchanged).toEqual({script_status:'draft',n:0});
        if(plan.format==='carousel'){
          const stranger=await createTenant(`sequence-review-${Date.now()}`);
          try{
            expect((await stranger.rpc('approve_sequence_review',{pid,p_expected:snapshot})).status).toBe(404);
            expect((await stranger.rpc('sequence_review_material',{pid})).data).toBeNull();
          }finally{await deleteTenant(stranger);}
        }
        ap=await client.rpc('approve_sequence_review',{pid,p_expected:snapshot});
      }else ap=await client.rpc('approve_piece',{p_post:pid,p_rendered:`https://example.test/${pid}.jpg`,p_approve_ai:false});
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

  test('roteiro concluído retoma imagens, preserva as prontas e abre revisão visual lado a lado',async({page})=>{
    test.setTimeout(240000);
    const f=await setup(),user=e2eUser(),client=await loginAs(user.email,user.password,user.id);
    await mockProduction(page);
    const [cycle]=await sql<{updated_at:string}>(`select updated_at from campaign_cycles where id='${f.cycle}'`);
    const [base]=await sql<{body:object}>(`select body from contents where id='${f.base.contentId}'`);
    expect((await client.rpc('approve_cycle_production',{p_cycle:f.cycle,p_command:crypto.randomUUID(),p_expected_updated:cycle.updated_at,p_bases:[{id:f.base.contentId,body:base.body}],p_items:[{content_id:f.base.contentId,platform:'instagram',format:'carousel',approach:'Aplicação diferente',purpose:'Percorrer uma situação',template_family:'M01',editorial_slug:'diagnostico-sistemico'}],p_replace:[]})).status).toBe(200);
    const [plan]=await sql<{id:string}>(`select id from content_piece_plans where cycle_id='${f.cycle}'`);
    const reserved=await client.rpc<{claim:string;piece:{id:string}}>('reserve_production_piece',{p_plan:plan.id});
    const pid=reserved.data.piece.id;
    expect((await client.rpc('save_production_progress',{p_plan:plan.id,p_claim:reserved.data.claim,p_done:true,p_patch:{caption:'Um percurso para observar a situação.',metadata:{script_notes:'Texto em três páginas.'}},p_units:[{layout:'cover',title:'Um novo olhar',body:''},{layout:'text',title:'A situação',body:'Texto longo demais para uma página legível. '.repeat(40)},{layout:'closing',title:'O que você observa?',body:'Uma pergunta para continuar.'}]})).status).toBe(200);
    await page.goto(`/producao?campaign=${f.camp.id}&cycle=${f.cycle}`);
    await expect(page.getByTestId('production-summary')).toBeVisible({timeout:120000});
    await expect(page.getByText('1 sequências têm imagens pendentes.',{exact:false})).toBeVisible();
    const before=await sql<{position:number;rendered_url:string|null;visual_status:string}>(`select position,rendered_url,visual_status from post_units where post_id='${pid}' order by position`);
    expect(before.map(u=>u.visual_status)).toEqual(['ready','failed','ready']);
    await sql(`update post_units set body='Uma aplicação curta e concreta.' where post_id='${pid}' and position=2`);
    await page.getByRole('button',{name:'Retomar produção pendente'}).click();
    await expect.poll(async()=>(await sql<{n:number}>(`select count(*)::int n from post_units where post_id='${pid}' and visual_status<>'ready'`))[0].n,{timeout:120000}).toBe(0);
    await expect(page.getByTestId('produce-progress')).toHaveCount(0);
    const after=await sql<{position:number;rendered_url:string}>(`select position,rendered_url from post_units where post_id='${pid}' order by position`);
    expect(after[0].rendered_url).toBe(before[0].rendered_url);expect(after[2].rendered_url).toBe(before[2].rendered_url);
    await expect(page.getByTestId('gallery-pages-strip').getByRole('img')).toHaveCount(3);
    await page.getByTestId('gallery-unit').getByRole('button').first().click();
    await expect(page.getByTestId('visual-review-page')).toHaveCount(3);
    await expect(page.getByTestId('script-units')).toHaveCount(0);
    expect((await sql<{script_status:string}>(`select script_status from user_posts where id='${pid}'`))[0].script_status).toBe('draft');
    await expect(page.getByTestId('visual-sequence-approve')).toBeDisabled();
    await page.getByRole('checkbox',{name:'Revisei o texto e todas as imagens desta sequência.'}).check();
    await page.getByTestId('visual-sequence-approve').click();
    await expect(page.getByTestId('gallery')).toBeVisible();
    await expect(page.getByTestId('unit-status')).toHaveText('Aprovado');
    const [approved]=await sql<{status:string;script_status:string}>(`select status,script_status from user_posts where id='${pid}'`);
    expect(approved).toEqual({status:'approved',script_status:'approved'});
  });
  test('revisão direta preserva outras páginas, legenda longa e aprovação; produção existente lê as imagens canônicas',async({page})=>{
    test.setTimeout(300000);
    const f=await setup(),user=e2eUser(),client=await loginAs(user.email,user.password,user.id);
    await mockProduction(page);
    const [cycle]=await sql<{updated_at:string}>(`select updated_at from campaign_cycles where id='${f.cycle}'`);
    const [base]=await sql<{body:object}>(`select body from contents where id='${f.base.contentId}'`);
    expect((await client.rpc('approve_cycle_production',{p_cycle:f.cycle,p_command:crypto.randomUUID(),p_expected_updated:cycle.updated_at,p_bases:[{id:f.base.contentId,body:base.body}],p_items:[{content_id:f.base.contentId,platform:'instagram',format:'carousel',approach:'Outra leitura para a revisão',purpose:'Percorrer e editar uma situação',template_family:'M01',editorial_slug:'diagnostico-sistemico'}],p_replace:[]})).status).toBe(200);
    const [plan]=await sql<{id:string}>(`select id from content_piece_plans where cycle_id='${f.cycle}'`);
    const r=await client.rpc<{claim:string;piece:{id:string}}>('reserve_production_piece',{p_plan:plan.id});const pid=r.data.piece.id;
    expect((await client.rpc('save_production_progress',{p_plan:plan.id,p_claim:r.data.claim,p_done:true,p_patch:{caption:'Legenda preservada.'},p_units:[{layout:'cover',title:'Capa para revisão',body:''},{layout:'text',title:'Título inicial',body:'Uma leitura breve.'},{layout:'closing',title:'O que você observa?',body:'Pergunta para continuar.'}]})).status).toBe(200);
    await page.goto(`/producao?campaign=${f.camp.id}&cycle=${f.cycle}`);
    await expect(page.getByTestId('unit-status')).toHaveText('Pronta para revisar',{timeout:120000});
    const before=await sql<PostUnit>(`select * from post_units where post_id='${pid}' order by position`);
    // O caminho antes chamado “produção existente” agora usa a mesma lista e lê post_units.
    await page.getByRole('button',{name:'Ver bases e proposta de produção'}).click();
    await page.getByRole('button',{name:'Ver produção existente'}).click();
    await expect(page.getByTestId('gallery-pages-strip').getByRole('img')).toHaveCount(3);
    await page.getByRole('button',{name:'Revisar peça',exact:true}).click();
    await page.getByRole('button',{name:'Editar arte da página 2',exact:true}).click();
    const dialog=page.getByRole('dialog');
    await expect(dialog.getByTestId('sequence-page-canvas')).toBeVisible();
    // Mouse real no canvas escalado: não selecionar a camada pelo menu lateral.
    await expect(dialog.getByRole('button',{name:'Título da página',exact:true})).toBeVisible();
    const art=dialog.locator('canvas.upper-canvas');
    const point=async(x:number,y:number)=>{const b=await art.boundingBox();if(!b)throw new Error('Arte não visível');return {x:b.x+x*b.width/1080,y:b.y+y*b.height/1350};};
    const json=before[1].fabric_json as {objects:Array<{name?:string;left:number;top:number;width:number;fontSize?:number}>};
    const title=json.objects.find(o=>o.name==='unit-title')!;
    let pt=await point(title.left+title.width*.25,title.top+(title.fontSize??50)*.5);
    await page.mouse.click(pt.x,pt.y);
    await expect(dialog.getByRole('textbox',{name:'Texto selecionado',exact:true})).toHaveValue('Título inicial');
    await page.mouse.dblclick(pt.x,pt.y);
    // O textarea invisível do Fabric precisa ficar dentro do modal e receber foco.
    const input=dialog.locator('textarea[data-fabric="textarea"]');
    await expect(input).toBeFocused();
    await page.keyboard.press('Control+a');await page.keyboard.insertText('Título editado na arte');
    await page.keyboard.press('Escape');
    // Escape do Fabric sai do texto; não fecha o ajuste e não perde a edição.
    await expect(dialog).toBeVisible();
    // Forma fina do template: antes só podia ser selecionada pela lista.
    const rule=json.objects.find(o=>o.name==='page-rule')!;
    pt=await point(rule.left+rule.width/2,rule.top+1.5);
    await page.mouse.move(pt.x,pt.y);await page.mouse.down();
    const end=await point(rule.left+rule.width/2+80,rule.top+1.5+60);
    await page.mouse.move(end.x,end.y,{steps:8});await page.mouse.up();
    await expect(dialog.getByTestId('editor-selected-type')).toHaveText('Retângulo');
    await expect(dialog.getByRole('spinbutton',{name:'Posição X',exact:true})).toHaveValue(String(rule.left+80));
    // Camadas sobrepostas: clique normal seleciona o topo; Alt + clique percorre.
    await dialog.getByRole('button',{name:'Elementos',exact:true}).click();
    await dialog.getByRole('button',{name:'Círculo',exact:true}).click();
    await dialog.getByRole('button',{name:'Retângulo',exact:true}).click();
    pt=await point(540,675);await page.mouse.click(pt.x,pt.y);
    await expect(dialog.getByTestId('editor-selected-type')).toHaveText('Retângulo');
    await page.keyboard.down('Alt');await page.mouse.click(pt.x,pt.y);await page.keyboard.up('Alt');
    await expect(dialog.getByTestId('editor-selected-type')).toHaveText('Círculo');
    await dialog.getByRole('button',{name:'Apagar',exact:true}).click();
    pt=await point(540,675);await page.mouse.click(pt.x,pt.y);
    await expect(dialog.getByTestId('editor-selected-type')).toHaveText('Retângulo');
    await dialog.getByRole('button',{name:'Apagar',exact:true}).click();
    // Salvar imediatamente captura a arte viva, sem aguardar o debounce da miniatura.
    await dialog.getByRole('button',{name:'Salvar esta página',exact:true}).click();
    await expect(dialog).toHaveCount(0,{timeout:60000});
    let after=await sql<PostUnit>(`select * from post_units where post_id='${pid}' order by position`);
    expect(after[1].title).toBe('Título editado na arte');expect(after[1].assets.manual_canvas).toBe(true);
    const savedRule=(after[1].fabric_json as typeof json).objects.find(o=>o.name==='page-rule')!;
    expect(savedRule.left).toBeCloseTo(rule.left+80,0);expect(savedRule.top).toBeCloseTo(rule.top+60,0);
    expect(after[0]).toEqual(before[0]);expect(after[2]).toEqual(before[2]);
    expect(after[1].rendered_url).not.toBe(before[1].rendered_url);
    await page.getByTestId('visual-review-page').nth(1).getByRole('button',{name:'Ajustar texto',exact:true}).click();
    await dialog.getByRole('textbox',{name:'Texto desta página',exact:true}).fill('Uma leitura ainda mais clara.');
    await dialog.getByRole('button',{name:'Conferir alteração',exact:true}).click();
    await expect(dialog.getByTestId('page-edit-candidate')).toBeVisible();
    await dialog.getByRole('button',{name:'Aplicar nesta página',exact:true}).click();
    await expect(dialog).toHaveCount(0,{timeout:60000});
    after=await sql<PostUnit>(`select * from post_units where post_id='${pid}' order by position`);
    expect(after[1].body).toBe('Uma leitura ainda mais clara.');expect(after[0]).toEqual(before[0]);expect(after[2]).toEqual(before[2]);
    await page.getByTestId('visual-review-page').nth(1).getByRole('button',{name:'Alterar visual',exact:true}).click();
    await dialog.getByRole('button',{name:'Leitura em fundo escuro',exact:false}).click();
    await expect(dialog.getByRole('img',{name:'Visual proposto'})).toBeVisible({timeout:60000});
    // Propor não muda a página ativa: só Aplicar registra a nova composição.
    expect((await sql<PostUnit>(`select * from post_units where post_id='${pid}' and position=2`))[0].rendered_url).toBe(after[1].rendered_url);
    await dialog.getByRole('button',{name:'Aplicar nesta página',exact:true}).click();
    await expect(dialog).toHaveCount(0,{timeout:60000});
    after=await sql<PostUnit>(`select * from post_units where post_id='${pid}' order by position`);
    expect(after[1].assets.page_direction?.theme).toBe('escuro');expect(after[1].title).toBe('Título editado na arte');
    expect(after[0]).toEqual(before[0]);expect(after[2]).toEqual(before[2]);
    await page.getByRole('button',{name:'Editar legenda',exact:true}).click();
    const caption='Um texto longo, com uma leitura completa para revisar.\n'.repeat(25)+'FIM DA LEGENDA';
    await page.getByRole('textbox',{name:'Editar legenda da sequência'}).fill(caption);
    await page.getByRole('button',{name:'Salvar legenda',exact:true}).click();
    await expect(page.getByTestId('sequence-caption')).toContainText('FIM DA LEGENDA');
    expect((await sql<{caption:string}>(`select caption from user_posts where id='${pid}'`))[0].caption).toBe(caption);
    for(let i=1;i<=3;i++)await page.getByRole('button',{name:`Marcar página ${i} como revisada`,exact:true}).click();
    await expect(page.getByTestId('visual-sequence-approve')).toBeEnabled();
    await page.getByTestId('visual-sequence-approve').click();
    await expect(page.getByTestId('gallery')).toBeVisible();await expect(page.getByTestId('unit-status')).toHaveText('Aprovado');
    expect((await sql<{status:string;scheduled_date:string|null;scheduled_package_id:string|null}>(`select status,scheduled_date,scheduled_package_id from user_posts where id='${pid}'`))[0]).toEqual({status:'approved',scheduled_date:null,scheduled_package_id:null});
    // Uma correção posterior desfaz só a aprovação do post, mantendo páginas não alteradas.
    await page.getByRole('button',{name:'Ver peça aprovada',exact:true}).click();
    await page.getByTestId('visual-review-page').nth(1).getByRole('button',{name:'Ajustar texto',exact:true}).click();
    await dialog.getByRole('textbox',{name:'Título desta página'}).fill('Nova revisão');
    await dialog.getByRole('button',{name:'Conferir alteração',exact:true}).click();await dialog.getByRole('button',{name:'Aplicar nesta página',exact:true}).click();
    await expect(dialog).toHaveCount(0,{timeout:60000});
    const [post]=await sql<{status:string;approved_version:number|null}>(`select status,approved_version from user_posts where id='${pid}'`);
    expect(post).toEqual({status:'pending_approval',approved_version:null});
    after=await sql<PostUnit>(`select * from post_units where post_id='${pid}' order by position`);
    expect(after[0].review_status).toBe('approved');expect(after[2].review_status).toBe('approved');expect(after[1].review_status).toBe('pending');
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
