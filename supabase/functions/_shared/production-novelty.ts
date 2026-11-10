// Política pura: a Hive tenta outro desdobramento antes de devolver um bloqueio ao produtor.
export class ProductionValidationError extends Error {
  readonly status = 422;
}
export class NarrativeOverlapError extends ProductionValidationError {
  constructor(message = 'A Hive ainda não encontrou um desdobramento suficientemente diferente. Ajuste a abordagem ou peça outra proposta; suas bases estão preservadas.') {
    super(message);
    this.name = 'NarrativeOverlapError';
  }
}

export async function withNovelContribution<T>(
  generate: (feedback: string) => Promise<T>,
  review: (value: T) => Promise<void>,
  attempts = 3,
): Promise<T> {
  let feedback = '';
  for (let i = 0; i < attempts; i++) {
    const value = await generate(feedback);
    try { await review(value); return value; }
    catch (e) {
      if (!(e instanceof NarrativeOverlapError)) throw e;
      feedback = 'A tentativa anterior repetiu uma contribuição já explorada. Preserve a base e a intenção aprovadas, mas desenvolva outro argumento, aplicação ou percurso substantivo. Trocar título, sinônimos ou formato não basta. ' + e.message;
    }
  }
  throw new NarrativeOverlapError();
}

export interface NoveltyConflict { index: number; against_id?: string; against_index?: number; reason: string }
export function validateNoveltyConflicts(data: unknown, count: number, historyIds: string[]): NoveltyConflict[] {
  const conflicts = (data as { conflicts?: unknown })?.conflicts;
  if (!Array.isArray(conflicts)) throw new Error('Não foi possível conferir os recortes propostos. Tente novamente.');
  return conflicts.map((c) => {
    if (!c || !Number.isInteger(c.index) || c.index < 0 || c.index >= count || typeof c.reason !== 'string' || !c.reason.trim()
      || !(historyIds.includes(c.against_id) || (Number.isInteger(c.against_index) && c.against_index >= 0 && c.against_index < count && c.against_index !== c.index))) {
      throw new Error('A conferência dos recortes trouxe uma referência inválida. Tente novamente.');
    }
    return { index: c.index, against_id: c.against_id, against_index: c.against_index, reason: c.reason.trim().slice(0, 300) };
  });
}

export function productionCandidateText(post: { caption?: string | null; carousel_text?: { quote?: string } | null }, units: Array<{ title?: string | null; body?: string | null }> = []): string {
  // O roteiro é a fonte da contribuição dos carrosséis/Stories, não só a capa/legenda.
  return [post.carousel_text?.quote, ...units.map(u => [u.title, u.body].filter(Boolean).join('\n')), post.caption].filter(Boolean).join('\n\n');
}
