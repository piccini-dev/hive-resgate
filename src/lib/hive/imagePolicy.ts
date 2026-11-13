/** Política editorial das fotos de biblioteca; nunca muda uma peça já composta. */
export type PhotoUsage = 'reference_only' | 'reusable';
export const photoUsage = (semantic?: Record<string, unknown> | null): PhotoUsage =>
  semantic?.usage_policy === 'reference_only' ? 'reference_only' : 'reusable';
const identity = (url: string) => url.split(/[?#]/)[0];

export function requireNewImage(url: string | null | undefined, previous?: string | null, references: string[] = []): string {
  if (!url) throw new Error('A Hive não conseguiu gerar uma nova imagem. A imagem atual permanece salva.');
  if ([previous, ...references].some(old => old && identity(old) === identity(url)))
    throw new Error('A Hive devolveu uma imagem já existente. A proposta não foi aplicada. Peça uma nova geração ou escolha outro formato.');
  return url;
}

export function generationUnavailable(status: 'needs_real_photo' | 'no_approved_style', reason: string): Error {
  return new Error(status === 'needs_real_photo'
    ? `Este pedido precisa de uma foto real; a Hive não vai fabricar essa evidência. ${reason}`.trim()
    : `Ainda não há estilo fotográfico aprovado para gerar esta imagem. Revise os estilos em Templates → Fotos e geração. ${reason}`.trim());
}
