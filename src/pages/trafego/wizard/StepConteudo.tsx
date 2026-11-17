import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InstagramPreview } from '@/components/traffic/InstagramPreview';
import {
  MAX_ADS, STATUS_LABELS, adModeFor, feedUsername, postPreview, toggleAd,
  type StepProps, type EligiblePost,
} from '@/lib/traffic-wizard';

export function StepConteudo({ state, posts, account, onChange }: StepProps) {
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
        <div className="grid grid-cols-1 justify-items-center gap-6 lg:grid-cols-2">
          {filtrados.map((p) => {
            const indice = state.ads.findIndex((ad) => ad.post_id === p.id);
            const selecionada = indice !== -1;
            const desabilitada = !selecionada && state.ads.length >= MAX_ADS;

            return (
              <div
                key={p.id}
                data-testid={`traffic-post-card-${p.id}`}
                className={`w-full max-w-[420px] space-y-2 rounded-2xl p-1 ${selecionada ? 'ring-2 ring-accent' : ''} ${desabilitada ? 'opacity-50' : ''}`}
              >
                <p className="px-1 text-sm font-medium line-clamp-2 break-words">
                  {p.title ?? 'Peça sem título'}
                </p>
                <InstagramPreview username={feedUsername(account)} {...postPreview(p)} alt={p.title ?? 'Peça sem título'} href={p.published_url} />
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <div className="min-w-0 text-xs text-muted-foreground">
                    <p>
                      {STATUS_LABELS[p.status]} · {p.platform === 'instagram' ? 'Instagram' : p.platform === 'linkedin' ? 'LinkedIn' : p.platform}
                    </p>
                    <p className="mt-1">
                      {adModeFor(p) === 'ig_post' ? 'Impulsiona o post publicado' : 'Vira anúncio com a arte da peça'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={selecionada ? 'accent' : 'outline'}
                    className="min-h-11 sm:min-h-0"
                    data-testid={`traffic-post-${p.id}`}
                    aria-pressed={selecionada}
                    aria-label={`Anunciar “${p.title ?? 'Peça sem título'}”`}
                    disabled={desabilitada}
                    onClick={() => onChange({ ...state, ads: toggleAd(state.ads, p) })}
                  >
                    {selecionada ? <><Check className="h-4 w-4" aria-hidden="true" /> Peça {indice + 1} · Tirar</> : 'Anunciar esta'}
                  </Button>
                </div>
              </div>
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
