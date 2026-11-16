import { useState } from 'react';
import { Check, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MAX_ADS, STATUS_LABELS, adModeFor, thumbnailOf, toggleAd,
  type StepProps, type EligiblePost,
} from '@/lib/traffic-wizard';

export function StepConteudo({ state, posts, onChange }: StepProps) {
  const [q, setQ] = useState('');
  const [rede, setRede] = useState<'todas' | 'instagram' | 'linkedin'>('todas');
  const filtrados: EligiblePost[] = posts.filter((p) =>
    (p.title ?? '').toLowerCase().includes(q.trim().toLowerCase())
    && (rede === 'todas' || p.platform === rede)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor="traffic-post-search" className="sr-only">Buscar peça</Label>
        <Input
          id="traffic-post-search"
          data-testid="traffic-post-search"
          placeholder="Buscar pelo título"
          className="min-w-0 basis-full sm:basis-52 sm:flex-1"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <Button type="button" size="sm" variant={rede === 'todas' ? 'accent' : 'outline'} aria-pressed={rede === 'todas'} data-testid="traffic-filter-todas" onClick={() => setRede('todas')}>
          Todas
        </Button>
        <Button type="button" size="sm" variant={rede === 'instagram' ? 'accent' : 'outline'} aria-pressed={rede === 'instagram'} data-testid="traffic-filter-instagram" onClick={() => setRede('instagram')}>
          Instagram
        </Button>
        <Button type="button" size="sm" variant={rede === 'linkedin' ? 'accent' : 'outline'} aria-pressed={rede === 'linkedin'} data-testid="traffic-filter-linkedin" onClick={() => setRede('linkedin')}>
          LinkedIn
        </Button>
        <p data-testid="traffic-selected-count" className="text-sm text-muted-foreground">
          {state.ads.length} de {MAX_ADS} escolhidas
        </p>
      </div>

      {posts.length === 0 ? (
        <div data-testid="traffic-no-posts" className="rounded-2xl border border-dashed p-8 text-center">
          <p>Nenhuma peça pronta para anunciar.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Só entram peças aprovadas, agendadas ou publicadas, com a arte pronta.
          </p>
        </div>
      ) : filtrados.length === 0 ? (
        <p data-testid="traffic-filter-empty" className="text-sm text-muted-foreground">
          Nenhuma peça com esse filtro.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtrados.map((p) => {
            const indice = state.ads.findIndex((ad) => ad.post_id === p.id);
            const selecionada = indice !== -1;
            const desabilitada = !selecionada && state.ads.length >= MAX_ADS;
            const miniatura = thumbnailOf(p);

            return (
              <button
                key={p.id}
                type="button"
                data-testid={`traffic-post-${p.id}`}
                aria-pressed={selecionada}
                disabled={desabilitada}
                onClick={() => onChange({ ...state, ads: toggleAd(state.ads, p) })}
                className={`flex w-full min-w-0 gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  selecionada
                    ? 'border-accent bg-accent/15 ring-2 ring-accent'
                    : 'border-border bg-card hover:border-accent/50'
                } ${desabilitada ? 'opacity-50' : ''}`}
              >
                {miniatura ? (
                  <img
                    src={miniatura}
                    alt={p.title ?? 'Peça sem título'}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-secondary" aria-hidden="true">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <span className="min-w-0 flex-1 break-words">
                  <span className="block font-medium line-clamp-2">
                    {p.title ?? 'Peça sem título'}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {STATUS_LABELS[p.status]} · {p.platform === 'instagram' ? 'Instagram' : p.platform === 'linkedin' ? 'LinkedIn' : p.platform}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {adModeFor(p) === 'ig_post' ? 'Impulsiona o post publicado' : 'Vira anúncio com a arte da peça'}
                  </span>
                </span>
                {selecionada && (
                  <Badge variant="accent" className="shrink-0 self-start gap-1">
                    <Check className="h-3 w-3" aria-hidden="true" />
                    {indice + 1}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      )}

      {state.ads.length >= MAX_ADS && (
        <p data-testid="traffic-max-hint" className="text-sm text-muted-foreground">
          Você chegou ao máximo de 5 peças. Desmarque uma para trocar.
        </p>
      )}
    </div>
  );
}
