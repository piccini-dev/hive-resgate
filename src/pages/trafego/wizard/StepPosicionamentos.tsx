import { ChoiceCard } from '@/components/campaign/WizardShell';
import { Label } from '@/components/ui/label';
import { type CampaignDraft, type StepProps } from '@/lib/traffic-wizard';

type Fb = CampaignDraft['placements']['facebook'][number];
type Ig = CampaignDraft['placements']['instagram'][number];

const fbOptions: Array<{ value: Fb; label: string }> = [
  { value: 'feed', label: 'Feed' },
  { value: 'story', label: 'Stories' },
  { value: 'facebook_reels', label: 'Reels' },
];
const igOptions: Array<{ value: Ig; label: string }> = [
  { value: 'stream', label: 'Feed' },
  { value: 'story', label: 'Stories' },
  { value: 'reels', label: 'Reels' },
];

export function StepPosicionamentos({ state, onChange }: StepProps) {
  const p = state.draft.placements;
  const set = (placements: CampaignDraft['placements']) => onChange({
    ...state,
    draft: { ...state.draft, placements },
  });

  const toggleFacebook = (selected: Fb) => {
    set({
      ...p,
      facebook: fbOptions
        .map((option) => option.value)
        .filter((value) => value === selected ? !p.facebook.includes(value) : p.facebook.includes(value)),
    });
  };

  const toggleInstagram = (selected: Ig) => {
    set({
      ...p,
      instagram: igOptions
        .map((option) => option.value)
        .filter((value) => value === selected ? !p.instagram.includes(value) : p.instagram.includes(value)),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ChoiceCard
          title="Automáticos"
          description="A Meta escolhe onde o anúncio rende mais."
          badge="Recomendado"
          selected={p.mode === 'auto'}
          testId="traffic-placements-auto"
          onClick={() => set({ ...p, mode: 'auto' })}
        />
        <ChoiceCard
          title="Manuais"
          description="Você escolhe os lugares."
          selected={p.mode === 'manual'}
          testId="traffic-placements-manual"
          onClick={() => set(
            p.facebook.length + p.instagram.length
              ? { ...p, mode: 'manual' }
              : { mode: 'manual', facebook: ['feed'], instagram: ['stream', 'story'] },
          )}
        />
      </div>

      {p.mode === 'manual' && (
        <div className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="font-medium">Facebook</legend>
            {fbOptions.map(({ value, label }) => {
              const id = `traffic-fb-${value}`;
              return (
                <div key={value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    id={id}
                    data-testid={id}
                    checked={p.facebook.includes(value)}
                    onChange={() => toggleFacebook(value)}
                  />
                  <Label htmlFor={id}>{label}</Label>
                </div>
              );
            })}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="font-medium">Instagram</legend>
            {igOptions.map(({ value, label }) => {
              const id = `traffic-ig-${value}`;
              return (
                <div key={value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    id={id}
                    data-testid={id}
                    checked={p.instagram.includes(value)}
                    onChange={() => toggleInstagram(value)}
                  />
                  <Label htmlFor={id}>{label}</Label>
                </div>
              );
            })}
          </fieldset>

          {p.facebook.includes('story') && (
            <p className="text-sm text-muted-foreground">
              Stories do Facebook só aparecem no celular.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
