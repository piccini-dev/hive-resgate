import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import type { Platform, UserPost } from '@/types';
import { atTime, cadenceDays, cadenceFor, toZoned, weekKey, type GuidedPlatformCfg, type MergedPrefs } from './schedule';
import { deliveryGroups, deliveryRoot } from './publicationDefaults';

export type Delivery = Pick<UserPost,'id'|'platform'|'account_id'|'metadata'|'status'|'scheduled_date'|'published_at'>;
export interface DistributionRule extends GuidedPlatformCfg { per_day_limit:number; mirror:boolean; start_date:string }
export interface PlannedDelivery { postId:string; date:string; time:string; reason:string; rule:DistributionRule }
export interface DistributionSuggestion { post_id:string; date:string; time:string; reason?:string }
export interface DistributionPlan { rows:PlannedDelivery[]; unplaced:Array<{postId:string;reason:string}> }
export const dateKey = (d:Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const timeKey = (d:Date) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
const accountKey = (p:Delivery) => `${p.platform}|${p.account_id??'sem-conta'}`;
const groupKey = (p:Delivery) => `${deliveryRoot(p)}|${p.platform}`;
const editorial = (p:Delivery) => String(p.metadata?.editorial_slug??'');

export function deliveryDate(p:Delivery): Date|null {
  const iso=p.status==='published'&&p.published_at?p.published_at:p.scheduled_date;
  if(!iso||p.status==='archived')return null;
  const d=new Date(iso);return Number.isNaN(d.getTime())?null:d;
}
export function parseSlot(date:string,time:string):Date|null {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))return null;
  const [y,m,d]=date.split('-').map(Number),wall=new Date(y,m-1,d,12);
  if(dateKey(wall)!==date)return null;
  const instant=atTime(wall,time),zoned=toZoned(instant);
  return dateKey(zoned)===date&&timeKey(zoned)===time?instant:null;
}

function ruleFor(prefs:MergedPrefs,platform:Platform,start:string,explicit?:GuidedPlatformCfg):DistributionRule {
  const cad=explicit??{...cadenceFor(prefs,platform),weekdays:cadenceDays(prefs,platform)};
  return {per_week:Math.max(0,cad.per_week),weekdays:[...new Set(cad.weekdays)],times:[...new Set(cad.times.filter(t=>/^([01]\d|2[0-3]):[0-5]\d$/.test(t)))],per_day_limit:prefs.per_day_limit,mirror:prefs.mirror_accounts,start_date:start};
}

function ledger(posts:Delivery[]) {
  const days=new Map<string,number>(),weeks=new Map<string,number>();
  function reserve(p:Delivery,instant:Date){const d=toZoned(instant),scope=accountKey(p),dk=`${scope}|${dateKey(d)}`,wk=`${scope}|${weekKey(d)}`;days.set(dk,(days.get(dk)??0)+1);weeks.set(wk,(weeks.get(wk)??0)+1);}
  for(const p of new Map(posts.map(p=>[p.id,p])).values()){const d=deliveryDate(p);if(d)reserve(p,d);}
  function capacity(group:Delivery[],instant:Date,rule:DistributionRule){
    const d=toZoned(instant),counts=new Map<string,number>();
    for(const p of group)counts.set(accountKey(p),(counts.get(accountKey(p))??0)+1);
    for(const [scope,n] of counts){if((days.get(`${scope}|${dateKey(d)}`)??0)+n>rule.per_day_limit)return false;if(rule.per_week>0&&(weeks.get(`${scope}|${weekKey(d)}`)??0)+n>rule.per_week)return false;}
    return true;
  }
  return {reserve,capacity};
}

