import { db } from '@/lib/db';
import { cycleApi } from '@/lib/campaignApi';
import { edge } from '@/lib/edge';
import { baseApi } from './bases';
import type { CampaignCycle, Content, PiecePlan, UserPost } from '@/types';
import type { ProductionItem, ProductionProposal } from './production-plan';
const contexts = new Map<string,{snapshot_id:string;profile_id:string}>();
export const productionApi = {
  // stock = fluxo do estoque vivo: a Hive escolhe os mães e o material de cada peça.
  async recommend(cycleId: string, stock = false): Promise<ProductionProposal> {
    const r = await edge.sequenceScript<ProductionProposal>({ action: 'recommend_cycle_plan', cycle_id: cycleId, ...(stock ? { stock: true } : {}) });
    if (!Array.isArray(r.items) || !r.items.length) throw new Error('A Hive não trouxe uma proposta completa. Suas bases continuam preservadas.');
    return { summary: r.summary ?? '', items: r.items.map(i => ({ ...i, discovery_ids: i.discovery_ids ?? [] })) };
  },
  async approve(cycle: CampaignCycle, command: string, bases: Content[], items: ProductionItem[], replace: string[]) {
    const current=await cycleApi.get(cycle.id);
    if(current?.plan?.production?.batch_id===command)return current;
    let context=contexts.get(command);
    if(!context){ context=await edge.sequenceScript<{snapshot_id:string;profile_id:string}>({action:'production_context',cycle_id:cycle.id}); contexts.set(command,context); }
    const chosen = bases.filter(c => items.some(p => p.content_id === c.id));
    // Mãe escolhido do estoque entra no ciclo antes da aprovação; quem já está mantém a versão adotada.
    const uses = await db.select<{ content_id: string }>('content_base_uses', { cycle_id: `eq.${cycle.id}`, select: 'content_id' });
    for (const c of chosen) {
      const version = c.metadata?.base_version_id as string | undefined;
      if (version && !uses.some(u => u.content_id === c.id)) await baseApi.adopt(version, cycle.id);
    }
    return db.rpc<CampaignCycle>('approve_cycle_production', {
      p_cycle: cycle.id, p_command: command, p_expected_updated: cycle.updated_at,
      p_bases: chosen.map(c => ({ id: c.id, version_id: c.metadata?.base_version_id ?? null, body: c.body })),
      p_items: items.map(item=>({...item,discovery_ids:item.discovery_ids??[],context_snapshot_id:context!.snapshot_id,profile_id:context!.profile_id})), p_replace: replace,
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
