import type { Content, FormatCapability, PieceFormat, PiecePlan, UserPost } from '@/types';
export type TemplateFamily = 'M01' | 'M02' | 'M03';
export interface ProductionItem {
  content_id: string; platform: 'instagram' | 'linkedin'; format: PieceFormat; approach: string; purpose: string;
  architecture: string | null; template_family: TemplateFamily; editorial_slug: string;
}
export interface ProductionProposal { summary: string; items: ProductionItem[] }
// These labels describe the existing compositors/recipes, rather than renamed registry headings.
export const FAMILY_LABELS: Record<TemplateFamily, string> = { M01: 'M01 · Texto e atmosfera', M02: 'M02 · Presença e fotografia', M03: 'M03 · Relações e mapas conceituais' };
export function productionProblems(items: ProductionItem[], bases: Content[], caps: FormatCapability[], families: string[], editorials: string[]): string[] {
  const errors: string[] = [];
  if (!items.length || items.length > 40) errors.push('Selecione de 1 a 40 peças.');
  const seen = new Set<string>();
  items.forEach((p, i) => {
    const prefix = `Peça ${i + 1}: `;
    if (!bases.some(c => c.id === p.content_id && c.status === 'validated')) errors.push(prefix + 'escolha uma base validada.');
    if (!caps.some(c => c.platform === p.platform && c.format === p.format) || p.format === 'reel') errors.push(prefix + 'formato ainda sem produção disponível.');
    if (!families.includes(p.template_family)) errors.push(prefix + 'família visual indisponível nesta marca.');
    if (!editorials.includes(p.editorial_slug)) errors.push(prefix + 'escolha uma editoria disponível.');
    if (!p.approach.trim() || !p.purpose.trim()) errors.push(prefix + 'explique a abordagem e o propósito.');
    const key = [p.content_id, p.platform, p.format, p.editorial_slug, p.approach.trim().toLowerCase()].join('|');
    if (seen.has(key)) errors.push(prefix + 'repete a mesma abordagem de outra peça. Diferencie sua contribuição.');
    seen.add(key);
  });
  return errors;
}
export const pendingProduction = (pieces: UserPost[]) => pieces.filter(p => ['idea', 'draft', 'pending_approval'].includes(p.status) && !p.metadata?.delivery_of);
export const editorialPieces = (pieces: UserPost[]) => pieces.filter(p => !p.metadata?.delivery_of);
export const samePlan = (a: ProductionItem[], b: ProductionItem[]) => JSON.stringify(a) === JSON.stringify(b);
export const canReviewProduction = (piece: UserPost, plans: PiecePlan[], batch?: string): boolean => !batch || ['approved','scheduled','published'].includes(piece.status)
  || plans.some(p=>p.id===piece.plan_id && p.production_batch_id===batch && p.status==='produced');
