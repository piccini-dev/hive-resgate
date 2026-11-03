// _shared/olhar-filtro.ts — revisão de nomes do Olhar Bee (proposta, camada 3 de confidencialidade).
//
// Toda leitura do agente público é conferida contra olhar_nomes_proibidos ANTES de
// aparecer ao visitante. Puro (sem Deno): roda na função e nos testes unit-*.
//   exato = true  → palavra inteira, respeitando maiúsculas ("Mar" barra; "mar" não).
//   exato = false → expressão de várias palavras, sem diferenciar maiúsculas nem acentos.

export interface NomeProibido { termo: string; exato: boolean }

const semAcento = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const escapa = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Devolve os termos encontrados (vazio = texto liberado).
export function nomesEncontrados(texto: string, nomes: NomeProibido[]): string[] {
  if (!texto) return [];
  const plano = semAcento(texto);
  const achados = new Set<string>();
  for (const n of nomes) {
    const t = n.termo.trim();
    if (!t) continue;
    if (n.exato) {
      if (new RegExp(`(?<![\\p{L}\\p{N}])${escapa(t)}(?![\\p{L}\\p{N}])`, 'u').test(texto)) achados.add(t);
    } else if (new RegExp(`(?<![\\p{L}\\p{N}])${escapa(semAcento(t))}(?![\\p{L}\\p{N}])`, 'u').test(plano)) {
      achados.add(t);
    }
  }
  return Array.from(achados);
}

// Todo texto visível de uma resposta do contrato (5.1/5.5), para conferir de uma vez.
export function textosVisiveis(resp: Record<string, unknown>): string {
  const out: string[] = [];
  const walk = (v: unknown): void => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => { if (k !== 'href' && k !== 'area_provavel' && k !== 'id') walk(x); });
  };
  walk({ questions: resp.questions, reading: resp.reading, message: resp.message });
  return out.join('\n');
}
