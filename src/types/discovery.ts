// Estoque vivo: descobertas da Biblioteca e o material de cada conteúdo-mãe.
// Contrato em docs/plano/CONTRATO-ESTOQUE.md.
export type DiscoveryKind = 'caso' | 'conceito' | 'pergunta' | 'dado' | 'historia' | 'pratica';
export type DiscoveryStatus = 'active' | 'dismissed' | 'drafted';
export type DiscoveryState = 'livre' | 'reservada' | 'usada';

export interface DiscoverySource { document_id: string; chunk_id: string | null; chunk_index: number | null; title: string }

export interface KnowledgeDiscovery {
  id: string; user_id: string; brand_id: string | null; document_id: string | null;
  title: string; summary: string; excerpt: string | null; kind: DiscoveryKind | null; tags: string[];
  sources: DiscoverySource[]; status: DiscoveryStatus; content_id: string | null; chunk_id: string | null;
  link_similarity: number | null; created_at: string; updated_at: string;
}

export interface DiscoveryAvailability { discovery_id: string; user_id: string; content_id: string | null; state: DiscoveryState }

export interface MotherStock { content_id: string; livres: number; reservadas: number; usadas: number; estado: 'vivo' | 'esgotado' }

export interface ScanResult { success: boolean; processed: number; found: number; linked: number; proposed: number }
