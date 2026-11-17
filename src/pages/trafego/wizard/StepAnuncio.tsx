import { Button } from '@/components/ui/button';
import { InstagramPreview } from '@/components/traffic/InstagramPreview';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CTA_OPTIONS, adPreview, feedUsername, type Cta, type StepProps, type WizardAd } from '@/lib/traffic-wizard';

export function StepAnuncio({ state, posts, account, onChange, onGoTo }: StepProps) {
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

          return (
            <section key={a.post_id} data-testid={`traffic-ad-${n}`} className="space-y-4 rounded-xl border bg-card p-4">
              <p className="min-w-0 break-words font-medium">
                Peça {n} · {post?.title ?? 'Peça sem título'}
              </p>

              {!post ? (
                <p data-testid={`traffic-ad-${n}-missing`} className="text-sm text-destructive">
                  Esta peça não está mais aprovada. Volte ao passo Conteúdo e troque.
                </p>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,380px)] lg:items-start">
                  <div className="min-w-0 space-y-4">
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
                        <p className="text-xs text-muted-foreground">Aparece como legenda, abaixo da arte.</p>
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
                          Para onde a pessoa vai ao clicar. A Hive acrescenta sozinha os códigos que medem de onde veio a visita.
                        </p>
                      </div>
                    </>
                  )}
                  </div>
                  <div className="min-w-0 lg:sticky lg:top-4">
                    <InstagramPreview
                      username={feedUsername(account)}
                      {...adPreview(a, post, state.objective)}
                      sponsored
                      alt={post.title ?? 'Peça sem título'}
                      testId={`traffic-ad-preview-${n}`}
                    />
                  </div>
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
