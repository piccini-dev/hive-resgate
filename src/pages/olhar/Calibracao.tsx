// Olhar Bee · bancada de calibração (E2, docs/olhar-bee/).
// Quem cuida da voz roda os casos fictícios no agente público de verdade, lê a resposta
// como o visitante veria e dá o veredito. "Ajustar" com comentário vira ajuste de
// calibração: entra no prompt do agente nas próximas leituras (curadoria humana).

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Eye, Loader2, PenLine, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { LoadError } from '@/components/shared/LoadState';
import { userMessage } from '@/lib/errors';
import { AREA_LABEL, CASOS, olhar, situacaoDosCasos, type OlharResposta, type OlharVeredito } from '@/lib/olhar';

const TIPO_LABEL: Record<OlharResposta['type'], string> = { questions: 'Perguntas', reading: 'Leitura', care: 'Acolhimento', refusal: 'Recusa' };

export function OlharCalibracao() {
  const [vereditos, setVereditos] = useState<OlharVeredito[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [caso, setCaso] = useState<string | null>(CASOS[0].codigo);
  const [desafio, setDesafio] = useState(CASOS[0].texto);
  const [resp, setResp] = useState<OlharResposta | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [comentario, setComentario] = useState('');
  const [salvo, setSalvo] = useState<OlharVeredito['veredito'] | null>(null);

  const carregar = useCallback(() => {
    setLoadError(false);
    olhar.vereditos().then(setVereditos).catch(() => setLoadError(true));
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const situacao = useMemo(() => situacaoDosCasos(vereditos), [vereditos]);
  const aprovados = CASOS.filter((c) => situacao[c.codigo] === 'aprovada').length;
  const ajustes = vereditos.filter((v) => v.veredito === 'ajustar' && v.comentario);
  const casoAtual = CASOS.find((c) => c.codigo === caso) ?? null;

  const escolher = (codigo: string | null) => {
    setCaso(codigo);
    setDesafio(codigo ? CASOS.find((c) => c.codigo === codigo)!.texto : '');
    setResp(null); setRespostas({}); setComentario(''); setSalvo(null);
  };

  const rodar = async (fn: () => Promise<OlharResposta>) => {
    setBusy(true); setSalvo(null); setComentario('');
    try { setResp(await fn()); }
    catch (e) { toast.error(userMessage(e, 'A Hive não conseguiu concluir esta leitura.')); }
    finally { setBusy(false); }
  };
  const iniciar = () => { setRespostas({}); void rodar(() => olhar.start(desafio.trim(), caso)); };
  const responder = (skipped: boolean) => resp && void rodar(() => olhar.answer(resp.session_id,
    (resp.questions ?? []).map((q) => ({ id: q.id, text: respostas[q.id] ?? '' })), skipped));

  const julgar = async (veredito: OlharVeredito['veredito']) => {
    if (!resp) return;
    if (veredito === 'ajustar' && !comentario.trim()) { toast.error('Diga no comentário o que ajustar.'); return; }
    setBusy(true);
    try {
      await olhar.calibrate(resp.session_id, veredito, comentario.trim());
      setSalvo(veredito);
      toast.success(veredito === 'aprovada' ? 'Leitura aprovada.' : 'Ajuste registrado: entra nas próximas leituras.');
      carregar();
    } catch (e) { toast.error(userMessage(e, 'Não foi possível registrar o veredito.')); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Olhar Bee · agente público</p>
        <h1 className="font-display text-3xl">Bancada de calibração</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Rode cada caso fictício no agente de verdade e leia a resposta como o visitante leria. Aprove, ou peça ajuste dizendo o que mudar:
          o comentário passa a orientar as próximas leituras. O agente só vai para o site quando os 14 casos estiverem aprovados.
        </p>
        <div className="flex items-center gap-3 text-sm" data-testid="calibracao-progresso">
          <span className="font-semibold tabular-nums">{aprovados} de {CASOS.length} casos aprovados</span>
          <span className="h-2 w-48 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
            <span className="block h-full bg-emerald-600" style={{ width: `${(100 * aprovados) / CASOS.length}%` }} />
          </span>
        </div>
      </header>

      {loadError && <LoadError what="os vereditos da calibração" onRetry={carregar} />}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <nav aria-label="Casos fictícios" className="space-y-1.5">
          {CASOS.map((c) => {
            const s = situacao[c.codigo];
            return (
              <button key={c.codigo} type="button" onClick={() => escolher(c.codigo)} data-testid={`caso-${c.codigo}`}
                className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${caso === c.codigo ? 'border-accent bg-accent/10' : 'bg-card hover:border-accent/50'}`}>
                <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground">{c.codigo}</span>
                <span className="flex-1">{c.titulo}</span>
                {s === 'aprovada' && <Badge className="bg-emerald-600 text-white">Aprovada</Badge>}
                {s === 'ajustar' && <Badge variant="outline" className="border-amber-500 text-amber-700">Ajustar</Badge>}
              </button>
            );
          })}
          <button type="button" onClick={() => escolher(null)} data-testid="caso-livre"
            className={`flex w-full items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-left text-sm ${caso === null ? 'border-accent bg-accent/10' : 'hover:border-accent/50'}`}>
            <PenLine className="h-4 w-4 text-muted-foreground" /> Caso livre
          </button>
        </nav>

        <section className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5">
              {casoAtual && <p className="text-xs text-muted-foreground"><b>Esperado:</b> {casoAtual.esperado}</p>}
              <label htmlFor="olhar-desafio" className="text-sm font-semibold">O que está acontecendo?</label>
              <Textarea id="olhar-desafio" value={desafio} onChange={(e) => setDesafio(e.target.value)} rows={4} maxLength={4000}
                placeholder="Conte do seu jeito. Não precisa organizar o problema." />
              <Button onClick={iniciar} disabled={busy || desafio.trim().length < 3} data-testid="olhar-rodar">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Olhar com a Bee
              </Button>
            </CardContent>
          </Card>

          {resp && (
            <Card data-testid="olhar-resultado" data-tipo={resp.type}>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{TIPO_LABEL[resp.type]}</Badge>
                  {resp.reading?.area_provavel && <Badge variant="outline">{AREA_LABEL[resp.reading.area_provavel]}</Badge>}
                  {resp.bancada?.barrado && <span className="flex items-center gap-1 text-amber-700"><AlertTriangle className="h-3.5 w-3.5" /> Uma tentativa citou nome proibido e foi refeita.</span>}
                  {resp.bancada?.modelo && <span className="ml-auto font-mono">{resp.bancada.modelo}</span>}
                </div>
                {resp.bancada?.motivo && <p className="text-xs italic text-muted-foreground">Por que este caminho: {resp.bancada.motivo}</p>}

                {resp.type === 'questions' && (
                  <div className="space-y-3">
                    {(resp.questions ?? []).map((q) => (
                      <div key={q.id} className="space-y-1">
                        <label htmlFor={`olhar-${q.id}`} className="text-sm font-medium">{q.text}</label>
                        <Textarea id={`olhar-${q.id}`} rows={2} value={respostas[q.id] ?? ''} placeholder={q.placeholder}
                          onChange={(e) => setRespostas((r) => ({ ...r, [q.id]: e.target.value }))} />
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button onClick={() => responder(false)} disabled={busy}>Continuar</Button>
                      <Button variant="outline" onClick={() => responder(true)} disabled={busy}>Pular e ver a leitura</Button>
                    </div>
                  </div>
                )}

                {resp.type === 'reading' && resp.reading && (
                  <div className="space-y-4 rounded-xl bg-secondary/50 p-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      {([['O que parece estar acontecendo', resp.reading.parece], ['O que talvez não esteja visível', resp.reading.invisivel], ['Onde pode estar o movimento', resp.reading.movimento]] as const).map(([t, b]) => (
                        <div key={t} className="space-y-1">
                          <h3 className="text-xs font-semibold uppercase tracking-wider">{t}</h3>
                          <p className="text-sm leading-relaxed">{b.text}</p>
                        </div>
                      ))}
                    </div>
                    {resp.reading.semelhantes.length > 0 && (
                      <div className="space-y-2 border-t pt-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider">Desafios semelhantes que já apoiamos</h3>
                        <div className="grid gap-2 md:grid-cols-2" data-testid="olhar-semelhantes">
                          {resp.reading.semelhantes.map((s) => (
                            <div key={s.title} className="rounded-lg border bg-card p-3 text-sm"><b className="block text-xs uppercase">{s.area}</b>{s.title}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{resp.reading.disclaimer}</p>
                  </div>
                )}

                {(resp.type === 'care' || resp.type === 'refusal') && <p className="rounded-xl bg-secondary/50 p-4 text-sm leading-relaxed">{resp.message}</p>}

                {resp.type !== 'questions' && (
                  <div className="space-y-2 border-t pt-4">
                    <label htmlFor="olhar-comentario" className="text-sm font-semibold">Veredito</label>
                    <Textarea id="olhar-comentario" rows={2} value={comentario} onChange={(e) => setComentario(e.target.value)}
                      placeholder="O que ajustar? (obrigatório para “Ajustar”; vira orientação do agente)" />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button onClick={() => julgar('aprovada')} disabled={busy || !!salvo} className="bg-emerald-600 text-white hover:bg-emerald-700"><Check className="h-4 w-4" /> Aprovar</Button>
                      <Button variant="outline" onClick={() => julgar('ajustar')} disabled={busy || !!salvo}><PenLine className="h-4 w-4" /> Ajustar</Button>
                      {salvo && <span className="text-sm text-muted-foreground" data-testid="olhar-veredito-salvo">{salvo === 'aprovada' ? 'Aprovada.' : 'Ajuste registrado.'} Rode de novo para ver outra versão.</span>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {ajustes.length > 0 && (
            <Card>
              <CardContent className="space-y-2 p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-accent" /> Ajustes que o agente já segue ({ajustes.length})</h2>
                <ul className="space-y-1.5 text-sm" data-testid="olhar-ajustes">
                  {ajustes.map((a) => <li key={a.id} className="rounded-md bg-secondary/60 px-3 py-1.5">{a.caso_codigo && <span className="mr-2 font-mono text-xs text-muted-foreground">{a.caso_codigo}</span>}{a.comentario}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
