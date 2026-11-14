import {test,expect} from '@playwright/test';
import {planDistribution,distributionProblems,parseSlot,type Delivery} from '../src/lib/distribution';
import {mergePrefs,guideFor,setScheduleTimeZone,cadenceDays} from '../src/lib/schedule';
import {calendarPositions,defaultDestinations,deliveryGroups,previewUrls} from '../src/lib/publicationDefaults';
import type {DistributionPrefs,SocialAccount} from '../src/types';

const now=new Date('2026-11-13T21:00:00Z'); // sexta, 18h em São Paulo
const prefs=(patch:DistributionPrefs={})=>mergePrefs({skip_weekends:true,per_day_limit:1,start_offset_days:1,platform_cadence:{instagram:{per_week:7,times:['12:00','18:30']}},...patch});
const piece=(id:string,account='a',root?:string,extra:Partial<Delivery>={}):Delivery=>({id,platform:'instagram',account_id:account,metadata:root?{delivery_of:root}:{},status:'approved',scheduled_date:null,published_at:null,...extra});
const mirrored=(n:number)=>Array.from({length:n},(_,i)=>[piece(`p${i}`),piece(`copy${i}`,'b',`p${i}`)]).flat();
const run=(standby:Delivery[],extra:Partial<Parameters<typeof planDistribution>[0]>={})=>planDistribution({standby,occupied:[],prefs:prefs(),now,...extra});
test.beforeEach(()=>setScheduleTimeZone('America/Sao_Paulo'));
test.afterAll(()=>setScheduleTimeZone('America/Sao_Paulo'));

