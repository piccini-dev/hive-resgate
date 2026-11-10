// Desenvolvimento de conhecimento. Revisões da base são versionadas no acervo;
// aprendizado de post e variações visuais pertencem à produção das peças.
import { edge } from '@/lib/edge';
import { contentApi, cycleApi, ideaApi } from '@/lib/campaignApi';
import { baseApi } from './bases';
import { requireKnowledgeResponse } from './base-state';
import type {
  Campaign, CampaignCycle, Content, ContentBody, Idea, UserPost,
} from '@/types';

// Desenvolve em paralelo (3 por vez) as ideias aprovadas que ainda não têm conteúdo.
export async function developIdeas(
  cycle: CampaignCycle, ideas: Idea[], existing: Content[],
  onProgress?: (done: number, total: number, content?: Content) => void,
): Promise<{ contents: Content[]; cycle: CampaignCycle }> {
  const todo = ideas.filter((i) => i.status === 'approved' && !existing.some((c) => c.idea_id === i.id));
  const updatedCycle = cycle.status === 'pauta_approved' ? await cycleApi.update(cycle.id, { status: 'developing' }) : cycle;
  const created: Content[] = [];
  let done = 0;
  const queue = [...todo];
  async function worker() {
    while (queue.length) {
      const idea = queue.shift()!;
      if (idea.source_base_version_id) {
        await baseApi.adopt(idea.source_base_version_id, cycle.id, idea.id);
        const reused = (await baseApi.listByCycle(cycle.id)).find((c) => c.idea_id === idea.id);
        if (!reused) throw new Error('Não foi possível recuperar a base selecionada.');
        created.push(reused); done++; onProgress?.(done, todo.length, reused); continue;
      }
      const r = await edge.contentDevelop({ idea_id: idea.id, mode: 'develop', purpose: 'knowledge_base' });
      requireKnowledgeResponse(r);
      const content = await contentApi.create({
        idea_id: idea.id, campaign_id: cycle.campaign_id, cycle_id: cycle.id,
        validation_format: 'knowledge_base', title: idea.title, strategic_function: idea.strategic_function ?? null, editorial_slug: idea.editorial_slug ?? null,
        // Perfil/contexto: as peças herdam (trigger) e QA/edições usam o mesmo snapshot.
        ...(r.context ? { profile_id: r.context.profile_id, context_snapshot_id: r.context.snapshot_id } : {}),
        body: { frase: r.frase, texto: r.texto }, considered: r.considered, status: 'pending_validation',
        versions: [{ at: new Date().toISOString(), body: { frase: r.frase, texto: r.texto }, note: 'Hive' }],
        position: idea.position,
        metadata: {
          purpose: 'knowledge_base', sources: r.meta.sources ?? [], gaps: r.meta.gaps ?? [],
        },
      });
      await ideaApi.update(idea.id, { status: 'developed' });
      created.push(content);
      done++;
      onProgress?.(done, todo.length, content);
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, todo.length) }, worker));
  return { contents: created, cycle: updatedCycle };
}

// Ajustar a base cria rascunho versionado; a versão em uso permanece congelada.
export async function reviseWithHive(content: Content, idea: Idea, mode: 'adjust' | 'new_version', instruction?: string): Promise<Content> {
  const r = await edge.contentDevelop({ idea_id: idea.id, content_id: content.id, mode, current: content.body, instruction, purpose: 'knowledge_base' });
  requireKnowledgeResponse(r);
  const body = { frase: r.frase, texto: r.texto };
  const draft = await baseApi.saveDraft(content, body, mode === 'adjust' ? `Ajuste: ${instruction}` : 'Nova versão com a Hive', r.considered);
  return { ...draft, considered: r.considered, metadata: { ...draft.metadata, purpose: 'knowledge_base', sources: r.meta.sources ?? [], gaps: r.meta.gaps ?? [] } };
}

// Edição humana cria rascunho, sem sobrescrever a base já utilizada.
export async function editContent(content: Content, body: ContentBody): Promise<Content> {
  return baseApi.saveDraft(content, body, 'Edição manual');
}

// O codigo BEE-DDMMAA-G{n}-D{n} é gerado no banco (trigger) — único mesmo em paralelo.

// Validação do conhecimento: servidor versiona a base; nenhuma peça é criada.
export async function validateContent(
  content: Content, _idea: Idea | undefined, _campaign: Campaign, _editorialName?: string,
): Promise<{ content: Content; piece: UserPost | null }> {
  return { content: await baseApi.validate(content), piece: null };
}

export async function discardContent(content: Content): Promise<Content> {
  if (content.idea_id) await ideaApi.update(content.idea_id, { status: 'discarded' });
  return contentApi.update(content.id, { status: 'discarded' });
}

export async function finishValidation(cycle: CampaignCycle): Promise<CampaignCycle> {
  return cycleApi.update(cycle.id, { status: 'producing' });
}
