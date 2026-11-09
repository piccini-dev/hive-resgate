import { edge } from '@/lib/edge';
import { aiApi } from '@/lib/api';
import { db } from '@/lib/db';
import { renderPiece } from './produce';
import { productionApi } from './production-api';
import type { PiecePlan, UserPost } from '@/types';
export async function producePlannedPiece(userId: string,plan: PiecePlan): Promise<UserPost> {
  const r=await productionApi.reserve(plan);
  if(r.done || !r.claim) return r.piece;
  const claim=r.claim;
  let p=r.piece;
  try {
    if(plan.format==='image') {
      if(!p.caption?.trim() || !p.carousel_text?.quote) {
        const text=await edge.sequenceScript<{quote:string;caption:string}>({action:'image',post_id:p.id,generation_claim:claim});
        p=await productionApi.save(plan,claim,{caption:text.caption,carousel_text:{quote:text.quote}});
      }
      // A post has its own pristine variation; base development does not pollute this learning.
      const existing=await db.select<{id:string}>('ai_variations',{post_id:`eq.${p.id}`,select:'id',limit:'1'});
      if(!existing.length){
        try{
          const generation=await aiApi.createGeneration({editorial_slug:plan.editorial_slug??undefined,platform:plan.platform,target_avatar:'ambos',briefing:`${plan.approach} — ${plan.purpose}`,variations_count:1});
          const [variation]=await aiApi.createVariations(generation.id,[{idx:0,quote:String(p.carousel_text?.quote??''),caption:p.caption??''}]);
          if(variation)await aiApi.linkVariationToPost(variation.id,p.id);
        }catch(e){console.warn('Não foi possível registrar a amostra de aprendizado.',e);}
      }
      if(!p.rendered_slides?.slide1) {
        const visual=await renderPiece(userId,p,{persist:false});
        p=await productionApi.save(plan,claim,{rendered_slides:visual.rendered_slides,carousel_fabric_json:visual.carousel_fabric_json,visual_decision:visual.visual_decision});
      }
      return productionApi.save(plan,claim,{},true);
    }
    await edge.sequenceScript({action:'script',post_id:p.id,generation_claim:claim});
    return (await db.selectOne<UserPost>('user_posts',{id:`eq.${p.id}`}))??p;
  } catch(e) {
    await productionApi.fail(plan,claim,(e as Error).message).catch(()=>{});
    throw e;
  }
}