/** Único planejador dos modos IA e semiautomático. A IA ordena; as regras definem os slots. */
export function planDistribution(input:{standby:Delivery[];occupied:Delivery[];prefs:MergedPrefs;perPlatform?:Partial<Record<Platform,GuidedPlatformCfg>>;now:Date;horizonDays?:number;suggestions?:DistributionSuggestion[];editorialGap?:(slug:string)=>number}):DistributionPlan {
  const {prefs,now}=input,first=addDays(startOfDay(toZoned(now)),prefs.start_offset_days),start=dateKey(first),horizon=input.horizonDays??180;
  const known=new Map(input.standby.map(p=>[p.id,p])),suggestions=new Map<string,DistributionSuggestion>();
  for(const s of input.suggestions??[])if(known.has(s.post_id)&&!suggestions.has(s.post_id))suggestions.set(s.post_id,s);
  const rank=new Map([...suggestions.keys()].map((id,i)=>[id,i]));
  const groups=deliveryGroups([...known.values()],prefs.mirror_accounts).map(posts=>({posts,rule:ruleFor(prefs,posts[0].platform,start,input.perPlatform?.[posts[0].platform]),anchor:null as Date|null,blocked:''}));
  if(rank.size)groups.sort((a,b)=>Math.min(...a.posts.map(p=>rank.get(p.id)??Infinity))-Math.min(...b.posts.map(p=>rank.get(p.id)??Infinity)));
  for(const g of groups){
    if(!g.rule.weekdays.length||!g.rule.times.length)g.blocked='Escolha ao menos um dia e um horário para esta rede.';
    if(!prefs.mirror_accounts)continue;
    const siblings=input.occupied.filter(p=>groupKey(p)===groupKey(g.posts[0])&&deliveryDate(p));
    const dates=[...new Set(siblings.map(p=>deliveryDate(p)!.toISOString()))];
    if(dates.length>1||siblings.some(p=>p.status==='published'))g.blocked='Esta peça já tem entregas em datas diferentes ou no histórico. Confira as contas antes de espelhar novas entregas.';
    else if(dates.length){g.anchor=new Date(dates[0]);const z=toZoned(g.anchor);if(g.anchor<=now||dateKey(z)<start||!g.rule.weekdays.includes(z.getDay())||!g.rule.times.includes(timeKey(z)))g.blocked='A data já marcada desta peça não atende ao novo padrão. Ela foi preservada; confira a entrega pendente.';}
  }
  const used=ledger(input.occupied),rows:PlannedDelivery[]=[],rotation=new Map<Platform,number>(),last=new Map<string,Date>();
  for(const p of input.occupied){const d=deliveryDate(p);if(d&&(!last.has(editorial(p))||d>last.get(editorial(p))!))last.set(editorial(p),d);}
  const pending=[...groups];
  for(let offset=0;offset<=horizon&&pending.length;offset++){
    const day=addDays(first,offset),date=dateKey(day);
    while(true){
      const eligible=pending.flatMap((g,index)=>{
        if(g.blocked||!g.rule.weekdays.includes(day.getDay())||(g.anchor&&dateKey(toZoned(g.anchor))!==date))return [];
        const n=rotation.get(g.posts[0].platform)??0,times=g.anchor?[timeKey(toZoned(g.anchor))]:g.rule.times.map((_,i)=>g.rule.times[(i+n)%g.rule.times.length]);
        for(const time of times){const instant=parseSlot(date,time);if(instant&&instant>now&&used.capacity(g.posts,instant,g.rule))return [{g,index,time,instant}];}
        return [];
      });
      if(!eligible.length)break;
      // Variedade orienta a ordem; nunca transforma uma preferência em buraco no calendário diário.
      const chosen=eligible.find(({g})=>{const previous=last.get(editorial(g.posts[0]));return !previous||differenceInCalendarDays(day,toZoned(previous))>=(input.editorialGap?.(editorial(g.posts[0]))??1);})??eligible[0];
      const {g,index,time,instant}=chosen;
      for(const post of g.posts){const suggestion=suggestions.get(post.id),reason=suggestion?.date===date&&suggestion.time===time?suggestion.reason:'Dia e horário definidos pelo padrão do produtor.';rows.push({postId:post.id,date,time,reason:reason??'Padrão do produtor.',rule:g.rule});used.reserve(post,instant);}
      rotation.set(g.posts[0].platform,(rotation.get(g.posts[0].platform)??0)+1);last.set(editorial(g.posts[0]),instant);pending.splice(index,1);
    }
  }
  return {rows,unplaced:pending.flatMap(g=>g.posts.map(p=>({postId:p.id,reason:g.blocked||`Não coube nos dias, horários e limites escolhidos nos próximos ${horizon} dias.`})))};
}

export interface CheckableRow {post:Delivery;date:string;time:string;rule?:DistributionRule;result?:{state:string}}
/** Confere novamente o plano salvo/editado. Linhas confirmadas continuam históricas e não são regravadas. */
export function distributionProblems(rows:CheckableRow[],occupied:Delivery[],now:Date):Map<string,string> {
  const errors=new Map<string,string>(),pending=rows.filter(r=>r.result?.state!=='ok'),ids=new Set(pending.map(r=>r.post.id));
  const used=ledger(occupied.filter(p=>!ids.has(p.id)));
  for(const r of rows.filter(r=>r.result?.state==='ok'))if(!occupied.some(p=>p.id===r.post.id&&deliveryDate(p))){const d=parseSlot(r.date,r.time);if(d)used.reserve(r.post,d);}
  for(const group of deliveryGroups(rows.map(r=>r.post))){
    const members=rows.filter(r=>group.some(p=>p.id===r.post.id));if(!members.some(r=>r.rule?.mirror))continue;
    const slots=new Set(members.map(r=>`${r.date}T${r.time}`));
    for(const p of occupied.filter(p=>!ids.has(p.id)&&groupKey(p)===groupKey(group[0]))){const d=deliveryDate(p);if(d)slots.add(`${dateKey(toZoned(d))}T${timeKey(toZoned(d))}`);}
    if(slots.size>1)for(const r of members)if(r.result?.state!=='ok')errors.set(r.post.id,'As contas espelhadas precisam do mesmo dia e horário. As entregas já confirmadas foram preservadas.');
  }
  const seen=new Set<string>();
  for(const row of pending){
    const id=row.post.id,instant=parseSlot(row.date,row.time),rule=row.rule;
    if(seen.has(id)){errors.set(id,'Esta entrega aparece duas vezes no plano.');continue;}seen.add(id);
    if(errors.has(id))continue;
    if(!instant||instant<=now){errors.set(id,'Escolha uma data e um horário futuros válidos.');continue;}
    if(rule&&(row.date<rule.start_date||!rule.weekdays.includes(toZoned(instant).getDay())||!rule.times.includes(row.time))){errors.set(id,'A data ou o horário não atende às regras deste plano.');continue;}
    if(rule&&!used.capacity([row.post],instant,rule)){errors.set(id,'O limite diário ou semanal desta conta foi atingido.');continue;}
    used.reserve(row.post,instant);
  }
  return errors;
}
