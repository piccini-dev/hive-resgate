import { AlertCircle, Check } from 'lucide-react';

const LABELS = ['Conteúdo', 'Campanha', 'Orçamento', 'Público', 'Posicionamentos', 'Anúncio', 'Revisão'];

// Sete colunas fixas: todas as etapas sempre visíveis, sem rolagem (no celular só os círculos).
export function WizardSteps({ current, problems, disabled, onGoTo }: {
  current: number;                       // 1..7
  problems: Record<number, string[]>;    // problemsByStep(errors)
  disabled: boolean;                     // salvando
  onGoTo: (step: number) => void;
}) {
  return (
    <nav aria-label="Etapas da campanha" data-testid="traffic-steps" className="min-w-0">
      <div className="relative">
        <div aria-hidden="true" className="absolute inset-x-[7%] top-[22px] h-px bg-border" />
        <ol className="relative grid grid-cols-7 gap-1">
          {LABELS.map((label, index) => {
            const n = index + 1;
            const active = n === current;
            const pending = n < current && problems[n].length > 0;
            const completed = n < current && !pending;
            const suffix = active ? ', etapa atual' : pending ? ', com pendência' : completed ? ', concluída' : '';
            return (
              <li key={n} className="min-w-0">
                <button
                  type="button"
                  data-testid={`traffic-step-${n}`}
                  onClick={() => { if (!active) onGoTo(n); }}
                  disabled={disabled}
                  aria-current={active ? 'step' : undefined}
                  aria-label={`${n}. ${label}${suffix}`}
                  title={label}
                  className="group flex min-h-11 w-full flex-col items-center gap-1 rounded-lg py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                >
                  <span className="rounded-full bg-background p-0.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors ${active ? 'bg-accent font-semibold text-accent-foreground' : pending ? 'bg-destructive/15 text-destructive' : completed ? 'bg-accent/30 text-foreground group-hover:bg-accent/50' : 'border border-muted-foreground text-muted-foreground group-hover:border-foreground group-hover:text-foreground'}`}>
                      {active ? n : pending ? <AlertCircle className="h-4 w-4" aria-hidden="true" /> : completed ? <Check className="h-4 w-4" aria-hidden="true" /> : n}
                    </span>
                  </span>
                  <span className={`hidden max-w-full text-center leading-tight lg:block ${active ? 'font-semibold text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <p aria-hidden="true" className="mt-1 text-center text-xs text-muted-foreground lg:hidden">
        Passo {current} de {LABELS.length} · {LABELS[current - 1]}
      </p>
    </nav>
  );
}
