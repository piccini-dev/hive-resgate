import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { accountApi } from '@/lib/campaignApi';
import { useAuthStore } from '@/store/authStore';
import type { SocialAccount } from '@/types';

export function PublicationDefaultsPanel() {
  const prefs=useAuthStore(s=>s.settings?.distribution_prefs),updateSettings=useAuthStore(s=>s.updateSettings);
  const [accounts,setAccounts]=useState<SocialAccount[]|null>(null),[selected,setSelected]=useState<string[]>([]),[mirror,setMirror]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(false);
  async function load(){setError(false);try{setAccounts(await accountApi.list());}catch{setError(true);}}
  useEffect(()=>{void load();},[]);
  useEffect(()=>{if(accounts){setSelected(prefs?.default_account_ids??accounts.filter(a=>a.status==='connected').map(a=>a.id));setMirror(prefs?.mirror_accounts??true);}},[accounts,prefs?.default_account_ids,prefs?.mirror_accounts]);
  return <section className="space-y-3 rounded-xl border bg-card p-5" data-testid="publication-defaults">
    <h2 className="font-display text-lg font-semibold">Padrões de publicação do produtor</h2>
    <p className="text-sm text-muted-foreground">Estas contas já vêm selecionadas ao preparar novas peças compatíveis. Você pode ajustar cada peça antes de confirmar. Deixe todas desmarcadas para escolher manualmente.</p>
    {error?<Button variant="outline" onClick={()=>void load()}>Tentar carregar contas</Button>:accounts===null?<p role="status">Carregando contas…</p>:<div className="flex flex-wrap gap-2">{accounts.filter(a=>a.status==='connected').map(a=><label key={a.id} className="flex items-center gap-2 rounded-lg border p-3 text-sm"><input type="checkbox" aria-label={`Conta padrão ${a.label} · ${a.platform}`} disabled={busy} checked={selected.includes(a.id)} onChange={e=>setSelected(old=>e.target.checked?[...old,a.id]:old.filter(id=>id!==a.id))}/>{a.label} · {a.platform}</label>)}</div>}
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" aria-label="Espelhar datas entre contas" checked={mirror} disabled={busy} onChange={e=>setMirror(e.target.checked)}/><span>Espelhar datas e horários da mesma peça entre contas da mesma rede.<span className="block text-xs text-muted-foreground">Desative para distribuir as contas independentemente nos novos planos. Agendamentos existentes permanecem preservados.</span></span></label>
    <Button variant="accent" disabled={busy||!accounts||error} onClick={async()=>{setBusy(true);try{const current=useAuthStore.getState().settings?.distribution_prefs;await updateSettings({distribution_prefs:{...current,default_account_ids:selected,mirror_accounts:mirror}});toast.success('Padrões de publicação salvos para novas peças e planos.');}catch(e){toast.error((e as Error).message);}finally{setBusy(false);}}}>{busy?'Salvando…':'Salvar padrões de publicação'}</Button>
  </section>;
}
