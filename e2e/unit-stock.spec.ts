import { test, expect } from '@playwright/test';
import { freeDiscoveries, motherStock } from '../src/lib/campaign/stock';
import type { DiscoveryAvailability, DiscoveryState, KnowledgeDiscovery } from '../src/types/discovery';

const M = 'mae-1';
function disc(id: string, over: Partial<KnowledgeDiscovery> = {}): KnowledgeDiscovery {
  return {
    id, user_id: 'u', brand_id: null, document_id: 'doc', title: `Descoberta ${id}`, summary: 'resumo', excerpt: null, kind: 'conceito', tags: [],
    sources: [], status: 'active', content_id: M, chunk_id: null, link_similarity: null,
    created_at: '2026-11-20T10:00:00.000+00:00', updated_at: '2026-11-20T10:00:00.000+00:00', ...over,
  };
}
const av = (id: string, state: DiscoveryState, content_id: string | null = M): DiscoveryAvailability => ({ discovery_id: id, user_id: 'u', content_id, state });

// Estoque vivo (CONTRATO-ESTOQUE §4): material livre, reservado e usado de cada conteúdo-mãe.
test.describe('unit · estoque do conteúdo-mãe', () => {
  test('com material livre o mãe está vivo e conta reservadas e usadas', () => {
    const ds = [disc('a'), disc('b'), disc('c'), disc('d')];
    const s = motherStock(M, ds, [av('a', 'livre'), av('b', 'reservada'), av('c', 'usada'), av('d', 'usada')]);
    expect(s).toEqual({ content_id: M, livres: 1, reservadas: 1, usadas: 2, estado: 'vivo' });
  });

  test('sem livres o mãe está esgotado (inclusive sem material nenhum)', () => {
    expect(motherStock(M, [disc('a')], [av('a', 'usada')]).estado).toBe('esgotado');
    expect(motherStock(M, [], [])).toEqual({ content_id: M, livres: 0, reservadas: 0, usadas: 0, estado: 'esgotado' });
  });

  test('ignora descartadas, material de outro mãe e descoberta sem estado na view', () => {
    const ds = [disc('a', { status: 'dismissed' }), disc('b', { content_id: 'outro' }), disc('c'), disc('d', { status: 'drafted' })];
    const avail = [av('a', 'livre'), av('b', 'livre', 'outro'), av('d', 'livre')];
    expect(motherStock(M, ds, avail)).toEqual({ content_id: M, livres: 1, reservadas: 0, usadas: 0, estado: 'vivo' });
    expect(freeDiscoveries(M, ds, avail).map(d => d.id)).toEqual(['d']);
  });

  test('freeDiscoveries devolve só as livres, da mais antiga para a mais nova', () => {
    const ds = [
      disc('nova', { created_at: '2026-11-22T09:00:00.000+00:00' }),
      disc('usada', { created_at: '2026-11-01T09:00:00.000+00:00' }),
      disc('antiga', { created_at: '2026-11-18T09:00:00.000+00:00' }),
      disc('reservada', { created_at: '2026-11-02T09:00:00.000+00:00' }),
    ];
    const avail = [av('nova', 'livre'), av('usada', 'usada'), av('antiga', 'livre'), av('reservada', 'reservada')];
    expect(freeDiscoveries(M, ds, avail).map(d => d.id)).toEqual(['antiga', 'nova']);
  });
});
