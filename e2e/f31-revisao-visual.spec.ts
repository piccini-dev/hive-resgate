import {test,expect,type Page} from '@playwright/test';
import {cleanupE2EData,cleanupE2EStorage,sql} from './helpers/admin';
import {seedAccounts,seedCampaign,seedValidatedContents} from './helpers/fixtures';
import {loginAs} from './helpers/tenant';
import {e2eUser} from './helpers/env';
import {mockEdge,mockProduction} from './helpers/mocks';
import {legacyDiagram} from './helpers/diagram-fixture';
import {partFields,revisionText} from '../src/lib/sequence/assistedRevision';
import type {PostUnit,UserPost} from '../src/types';

const PIXEL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jX1sAAAAASUVORK5CYII=';
test.describe('F31 · revisão compacta e regras visuais',()=>{
  test.beforeEach(async()=>{await cleanupE2EData();});
  test.afterAll(async()=>{await cleanupE2EData();await cleanupE2EStorage();});
  async function setup(page:Page,format:'carousel'|'image'='carousel'){
    await mockProduction(page);
    const accounts=await seedAccounts(),camp=await seedCampaign({weeks:1,accountIds:[accounts.instagram]});
    const cycle=camp.cycleIds[0],[base]=await seedValidatedContents(camp.id,cycle,[{title:'Uma base para revisão',channels:[]}]);
    const user=e2eUser(),client=await loginAs(user.email,user.password,user.id);
    const [c]=await sql<{updated_at:string}>(`select updated_at from campaign_cycles where id='${cycle}'`);
    const [b]=await sql<{body:object}>(`select body from contents where id='${base.contentId}'`);
    expect((await client.rpc('approve_cycle_production',{p_cycle:cycle,p_command:crypto.randomUUID(),p_expected_updated:c.updated_at,p_bases:[{id:base.contentId,body:b.body}],p_items:[{content_id:base.contentId,platform:'instagram',format,approach:'Revisar uma ideia',purpose:'Clareza',template_family:'M03',editorial_slug:'diagnostico-sistemico'}],p_replace:[]})).status).toBe(200);
    const [plan]=await sql<{id:string}>(`select id from content_piece_plans where cycle_id='${cycle}'`);
    const claim=await client.rpc<{claim:string;piece:{id:string}}>('reserve_production_piece',{p_plan:plan.id});expect(claim.status).toBe(200);
    const pid=claim.data.piece.id,caption='Uma legenda que precisa ser lida integralmente.\n'.repeat(20)+'FIM DA LEGENDA';
    expect((await client.rpc('save_production_progress',{p_plan:plan.id,p_claim:claim.data.claim,p_done:true,p_patch:{caption,...(format==='image'?{rendered_slides:{slide1:PIXEL},carousel_fabric_json:[legacyDiagram()],carousel_text:{quote:'Título do diagrama'},visual_decision:{variant:'M03-B'}}:{})},...(format==='carousel'?{p_units:[{layout:'cover',title:'Título do diagrama',body:''},{layout:'text',title:'Outra página',body:''}]}:{})})).status).toBe(200);
    let units=await sql<PostUnit>(`select * from post_units where post_id='${pid}' order by position`);
    for(const u of units)expect((await client.rest(`/post_units?id=eq.${u.id}`,{method:'PATCH',body:JSON.stringify({fabric_json:legacyDiagram(u.title!),rendered_url:PIXEL,visual_status:'ready',rendered_text_version:u.text_version,assets:{...u.assets,variant:'M03-B',manual_canvas:true}})})).status).toBe(204);
    if(format==='carousel')expect((await client.rpc('sync_unit_projection',{pid})).status).toBe(204);
    units=await sql<PostUnit>(`select * from post_units where post_id='${pid}' order by position`);
    return {pid,units,caption,client,url:`/producao?campaign=${camp.id}&cycle=${cycle}`};
  }
  async function open(page:Page,url:string){await page.goto(url);await expect(page.getByTestId('unit-status')).toHaveText('Pronta para revisar');await page.getByRole('button',{name:'Revisar peça',exact:true}).click();}

  test('diagrama abre compacto; proposta preserva a página até aplicar e recusa retorno fora do escopo',async({page})=>{
    const f=await setup(page),art=f.units[0].fabric_json as ReturnType<typeof legacyDiagram>;
    const fields=partFields(art,{variant:'M03-B',scope:'diagram',selected:[],texts:{},representation:'diagram',content:'',height:1350});
    const id=Object.keys(fields).find(k=>fields[k]==='Visível')!;let invalid=false;const calls:Record<string,unknown>[]=[];
    await mockEdge(page,'edit-text',()=>({success:true,text:invalid?'[[0]]\nTítulo proibido':revisionText({...fields,[id]:'Aparente'})}),calls);
    await open(page,f.url);await page.getByRole('button',{name:'Editar arte da página 1',exact:true}).click();
    const dialog=page.getByRole('dialog');await expect(dialog.getByTestId('sequence-page-canvas')).toHaveCount(0);
    await dialog.getByRole('button',{name:'Revisar diagrama e textos',exact:true}).click();
    await expect(dialog.getByRole('textbox',{name:'Texto ligado à imagem 1',exact:true})).toHaveCount(0);
    await dialog.getByRole('textbox',{name:'Pedido de revisão do diagrama'}).fill('Explique melhor a camada visível, preservando o título.');
    const propose=dialog.getByRole('button',{name:'Conferir sugestão da Hive',exact:true});await propose.click();
    await expect(dialog.getByRole('img',{name:'Visual proposto',exact:true})).toBeVisible({timeout:60000});
    expect((await sql<PostUnit>(`select * from post_units where id='${f.units[0].id}'`))[0]).toEqual(f.units[0]);
    await dialog.getByRole('button',{name:'Descartar proposta',exact:true}).click();invalid=true;await propose.click();
    await expect(dialog.getByRole('alert')).toContainText('fora da seleção');await expect(dialog.getByTestId('page-edit-candidate')).toHaveCount(0);
    invalid=false;await propose.click();await expect(dialog.getByRole('img',{name:'Visual proposto',exact:true})).toBeVisible({timeout:60000});
    await dialog.getByRole('button',{name:'Aplicar nesta página',exact:true}).click();await expect(dialog).toHaveCount(0);
    const after=await sql<PostUnit>(`select * from post_units where post_id='${f.pid}' order by position`),objects=(after[0].fabric_json as typeof art).objects;
    art.objects.forEach((o,i)=>{if(i===Number(id))expect(objects[i].text).toBe('Aparente');else expect(objects[i]).toEqual(o);});
    expect(after[0].title).toBe(f.units[0].title);expect(after[0].body).toBe(f.units[0].body);expect(after[1]).toEqual(f.units[1]);
    expect((await sql<UserPost>(`select * from user_posts where id='${f.pid}'`))[0].caption).toBe(f.caption);
    expect(calls).toHaveLength(3);expect(calls[0].post_id).toBe(f.pid);
  });

  test('revisar tudo altera só os textos da página e do diagrama, sem tocar na legenda ou na outra página',async({page})=>{
    const f=await setup(page),art=f.units[0].fabric_json as ReturnType<typeof legacyDiagram>;
    const fields=partFields(art,{variant:'M03-B',scope:'diagram',selected:[],texts:{},representation:'diagram',content:'',height:1350});
    const id=Object.keys(fields).find(k=>fields[k]==='Visível')!;
    await mockEdge(page,'edit-text',()=>({success:true,text:revisionText({title:'Nova leitura',body:'',...fields,[id]:'Aparente'})}));
    await open(page,f.url);await page.getByRole('button',{name:'Editar arte da página 1',exact:true}).click();
    const dialog=page.getByRole('dialog');await dialog.getByRole('textbox',{name:'Pedido de revisão desta página'}).fill('Revise o título e torne o primeiro nível mais claro.');
    await dialog.getByRole('button',{name:'Conferir sugestão da Hive',exact:true}).click();await expect(dialog.getByRole('img',{name:'Visual proposto',exact:true})).toBeVisible({timeout:60000});
    await dialog.getByRole('button',{name:'Aplicar nesta página',exact:true}).click();await expect(dialog).toHaveCount(0);
    const after=await sql<PostUnit>(`select * from post_units where post_id='${f.pid}' order by position`);
    expect(after[0].title).toBe('Nova leitura');expect(after[1]).toEqual(f.units[1]);
    expect((await sql<UserPost>(`select * from user_posts where id='${f.pid}'`))[0].caption).toBe(f.caption);
    const objects=(after[0].fabric_json as typeof art).objects;expect(objects[Number(id)].text).toBe('Aparente');
    for(let i=0;i<objects.length;i++)if(i!==0&&i!==Number(id))expect(objects[i]).toEqual(art.objects[i]);
  });

  test('legenda não é cortada; pedido de nova foto sem estilo aprovado explica o impedimento e preserva a peça',async({page})=>{
    const f=await setup(page,'image');
    expect((await f.client.rest(`/user_posts?id=eq.${f.pid}`,{method:'PATCH',body:JSON.stringify({visual_decision:{variant:'M02-B',image_ref:PIXEL,asset:{url:PIXEL,origin:'real'}},carousel_text:{quote:'Título do diagrama'}})})).status).toBe(204);
    await mockEdge(page,'marcos-photo',()=>({status:'no_approved_style',plan:{reasons:['Aprove um estilo antes de gerar.']}}));
    await open(page,f.url);await expect(page.getByTestId('piece-caption')).toContainText('FIM DA LEGENDA');
    expect(await page.getByTestId('piece-caption').evaluate(el=>getComputedStyle(el).getPropertyValue('-webkit-line-clamp'))).toBe('none');
    const [before]=await sql<UserPost>(`select * from user_posts where id='${f.pid}'`);
    await page.getByTestId('action-swap_image').click();await page.getByRole('textbox',{name:'O que mudar na imagem (opcional)'}).fill('Recrie uma cena ligada ao contexto. Não repita a foto da biblioteca.');
    await page.getByTestId('generate-proposal').click();await expect(page.getByText(/Ainda não há estilo fotográfico aprovado/)).toBeVisible({timeout:60000});
    await expect(page.getByTestId('candidate-apply')).toHaveCount(0);expect((await sql<UserPost>(`select * from user_posts where id='${f.pid}'`))[0]).toEqual(before);
  });

  test('Templates permite escolher referência apenas sem apagar os outros metadados da foto',async({page})=>{
    let photo={id:'00000000-0000-4000-8000-000000000031',brand_id:'00000000-0000-4000-8000-000000000032',kind:'photo',title:'Referência E2E',url:PIXEL,origin:'real',is_active:true,semantic:{nivel:'A0',usage_policy:'reusable'},updated_at:'2026-11-13T10:00:00+00:00'};
    let writes=0;
    await page.route('**/rest/v1/design_assets?**',async route=>{
      const req=route.request(),url=new URL(req.url());let data:unknown=[];
      if(req.method()==='PATCH'){writes++;expect(url.searchParams.get('updated_at')).toBe(`eq.${photo.updated_at}`);const patch=req.postDataJSON();expect(patch.semantic).toEqual({nivel:'A0',usage_policy:'reference_only'});photo={...photo,...patch};data=[photo];}
      else if(url.searchParams.has('person_slug'))data=[photo];
      await route.fulfill({status:200,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,PATCH,OPTIONS','content-type':'application/json'},body:JSON.stringify(data)});
    });
    await page.goto('/templates');await page.getByText('Fotos e geração',{exact:true}).click();
    await page.getByRole('combobox',{name:'Uso da foto Referência E2E'}).selectOption('reference_only');
    await expect(page.getByText('Regra da foto atualizada para novas peças.',{exact:true})).toBeVisible();expect(writes).toBe(1);
    await page.reload();await page.getByText('Fotos e geração',{exact:true}).click();await expect(page.getByRole('combobox',{name:'Uso da foto Referência E2E'})).toHaveValue('reference_only');
  });
});
