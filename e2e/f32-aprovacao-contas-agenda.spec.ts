import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {addDays,format} from 'date-fns';
import {cleanupE2EData,cleanupE2EStorage,seed,sql,lit,uploadE2EImage} from './helpers/admin';
import {seedAccounts,seedCampaign,seedValidatedContents} from './helpers/fixtures';
import {e2eUser} from './helpers/env';
import {loginAs,type Tenant} from './helpers/tenant';
import {mockEdge,mockProduction} from './helpers/mocks';
import type {DistributionPrefs} from '../src/types';

const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST,OPTIONS','content-type':'application/json'};
const daily:DistributionPrefs={skip_weekends:true,per_day_limit:1,start_offset_days:1,mirror_accounts:true,platform_cadence:{instagram:{per_week:7,times:['12:00','18:30']}}};
test.describe('F32 · aprovação, contas e distribuição diária',()=>{
  let client:Tenant,IMG='',original:{distribution_prefs:DistributionPrefs|null;timezone:string|null};
  test.beforeAll(async()=>{
    const u=e2eUser();client=await loginAs(u.email,u.password,u.id);
    [original]=await sql(`select distribution_prefs,timezone from user_settings where user_id='${u.id}'`);
    IMG=await uploadE2EImage('f32-arte.jpg',readFileSync('e2e/fixtures/peca-a.jpg'));
  });
  test.beforeEach(async()=>{await cleanupE2EData();await sql(`update user_settings set distribution_prefs=${lit(JSON.stringify(daily))}::jsonb,timezone='America/Sao_Paulo' where user_id='${e2eUser().id}'`);});
  test.afterAll(async()=>{
    await cleanupE2EData();await cleanupE2EStorage();
    if(original)await sql(`update user_settings set distribution_prefs=${lit(original.distribution_prefs===null?null:JSON.stringify(original.distribution_prefs))}::jsonb,timezone=${lit(original.timezone)} where user_id='${e2eUser().id}'`);
  });
  async function accounts(){const a=await seedAccounts();const b=await seed('social_accounts',{platform:'instagram',label:'@segunda-e2e',status:'connected',instagram_access_token:'tok-falso',instagram_business_account_id:'17840000000000002'});return {a:a.instagram,b};}
  async function approve(id:string){const r=await client.rpc('approve_piece',{p_post:id,p_rendered:IMG});expect(r.status).toBe(200);}
  async function legacy(title:string,account:string|null=null){const id=await seed('user_posts',{platform:'instagram',format:'image',status:'pending_approval',title,caption:'Legenda de '+title,carousel_text:{quote:title},rendered_slides:{slide1:IMG},account_id:account,metadata:{editorial_slug:'diagnostico-sistemico'}});await approve(id);return id;}
  async function destinations(page:Page){
    const acc=await accounts(),camp=await seedCampaign({weeks:1,accountIds:[acc.a,acc.b]}),cycle=camp.cycleIds[0];
    const bases=await seedValidatedContents(camp.id,cycle,[1,2].map(n=>({title:'Conhecimento amplo '+n,channels:[]})));
    const [c]=await sql<{updated_at:string}>(`select updated_at from campaign_cycles where id='${cycle}'`);
    const baseRows=await sql<{id:string;body:object}>(`select id,body from contents where cycle_id='${cycle}' order by position`);
    expect((await client.rpc('approve_cycle_production',{p_cycle:cycle,p_command:crypto.randomUUID(),p_expected_updated:c.updated_at,p_bases:baseRows,p_items:bases.map((b,i)=>({content_id:b.contentId,platform:'instagram',format:'image',approach:'Recorte distinto '+i,purpose:'Abrir conversa',template_family:'M01',editorial_slug:'diagnostico-sistemico'})),p_replace:[]})).status).toBe(200);
    const plans=await sql<{id:string;position:number}>(`select id,position from content_piece_plans where cycle_id='${cycle}' order by position`),ids:string[]=[];
    for(const [i,p] of plans.entries()){
      const claim=await client.rpc<{claim:string;piece:{id:string}}>('reserve_production_piece',{p_plan:p.id});expect(claim.status).toBe(200);const id=claim.data.piece.id;ids.push(id);
      expect((await client.rpc('save_production_progress',{p_plan:p.id,p_claim:claim.data.claim,p_done:true,p_patch:{title:'Arte aprovada '+i,caption:'Legenda distinta '+i,carousel_text:{quote:'Uma leitura própria '+i},rendered_slides:{slide1:IMG},visual_decision:{variant:'M01-A'}}})).status).toBe(200);await approve(id);
    }
    await mockProduction(page);await page.goto(`/producao?campaign=${camp.id}&cycle=${cycle}`);
    await page.getByRole('button',{name:/Escolher contas e preparar publicação/}).click();
    return {acc,camp,cycle,ids};
  }

  test('artes e contas padrão aparecem juntas; confirmação em lote retoma só a peça que falhou',async({page})=>{
    const f=await destinations(page);await expect(page.getByTestId('destination-piece')).toHaveCount(2);
    await expect(page.getByRole('img',{name:'Peça aprovada · página 1'})).toHaveCount(2);
    for(const row of await page.getByTestId('destination-piece').all()){await expect(row.getByRole('checkbox',{name:'Conta E2E',exact:true})).toBeChecked();await expect(row.getByRole('checkbox',{name:'Conta @segunda-e2e',exact:true})).toBeChecked();}
    const calls:string[]=[];let fail=true;
    await page.route('**/rest/v1/rpc/prepare_piece_destinations',async route=>{
      if(route.request().method()==='OPTIONS')return route.fulfill({status:200,headers:CORS});
      const id=route.request().postDataJSON().p_post;calls.push(id);
      if(id===f.ids[1]&&fail){fail=false;return route.fulfill({status:409,headers:CORS,body:JSON.stringify({message:'Conflito de teste nesta peça.'})});}
      await route.fallback();
    });
    await page.getByRole('button',{name:'Confirmar destinos e seguir'}).click();
    await expect(page.getByTestId('destinations-summary')).toHaveText('1 de 2 peças com destinos confirmados');
    await expect(page.getByRole('alert')).toContainText('Conflito de teste nesta peça.');
    const pending=page.getByTestId('destination-piece').filter({has:page.getByText('Uma leitura própria 1',{exact:true})});
    await expect(pending.getByRole('checkbox',{name:'Conta @segunda-e2e',exact:true})).toBeChecked();
    await page.getByRole('button',{name:'Confirmar destinos e seguir'}).click();
    await expect(page).toHaveURL(new RegExp(`/agenda\\?campaign=${f.camp.id}`));
    expect(calls.filter(id=>id===f.ids[0])).toHaveLength(1);expect(calls.filter(id=>id===f.ids[1])).toHaveLength(2);
    const rows=await sql<{status:string;account_id:string;root:string}>(`select status,account_id,coalesce(metadata->>'delivery_of',id::text) root from user_posts where cycle_id='${f.cycle}' and status<>'archived'`);
    expect(rows).toHaveLength(4);expect(rows.every(r=>r.status==='approved')).toBe(true);for(const root of f.ids)expect(rows.filter(r=>r.root===root).map(r=>r.account_id).sort()).toEqual([f.acc.a,f.acc.b].sort());
    await expect(page.getByTestId('queue-count')).toHaveText('2');await expect(page.getByTestId('queue-piece')).toHaveCount(2);await expect(page.getByTestId('queue-account').filter({hasText:'@segunda-e2e'})).toHaveCount(2);
  });

  test('padrões de conta e espelhamento persistem sem apagar a cadência; configuração da agenda preserva as contas',async({page})=>{
    const acc=await accounts();await page.goto('/configuracoes');await page.getByRole('tab',{name:'Contas',exact:true}).click();const panel=page.getByTestId('publication-defaults');
    await panel.getByRole('checkbox',{name:'Conta padrão E2E · instagram',exact:true}).uncheck();
    await panel.getByRole('checkbox',{name:'Espelhar datas entre contas',exact:true}).uncheck();
    await panel.getByRole('button',{name:'Salvar padrões de publicação',exact:true}).click();
    await expect(page.getByText('Padrões de publicação salvos para novas peças e planos.',{exact:true})).toBeVisible();
    const [saved]=await sql<{distribution_prefs:DistributionPrefs}>(`select distribution_prefs from user_settings where user_id='${e2eUser().id}'`);
    expect(saved.distribution_prefs).toMatchObject({mirror_accounts:false,platform_cadence:daily.platform_cadence});
    expect(saved.distribution_prefs.default_account_ids).toContain(acc.b);expect(saved.distribution_prefs.default_account_ids).not.toContain(acc.a);
    await page.reload();await page.getByRole('tab',{name:'Contas',exact:true}).click();
    await expect(panel.getByRole('checkbox',{name:'Conta padrão E2E · instagram',exact:true})).not.toBeChecked();await expect(panel.getByRole('checkbox',{name:'Espelhar datas entre contas',exact:true})).not.toBeChecked();
    await page.goto('/agenda');await page.getByRole('button',{name:'Configurar',exact:true}).click();
    const config=page.getByRole('dialog');await config.getByRole('button',{name:'Todos os dias no Instagram',exact:true}).click();
    await config.getByRole('button',{name:'Salvar',exact:true}).click();
    await expect(page.getByText('Preferências de distribuição salvas.',{exact:true})).toBeVisible();
    const [again]=await sql<{distribution_prefs:DistributionPrefs}>(`select distribution_prefs from user_settings where user_id='${e2eUser().id}'`);
    expect(again.distribution_prefs.default_account_ids).toEqual(saved.distribution_prefs.default_account_ids);
    expect(again.distribution_prefs.mirror_accounts).toBe(false);expect(again.distribution_prefs.platform_cadence?.instagram?.weekdays).toEqual([0,1,2,3,4,5,6]);
  });

  test('IA e semiautomático distribuem sete peças em sete dias para duas contas; calendário reúne as entregas e identifica cada conta',async({page})=>{
    test.setTimeout(240000);const acc=await accounts(),roots:string[]=[];
    for(let n=0;n<7;n++){
      const id=await legacy('Peça diária '+n);roots.push(id);const material=await client.rpc<{hash:string}>('publication_material',{p_post:id});expect(material.status).toBe(200);
      expect((await client.rpc('prepare_piece_destinations',{p_post:id,p_expected_hash:material.data.hash,p_accounts:[acc.a,acc.b]})).status).toBe(200);
    }
    const calls:Record<string,unknown>[]=[];await mockEdge(page,'distribute-schedule',b=>({success:true,plan:(b.standby as Array<{id:string}>).map(s=>({post_id:s.id,date:'2000-01-01',time:'03:00'}))}),calls);
    await page.goto('/agenda');await expect(page.getByTestId('queue-count')).toHaveText('7');
    await page.getByRole('button',{name:'Semi-auto'}).click();
    const wizard=page.getByRole('dialog');await expect(wizard.getByRole('button',{name:'Todos os dias',exact:true})).toHaveAttribute('aria-pressed','true');
    for(const d of ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'])await expect(wizard.getByRole('button',{name:d,exact:true})).toHaveAttribute('aria-pressed','true');
    await expect(wizard.getByRole('button',{name:'12:00',exact:true})).toHaveAttribute('aria-pressed','true');await expect(wizard.getByRole('button',{name:'18:30',exact:true})).toHaveAttribute('aria-pressed','true');
    await wizard.getByRole('button',{name:'Gerar plano',exact:true}).click();
    await expect(page.getByTestId('plan-row')).toHaveCount(14);
    const slots=await page.getByTestId('plan-slot').allTextContents();const expected=Array.from({length:7},(_,i)=>`${format(addDays(new Date(),i+1),'yyyy-MM-dd')} · ${i%2?'18:30':'12:00'}`);
    expect([...new Set(slots)]).toEqual(expected);await expect(page.getByTestId('plan-piece')).toHaveCount(7);
    for(const group of await page.getByTestId('plan-piece').all())expect((await group.getByTestId('plan-account').allTextContents()).sort()).toEqual(['@segunda-e2e','E2E'].sort());
    await page.getByRole('button',{name:'Cancelar',exact:true}).click();await page.getByRole('button',{name:'IA distribuir',exact:true}).click();
    await expect(page.getByTestId('plan-row')).toHaveCount(14);expect(await page.getByTestId('plan-slot').allTextContents()).toEqual(slots);
    expect((calls[0].standby as unknown[])).toHaveLength(7); // uma sugestão editorial, não catorze revisões
    await page.getByRole('button',{name:'Aplicar (14)',exact:true}).click();await expect(page.getByTestId('queue-count')).toHaveText('0',{timeout:150000});
    const rows=await sql<{id:string;root:string;status:string;d:string;account_id:string}>(`select id,coalesce(metadata->>'delivery_of',id::text) root,status,scheduled_date::text d,account_id from user_posts where user_id='${e2eUser().id}'`);
    expect(rows).toHaveLength(14);expect(rows.every(r=>r.status==='scheduled')).toBe(true);
    for(const root of roots){const deliveries=rows.filter(r=>r.root===root);expect(deliveries).toHaveLength(2);expect(deliveries[0].d).toBe(deliveries[1].d);expect(deliveries.map(r=>r.account_id).sort()).toEqual([acc.a,acc.b].sort());}
    expect((await sql<{n:number}>(`select count(*)::int n from schedule_commands where user_id='${e2eUser().id}'`))[0].n).toBe(14);
    const first=rows[0];await page.goto('/agenda?focus='+first.id);await expect(page.getByTestId('piece-panel')).toBeVisible();await expect(page.getByTestId('panel-account')).toHaveText(first.account_id===acc.a?'E2E':'@segunda-e2e');
    await page.getByRole('button',{name:'Fechar',exact:true}).click();
    await expect(page.getByTestId('calendar-piece')).toHaveCount(7);
    await page.getByRole('button',{name:'Semana',exact:true}).click();await expect(page.getByTestId('calendar-position').first()).toBeVisible();
    const group=page.getByTestId('calendar-piece').first();await expect(group.getByTestId('agenda-account')).toHaveCount(2);
    await page.getByRole('button',{name:'Dia',exact:true}).click();await expect(page.getByTestId('calendar-piece').first()).toBeVisible();
  });

  test('Aprovar e seguir só avança depois da aprovação confirmada; falha mantém a peça no editor',async({page})=>{
    await accounts();const fabric={version:'6.0.0',background:'#fff',objects:[{type:'Rect',version:'6.0.0',left:100,top:100,width:400,height:300,fill:'#e89a3c'}]};
    const id=await seed('user_posts',{platform:'instagram',format:'image',status:'pending_approval',title:'Aprovação com continuidade',caption:'Legenda preservada',carousel_text:{quote:'Texto preservado'},rendered_slides:null,carousel_fabric_json:[fabric]});
    await page.route('**/rest/v1/rpc/approve_piece',async route=>{if(route.request().method()==='OPTIONS')return route.fulfill({status:200,headers:CORS});return route.fulfill({status:409,headers:CORS,body:JSON.stringify({message:'Aprovação recusada no teste.'})});});
    await page.goto('/posts/'+id);const next=page.getByTestId('editor-next');await expect(next).toHaveText('Aprovar e seguir');await expect(next).toBeEnabled({timeout:30000});
    await expect(page.getByRole('button',{name:'Publicar',exact:true})).toHaveCount(0);
    // Erro no fluxo, sem toast sobre o cabeçalho: é possível tentar novamente com o aviso visível.
    const approvalError=page.getByTestId('editor-approval-error');
    await next.click();await expect(approvalError).toContainText('Aprovação recusada no teste.');await expect(page).toHaveURL(new RegExp('/posts/'+id+'$'));
    await expect(page.getByRole('alert')).toContainText('Aprovação recusada no teste.');
    await expect(page.locator('#caption')).toHaveValue('Legenda preservada');
    await expect(next).toBeEnabled();
    await expect.poll(async()=>next.evaluate(el=>{const b=el.getBoundingClientRect(),hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return hit===el||el.contains(hit);})).toBe(true);
    expect((await sql<{status:string}>(`select status from user_posts where id='${id}'`))[0].status).toBe('pending_approval');
    await page.unroute('**/rest/v1/rpc/approve_piece');
    // Mantém o aviso na tela e não move o cursor nem espera a mensagem desaparecer.
    await expect(approvalError).toBeVisible();
    const beforeRetry=await next.evaluate(el=>({disabled:(el as HTMLButtonElement).disabled,canvasReady:document.querySelector('[data-canvas-ready]')?.getAttribute('data-canvas-ready'),hit:document.elementFromPoint(el.getBoundingClientRect().x+el.getBoundingClientRect().width/2,el.getBoundingClientRect().y+el.getBoundingClientRect().height/2)?.tagName}));
    try{await next.click();}catch(e){throw new Error('Nova tentativa de aprovação: '+JSON.stringify(beforeRetry)+' '+String(e));}
    await expect(page).toHaveURL(/\/agenda/,{timeout:30000});
    expect((await sql(`select status,caption from user_posts where id='${id}'`))[0]).toEqual({status:'approved',caption:'Legenda preservada'});
  });
});
