import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadError, Loading } from '@/components/shared/LoadState';
import {
  createDraftCampaign, deleteDraftCampaign, listDraftCampaigns, listEligiblePosts, loadWizardCampaign,
  toWizardState, type TrafficCampaignRow,
} from '@/lib/traffic';
import { type EligiblePost, type WizardState } from '@/lib/traffic-wizard';

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
  const [state, setState] = useState<WizardState | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [loaded, eligible] = await Promise.all([loadWizardCampaign(id), listEligiblePosts()]);
      setCampaign(loaded?.campaign ?? null);
      setPosts(eligible);
      setState(loaded ? toWizardState(loaded.campaign, loaded.ads) : null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
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

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 lg:py-12">
      {campaign.status === 'failed' && (
        <div data-testid="traffic-draft-failed" role="status" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          A Meta recusou da última vez: {campaign.error ?? 'erro desconhecido'}. Ajuste e crie de novo.
        </div>
      )}
      <p>Passo {state.step} de 7</p>
    </div>
  );
}

export function NovaCampanha() {
  const [params] = useSearchParams();
  const id = params.get('id');
  return id ? <Wizard key={id} id={id} /> : <DraftList />;
}
