import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ChoiceCard } from '@/components/campaign/WizardShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { edge } from '@/lib/edge';
import { COUNTRY_NAMES, addInterest, addLocation, removeInterest, removeLocation, type CampaignDraft, type StepProps } from '@/lib/traffic-wizard';

type TargetingDraft = CampaignDraft['targeting'];

function useMetaSearch<T>(q: string, search: (q: string) => Promise<{ items: T[] }>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setItems([]); setError(null); return; }
    let alive = true;
    const timer = setTimeout(async () => {
      setLoading(true); setError(null);
      try { const r = await search(term); if (alive) setItems(r.items); }
      catch (e) { if (alive) setError(e instanceof Error ? e.message : 'erro desconhecido'); }
      finally { if (alive) setLoading(false); }
    }, 350);
    return () => { alive = false; clearTimeout(timer); };
  }, [q, search]);
  return { items, loading, error };
}

export function StepPublico({ state, onChange }: StepProps) {
  const [locQ, setLocQ] = useState('');
  const { items: locations, loading: locLoading, error: locError } = useMetaSearch(locQ, edge.trafficSearchLocations);
  const [intQ, setIntQ] = useState('');
  const { items: interests, loading: intLoading, error: intError } = useMetaSearch(intQ, edge.trafficSearchInterests);
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
        <h2 className="font-display text-lg font-semibold">Locais</h2>
        {t.countries.length + t.regions.length + t.cities.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum local escolhido.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {t.countries.map((c) => {
              const nome = COUNTRY_NAMES[c] ?? c;
              return (
                <span key={'country-' + c} className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border px-3 py-1 text-sm">
                  <span className="min-w-0 break-words">{nome}</span>
                  <button
                    type="button"
                    aria-label={`Remover ${nome}`}
                    data-testid={`traffic-loc-remove-${c}`}
                    onClick={() => setT(removeLocation(t, 'country', c))}
                    className="shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })}
            {t.regions.map((r) => (
              <span key={'region-' + r.key} className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border px-3 py-1 text-sm">
                <span className="min-w-0 break-words">{r.name}</span>
                <button
                  type="button"
                  aria-label={`Remover ${r.name}`}
                  data-testid={`traffic-loc-remove-${r.key}`}
                  onClick={() => setT(removeLocation(t, 'region', r.key))}
                  className="shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {t.cities.map((c) => {
              const nome = `${c.name} (+${c.radius_km ?? 10} km)`;
              return (
                <span key={'city-' + c.key} className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border px-3 py-1 text-sm">
                  <span className="min-w-0 break-words">{nome}</span>
                  <button
                    type="button"
                    aria-label={`Remover ${nome}`}
                    data-testid={`traffic-loc-remove-${c.key}`}
                    onClick={() => setT(removeLocation(t, 'city', c.key))}
                    className="shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="traffic-loc-search">Acrescentar local</Label>
          <Input
            id="traffic-loc-search"
            data-testid="traffic-loc-search"
            placeholder="Buscar país, estado ou cidade"
            value={locQ}
            onChange={(event) => setLocQ(event.target.value)}
          />
        </div>
        {locQ.trim().length >= 2 && (
          <>
            {locLoading && <p className="text-sm text-muted-foreground">Buscando…</p>}
            {locError && <p className="text-sm text-destructive">Não deu para buscar agora: {locError}</p>}
            {!locLoading && !locError && locations.length === 0 && (
              <p className="text-sm text-muted-foreground">Nada encontrado.</p>
            )}
            {!locLoading && !locError && locations.length > 0 && (
              <ul className="space-y-1">
                {locations.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      data-testid={`traffic-loc-${item.key}`}
                      onClick={() => { setT(addLocation(t, item)); setLocQ(''); }}
                      className="w-full min-w-0 rounded-md px-3 py-2 text-left hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span className="block break-words text-sm">{item.name}</span>
                      <span className="block break-words text-xs text-muted-foreground">
                        {item.type === 'country' ? 'País' : item.type === 'region' ? 'Estado' : item.type === 'city' ? 'Cidade' : item.type}
                        {item.region ?? item.country_code ? ` · ${item.region ?? item.country_code}` : ''}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
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
      <div className="space-y-3">
        {t.interests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum interesse: a Meta usa só local, idade e gênero.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {t.interests.map((i) => (
              <span key={i.id} className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border px-3 py-1 text-sm">
                <span className="min-w-0 break-words">{i.name}</span>
                <button
                  type="button"
                  aria-label={`Remover ${i.name}`}
                  data-testid={`traffic-int-remove-${i.id}`}
                  onClick={() => setT(removeInterest(t, i.id))}
                  className="shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="traffic-int-search">Interesses (opcional)</Label>
          <Input
            id="traffic-int-search"
            data-testid="traffic-int-search"
            placeholder="Buscar interesse (ex.: liderança)"
            value={intQ}
            onChange={(event) => setIntQ(event.target.value)}
          />
        </div>
        {intQ.trim().length >= 2 && (
          <>
            {intLoading && <p className="text-sm text-muted-foreground">Buscando…</p>}
            {intError && <p className="text-sm text-destructive">Não deu para buscar agora: {intError}</p>}
            {!intLoading && !intError && interests.length === 0 && (
              <p className="text-sm text-muted-foreground">Nada encontrado.</p>
            )}
            {!intLoading && !intError && interests.length > 0 && (
              <ul className="space-y-1">
                {interests.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      data-testid={`traffic-int-${item.id}`}
                      onClick={() => { setT(addInterest(t, item)); setIntQ(''); }}
                      className="w-full min-w-0 rounded-md px-3 py-2 text-left hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span className="block break-words text-sm">{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
