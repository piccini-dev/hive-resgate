// Estoque de um conteúdo-mãe: quanto material da Biblioteca ainda não foi usado (contrato §4).
// O estado de cada descoberta vem da view discovery_availability; sem linha na view, não conta.
import type { DiscoveryAvailability, DiscoveryState, KnowledgeDiscovery, MotherStock } from '@/types/discovery';

function ofMother(contentId: string, discoveries: KnowledgeDiscovery[], availability: DiscoveryAvailability[]) {
  const state = new Map<string, DiscoveryState>(availability.map(a => [a.discovery_id, a.state]));
  return discoveries.filter(d => d.content_id === contentId && d.status !== 'dismissed').map(d => ({ d, state: state.get(d.id) }));
}

export function motherStock(contentId: string, discoveries: KnowledgeDiscovery[], availability: DiscoveryAvailability[]): MotherStock {
  const all = ofMother(contentId, discoveries, availability);
  const count = (s: DiscoveryState) => all.filter(x => x.state === s).length;
  const livres = count('livre');
  return { content_id: contentId, livres, reservadas: count('reservada'), usadas: count('usada'), estado: livres > 0 ? 'vivo' : 'esgotado' };
}

export function freeDiscoveries(contentId: string, discoveries: KnowledgeDiscovery[], availability: DiscoveryAvailability[]): KnowledgeDiscovery[] {
  return ofMother(contentId, discoveries, availability).filter(x => x.state === 'livre').map(x => x.d)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}
