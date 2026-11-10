import { expect, test } from '@playwright/test';
import { requireKnowledgeResponse, resolveBases, type BaseUse, type BaseVersion } from '../src/lib/campaign/base-state';
import type { Content } from '../src/types';

const content = (patch: Partial<Content> = {}): Content => ({
  id: 'base', user_id: 'owner', campaign_id: 'original', cycle_id: 'original-cycle', idea_id: 'original-idea',
  title: 'Pensamento', validation_format: 'knowledge_base', body: { frase: 'Síntese nova', texto: 'Acervo evoluiu' },
  status: 'validated', versions: [], position: 0, metadata: {}, created_at: '2026-11-09', updated_at: '2026-11-09', ...patch,
});
const version = (patch: Partial<BaseVersion> = {}): BaseVersion => ({
  id: 'v1', content_id: 'base', user_id: 'owner', draft_cycle_id: 'original-cycle', ordinal: 1,
  body: { frase: 'Síntese validada', texto: 'Pensamento já aprovado' }, considered: null, context_snapshot_id: null,
  status: 'validated', validated_at: '2026-11-09', created_at: '2026-11-09', note: null, ...patch,
});
const use = (patch: Partial<BaseUse> = {}): BaseUse => ({
  id: 'use', user_id: 'owner', content_id: 'base', version_id: 'v1', campaign_id: 'current', cycle_id: 'cycle', idea_id: 'pauta',
  origin: 'archive', position: 2, content: content(), version: version(), ...patch,
});

test('uso preserva versão validada mesmo que o acervo tenha evoluído (T08/T10)', () => {
  const c = content();
  const [r] = resolveBases([], [use({ content: c })], [], 'cycle');
  expect(r.body.texto).toBe('Pensamento já aprovado');
  expect(r.campaign_id).toBe('current'); expect(r.cycle_id).toBe('cycle'); expect(r.idea_id).toBe('pauta');
  expect(r.metadata).toMatchObject({ base_version_id: 'v1', base_origin: 'archive' });
  expect(c.body.texto).toBe('Acervo evoluiu');
});
test('uma base não aparece duas vezes ao carregar registro original e utilização (T05)', () => {
  expect(resolveBases([content({ cycle_id: 'cycle' })], [use()], [], 'cycle')).toHaveLength(1);
});
test('rascunho de outro ciclo não muda a versão desta campanha (T04/T08)', () => {
  const draft = version({ id: 'draft', status: 'draft', validated_at: null, draft_cycle_id: 'other', body: { texto: 'Outra campanha' } });
  expect(resolveBases([], [use()], [draft], 'cycle')[0].body.texto).toBe('Pensamento já aprovado');
});
test('rascunho local mostra revisão pendente e conserva referência da versão validada (T04)', () => {
  const draft = version({ id: 'draft', ordinal: 2, status: 'draft', validated_at: null, draft_cycle_id: 'cycle', body: { texto: 'Aprofundamento' } });
  const [r] = resolveBases([], [use()], [draft], 'cycle');
  expect(r.status).toBe('pending_validation'); expect(r.body.texto).toBe('Aprofundamento');
  expect(r.metadata).toMatchObject({ base_version_id: 'v1', draft_version_id: 'draft' });
});
test('rascunho substituído não retorna e o mais recente vence sem depender da ordem da resposta (T04)', () => {
  const drafts = [version({ id: 'd2', ordinal: 2, status: 'draft', validated_at: null, draft_cycle_id: 'cycle' }), version({ id: 'old', ordinal: 8, status: 'superseded', validated_at: null, draft_cycle_id: 'cycle' }), version({ id: 'd3', ordinal: 3, status: 'draft', validated_at: null, draft_cycle_id: 'cycle' })];
  const [r] = resolveBases([], [use()], drafts, 'cycle');
  expect(r.metadata.draft_version_id).toBe('d3'); expect(drafts[0].id).toBe('d2');
});
test('referência incoerente falha explicitamente em vez de mostrar outra versão (T03/T13)', () => {
  expect(() => resolveBases([], [use({ version: version({ id: 'other' }) })], [], 'cycle')).toThrow('conferir a versão');
  expect(() => resolveBases([], [use({ version: version({ user_id: 'other' }) })], [], 'cycle')).toThrow('conferir a versão');
});
test('bases legadas validadas permanecem disponíveis sem serem reescritas ou reprovadas (T14/T17)', () => {
  const legacy = content({ cycle_id: 'cycle', validation_format: 'linkedin', body: { texto: 'Legado aprovado' } });
  const result = resolveBases([legacy], [], [], 'cycle');
  expect(result).toEqual([legacy]); expect(result[0].status).toBe('validated');
});
test('resposta do servidor antigo não é aceita silenciosamente como conteúdo-base (T01)', () => {
  expect(() => requireKnowledgeResponse({ frase: 'Post', texto: 'Legenda #tema', meta: {} })).toThrow('servidor');
  expect(() => requireKnowledgeResponse({ frase: 'Síntese', texto: ' ', meta: { purpose: 'knowledge_base' } })).toThrow('completo');
  expect(() => requireKnowledgeResponse({ frase: 'Síntese', texto: 'Argumentos e lacunas', meta: { purpose: 'knowledge_base' } })).not.toThrow();
});


test('contexto exibido acompanha a versão congelada, mesmo quando o acervo muda de perfil', () => {
  const original = content({ context_snapshot_id: 'contexto-atual' });
  const [r] = resolveBases([], [use({ content: original, version: version({ context_snapshot_id: 'contexto-validado' }) })], [], 'cycle');
  expect(r.context_snapshot_id).toBe('contexto-validado');
  const [unknown] = resolveBases([], [use({ content: original, version: version({ context_snapshot_id: null }) })], [], 'cycle');
  expect(unknown.context_snapshot_id).toBeNull();
});

test('rascunho preserva seu contexto sem buscar o perfil atual da base canônica', () => {
  const [r] = resolveBases([], [use({ content: content({ context_snapshot_id: 'contexto-atual' }) })],
    [version({ id: 'draft', status: 'draft', draft_cycle_id: 'cycle', context_snapshot_id: 'contexto-rascunho' })], 'cycle');
  expect(r.context_snapshot_id).toBe('contexto-rascunho');
});
