import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CTA_OPTIONS, thumbnailOf, type Cta, type StepProps, type WizardAd } from '@/lib/traffic-wizard';

export function StepAnuncio({ state, posts, onChange, onGoTo }: StepProps) {
  const set = (i: number, patch: Partial<WizardAd>) => onChange({ ...state, ads: state.ads.map((a, j) => (j === i ? { ...a, ...patch } : a)) });

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">O anúncio sai pela Página do Facebook e pelo Instagram escolhidos em Configurações.</p>

      {state.ads.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Escolha as peças no passo Conteúdo.</p>
          <Button variant="outline" onClick={() => onGoTo(1)}>Ir para Conteúdo</Button>
        </div>
      ) : (
        state.ads.map((a, i) => {
          const n = i + 1;
          const post = posts.find((p) => p.id === a.post_id);
          const thumbnail = post ? thumbnailOf(post) : null;

          return (
            <section key={a.post_id} data-testid={`traffic-ad-${n}`} className="space-y-4 rounded-xl border bg-card p-4">
              <div className="flex min-w-0 items-center gap-3">
                {thumbnail ? (
                  <img src={thumbnail} alt={post?.title ?? 'Peça sem título'} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                  </div>
                )}
                <p className="min-w-0 line-clamp-2 break-words font-medium">
                  Peça {n} · {post?.title ?? 'Peça sem título'}
                </p>
              </div>

              {!post ? (
                <p data-testid={`traffic-ad-${n}-missing`} className="text-sm text-destructive">
                  Esta peça não está mais aprovada. Volte ao passo Conteúdo e troque.
                </p>
              ) : (
                <>
                  {a.mode === 'ig_post' && (
                    <p className="text-sm text-muted-foreground">
                      Usa o post publicado no Instagram como está, com o texto e a arte dele.
                    </p>
                  )}

                  {a.mode === 'new_creative' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`traffic-ad-${n}-text`}>Texto principal</Label>
                        <Textarea
                          id={`traffic-ad-${n}-text`}
                          data-testid={`traffic-ad-${n}-text`}
                          rows={4}
                          maxLength={2000}
                          value={a.primary_text}
                          onChange={(event) => set(i, { primary_text: event.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">Aparece acima da arte.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`traffic-ad-${n}-headline`}>Título</Label>
                        <Input
                          id={`traffic-ad-${n}-headline`}
                          data-testid={`traffic-ad-${n}-headline`}
                          maxLength={255}
                          value={a.headline}
                          onChange={(event) => set(i, { headline: event.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">Opcional. Aparece abaixo da arte.</p>
                      </div>
                    </>
                  )}

                  {(a.mode === 'new_creative' || (a.mode === 'ig_post' && state.objective === 'OUTCOME_TRAFFIC')) && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`traffic-ad-${n}-cta`}>Botão</Label>
                        <Select value={a.cta} onValueChange={(v) => set(i, { cta: v as Cta })}>
                          <SelectTrigger id={`traffic-ad-${n}-cta`} data-testid={`traffic-ad-${n}-cta`}>
                            <SelectValue placeholder="Escolha o botão" />
                          </SelectTrigger>
                          <SelectContent>
                            {CTA_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`traffic-ad-${n}-link`}>Link de destino</Label>
                        <Input
                          type="url"
                          inputMode="url"
                          id={`traffic-ad-${n}-link`}
                          data-testid={`traffic-ad-${n}-link`}
                          placeholder="https://"
                          value={a.link_url}
                          onChange={(event) => set(i, { link_url: event.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Para onde a pessoa vai ao clicar. A Hive acrescenta as UTMs sozinha.
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
