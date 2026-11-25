// Estoque vivo: descobertas da Biblioteca (contrato em docs/plano/CONTRATO-ESTOQUE.md §4).
import { db } from '@/lib/db';
import { edge } from '@/lib/edge';
import type { DiscoveryAvailability, DiscoveryStatus, KnowledgeDiscovery, ScanResult } from '@/types/discovery';

export const discoveryApi = {
  // loose = soltas: ativas e ainda sem conteúdo-mãe.
  async list(filter: { content_id?: string | null; document_id?: string; status?: DiscoveryStatus; loose?: boolean } = {}): Promise<KnowledgeDiscovery[]> {
    const params: Record<string, string> = { order: 'created_at.desc' };
    if (filter.content_id === null || filter.loose) params.content_id = 'is.null';
    else if (filter.content_id) params.content_id = `eq.${filter.content_id}`;
    if (filter.document_id) params.document_id = `eq.${filter.document_id}`;
    const status = filter.status ?? (filter.loose ? 'active' : undefined);
    if (status) params.status = `eq.${status}`;
    return db.select<KnowledgeDiscovery>('knowledge_discoveries', params);
  },
  async availability(): Promise<DiscoveryAvailability[]> {
    return db.select<DiscoveryAvailability>('discovery_availability');
  },
  async dismiss(id: string): Promise<void> {
    await db.update('knowledge_discoveries', { id: `eq.${id}` }, { status: 'dismissed', updated_at: new Date().toISOString() });
  },
  async update(id: string, patch: { title?: string; tags?: string[]; content_id?: string | null }): Promise<KnowledgeDiscovery> {
    const rows = await db.update<KnowledgeDiscovery>('knowledge_discoveries', { id: `eq.${id}` }, { ...patch, updated_at: new Date().toISOString() });
    if (!rows[0]) throw new Error('Descoberta não encontrada');
    return rows[0];
  },
  async scanNow(documentId: string): Promise<ScanResult> {
    return edge.libraryScan({ action: 'scan', document_id: documentId });
  },
  async proposeMothers(): Promise<ScanResult> {
    return edge.libraryScan({ action: 'propose_mothers' });
  },
};
