import { useMemo, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InstagramPreview } from '@/components/traffic/InstagramPreview';
import { edge } from '@/lib/edge';
import {
  COUNTRY_NAMES, OBJECTIVE_LABELS, adPreview, budgetTotal, draftErrors, feedUsername, isoToDay, stepOfError, thumbnailOf,
  type StepProps,
} from '@/lib/traffic-wizard';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const ddmm = (day: string) => day ? day.split('-').reverse().slice(0, 2).join('/') : '';

const PLACE: Record<string, string> = { feed: 'Feed', stream: 'Feed', story: 'Stories', facebook_reels: 'Reels', reels: 'Reels' };

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[9rem_1fr] sm:gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

function Section({ title, step, disabled, onGoTo, children }: {
  title: string; step: number; disabled: boolean; onGoTo: (n: number) => void; children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display font-semibold">{title}</h2>
        <Button variant="ghost" size="sm" data-testid={`traffic-review-edit-${step}`} disabled={disabled} onClick={() => onGoTo(step)}>Editar</Button>
      </div>
      <div className="mt-3 text-sm">{children}</div>
    </section>
  );
}

export function StepRevisao({ state, posts, account, onGoTo, onCreated }: StepProps) {
  const errors = useMemo(() => draftErrors(state, posts), [state, posts]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function criar() {
    setCreating(true); setError(null);
    try {
      await edge.trafficCreate(state.id);
      toast.success('Campanha criada na Meta, pausada. Nada é gasto até ela ser ativada.');
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
  const start = ddmm(isoToDay(d.starts_at));
  const period = d.ends_at ? `de ${start} a ${ddmm(isoToDay(d.ends_at))}` : `a partir de ${start}, sem término`;
  const locations = [
    ...t.countries.map((c) => COUNTRY_NAMES[c] ?? c),
    ...t.regions.map((r) => r.name),
    ...t.cities.map((c) => c.name),
  ].join(', ');
  const titleOf = (postId: string) => posts.find((post) => post.id === postId)?.title || 'Peça que saiu da aprovação';
  const edit = { disabled: creating, onGoTo };

  return (
    <div className="space-y-6">
      <Section title="Conteúdo" step={1} {...edit}>
        <ul className="space-y-3">
          {state.ads.map((ad) => {
            const post = posts.find((p) => p.id === ad.post_id);
            const thumb = post ? thumbnailOf(post) : null;
            return (
              <li key={ad.post_id} className="flex min-w-0 items-center gap-3">
                {thumb
                  ? <img src={thumb} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  : <span className="h-12 w-12 shrink-0 rounded-lg bg-secondary" aria-hidden="true" />}
                <span className="min-w-0 break-words">
                  <span className="block font-medium">{titleOf(ad.post_id)}</span>
                  <span className="block text-muted-foreground">{ad.mode === 'ig_post' ? 'Impulsiona o post publicado' : 'Vira anúncio com a arte da peça'}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Campanha" step={2} {...edit}>
        <dl className="space-y-2">
          <Row label="Objetivo">{state.objective ? OBJECTIVE_LABELS[state.objective].title : 'Não escolhido'}</Row>
          <Row label="Nome">{state.name.trim() || 'Sem nome'}</Row>
        </dl>
      </Section>

      <Section title="Orçamento e programação" step={3} {...edit}>
        <dl className="space-y-2">
          <Row label={d.budget_type === 'daily' ? 'Por dia' : 'Total'}>{brl(d.amount)}</Row>
          <Row label="Período">{period}</Row>
        </dl>
      </Section>

      <Section title="Público" step={4} {...edit}>
        <dl className="space-y-2">
          <Row label="Tipo">{t.advantage_audience ? 'Advantage+ (a Meta amplia)' : 'Só o público escolhido'}</Row>
          <Row label="Locais">{locations || 'Nenhum'}</Row>
          <Row label="Idade">{t.age_min} a {t.age_max} anos</Row>
          <Row label="Gênero">{t.genders === 'all' ? 'Todos' : t.genders === 'male' ? 'Homens' : 'Mulheres'}</Row>
          <Row label="Interesses">{t.interests.length ? t.interests.map((i) => i.name).join(', ') : 'Nenhum'}</Row>
        </dl>
      </Section>

      <Section title="Posicionamentos" step={5} {...edit}>
        <dl className="space-y-2">
          {placements.mode === 'auto' ? (
            <Row label="Onde">Automáticos (a Meta escolhe)</Row>
          ) : (
            <>
              <Row label="Facebook">{placements.facebook.map((p) => PLACE[p]).join(', ') || 'Nenhum'}</Row>
              <Row label="Instagram">{placements.instagram.map((p) => PLACE[p]).join(', ') || 'Nenhum'}</Row>
            </>
          )}
        </dl>
      </Section>

      <Section title="Anúncios" step={6} {...edit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {state.ads.map((ad, index) => {
            const n = index + 1;
            const post = posts.find((p) => p.id === ad.post_id);
            return (
              <div key={ad.post_id} className="min-w-0 space-y-2">
                <p className="break-words font-medium">Peça {n} · {titleOf(ad.post_id)}</p>
                {post && (
                  <InstagramPreview
                    username={feedUsername(account)}
                    {...adPreview(ad, post, state.objective)}
                    sponsored
                    alt={post.title ?? 'Peça sem título'}
                    href={post.published_url}
                    testId={`traffic-review-preview-${n}`}
                  />
                )}
                {(ad.mode === 'new_creative' || state.objective === 'OUTCOME_TRAFFIC') && (
                  <dl className="space-y-2">
                    <Row label="Link"><span className="break-all">{ad.link_url || 'Sem link'}</span></Row>
                  </dl>
                )}
              </div>
            );
          })}
        </div>
      </Section>

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

      <div data-testid="traffic-review-summary" className="space-y-1 rounded-xl border border-accent bg-accent/10 p-4">
        <p className="font-display text-lg font-semibold">
          {total !== null ? `Gasto máximo: ${brl(total)}` : `${brl(d.amount)} por dia, até você pausar`}
        </p>
        <p className="text-sm">{period}</p>
        <p className="text-sm text-muted-foreground">
          A campanha, o conjunto e os anúncios são criados na Meta <strong className="text-foreground">pausados</strong>. Nada é gasto até a campanha ser ativada, e o teto mensal vale sempre.
        </p>
      </div>
      <div className="space-y-2">
        <Button variant="accent" size="lg" data-testid="traffic-create" disabled={errors.length > 0 || creating} onClick={criar}>
          {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Criando na Meta…</> : 'Criar (pausada)'}
        </Button>
        {error && <p role="alert" data-testid="traffic-create-error" className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
