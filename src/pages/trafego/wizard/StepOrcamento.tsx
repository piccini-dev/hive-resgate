import { ChoiceCard } from '@/components/campaign/WizardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  addDays, budgetTotal, dayToEndIso, dayToStartIso, isoToDay, spDay,
  type CampaignDraft, type StepProps,
} from '@/lib/traffic-wizard';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function StepOrcamento({ state, onChange }: StepProps) {
  const d = state.draft;
  const set = (patch: Partial<CampaignDraft>) => onChange({ ...state, draft: { ...d, ...patch } });
  const { total, days } = budgetTotal(d);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ChoiceCard
          title="Diário"
          description="Um valor por dia. Pode ficar sem término."
          selected={d.budget_type === 'daily'}
          testId="traffic-budget-daily"
          onClick={() => set({ budget_type: 'daily' })}
        />
        <ChoiceCard
          title="Total"
          description="Um valor para o período inteiro. Precisa de término."
          selected={d.budget_type === 'lifetime'}
          testId="traffic-budget-lifetime"
          onClick={() => set({
            budget_type: 'lifetime',
            ends_at: d.ends_at ?? dayToEndIso(addDays(isoToDay(d.starts_at) || spDay(), 6)),
          })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="traffic-amount">
          {d.budget_type === 'daily' ? 'Valor por dia (R$)' : 'Valor total (R$)'}
        </Label>
        <Input
          id="traffic-amount"
          data-testid="traffic-amount"
          type="number"
          inputMode="decimal"
          min={1}
          step={1}
          value={d.amount || ''}
          onChange={(e) => set({ amount: Number(e.target.value) || 0 })}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="traffic-start">Início</Label>
          <Input
            id="traffic-start"
            data-testid="traffic-start"
            type="date"
            min={spDay()}
            value={isoToDay(d.starts_at)}
            onChange={(e) => {
              const v = e.target.value;
              set({ starts_at: v ? dayToStartIso(v) : '' });
            }}
          />
        </div>

        <div className="min-w-0 space-y-2">
          {d.ends_at !== null ? (
            <>
              <Label htmlFor="traffic-end">Término</Label>
              <Input
                id="traffic-end"
                data-testid="traffic-end"
                type="date"
                min={isoToDay(d.starts_at) || spDay()}
                value={isoToDay(d.ends_at)}
                onChange={(e) => {
                  const v = e.target.value;
                  set({ ends_at: v ? dayToEndIso(v) : '' });
                }}
              />
              {d.budget_type === 'daily' && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  data-testid="traffic-no-end"
                  onClick={() => set({ ends_at: null })}
                >
                  Sem data de término
                </Button>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Sem término: roda até você pausar.</p>
              <Button
                type="button"
                variant="link"
                size="sm"
                data-testid="traffic-pick-end"
                onClick={() => set({ ends_at: dayToEndIso(addDays(isoToDay(d.starts_at) || spDay(), 6)) })}
              >
                Escolher término
              </Button>
            </>
          )}
        </div>
      </div>

      <div data-testid="traffic-budget-summary" className="rounded-xl border bg-card p-4 text-sm">
        <p>
          {d.budget_type === 'daily'
            ? total !== null
              ? `Até ${brl(total)} em ${days} dias.`
              : `${brl(d.amount)} por dia, até você pausar.`
            : `Até ${brl(d.amount)} no período.`}
        </p>
        <p className="mt-2 text-muted-foreground">
          A campanha nasce pausada: nada é gasto até você ativar, e o teto mensal da configuração vale sempre.
        </p>
      </div>
    </div>
  );
}
