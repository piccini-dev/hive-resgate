import { db } from '@/lib/db';
import { contentApi } from '@/lib/campaignApi';
import type { Content, ContentBody } from '@/types';
import { resolveBases, type BaseUse, type BaseVersion } from './base-state';
export type { BaseVersion } from './base-state';
export const baseApi = {
  async listByCycle(cycleId: string): Promise<Content[]> {
    const [originals, uses, drafts] = await Promise.all([
      contentApi.listByCycle(cycleId),
      db.select<BaseUse>('content_base_uses', { cycle_id: `eq.${cycleId}`, select: '*,content:contents(*),version:content_base_versions(*)', order: 'position.asc' }),
      db.select<BaseVersion>('content_base_versions', { draft_cycle_id: `eq.${cycleId}`, status: 'eq.draft', order: 'ordinal.desc' }),
    ]);
    return resolveBases(originals, uses, drafts, cycleId);
  },
  async archive(): Promise<Array<{ content: Content; version: BaseVersion | null }>> {
    const [contents, versions] = await Promise.all([
      contentApi.listAll(), db.select<BaseVersion>('content_base_versions', { status: 'eq.validated', order: 'ordinal.desc' }),
    ]);
    return contents.filter((c) => c.status === 'validated').map((c) => ({ content: c, version: versions.find((v) => v.content_id === c.id) ?? null }));
  },
  async validate(content: Content): Promise<Content> {
    if (!content.cycle_id) throw new Error('Selecione o ciclo de utilização da base.');
    const r = await db.rpc<{ content: Content; version: BaseVersion }>('validate_content_base', {
      p_content: content.id, p_cycle: content.cycle_id, p_draft: content.metadata?.draft_version_id ?? null, p_expected_body: content.body,
    });
    return { ...r.content, campaign_id: content.campaign_id, cycle_id: content.cycle_id, body: r.version.body, considered: r.version.considered, status: 'validated',
      metadata: { ...r.content.metadata, base_version_id: r.version.id, draft_version_id: null } };
  },
  async saveDraft(content: Content, body: ContentBody, note: string, considered?: Content['considered']): Promise<Content> {
    if (!content.cycle_id) throw new Error('Selecione o ciclo de utilização da base.');
    const draft = await db.rpc<BaseVersion>('save_base_draft', {
      p_content: content.id, p_cycle: content.cycle_id, p_body: body, p_note: note,
      p_expected_draft: content.metadata?.draft_version_id ?? null, p_expected_updated: content.updated_at, p_considered: considered ?? content.considered ?? null,
    });
    return { ...content, body: draft.body, status: 'pending_validation', metadata: { ...content.metadata, draft_version_id: draft.id } };
  },
  async adopt(versionId: string, cycleId: string, ideaId?: string) {
    return db.rpc<BaseUse>('adopt_content_base', { p_version: versionId, p_cycle: cycleId, p_idea: ideaId ?? null });
  },
};
