import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import { pieceApi } from '@/lib/campaignApi';
import { editorialPieces } from '@/lib/campaign/production-plan';
import { FORMAT_LABELS } from '@/lib/sequence/service';
import { defaultDestinations, previewUrls } from '@/lib/publicationDefaults';
import { useAuthStore } from '@/store/authStore';
import type { Campaign, CampaignCycle, PostUnit, SocialAccount, UserPost } from '@/types';

interface Material { hash:string; duplicates:Array<{id:string;account_id:string;platform:string;status:string}>; deliveries:Array<{id:string;account_id:string|null;status:string;source_hash?:string}> }
interface Entry { piece:UserPost;material:Material;selected:string[];allowRepeat:boolean;note:string;confirmed:boolean;images:string[];error?:string }
const approved=(p:UserPost)=>['approved','scheduled','published'].includes(p.status);
const protectedEntry=(e:Entry)=>e.material.deliveries.some(d=>['scheduled','published'].includes(d.status));
const repeats=(e:Entry)=>e.selected.some(id=>e.material.duplicates.some(d=>d.account_id===id));

export function PublicationDestinations({campaign,cycle,accounts,onBack,onCycleChange}:{campaign:Campaign;cycle:CampaignCycle;accounts:SocialAccount[];onBack:()=>void;onCycleChange:(c:CampaignCycle)=>void}) {
  const navigate=useNavigate(),prefs=useAuthStore(s=>s.settings?.distribution_prefs);
  const [entries,setEntries]=useState<Entry[]|null>(null),[error,setError]=useState(false),[busy,setBusy]=useState(false),[progress,setProgress]=useState({done:0,total:0});
  async function load(failures:Record<string,string>={}):Promise<Entry[]> {
    setError(false);
    try {
      const pieces=editorialPieces(await pieceApi.listByCycle(cycle.id)).filter(p=>p.status!=='archived'&&(!cycle.plan?.production||p.metadata?.production_batch_id===cycle.plan.production.batch_id));
      const pages=pieces.length?await db.select<Pick<PostUnit,'post_id'|'position'|'rendered_url'>>('post_units',{post_id:'in.('+pieces.map(p=>p.id).join(',')+')',select:'post_id,position,rendered_url',order:'position.asc'}):[];
      const rows=await Promise.all(pieces.map(async piece=>{
        const material=await db.rpc<Material>('publication_material',{p_post:piece.id});
        const hasRepeat=material.duplicates.some(d=>material.deliveries.some(x=>x.account_id===d.account_id));
        const confirmed=piece.metadata?.destinations_confirmed===true&&piece.metadata?.destination_material_hash===material.hash&&piece.metadata?.destination_account_id===piece.account_id&&(!hasRepeat||piece.metadata?.intentional_republish===true);
        const established=piece.metadata?.destinations_confirmed===true||material.deliveries.some(d=>d.id!==piece.id||['scheduled','published'].includes(d.status));
        const selected=established?material.deliveries.flatMap(d=>d.account_id?[d.account_id]:[]):defaultDestinations(piece.platform,accounts,prefs,campaign.account_ids);
        const images=pages.filter(p=>p.post_id===piece.id).flatMap(p=>p.rendered_url?[p.rendered_url]:[]);
        return {piece,material,selected,allowRepeat:false,note:'',confirmed,images:images.length?images:previewUrls(piece),error:failures[piece.id]} as Entry;
      }));
      setEntries(previous=>rows.map(row=>{
        const old=previous?.find(e=>e.piece.id===row.piece.id);
        return old&&!row.confirmed&&!protectedEntry(row)&&old.material.hash===row.material.hash
          ?{...row,selected:old.selected,allowRepeat:old.allowRepeat,note:old.note}:row;
      }));
      return rows;
    } catch(e){setError(true);throw e;}
  }
  useEffect(()=>{void load().catch(()=>{});},[cycle.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const change=(id:string,patch:Partial<Entry>)=>setEntries(es=>es?.map(e=>e.piece.id===id?{...e,...patch,error:undefined}:e)??null);
  const canConfirm=(e:Entry)=>approved(e.piece)&&!protectedEntry(e)&&e.selected.length>0&&e.selected.every(id=>accounts.some(a=>a.id===id&&a.platform===e.piece.platform&&a.status==='connected'))&&(!repeats(e)||(e.allowRepeat&&e.note.trim().length>=5));
  async function confirmAndContinue(){
    if(!entries||busy||!entries.every(e=>e.confirmed||canConfirm(e)))return;
    setBusy(true);const todo=entries.filter(e=>!e.confirmed),failures:Record<string,string>={};setProgress({done:0,total:todo.length});
    try{
      for(const [i,e] of todo.entries()){
        try{await db.rpc('prepare_piece_destinations',{p_post:e.piece.id,p_expected_hash:e.material.hash,p_accounts:e.selected,p_allow_repeat:e.allowRepeat,p_repeat_note:e.note||null});}
        catch(err){const message=(err as Error).message;failures[e.piece.id]=message;if(/HTTP 403/.test(message))break;}
        setProgress({done:i+1,total:todo.length});
      }
      const rows=await load(failures);
      if(Object.keys(failures).length||!rows.every(e=>e.confirmed)){toast.error('Alguns destinos não foram confirmados. Confira as peças pendentes; os sucessos foram preservados.');return;}
      const c=await db.rpc<CampaignCycle>('complete_cycle_production',{p_cycle:cycle.id});onCycleChange(c);navigate('/agenda?campaign='+campaign.id);
    }catch(e){toast.error((e as Error).message);}finally{setBusy(false);}
  }
  if(error)return <div className="space-y-3"><p role="alert">Não foi possível conferir os destinos.</p><Button variant="outline" onClick={()=>void load().catch(()=>{})}>Tentar novamente</Button></div>;
  if(!entries)return <Loader2 className="m-8 h-5 w-5 animate-spin"/>;
  const allDone=entries.length>0&&entries.every(e=>e.confirmed),ready=entries.length>0&&entries.every(e=>e.confirmed||canConfirm(e));
  return <div className="space-y-5" data-testid="publication-destinations">
    <Button variant="ghost" disabled={busy} onClick={onBack}><ArrowLeft className="h-4 w-4"/>Voltar à revisão</Button>
    <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Preparar publicação</p><h1 className="mt-1 font-display text-2xl font-bold">Confira as peças e as contas</h1>
      <p className="mt-2 text-sm text-muted-foreground">O material já aprovado será usado nas contas selecionadas. Confirme o conjunto para seguir à agenda; cada conta terá seu próprio agendamento e histórico.</p>
      <Link to="/configuracoes" state={{tab:'accounts'}} className="text-sm underline">Configurar contas padrão e espelhamento</Link></div>
    <p className="text-sm" data-testid="destinations-summary">{entries.filter(e=>e.confirmed).length} de {entries.length} peças com destinos confirmados</p>
    {entries.map(e=>{
      const compatible=accounts.filter(a=>a.platform===e.piece.platform),locked=protectedEntry(e);
      return <section key={e.piece.id} className="space-y-3 rounded-xl border bg-card p-4" data-testid="destination-piece" data-post={e.piece.id}>
        <div className="flex gap-4">
          {approved(e.piece)&&<div className="flex max-w-[45%] gap-2 overflow-x-auto" data-testid="destination-previews">{e.images.map((url,i)=><img key={i} src={url} alt={'Peça aprovada · página '+(i+1)} className="h-36 w-auto shrink-0 rounded border object-contain"/>)}</div>}
          <div className="min-w-0 space-y-2"><p className="font-semibold">{e.piece.carousel_text?.quote as string||e.piece.title}</p><p className="text-xs text-muted-foreground">{e.piece.platform==='instagram'?'Instagram':'LinkedIn'} · {FORMAT_LABELS[e.piece.format??'image']}</p>
          <details className="text-sm"><summary className="cursor-pointer">Ler legenda aprovada</summary><p className="mt-2 whitespace-pre-wrap break-words">{e.piece.caption}</p></details></div>
        </div>
        {!approved(e.piece)&&<p className="text-sm text-amber-700">Esta peça ainda precisa de aprovação editorial. Volte à revisão antes de continuar.</p>}
        <div className="flex flex-wrap gap-2">{compatible.map(a=><label key={a.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><input type="checkbox" aria-label={'Conta '+a.label} disabled={busy||!approved(e.piece)||locked||a.status!=='connected'} checked={e.selected.includes(a.id)} onChange={()=>change(e.piece.id,{selected:e.selected.includes(a.id)?e.selected.filter(id=>id!==a.id):[...e.selected,a.id],confirmed:false,allowRepeat:false,note:''})}/>{a.label}{a.status!=='connected'?' · desconectada':''}</label>)}</div>
        {!compatible.some(a=>a.status==='connected')&&<p className="text-sm text-muted-foreground">Conecte uma conta desta plataforma em Configurações.</p>}
        {locked&&!e.confirmed&&<p role="alert" className="text-sm text-amber-700">Há material já agendado ou publicado. Ele permanece preservado; confira a peça na revisão.</p>}
        {repeats(e)&&!e.confirmed&&<div className="space-y-2 rounded-lg bg-amber-500/10 p-3 text-sm"><p>Este conteúdo já está aprovado, agendado ou publicado em uma conta selecionada.</p><label className="flex items-center gap-2"><input type="checkbox" disabled={busy} checked={e.allowRepeat} onChange={x=>change(e.piece.id,{allowRepeat:x.target.checked})}/>Quero republicar intencionalmente</label>{e.allowRepeat&&<Input aria-label="Motivo da republicação" placeholder="Por que faz sentido repetir agora?" value={e.note} onChange={x=>change(e.piece.id,{note:x.target.value})}/>}</div>}
        {e.error&&<p role="alert" className="text-sm text-destructive">{e.error}</p>}
        {e.confirmed&&<p className="flex items-center gap-2 text-sm text-emerald-600"><Check className="h-4 w-4"/>Destinos confirmados para este material</p>}
      </section>;
    })}
    <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-4">
      <p className="text-sm text-muted-foreground">{busy?'Confirmando '+progress.done+' de '+progress.total+'…':'Confira as contas e confirme o conjunto uma única vez.'}</p>
      <Button variant="accent" size="lg" disabled={busy||!ready} onClick={()=>void confirmAndContinue()}>{busy?<Loader2 className="h-4 w-4 animate-spin"/>:<ArrowRight className="h-4 w-4"/>}{allDone?'Seguir para a agenda':'Confirmar destinos e seguir'}</Button>
    </div>
  </div>;
}
