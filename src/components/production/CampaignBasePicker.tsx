import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LoadError } from '@/components/shared/LoadState';
import { baseApi, type BaseVersion } from '@/lib/campaign/bases';
import { cycleApi } from '@/lib/campaignApi';
import { buildCyclePlan } from '@/lib/campaign/plan';
import type { Campaign, CampaignCycle, Content, SocialAccount } from '@/types';

// Campanha recebe matéria-prima validada. Não chama cycle-pauta nem content-develop.
export function CampaignBasePicker({ campaign, cycle, accounts, onDone }: {
  campaign: Campaign; cycle: CampaignCycle; accounts: SocialAccount[]; onDone: (cycle: CampaignCycle) => void;
}) {
  const [entries, setEntries] = useState<Array<{content: Content; version: BaseVersion | null}> | null>(null);
  const [selected, setSelected] = useState<string[]>([]), [busy, setBusy] = useState(false), [failed, setFailed] = useState(false);
  const [adopted, setAdopted] = useState<string[]>([]);
  async function load() {
    setFailed(false);
    try {
      const [catalog, used] = await Promise.all([baseApi.catalog(), baseApi.listByCycle(cycle.id, false)]);
      setEntries(catalog.filter(e => !!e.version && (!campaign.profile_id || !e.content.profile_id || e.content.profile_id === campaign.profile_id)));
      setSelected(used.filter(c => c.status === 'validated').map(c => c.id));
      setAdopted(used.filter(c => c.status === 'validated').map(c => c.id));
    } catch { setFailed(true); }
  }
  useEffect(() => { void load(); }, [cycle.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (failed) return <LoadError what="os conteúdos mãe disponíveis" onRetry={() => void load()}/>;
  return <section className="space-y-5" data-testid="campaign-base-picker">
    <div><p className="text-xs uppercase text-muted-foreground">Campanha · Seleção da matéria-prima</p><h1 className="mt-1 font-display text-2xl font-bold">Quais conteúdos mãe sustentam este ciclo?</h1>
      <p className="mt-2 text-sm text-muted-foreground">A campanha utiliza bases aprovadas. Na etapa seguinte, a Hive propõe recortes, aplicações e formatos alinhados ao objetivo.</p></div>
    <p className="rounded-xl border bg-card p-4 text-sm">{campaign.intent || campaign.name}</p>
    {!entries ? <Loader2 className="h-5 w-5 animate-spin"/> : entries.length === 0 ? <p className="text-sm">Ainda não há conteúdos mãe validados disponíveis para este perfil.</p> : <div className="grid gap-3 md:grid-cols-2">{entries.map(e => <label key={e.content.id} className="flex items-start gap-3 rounded-xl border bg-card p-4">
      <input type="checkbox" className="mt-1" disabled={busy || adopted.includes(e.content.id)} checked={selected.includes(e.content.id)} onChange={event => setSelected(ids => event.target.checked ? [...ids, e.content.id] : ids.filter(id => id !== e.content.id))}/>
      <span><span className="block font-semibold">{e.content.title}</span><span className="mt-1 block text-sm text-muted-foreground">{e.version?.body.frase}</span><span className="mt-2 block text-xs text-muted-foreground">{adopted.includes(e.content.id) ? 'Já vinculada a este ciclo · versão preservada' : `Versão ${e.version?.ordinal} · validada`}</span></span>
    </label>)}</div>}
    <div className="flex flex-wrap items-center gap-3"><Button variant="accent" disabled={busy || selected.length === 0} onClick={async () => {
      setBusy(true);
      try {
        const chosen = entries!.filter(e => selected.includes(e.content.id) && e.version);
        if (!chosen.length) throw new Error('Selecione um conteúdo mãe validado.');
        // Cada adoção é idempotente; uma falha não apaga bases nem utilizações anteriores.
        for (const e of chosen.filter(e => !adopted.includes(e.content.id))) await baseApi.adopt(e.version!.id, cycle.id);
        onDone(await cycleApi.update(cycle.id, { plan: cycle.plan ?? buildCyclePlan(campaign, cycle, accounts), status: 'producing' }));
      } catch(e) { toast.error((e as Error).message); await load(); } finally { setBusy(false); }
    }}>{busy ? 'Preparando o ciclo…' : 'Usar bases e propor recortes'}</Button>
      <Link className="text-sm underline" to="/conteudos-mae">Falta uma base? Desenvolver no acervo</Link></div>
    <p className="text-xs text-muted-foreground">Selecionar bases não cria nem aprova posts. Os agendamentos existentes permanecem preservados.</p>
  </section>;
}
