import type { DistributionPrefs, SocialAccount, UserPost } from '@/types';

export const deliveryRoot = (post: Pick<UserPost,'id'|'metadata'>): string =>
  typeof post.metadata?.delivery_of === 'string' && post.metadata.delivery_of ? post.metadata.delivery_of : post.id;

export function defaultDestinations(platform: string, accounts: SocialAccount[], prefs?: DistributionPrefs | null, campaignAccounts: string[] = []): string[] {
  const compatible = accounts.filter(a=>a.platform===platform&&a.status==='connected');
  const ids = prefs?.default_account_ids ?? (campaignAccounts.length ? campaignAccounts : compatible.map(a=>a.id));
  return compatible.filter(a=>ids.includes(a.id)).map(a=>a.id);
}

/** Agrupa pelo vínculo editorial real, nunca por título ou legenda semelhantes. */
export function deliveryGroups<T extends Pick<UserPost,'id'|'metadata'|'platform'>>(posts: T[], mirror = true): T[][] {
  const groups = new Map<string,T[]>();
  for(const p of posts){const key=mirror?`${deliveryRoot(p)}|${p.platform}`:p.id;groups.set(key,[...(groups.get(key)??[]),p]);}
  return [...groups.values()];
}

export function previewUrls(post: Pick<UserPost,'rendered_slides'>): string[] {
  return Object.entries(post.rendered_slides??{}).sort(([a],[b])=>Number(a.replace('slide',''))-Number(b.replace('slide',''))).map(([,url])=>url).filter(Boolean);
}

/** Colunas para blocos simultâneos: grupos conectados por sobreposição dividem a largura. */
export function calendarPositions<T extends {top:number;height:number}>(items:T[]): Array<T & {lane:number;lanes:number}> {
  const sorted=items.map(item=>({...item,lane:0,lanes:1})).sort((a,b)=>a.top-b.top);
  let cluster:typeof sorted=[],ends:number[]=[],edge=-Infinity;
  function finish(){for(const item of cluster)item.lanes=ends.length;cluster=[];ends=[];}
  for(const item of sorted){
    if(item.top>=edge){finish();edge=-Infinity;}
    let lane=ends.findIndex(end=>end<=item.top);if(lane<0)lane=ends.length;
    item.lane=lane;ends[lane]=item.top+item.height;edge=Math.max(edge,ends[lane]);cluster.push(item);
  }
  finish();return sorted;
}
