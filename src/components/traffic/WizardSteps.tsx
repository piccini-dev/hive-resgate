import { useEffect, useRef, Fragment } from 'react';
import { AlertCircle, Check } from 'lucide-react';

const LABELS = ['Conteúdo', 'Campanha', 'Orçamento', 'Público', 'Posicionamentos', 'Anúncio', 'Revisão'];

export function WizardSteps({ current, problems, disabled, onGoTo }: {
  current: number;                       // 1..7
  problems: Record<number, string[]>;    // problemsByStep(errors)
  disabled: boolean;                     // salvando
  onGoTo: (step: number) => void;
}) {
  const currentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [current]);

  return (
    <nav aria-label="Etapas da campanha" data-testid="traffic-steps" className="min-w-0">
      <ol className="flex items-center gap-1 overflow-x-auto pb-1">
        {LABELS.map((label, index) => {
          const n = index + 1;
          const active = n === current;
          const pending = n < current && problems[n].length > 0;
          const completed = n < current && !pending;
          const suffix = active ? ', etapa atual' : pending ? ', com pendência' : completed ? ', concluída' : '';
          return (
            <Fragment key={n}>
              {n > 1 && <li aria-hidden="true" className="h-px w-3 shrink-0 bg-border sm:w-6" />}
              <li className="shrink-0">
                <button
                  type="button"
                  ref={active ? currentRef : undefined}
                  data-testid={`traffic-step-${n}`}
                  onClick={() => { if (!active) onGoTo(n); }}
                  disabled={disabled}
                  aria-current={active ? 'step' : undefined}
                  aria-label={`${n}. ${label}${suffix}`}
                  className={`flex items-center gap-2 rounded-full px-2 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 ${active ? 'bg-accent/15 font-semibold text-foreground' : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'}`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${active ? 'bg-accent text-accent-foreground' : pending ? 'bg-destructive/15 text-destructive' : completed ? 'bg-accent/30 text-foreground' : 'border border-muted-foreground/50'}`}>
                    {active ? n : pending ? <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> : completed ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : n}
                  </span>
                  <span className={active ? '' : 'hidden sm:inline'}>{label}</span>
                </button>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
