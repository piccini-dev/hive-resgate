// Aba "Lições" do Coach: as regras que a IA destilou das correções e conversas.
// As ativas entram no prompt; o Marcos desliga a que não fizer sentido.

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { aiApi } from '@/lib/api';
import type { AiFacet, AiLearning } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function LicoesTab(): JSX.Element {
  const [learnings, setLearnings] = useState<AiLearning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const l = await aiApi.listLearnings();
        setLearnings(l);
      } catch (e) {
        console.error(e);
        toast.error('Falha ao carregar as lições');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function toggle(l: AiLearning) {
    try {
      await aiApi.toggleLearning(l.id, !l.ativo);
      setLearnings((cur) => cur.map((x) => (x.id === l.id ? { ...x, ativo: !x.ativo } : x)));
      toast.success(!l.ativo ? 'Lição religada' : 'Lição desligada — sai do próximo prompt');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao alterar');
    }
  }

  if (loading) {
    return (
      <div className="py-10 text-center">
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ativas = learnings.filter((l) => l.ativo);

  return (
    <div className="space-y-3" data-testid="coach-licoes">
      <p className="text-xs text-muted-foreground">
        Regras destiladas das suas correções e conversas, por faceta. As ativas entram no prompt — desligue a que não fizer sentido.
      </p>
      {learnings.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Nada ainda. As lições aparecem quando você corrige um post ou salva uma proposta na Conversa.
        </p>
      ) : (
        <ul className="space-y-2">
          {learnings.map((l) => (
            <li
              key={l.id}
              className={cn(
                'rounded-md border p-2.5 transition-colors',
                l.ativo ? 'border-border bg-card' : 'border-dashed border-border bg-muted/30',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={cn('text-xs leading-snug', !l.ativo && 'text-muted-foreground line-through')}>
                  {l.texto}
                </p>
                <button
                  onClick={() => void toggle(l)}
                  title={l.ativo ? 'Desligar (sai do prompt)' : 'Religar'}
                  aria-label={l.ativo ? 'Desligar lição' : 'Religar lição'}
                  data-testid="licao-toggle"
                  className={cn(
                    'relative h-4 w-7 shrink-0 rounded-full transition-colors',
                    l.ativo ? 'bg-accent' : 'bg-muted-foreground/30',
                  )}
                >
                  <span className={cn('absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all', l.ativo ? 'left-3.5' : 'left-0.5')} />
                </button>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <FacetBadge facet={l.facet} />
                <Badge variant="secondary" className="text-[9px]">{l.categoria}</Badge>
                {l.evidencias > 1 && (
                  <Badge variant="outline" className="text-[9px]" title="Correções que reforçaram esta regra">
                    reforçada {l.evidencias}x
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        {ativas.length} lição(ões) ativa(s) moldando cada geração
      </p>
    </div>
  );
}

const FACET_META: Record<AiFacet, string> = {
  texto: 'Texto',
  legenda: 'Legenda',
  imagem: 'Imagem',
};

function FacetBadge({ facet }: { facet: AiFacet }) {
  const label = FACET_META[facet];
  const color = facet === 'texto' ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
    : facet === 'legenda' ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
    : 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300';
  return <Badge variant="secondary" className={cn('text-[9px]', color)}>{label}</Badge>;
}
