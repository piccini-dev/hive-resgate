import type { PiecePlan, PostUnit, UserPost } from '../../types';

export const needsSequenceRender = (u: PostUnit) => !u.rendered_url || u.visual_status !== 'ready' || u.rendered_text_version !== u.text_version;

export function sequenceVisualTodo(pieces: UserPost[], plans: PiecePlan[], units: PostUnit[], batch?: string): UserPost[] {
  if (!batch) return [];
  return pieces.filter(p => p.status === 'pending_approval' && ['carousel','story'].includes(p.format) && p.metadata?.production_batch_id === batch
    && plans.some(pl=>pl.id===p.plan_id&&pl.production_batch_id===batch&&pl.status==='produced')
    && units.some(u=>u.post_id===p.id&&needsSequenceRender(u)));
}

// Mesmo material que o produtor está vendo; a aprovação atômica compara com o servidor.
export function sequenceReviewSnapshot(p: UserPost, units: PostUnit[]) {
  return { version:p.version??1, format:p.format, caption:p.caption??'', units:[...units].sort((a,b)=>a.position-b.position).map(u=>({
    id:u.id,position:u.position,title:u.title??'',body:u.body??'',layout:u.layout,rendered_url:u.rendered_url??null,
    text_version:u.text_version,rendered_text_version:u.rendered_text_version??null,
  })) };
}
