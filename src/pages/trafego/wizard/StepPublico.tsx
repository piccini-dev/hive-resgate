import { ChoiceCard } from '@/components/campaign/WizardShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type CampaignDraft, type StepProps } from '@/lib/traffic-wizard';

type TargetingDraft = CampaignDraft['targeting'];

export function StepPublico({ state, onChange }: StepProps) {
  const t = state.draft.targeting;
  const setT = (targeting: TargetingDraft) => onChange({ ...state, draft: { ...state.draft, targeting } });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ChoiceCard
          title="Público Advantage+"
          description="A Meta usa o que você escolher como sugestão e amplia para quem tem mais chance de responder."
          badge="Recomendado"
          testId="traffic-adv-on"
          selected={t.advantage_audience}
          onClick={() => setT({ ...t, advantage_audience: true })}
        />
        <ChoiceCard
          title="Só o público escolhido"
          description="A Meta entrega apenas para quem bate com o que você escolher abaixo."
          testId="traffic-adv-off"
          selected={!t.advantage_audience}
          onClick={() => setT({ ...t, advantage_audience: false })}
        />
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="traffic-age-min">Idade mínima</Label>
            <Input
              id="traffic-age-min"
              data-testid="traffic-age-min"
              type="number"
              min={18}
              max={65}
              value={t.age_min}
              onChange={(event) => setT({ ...t, age_min: Number(event.target.value) || 18 })}
            />
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="traffic-age-max">Idade máxima</Label>
            <Input
              id="traffic-age-max"
              data-testid="traffic-age-max"
              type="number"
              min={18}
              max={65}
              value={t.age_max}
              onChange={(event) => setT({ ...t, age_max: Number(event.target.value) || 65 })}
            />
          </div>
        </div>
        {t.advantage_audience && (
          <p className="text-sm text-muted-foreground">
            Com Advantage+, a idade vira sugestão e a mínima vai de 18 a 25.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="traffic-gender">Gênero</Label>
        <Select value={t.genders} onValueChange={(v) => setT({ ...t, genders: v as TargetingDraft['genders'] })}>
          <SelectTrigger id="traffic-gender" data-testid="traffic-gender">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="male">Homens</SelectItem>
            <SelectItem value="female">Mulheres</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
