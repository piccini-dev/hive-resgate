// Política pura: a Hive tenta outro desdobramento antes de devolver um bloqueio ao produtor.
export class ProductionValidationError extends Error {
  readonly status = 422;
}
export class NarrativeOverlapError extends ProductionValidationError {
  constructor(message = 'A Hive ainda não encontrou um desdobramento suficientemente diferente. Ajuste a abordagem ou peça outra proposta; suas bases estão preservadas.', readonly conflicts: NoveltyConflict[] = []) {
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
  let lastOverlap: NarrativeOverlapError | null = null;
  for (let i = 0; i < attempts; i++) {
    const value = await generate(feedback);
    try { await review(value); return value; }
    catch (e) {
      if (!(e instanceof NarrativeOverlapError)) throw e;
      lastOverlap = e;
      feedback = 'A tentativa anterior repetiu uma contribuição já explorada. Preserve a base e a intenção aprovadas, mas desenvolva outro argumento, aplicação ou percurso substantivo. Trocar título, sinônimos ou formato não basta. ' + e.message;
    }
  }
  // Informe a razão concreta da recusa, sem mascarar uma falha repetida.
  throw lastOverlap ?? new NarrativeOverlapError();
}

export interface NoveltyConflict { index: number; against_id?: string; against_index?: number; reason: string }
export function validateNoveltyConflicts(data: unknown, count: number, historyIds: string[]): NoveltyConflict[] {
  const conflicts = (data as { conflicts?: unknown })?.conflicts;
  if (!Array.isArray(conflicts)) throw new ProductionValidationError('A conferência dos recortes não retornou uma lista válida. Tente novamente.');
  return conflicts.map((c) => {
    // O índice da proposta é indispensável: nunca liberar algo que a IA possa ter
    // marcado como repetitivo, mas não conseguimos identificar.
    if (!c || !Number.isInteger(c.index) || c.index < 0 || c.index >= count || typeof c.reason !== 'string' || !c.reason.trim()) {
      throw new ProductionValidationError('A conferência dos recortes não identificou o item corretamente. Tente novamente.');
    }
    // A IA pode inventar um UUID ou uma posição da referência histórica. Nessa
    // situação, a proposta sinalizada é EXCLUÍDA (fail closed), jamais aprovada.
    // Históricos enumerados eliminam a necessidade de copiar UUIDs pelo modelo.
    let against_id = historyIds.includes(c.against_id) ? c.against_id as string : undefined;
    if (!against_id && Number.isInteger(c.against_history_index)
      && c.against_history_index >= 0 && c.against_history_index < historyIds.length) {
      against_id = historyIds[c.against_history_index];
    }
    const against_index = Number.isInteger(c.against_index) && c.against_index >= 0
      && c.against_index < count && c.against_index !== c.index ? c.against_index as number : undefined;
    return {
      index: c.index,
      ...(against_id ? { against_id } : {}),
      ...(against_index !== undefined ? { against_index } : {}),
      reason: c.reason.trim().slice(0, 300),
    };
  });
}

// Nunca aceite uma contribuição apontada como repetitiva pela revisão.
// Para proposta de ciclo, as demais podem seguir como um lote menor e revisável.
export function withoutNoveltyConflicts<T>(items: readonly T[], conflicts: readonly NoveltyConflict[]): T[] {
  const rejected = new Set(conflicts.map(c => c.index));
  return items.filter((_, index) => !rejected.has(index));
}

export function productionCandidateText(post: { caption?: string | null; carousel_text?: { quote?: string } | null }, units: Array<{ title?: string | null; body?: string | null }> = []): string {
  // O roteiro é a fonte da contribuição dos carrosséis/Stories, não só a capa/legenda.
  return [post.carousel_text?.quote, ...units.map(u => [u.title, u.body].filter(Boolean).join('\n')), post.caption].filter(Boolean).join('\n\n');
}

// Ideias são uma proposta para o autor, não posts prontos. A validação semântica
// de repetição é feita depois, sobre o texto COMPLETO, antes da revisão do post.
// Aqui só filtramos opções inexistentes e duplicações exatas de recorte.
export interface ProposedProductionItem {
  content_id: string; platform: string; format: string;
  approach: string; purpose: string; editorial_slug: string;
  template_family: string; architecture: string | null;
}
export interface ProductionChoices {
  baseIds: readonly string[];
  formats: readonly { platform: string; format: string }[];
  families: readonly string[];
  editorialSlugs: readonly string[];
}
export function usableProductionProposals(raw: unknown, choices: ProductionChoices): ProposedProductionItem[] {
  if (!Array.isArray(raw)) return [];
  const bases = new Set(choices.baseIds), families = new Set(choices.families), editorials = new Set(choices.editorialSlugs);
  const formats = new Set(choices.formats.map(f => f.platform + '/' + f.format));
  const seen = new Set<string>(), accepted: ProposedProductionItem[] = [];
  for (const candidate of raw) {
    if (!candidate || typeof candidate !== 'object') continue;
    const p = candidate as Record<string, unknown>;
    const content_id = typeof p.content_id === 'string' ? p.content_id : '';
    const platform = typeof p.platform === 'string' ? p.platform : '';
    const format = typeof p.format === 'string' ? p.format : '';
    const editorial_slug = typeof p.editorial_slug === 'string' ? p.editorial_slug : '';
    const template_family = typeof p.template_family === 'string' ? p.template_family : '';
    const approach = typeof p.approach === 'string' ? p.approach.trim().slice(0, 240) : '';
    const purpose = typeof p.purpose === 'string' ? p.purpose.trim().slice(0, 600) : '';
    if (!bases.has(content_id) || !formats.has(platform+'/'+format) || !families.has(template_family)
      || !editorials.has(editorial_slug) || !approach || !purpose) continue;
    const key = [content_id, platform, format, editorial_slug, approach.toLocaleLowerCase('pt-BR')].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    const architecture = format === 'image' ? null
      : typeof p.architecture === 'string' && ['conceito','perspectiva','historia','experimento'].includes(p.architecture)
        ? p.architecture : 'conceito';
    accepted.push({ content_id, platform, format, approach, purpose, editorial_slug, template_family, architecture });
    if (accepted.length === 40) break;
  }
  return accepted;
}


// A comparação de posts completos deve respeitar a marca que assinou a peça.
// Legacy posts sem perfil/brand atribuível não são tratados automaticamente
// como pertencentes a TODAS as marcas do produtor.
export function scopedPostHistoryQuery(
  userId: string,
  platform: string,
  postId: string,
  profileIds: readonly string[],
): string {
  if (!profileIds.length) throw new ProductionValidationError('A marca não tem perfis de comunicação válidos para conferir a produção.');
  const uuids = /^[a-f\d]{8}-[a-f\d]{4}-[1-8][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
  if (![userId, postId, ...profileIds].every(id=>uuids.test(id))) {
    throw new ProductionValidationError('Não foi possível conferir os perfis da marca para comparar os posts.');
  }
  if (!['instagram','linkedin'].includes(platform)) throw new ProductionValidationError('Plataforma não reconhecida para comparação de posts.');
  return `/user_posts?user_id=eq.${userId}&platform=eq.${platform}&id=neq.${postId}&profile_id=in.(${profileIds.join(',')})&status=in.(draft,pending_approval,approved,scheduled,published)&select=id,platform,caption,carousel_text,metadata&order=created_at.desc&limit=60`;
}

export interface RepeatEvidence { repeat: boolean; against_id?: string; reason?: string }
export function verifiedRepeatEvidence(data: unknown, historyIds: readonly string[]): RepeatEvidence {
  const p = data as Record<string, unknown> | null;
  if (!p || typeof p.repeat !== 'boolean') {
    throw new ProductionValidationError('A verificação de repetição não retornou uma avaliação válida.');
  }
  if (!p.repeat) return { repeat: false };
  const against_id = typeof p.against_id === 'string' ? p.against_id : '';
  const reason = typeof p.reason === 'string' ? p.reason.trim() : '';
  if (!historyIds.includes(against_id) || reason.length < 12) {
    // Não aceitar um booleano sem referência real, nem declarar repetição
    // sem saber qual contribuição foi efetivamente duplicada.
    throw new ProductionValidationError('A verificação sinalizou repetição sem identificar o post e o argumento correspondente.');
  }
  return { repeat: true, against_id, reason: reason.slice(0, 260) };
}
