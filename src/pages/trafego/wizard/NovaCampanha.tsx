import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadError, Loading } from '@/components/shared/LoadState';
import { WizardShell } from '@/components/campaign/WizardShell';
import { WizardSteps } from '@/components/traffic/WizardSteps';
import {
  createDraftCampaign, deleteDraftCampaign, getAdvertiserUsername, listDraftCampaigns, listEligiblePosts, loadWizardCampaign,
  saveWizard, toWizardState, type TrafficCampaignRow,
} from '@/lib/traffic';
import {
  WIZARD_STEPS, canAdvance, draftErrors, problemsByStep,
  type EligiblePost, type WizardState,
} from '@/lib/traffic-wizard';
import { StepConteudo } from './StepConteudo';
import { StepCampanha } from './StepCampanha';
import { StepOrcamento } from './StepOrcamento';
import { StepPublico } from './StepPublico';
import { StepPosicionamentos } from './StepPosicionamentos';
import { StepAnuncio } from './StepAnuncio';
import { StepRevisao } from './StepRevisao';

const STEPS = {
  1: StepConteudo, 2: StepCampanha, 3: StepOrcamento, 4: StepPublico,
  5: StepPosicionamentos, 6: StepAnuncio, 7: StepRevisao,
} as const;

function DraftList() {
  const [, setParams] = useSearchParams();
  const [drafts, setDrafts] = useState<TrafficCampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setDrafts(await listDraftCampaigns());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  async function start() {
    setCreating(true);
    try {
      const id = await createDraftCampaign();
      setParams({ aba: 'nova', id });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não deu para criar o rascunho.');
    } finally {
      setCreating(false);
    }
  }

  async function removeDraft(id: string) {
    setDeletingId(id);
    try {
      await deleteDraftCampaign(id);
      toast.success('Rascunho excluído.');
      setConfirmId(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não deu para excluir o rascunho.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 lg:py-12">
      {loading ? <Loading what="os rascunhos" /> : error ? <LoadError what="os rascunhos" onRetry={() => void reload()} /> : (
        <>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold">Nova campanha</h2>
            <p className="text-sm text-muted-foreground">Monte a campanha em 7 passos. O rascunho fica salvo a cada passo.</p>
          </div>
          <Button variant="accent" data-testid="traffic-start" disabled={creating} onClick={() => void start()}>
            Começar nova campanha
          </Button>
          {drafts.length > 0 && (
            <section className="space-y-3">
              <h3 className="font-display text-lg font-semibold">Rascunhos</h3>
              {drafts.map((c) => (
                <div key={c.id} data-testid={`traffic-draft-${c.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="break-words font-medium">{c.name || 'Sem nome'}</p>
                    <p className="text-xs text-muted-foreground">
                      Passo {c.step} de 7 · atualizado em {new Date(c.updated_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                    {c.status === 'failed' && (
                      <>
                        <Badge>A Meta recusou</Badge>
                        {c.error && <p className="break-words text-sm text-destructive">{c.error}</p>}
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setParams({ aba: 'nova', id: c.id })}>
                      Continuar
                    </Button>
                    <Button
                      variant={confirmId === c.id ? 'destructive' : 'ghost'}
                      size="sm"
                      aria-label={confirmId === c.id ? undefined : `Excluir rascunho ${c.name || 'sem nome'}`}
                      data-testid={confirmId === c.id ? `traffic-draft-delete-${c.id}` : undefined}
                      disabled={deletingId === c.id}
                      onClick={() => confirmId === c.id ? void removeDraft(c.id) : setConfirmId(c.id)}
                    >
                      {confirmId === c.id ? 'Confirmar exclusão' : 'Excluir'}
                    </Button>
                    {confirmId === c.id && (
                      <Button variant="ghost" size="sm" disabled={deletingId === c.id} onClick={() => setConfirmId(null)}>Cancelar</Button>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Wizard({ id }: { id: string }) {
  const [, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [campaign, setCampaign] = useState<TrafficCampaignRow | null>(null);
  const [posts, setPosts] = useState<EligiblePost[]>([]);
  const [account, setAccount] = useState<string | undefined>(undefined);
  const [state, setState] = useState<WizardState | null>(null);
  const [saving, setSaving] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  const errors = useMemo(() => state ? draftErrors(state, posts) : [], [state, posts]);

  async function go(step: number, after?: () => void) {
    if (!state || saving) return;
    setSaving(true);
    try {
      const next = { ...state, step };
      await saveWizard(next);
      setState(next);
      window.scrollTo({ top: 0 });
      // Leitor de tela e teclado começam o passo novo pelo título.
      requestAnimationFrame(() => shellRef.current?.querySelector<HTMLElement>('h1')?.focus());
      after?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não deu para salvar o rascunho.');
    } finally {
      setSaving(false);
    }
  }

  const loadSeq = useRef(0);
  const reload = useCallback(async () => {
    // Só a última carga vale: uma resposta atrasada não pode apagar o que já foi escolhido.
    const seq = ++loadSeq.current;
    setLoading(true);
    setError(false);
    try {
      const [loaded, eligible, username] = await Promise.all([loadWizardCampaign(id), listEligiblePosts(), getAdvertiserUsername().catch(() => null)]);
      if (seq !== loadSeq.current) return;
      setCampaign(loaded?.campaign ?? null);
      setPosts(eligible);
      setAccount(username ?? undefined);
      setState(loaded ? toWizardState(loaded.campaign, loaded.ads) : null);
    } catch {
      if (seq === loadSeq.current) setError(true);
    } finally {
      if (seq === loadSeq.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => { void reload(); }, [reload]);

  if (loading) return <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:py-12"><Loading what="o rascunho" /></div>;
  if (error) return <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:py-12"><LoadError what="o rascunho" onRetry={() => void reload()} /></div>;
  if (!campaign) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:py-12">
        <div data-testid="traffic-draft-missing" className="space-y-4 rounded-2xl border border-dashed p-8 text-center">
          <p>Rascunho não encontrado.</p>
          <Button variant="outline" onClick={() => setParams({ aba: 'nova' })}>Voltar aos rascunhos</Button>
        </div>
      </div>
    );
  }
  if (campaign.status !== 'draft' && campaign.status !== 'failed') {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:py-12">
        <div data-testid="traffic-draft-locked" className="space-y-4 rounded-2xl border border-dashed p-8 text-center">
          <p>Esta campanha já foi enviada para a Meta.</p>
          <Button variant="outline" onClick={() => setParams({})}>Ver campanhas</Button>
        </div>
      </div>
    );
  }
  if (!state) return null;

  const problems = problemsByStep(errors)[state.step];
  const Step = STEPS[state.step as keyof typeof STEPS];

  return (
    <div ref={shellRef}>
    <WizardShell
      progress={<WizardSteps current={state.step} problems={problemsByStep(errors)} disabled={saving} onGoTo={(n) => void go(n)} />}
      title={WIZARD_STEPS[state.step - 1].title}
      subtitle={WIZARD_STEPS[state.step - 1].subtitle}
      onBack={state.step > 1 ? () => void go(state.step - 1) : () => setParams({ aba: 'nova' })}
      footer={state.step < 7 ? (
        <>
          <Button variant="accent" data-testid="traffic-next" disabled={saving || !canAdvance(state.step, errors)} onClick={() => void go(state.step + 1)}>
            Continuar
          </Button>
          <Button variant="ghost" data-testid="traffic-save-exit" disabled={saving} onClick={() => void go(state.step, () => setParams({ aba: 'nova' }))}>
            Salvar e sair
          </Button>
        </>
      ) : undefined}
    >
      {campaign.status === 'failed' && (
        <div data-testid="traffic-draft-failed" role="status" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          A Meta recusou da última vez: {campaign.error ?? 'erro desconhecido'}. Ajuste e crie de novo.
        </div>
      )}
      <Step state={state} posts={posts} account={account} problems={problems} onChange={setState} onGoTo={(n) => void go(n)} onCreated={() => setParams({})} />
      {state.step < 7 && problems.length > 0 && (
        <div data-testid="traffic-step-problems" className="text-sm text-muted-foreground">
          <p className="font-medium">Para continuar:</p>
          <ul className="list-disc pl-5">
            {problems.map((problem, index) => <li key={index} className="break-words">{problem}</li>)}
          </ul>
        </div>
      )}
    </WizardShell>
    </div>
  );
}

export function NovaCampanha() {
  const [params] = useSearchParams();
  const id = params.get('id');
  return id ? <Wizard key={id} id={id} /> : <DraftList />;
}
