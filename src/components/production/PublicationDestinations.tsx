import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import { pieceApi } from '@/lib/campaignApi';
import { editorialPieces } from '@/lib/campaign/production-plan';
import { FORMAT_LABELS } from '@/lib/sequence/service';
import type { Campaign, CampaignCycle, SocialAccount, UserPost } from '@/types';
interface Material { hash: string; duplicates: Array<{id:string;account_id:string;platform:string;status:string}>; deliveries: Array<{id:string;account_id:string|null;status:string;source_hash?:string}> }
interface Entry { piece:UserPost;material:Material;selected:string[];allowRepeat:boolean;note:string;confirmed:boolean }
export function PublicationDestinations({campaign,cycle,accounts,onBack,onCycleChange}:{campaign:Campaign;cycle:CampaignCycle;accounts:SocialAccount[];onBack:()=>void;onCycleChange:(c:CampaignCycle)=>void}) {
  const navigate=useNavigate();
  const [entries,setEntries]=useState<Entry[]|null>(null);
  const [error,setError]=useState(false);
  const [busy,setBusy]=useState<string|null>(null);
  async function load(){
    setError(false);
    try{
      const pieces=editorialPieces(await pieceApi.listByCycle(cycle.id)).filter(p=>p.status!=='archived'&&(!cycle.plan?.production||p.metadata?.production_batch_id===cycle.plan.production.batch_id));
      const rows=await Promise.all(pieces.map(async piece=>{
        const material=await db.rpc<Material>('publication_material',{p_post:piece.id});
        const hasRepeat=material.duplicates.some(d=>material.deliveries.some(x=>x.account_id===d.account_id));
        const selected=material.deliveries.map(d=>d.account_id).filter((a):a is string=>!!a);
        return {piece,material,selected,allowRepeat:false,note:'',confirmed:piece.metadata?.destinations_confirmed===true&&piece.metadata?.destination_material_hash===material.hash&&(!hasRepeat||piece.metadata?.intentional_republish===true)};
      }));setEntries(rows);
    }catch{setError(true);}
  }
  useEffect(()=>{void load();},[cycle.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const change=(id:string,patch:Partial<Entry>)=>setEntries(es=>es?.map(e=>e.piece.id===id?{...e,...patch}:e)??null);
  if(error)return <div className="space-y-3"><p role="alert">Não foi possível conferir os destinos.</p><Button variant="outline" onClick={()=>void load()}>Tentar novamente</Button></div>;
  if(!entries)return <Loader2 className="m-8 h-5 w-5 animate-spin"/>;
  const allDone=entries.length>0&&entries.every(e=>e.confirmed);
  return <div className="space-y-5" data-testid="publication-destinations">
    <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4"/>Voltar à revisão</Button>
    <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Preparar publicação</p><h1 className="mt-1 font-display text-2xl font-bold">Em quais contas vamos usar cada peça?</h1>
      <p className="mt-2 text-sm text-muted-foreground">O conteúdo foi revisado uma vez. Agora confirme os destinos compatíveis. Cada conta terá seu próprio agendamento e histórico, usando o mesmo material aprovado.</p></div>
    {entries.map(e=>{
      const compatible=accounts.filter(a=>a.platform===e.piece.platform&&a.status==='connected');
      const duplicateAccounts=new Set(e.material.duplicates.map(d=>d.account_id));
      const hasRepeat=e.selected.some(id=>duplicateAccounts.has(id));
      const approved=['approved','scheduled','published'].includes(e.piece.status);
      const protectedPiece=e.material.deliveries.some(d=>['scheduled','published'].includes(d.status));
      return <section key={e.piece.id} className="space-y-3 rounded-xl border bg-card p-4" data-testid="destination-piece">
        <p className="font-semibold">{e.piece.carousel_text?.quote as string||e.piece.title}</p>
        <p className="text-xs text-muted-foreground">{e.piece.platform==='instagram'?'Instagram':'LinkedIn'} · {FORMAT_LABELS[e.piece.format??'image']}</p>
        {!approved&&<p className="text-sm text-amber-700">Esta peça ainda precisa de aprovação editorial.</p>}
        <div className="flex flex-wrap gap-2">{compatible.map(a=><label key={a.id} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm"><input type="checkbox" disabled={!!busy||!approved||protectedPiece} checked={e.selected.includes(a.id)} onChange={()=>change(e.piece.id,{selected:e.selected.includes(a.id)?e.selected.filter(id=>id!==a.id):[...e.selected,a.id],confirmed:false,allowRepeat:false,note:''})}/>{a.label}</label>)}</div>
        {!compatible.length&&<p className="text-sm text-muted-foreground">Conecte uma conta desta plataforma em Configurações para continuar.</p>}
        {hasRepeat&&!e.confirmed&&<div className="space-y-2 rounded-lg bg-amber-500/10 p-3 text-sm">
          <p>O mesmo conteúdo já está aprovado, agendado ou publicado em uma das contas selecionadas.</p>
          <label className="flex items-center gap-2"><input type="checkbox" disabled={!!busy} checked={e.allowRepeat} onChange={x=>change(e.piece.id,{allowRepeat:x.target.checked})}/>Quero republicar intencionalmente</label>
          {e.allowRepeat&&<Input aria-label="Motivo da republicação" placeholder="Por que faz sentido repetir agora?" value={e.note} onChange={x=>change(e.piece.id,{note:x.target.value})}/>}
        </div>}
        {e.confirmed?<p className="flex items-center gap-2 text-sm text-emerald-600"><Check className="h-4 w-4"/>Destinos confirmados para este material</p>:
          <Button variant="accent" size="sm" disabled={!!busy||!approved||!e.selected.length||(hasRepeat&&(!e.allowRepeat||e.note.trim().length<5))} onClick={async()=>{
            setBusy(e.piece.id);try{await db.rpc('prepare_piece_destinations',{p_post:e.piece.id,p_expected_hash:e.material.hash,p_accounts:e.selected,p_allow_repeat:e.allowRepeat,p_repeat_note:e.note||null});await load();toast.success('Destinos confirmados.');}
            catch(err){toast.error((err as Error).message);await load();}finally{setBusy(null);}
          }}>{busy===e.piece.id?<Loader2 className="h-4 w-4 animate-spin"/>:<Check className="h-4 w-4"/>}Confirmar destinos</Button>}
      </section>;
    })}
    <Button variant="accent" size="lg" disabled={!!busy||!allDone} onClick={async()=>{
      setBusy('finish');try{const c=await db.rpc<CampaignCycle>('complete_cycle_production',{p_cycle:cycle.id});onCycleChange(c);navigate(`/agenda?campaign=${campaign.id}`);}
      catch(e){toast.error((e as Error).message);}finally{setBusy(null);}
    }}>Seguir para a agenda <ArrowRight className="h-4 w-4"/></Button>
  </div>;
}
