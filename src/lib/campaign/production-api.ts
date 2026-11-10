import { db } from '@/lib/db';
import { cycleApi } from '@/lib/campaignApi';
import { edge } from '@/lib/edge';
import type { CampaignCycle, Content, PiecePlan, UserPost } from '@/types';
import type { ProductionItem, ProductionProposal } from './production-plan';
const contexts = new Map<string,{snapshot_id:string;profile_id:string}>();
export const productionApi = {
  async recommend(cycleId: string): Promise<ProductionProposal> {
    const r = await edge.sequenceScript<ProductionProposal>({ action: 'recommend_cycle_plan', cycle_id: cycleId });
    if (!Array.isArray(r.items) || !r.items.length) throw new Error('A Hive não trouxe uma proposta completa. Suas bases continuam preservadas.');
    return { summary: r.summary ?? '', items: r.items };
  },
  async approve(cycle: CampaignCycle, command: string, bases: Content[], items: ProductionItem[], replace: string[]) {
    const current=await cycleApi.get(cycle.id);
    if(current?.plan?.production?.batch_id===command)return current;
    let context=contexts.get(command);
    if(!context){ context=await edge.sequenceScript<{snapshot_id:string;profile_id:string}>({action:'production_context',cycle_id:cycle.id}); contexts.set(command,context); }
    return db.rpc<CampaignCycle>('approve_cycle_production', {
      p_cycle: cycle.id, p_command: command, p_expected_updated: cycle.updated_at,
      p_bases: bases.filter(c => items.some(p => p.content_id === c.id)).map(c => ({ id: c.id, version_id: c.metadata?.base_version_id ?? null, body: c.body })),
      p_items: items.map(item=>({...item,context_snapshot_id:context!.snapshot_id,profile_id:context!.profile_id})), p_replace: replace,
    });
  },
  reserve(plan: PiecePlan) { return db.rpc<{ piece: UserPost; claim: string | null; done: boolean }>('reserve_production_piece', { p_plan: plan.id }); },
  save(plan: PiecePlan, claim: string, patch: Partial<UserPost>, done = false) {
    return db.rpc<UserPost>('save_production_progress', { p_plan: plan.id, p_claim: claim, p_patch: patch, p_done: done });
  },
  fail(plan: PiecePlan, claim: string, error: string) {
    return db.rpc<UserPost>('save_production_progress', { p_plan: plan.id, p_claim: claim, p_error: error });
  },
};