test('sete peças em duas contas geram sete dias corridos, inclusive fim de semana, com horários alternados',()=>{
  const result=run(mirrored(7));expect(result.unplaced).toEqual([]);expect(result.rows).toHaveLength(14);
  expect(deliveryGroups(mirrored(7))).toHaveLength(7);
  for(let i=0;i<7;i++){
    const [a,b]=result.rows.slice(i*2,i*2+2);
    expect(a.date).toBe(`2026-11-${14+i}`);expect(a.time).toBe(i%2?'18:30':'12:00');
    expect(b).toMatchObject({date:a.date,time:a.time});
  }
  expect(distributionProblems(result.rows.map(r=>({...r,post:mirrored(7).find(p=>p.id===r.postId)!})),[],now).size).toBe(0);
});
test('semiautomático parte da frequência, dias e horários salvos, inclusive zero sem limite',()=>{
  const p=prefs({platform_cadence:{instagram:{per_week:0,times:['07:45'],weekdays:[0,6]}}}),g=guideFor(p,'instagram');
  expect(g.defaultPerWeek).toBe(0);expect(g.weekdays.filter(d=>d.recommended).map(d=>d.dow).sort()).toEqual([0,6]);
  expect(g.times.filter(t=>t.recommended).map(t=>t.time)).toEqual(['07:45']);
  const result=run(mirrored(3),{prefs:p,perPlatform:{instagram:{per_week:g.defaultPerWeek,weekdays:g.weekdays.filter(d=>d.recommended).map(d=>d.dow),times:g.times.filter(t=>t.recommended).map(t=>t.time)}}});
  expect([...new Set(result.rows.map(r=>r.date))]).toEqual(['2026-11-14','2026-11-15','2026-11-21']);
});
test('dias explícitos prevalecem sobre a regra geral de fins de semana e ausência de dias não é substituída silenciosamente',()=>{
  const p=prefs({platform_cadence:{instagram:{per_week:7,times:['12:00'],weekdays:[0]}}});
  expect(cadenceDays(p,'instagram')).toEqual([0]);expect(run([piece('p')],{prefs:p}).rows[0].date).toBe('2026-11-15');
  const empty=run([piece('p')],{perPlatform:{instagram:{per_week:7,times:['12:00'],weekdays:[]}}});
  const noTimes=run([piece('p')],{prefs:prefs({platform_cadence:{instagram:{per_week:7,times:[]}}})});expect(noTimes.rows).toEqual([]);expect(noTimes.unplaced).toHaveLength(1);
  expect(empty.rows).toEqual([]);expect(empty.unplaced[0].reason).toContain('ao menos um dia');
});
test('limite semanal é por conta e considera a semana parcial já ocupada',()=>{
  const p=prefs({skip_weekends:false,platform_cadence:{instagram:{per_week:2,times:['12:00']}}});
  const old=piece('old','a',undefined,{status:'scheduled',scheduled_date:'2026-11-12T15:00:00Z'});
  const result=run(mirrored(3),{prefs:p,occupied:[old]});
  expect(result.rows.map(r=>r.date)).toEqual(['2026-11-14','2026-11-14','2026-11-16','2026-11-16','2026-11-17','2026-11-17']);
  expect(old.scheduled_date).toBe('2026-11-12T15:00:00Z');
});
test('entrega já agendada ancora a outra conta sem mover o material existente',()=>{
  const old=piece('p','a',undefined,{status:'scheduled',scheduled_date:'2026-11-15T15:00:00Z'});
  const result=run([piece('copy','b','p')],{occupied:[old]});
  expect(result.rows[0]).toMatchObject({date:'2026-11-15',time:'12:00'});expect(old.scheduled_date).toBe('2026-11-15T15:00:00Z');
});
test('histórico, âncora passada ou âncoras divergentes ficam pendentes com motivo explícito',()=>{
  for(const occupied of [
    [piece('p','a',undefined,{status:'published',published_at:'2026-11-12T15:00:00Z'})],
    [piece('p','a',undefined,{status:'scheduled',scheduled_date:'2026-11-12T15:00:00Z'})],
    [piece('p','a',undefined,{status:'scheduled',scheduled_date:'2026-11-15T15:00:00Z'}),piece('c','c','p',{status:'scheduled',scheduled_date:'2026-11-16T15:00:00Z'})],
  ]){const result=run([piece('copy','b','p')],{occupied});expect(result.rows).toEqual([]);expect(result.unplaced).toHaveLength(1);expect(result.unplaced[0].reason).toMatch(/preservada|histórico/);}
});
test('espelhamento desativado distribui por capacidade de cada conta independentemente',()=>{
  const occupied=[piece('old','a',undefined,{status:'scheduled',scheduled_date:'2026-11-14T15:00:00Z'})];
  const result=run(mirrored(1),{prefs:prefs({mirror_accounts:false}),occupied});
  expect(result.rows.find(r=>r.postId==='copy0')?.date).toBe('2026-11-14');expect(result.rows.find(r=>r.postId==='p0')?.date).toBe('2026-11-15');
});
test('datas inválidas da IA são corrigidas, a ordem conhecida é preservada e nenhuma peça é omitida',()=>{
  const result=run(mirrored(3),{suggestions:[{post_id:'p2',date:'2000-01-01',time:'03:00'},{post_id:'inexistente',date:'2026-11-15',time:'12:00'},{post_id:'p2',date:'2026-11-16',time:'18:30'}]});
  expect(result.rows.map(r=>r.postId)).toEqual(['p2','copy2','p0','copy0','p1','copy1']);
  expect(result.rows[0]).toMatchObject({date:'2026-11-14',time:'12:00'});expect(result.unplaced).toEqual([]);
});
test('preferência editorial não cria buracos na cadência diária e o horizonte gera pendências visíveis',()=>{
  const result=run(mirrored(7),{editorialGap:()=>30,horizonDays:2});
  expect([...new Set(result.rows.map(r=>r.date))]).toEqual(['2026-11-14','2026-11-15','2026-11-16']);expect(result.unplaced).toHaveLength(8);
});
test('validação de plano retomado recusa divergência entre contas e preserva confirmação anterior',()=>{
  const posts=mirrored(1),result=run(posts),rows=result.rows.map(r=>({...r,post:posts.find(p=>p.id===r.postId)!}));
  const changed=rows.map((r,i)=>({...r,date:i?'2026-11-15':r.date,...(i?{}:{result:{state:'ok'}})}));
  const errors=distributionProblems(changed,[],now);expect(errors.has('p0')).toBe(false);expect(errors.get('copy0')).toContain('mesmo dia');
});
test('revalidação confere dias, horários, data inicial, limites por conta e linhas repetidas',()=>{
  const p=piece('p'),row={...run([p]).rows[0],post:p};
  for(const patch of [{date:'2026-11-13'},{time:'03:00'},{date:'2026-02-30'}])expect(distributionProblems([{...row,...patch}],[],now).has('p')).toBe(true);
  expect(distributionProblems([row],[piece('old','a',undefined,{status:'scheduled',scheduled_date:parseSlot(row.date,row.time)!.toISOString()})],now).get('p')).toContain('limite');
  expect(distributionProblems([row,row],[],now).get('p')).toContain('duas vezes');
});
test('confirmadas não são contadas duas vezes ao retomar; plano antigo sem regras continua utilizável',()=>{
  const posts=mirrored(2),result=run(posts),rows=result.rows.map(r=>({...r,post:posts.find(p=>p.id===r.postId)!}));
  const saved=posts[0];saved.status='scheduled';saved.scheduled_date=parseSlot(rows[0].date,rows[0].time)!.toISOString();
  expect(distributionProblems(rows.map((r,i)=>({...r,...(i===0?{result:{state:'ok'}}:{})})),[saved],now).size).toBe(0);
  expect(distributionProblems([{post:piece('legacy'),date:'2026-11-15',time:'04:25'}],[],now).size).toBe(0);
});
test('fuso do produtor define o instante, incluindo mudança de dia e horários inexistentes',()=>{
  expect(parseSlot('2026-11-14','00:30')!.toISOString()).toBe('2026-11-14T03:30:00.000Z');
  expect(parseSlot('2026-11-31','12:00')).toBeNull();expect(parseSlot('2026-11-14','24:00')).toBeNull();
  setScheduleTimeZone('America/New_York');expect(parseSlot('2027-03-14','02:30')).toBeNull();
});
test('padrões de destino respeitam seleção vazia, campanha, rede e conexão',()=>{
  const accounts=[{id:'a',platform:'instagram',status:'connected'},{id:'b',platform:'instagram',status:'disconnected'},{id:'li',platform:'linkedin',status:'connected'}] as SocialAccount[];
  expect(defaultDestinations('instagram',accounts)).toEqual(['a']);expect(defaultDestinations('instagram',accounts,{default_account_ids:[]})).toEqual([]);
  expect(defaultDestinations('instagram',accounts,{default_account_ids:['a','b','li']})).toEqual(['a']);
  expect(defaultDestinations('linkedin',accounts,undefined,['a'])).toEqual([]);
  expect(defaultDestinations('linkedin',accounts,undefined,['li'])).toEqual(['li']);
});
test('títulos iguais não agrupam peças diferentes; prévias de carrossel mantêm ordem numérica',()=>{
  expect(deliveryGroups([piece('a'),piece('b')])).toHaveLength(2);
  expect(previewUrls({rendered_slides:{slide10:'10',slide2:'2',slide1:'1'}})).toEqual(['1','2','10']);
});
test('blocos simultâneos dividem largura sem sobreposição; blocos separados recuperam a largura',()=>{
  const input=[{id:'a',top:0,height:50},{id:'b',top:20,height:50},{id:'c',top:60,height:50},{id:'d',top:120,height:30}];
  const result=calendarPositions(input);expect(result.map(r=>[r.id,r.lane,r.lanes])).toEqual([['a',0,2],['b',1,2],['c',0,2],['d',0,1]]);
  expect(input[0]).toEqual({id:'a',top:0,height:50});
});
