import type { Content, ContentBody } from '@/types';

export interface BaseVersion {
  id: string; content_id: string; user_id: string; draft_cycle_id: string | null; ordinal: number;
  body: ContentBody; considered: Content['considered']; context_snapshot_id: string | null;
  status: 'draft' | 'validated' | 'superseded'; created_at: string; validated_at: string | null; note: string | null;
}
export interface BaseUse {
  id: string; user_id: string; content_id: string; version_id: string; campaign_id: string; cycle_id: string; idea_id: string | null;
  origin: 'new' | 'archive' | 'legacy'; position: number; content: Content; version: BaseVersion;
}

// Uma utilização lê sua versão congelada, mesmo que o acervo tenha evoluído.
// Rascunho de outro ciclo não altera o trabalho que o produtor está revisando.
export function resolveBases(originals: Content[], uses: BaseUse[], drafts: BaseVersion[], cycleId: string): Content[] {
  const all = new Map(originals.filter((c) => c.cycle_id === cycleId).map((c) => [c.id, c]));
  for (const u of uses.filter((x) => x.cycle_id === cycleId)) {
    if (!u.content || !u.version || u.version.status !== 'validated' || u.version.content_id !== u.content_id || u.version.id !== u.version_id || u.content.user_id !== u.user_id || u.version.user_id !== u.user_id) throw new Error('Não foi possível conferir a versão utilizada nesta campanha.');
    all.set(u.content_id, {
      ...u.content, campaign_id: u.campaign_id, cycle_id: u.cycle_id, idea_id: u.idea_id ?? u.content.idea_id,
      body: u.version.body, considered: u.version.considered, status: 'validated', position: u.position,
      metadata: { ...u.content.metadata, base_version_id: u.version_id, base_origin: u.origin, base_use_id: u.id },
    });
  }
  return [...all.values()].map((c) => {
    const d = drafts.filter((v) => v.content_id === c.id && v.draft_cycle_id === cycleId && v.status === 'draft').sort((a, b) => b.ordinal - a.ordinal)[0];
    return d ? { ...c, body: d.body, considered: d.considered ?? c.considered, status: 'pending_validation' as const, metadata: { ...c.metadata, draft_version_id: d.id } } : c;
  }).sort((a, b) => a.position - b.position);
}

export function requireKnowledgeResponse(r: { meta?: { purpose?: string }; frase?: string; texto?: string }): void {
  if (r.meta?.purpose !== 'knowledge_base') throw new Error('O servidor de conteúdos-base precisa ser atualizado antes de continuar. Seu trabalho já salvo permanece preservado.');
  if (!r.frase?.trim() || !r.texto?.trim()) throw new Error('A Hive não retornou um desenvolvimento completo.');
}
