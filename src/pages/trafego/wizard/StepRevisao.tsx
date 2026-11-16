import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { edge } from '@/lib/edge';
import {
  COUNTRY_NAMES, CTA_LABELS, OBJECTIVE_LABELS, budgetTotal, draftErrors, isoToDay, stepOfError,
  type StepProps,
} from '@/lib/traffic-wizard';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const ddmm = (day: string) => day ? day.split('-').reverse().slice(0, 2).join('/') : '';

export function StepRevisao({ state, posts, onGoTo, onCreated }: StepProps) {
  const errors = useMemo(() => draftErrors(state, posts), [state, posts]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function criar() {
    setCreating(true); setError(null);
    try {
      await edge.trafficCreate(state.id);
      toast.success('Campanha criada na Meta, pausada. Ative quando quiser em Campanhas.');
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar na Meta.');
    } finally {
      setCreating(false);
    }
  }

  const d = state.draft;
  const t = d.targeting;
  const placements = d.placements;
  const total = budgetTotal(d).total;
  const locations = [
    ...t.countries.map((c) => COUNTRY_NAMES[c] ?? c),
    ...t.regions.map((r) => r.name),
    ...t.cities.map((c) => c.name),
  ].join(', ');
  const facebook = placements.facebook.map((pos) =>
    pos === 'feed' ? 'Feed' : pos === 'story' ? 'Stories' : 'Reels'
  ).join(', ');
  const instagram = placements.instagram.map((pos) =>
    pos === 'stream' ? 'Feed' : pos === 'story' ? 'Stories' : 'Reels'
  ).join(', ');

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display font-semibold">Conteúdo</h2>
          <Button variant="ghost" size="sm" data-testid="traffic-review-edit-1" onClick={() => onGoTo(1)}>Editar</Button>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {state.ads.map((ad, index) => (
            <div key={index} className="min-w-0 break-words">
              <p>{posts.find((post) => post.id === ad.post_id)?.title || 'Peça que saiu da aprovação'}</p>
              <p className="text-muted-foreground">{ad.mode === 'ig_post' ? 'post do Instagram' : 'anúncio com a arte'}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display font-semibold">Campanha</h2>
          <Button variant="ghost" size="sm" data-testid="traffic-review-edit-2" onClick={() => onGoTo(2)}>Editar</Button>
        </div>
        <div className="mt-3 space-y-1 text-sm break-words">
          <p>{state.objective ? OBJECTIVE_LABELS[state.objective].title : 'Objetivo não escolhido'}</p>
          <p className="text-muted-foreground">{state.name.trim() || 'Sem nome'}</p>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display font-semibold">Orçamento e programação</h2>
          <Button variant="ghost" size="sm" data-testid="traffic-review-edit-3" onClick={() => onGoTo(3)}>Editar</Button>
        </div>
        <div className="mt-3 space-y-1 text-sm break-words">
          <p>{brl(d.amount)} {d.budget_type === 'daily' ? 'por dia' : 'no total'}</p>
          <p>{d.ends_at
            ? `de ${ddmm(isoToDay(d.starts_at))} a ${ddmm(isoToDay(d.ends_at))}`
            : `a partir de ${ddmm(isoToDay(d.starts_at))}, sem término`}
          </p>
          {total !== null && <p className="text-muted-foreground">Gasto máximo: {brl(total)}</p>}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display font-semibold">Público</h2>
          <Button variant="ghost" size="sm" data-testid="traffic-review-edit-4" onClick={() => onGoTo(4)}>Editar</Button>
        </div>
        <div className="mt-3 space-y-1 text-sm break-words">
          <p>{t.advantage_audience ? 'Advantage+ ligado' : 'Só o público escolhido'}</p>
          <p>{locations || 'Sem locais'}</p>
          <p>{t.age_min} a {t.age_max} anos</p>
          <p>{t.genders === 'all' ? 'Todos' : t.genders === 'male' ? 'Homens' : 'Mulheres'}</p>
          <p className="text-muted-foreground">{t.interests.length ? t.interests.map((i) => i.name).join(', ') : 'Sem interesses'}</p>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display font-semibold">Posicionamentos</h2>
          <Button variant="ghost" size="sm" data-testid="traffic-review-edit-5" onClick={() => onGoTo(5)}>Editar</Button>
        </div>
        <div className="mt-3 space-y-1 text-sm break-words">
          {placements.mode === 'auto' ? (
            <p>Automáticos</p>
          ) : (
            <>
              <p>Facebook: {facebook || 'Nenhum'}</p>
              <p>Instagram: {instagram || 'Nenhum'}</p>
            </>
          )}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display font-semibold">Anúncios</h2>
          <Button variant="ghost" size="sm" data-testid="traffic-review-edit-6" onClick={() => onGoTo(6)}>Editar</Button>
        </div>
        <div className="mt-3 space-y-3 text-sm">
          {state.ads.map((ad, index) => (
            <div key={index} className="min-w-0 space-y-1 break-words">
              <p className="font-medium">Peça {index + 1}</p>
              <p>{ad.mode === 'ig_post'
                ? 'usa o post como está'
                : ad.primary_text.slice(0, 80) + (ad.primary_text.length > 80 ? '…' : '')}</p>
              <p className="text-muted-foreground">{CTA_LABELS[ad.cta]}</p>
              {ad.link_url && <p className="text-muted-foreground">{ad.link_url}</p>}
            </div>
          ))}
        </div>
      </section>

      {errors.length > 0 && (
        <div role="alert" data-testid="traffic-review-errors" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="font-medium">Antes de criar, falta:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {errors.map((e, index) => (
              <li key={index} className="break-words">
                {e}{' '}
                <Button variant="link" size="sm" onClick={() => onGoTo(stepOfError(e))}>Resolver</Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        A campanha, o conjunto e os anúncios são criados na Meta <strong>pausados</strong>. Nada é gasto até você ativar em Campanhas.
      </p>
      <div className="space-y-2">
        <Button variant="accent" size="lg" data-testid="traffic-create" disabled={errors.length > 0 || creating} onClick={criar}>
          {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Criando na Meta…</> : 'Criar (pausada)'}
        </Button>
        {error && <p role="alert" data-testid="traffic-create-error" className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
