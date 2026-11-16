import { Eye, Heart, MousePointerClick } from 'lucide-react';
import { ChoiceCard } from '@/components/campaign/WizardShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OBJECTIVE_LABELS, type Objective, type StepProps } from '@/lib/traffic-wizard';

const objectives = Object.keys(OBJECTIVE_LABELS) as Objective[];

export function StepCampanha({ state, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {objectives.map((o) => (
          <ChoiceCard
            key={o}
            title={OBJECTIVE_LABELS[o].title}
            description={OBJECTIVE_LABELS[o].description}
            selected={state.objective === o}
            testId={`traffic-objective-${o}`}
            icon={o === 'OUTCOME_AWARENESS' ? <Eye className="h-5 w-5" /> : o === 'OUTCOME_TRAFFIC' ? <MousePointerClick className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
            onClick={() => onChange({ ...state, objective: o, draft: { ...state.draft, optimization_goal: undefined } })}
          />
        ))}
      </div>
      {state.objective === 'OUTCOME_TRAFFIC' && (
        <p data-testid="traffic-objective-link-note" className="text-sm text-muted-foreground">
          Em Tráfego, cada anúncio precisa de um link. Você informa no passo Anúncio.
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="traffic-name">Nome da campanha</Label>
        <Input
          id="traffic-name"
          data-testid="traffic-name"
          maxLength={120}
          placeholder="Ex.: Liderança · novembro"
          value={state.name}
          onChange={(e) => onChange({ ...state, name: e.target.value })}
        />
        <p className="text-sm text-muted-foreground">Aparece no Gerenciador de Anúncios da Meta.</p>
      </div>
    </div>
  );
}
