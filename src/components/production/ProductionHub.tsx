import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadError } from '@/components/shared/LoadState';
import { baseApi } from '@/lib/campaign/bases';
import { cycleApi, pieceApi } from '@/lib/campaignApi';
import { productionApi } from '@/lib/campaign/production-api';
import { FAMILY_LABELS, pendingProduction, productionProblems, type ProductionItem, type ProductionProposal, type TemplateFamily } from '@/lib/campaign/production-plan';
import { loadHiveDesign } from '@/lib/hive/loadDesign';
import { capabilities, FORMAT_LABELS } from '@/lib/sequence/service';
import { ReviewStep } from './ReviewStep';
import { PublicationDestinations } from './PublicationDestinations';
import type { BeeEditorial, Campaign, CampaignCycle, Content, FormatCapability, Idea, SocialAccount, UserPost } from '@/types';

type Props = { campaign: Campaign; cycle: CampaignCycle; ideas: Idea[]; editorials: BeeEditorial[]; accounts: SocialAccount[]; onCycleChange: (c: CampaignCycle) => void };
const selectClass = 'w-full rounded-md border border-input bg-background p-2 text-sm';
export function ProductionHub(props: Props) {
  // Changing cycles remounts this hub: no proposal/account choice can bleed into another campaign.
  const { cycle, campaign, editorials, onCycleChange } = props;
  const [bases, setBases] = useState<Content[] | null>(null);
  const [pieces, setPieces] = useState<UserPost[]>([]);
  const [caps, setCaps] = useState<FormatCapability[]>([]);
  const [families, setFamilies] = useState<TemplateFamily[]>([]);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<'plan'|'legacy'|'review'|'destinations'>(cycle.plan?.production ? 'review' : 'plan');
  const key = `hive:production-proposal:${cycle.user_id}:${cycle.id}`;
  const [proposal, setProposal] = useState<ProductionProposal | null>(() => {
    try { const p=JSON.parse(localStorage.getItem(key)??'null'); return p && Array.isArray(p.items) && p.items.length<=40 ? p : null; } catch { return null; }
  });
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [command, setCommand] = useState(() => crypto.randomUUID());
  const pending = pendingProduction(pieces);
  async function load() {
    setFailed(false);
    try {
      const [b,p,c,d] = await Promise.all([baseApi.listByCycle(cycle.id,false),pieceApi.listByCycle(cycle.id),capabilities(),loadHiveDesign()]);
      setBases(b.filter(c=>c.status==='validated')); setPieces(p); setCaps(c);
      setFamilies([...new Set(d.variacoes.map(v=>v.manifestacao_id))].filter((f):f is TemplateFamily=>['M01','M02','M03'].includes(f??'')));
    } catch { setFailed(true); }
  }
  useEffect(()=>{void load();},[cycle.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{try{if(proposal)localStorage.setItem(key,JSON.stringify(proposal));else localStorage.removeItem(key);}catch{/* Approval always checks the server even when browser storage is unavailable. */}},[proposal,key]);
  function update(items: ProductionItem[]) { setProposal(p=>({summary:p?.summary??'',items})); setCommand(crypto.randomUUID()); setConfirmReplace(false); }
  async function recommend() {
    setBusy(true);
    try { setProposal(await productionApi.recommend(cycle.id)); setCommand(crypto.randomUUID()); setConfirmReplace(false); }
    catch(e){toast.error((e as Error).message);}finally{setBusy(false);}
  }
  if(failed)return <LoadError what="a proposta de produção" onRetry={()=>void load()}/>;
  if(!bases)return <Loader2 className="m-8 h-5 w-5 animate-spin"/>;
  if(view==='destinations')return <PublicationDestinations {...props} onBack={()=>setView('review')}/>;
  if(view==='review'||view==='legacy')return <div className="space-y-4">
    <Button variant="ghost" onClick={()=>{setView('plan');void load();}}><ArrowLeft className="h-4 w-4"/>Ver bases e proposta de produção</Button>
    <ReviewStep {...props} allowAutoProduction={view==='review'&&!!cycle.plan?.production} productionBatchId={view==='review'?cycle.plan?.production?.batch_id:undefined}
      onPreparePublication={view==='review'&&cycle.plan?.production?()=>setView('destinations'):undefined}/>
  </div>;
  const errors=proposal?productionProblems(proposal.items,bases,caps,families,editorials.map(e=>e.slug)):[];
  const patch=(index:number,p:Partial<ProductionItem>)=>update(proposal!.items.map((item,i)=>i===index?{...item,...p}:item));
  const add=()=>{
    const c=bases[0],cap=caps.find(c=>c.format==='carousel'&&c.platform==='instagram')??caps.find(c=>c.format==='image');
    if(!c||!cap||!families.length)return;
    update([...(proposal?.items??[]),{content_id:c.id,platform:cap.platform as ProductionItem['platform'],format:cap.format,approach:'',purpose:'',architecture:cap.format==='image'?null:'conceito',template_family:families[0],editorial_slug:c.editorial_slug??editorials[0]?.slug??''}]);
  };
  return <div className="space-y-5" data-testid="production-plan">
    <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Criar posts · proposta de produção</p>
      <h1 className="mt-1 font-display text-2xl font-bold">Como este conhecimento vai ganhar forma?</h1>
      <p className="mt-2 text-sm text-muted-foreground">Você tem {bases.length} bases validadas. A Hive conecta esse conhecimento às necessidades da campanha e propõe peças com contribuições distintas. As contas serão escolhidas depois da aprovação dos posts.</p>
    </div>
    <details className="rounded-xl border bg-card p-4"><summary className="cursor-pointer text-sm font-semibold">Ver as {bases.length} bases disponíveis</summary>
      <ul className="mt-3 space-y-2 text-sm">{bases.map(b=><li key={b.id}><b>{b.title}</b><p className="text-muted-foreground">{b.body.frase}</p></li>)}</ul>
    </details>
    {pieces.some(p=>p.status!=='archived'&&!p.metadata?.delivery_of)&&<section className="space-y-2 rounded-xl border bg-card p-4">
      <p className="text-sm">{pending.length} rascunhos de posts aguardam revisão. Seus conteúdos-base estão preservados. Peças aprovadas, agendadas e publicadas permanecem no histórico.</p>
      <Button variant="outline" size="sm" onClick={()=>setView('legacy')}>Ver produção existente</Button>
      {cycle.plan?.production&&<Button variant="outline" size="sm" onClick={()=>setView('review')}>Retomar plano aprovado</Button>}
    </section>}
    <div className="flex flex-wrap gap-2"><Button variant="accent" disabled={busy||!bases.length} onClick={()=>void recommend()}>{busy?<Loader2 className="h-4 w-4 animate-spin"/>:<Sparkles className="h-4 w-4"/>}{proposal?'Pedir outra proposta à Hive':'Propor produção com a Hive'}</Button>
      <Button variant="outline" disabled={busy||!bases.length||!families.length} onClick={add}><Plus className="h-4 w-4"/>Eu já sei o que quero criar</Button></div>
    {proposal&&<>
      {proposal.summary&&<div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm" data-testid="production-rationale"><b>Leitura da Hive</b><p className="mt-1">{proposal.summary}</p></div>}
      <p className="text-sm font-semibold">{proposal.items.length} peças propostas · ajuste ou remova antes de produzir</p>
      <div className="space-y-4">{proposal.items.map((item,i)=><section key={i} className="space-y-3 rounded-xl border bg-card p-4" data-testid="production-plan-item">
        <div className="flex items-center justify-between gap-3"><b className="text-sm">Peça {i+1}</b><Button aria-label={`Remover peça ${i+1}`} variant="ghost" size="sm" disabled={busy} onClick={()=>update(proposal.items.filter((_,n)=>n!==i))}><Trash2 className="h-4 w-4"/></Button></div>
        <label className="block space-y-1 text-xs">Base de conhecimento<select className={selectClass} disabled={busy} value={item.content_id} onChange={e=>patch(i,{content_id:e.target.value})}>{bases.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</select></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs">Plataforma<select className={selectClass} disabled={busy} value={item.platform} onChange={e=>{const platform=e.target.value as ProductionItem['platform'];patch(i,{platform,format:caps.some(c=>c.platform===platform&&c.format===item.format)?item.format:'image'});}}><option value="instagram">Instagram</option><option value="linkedin">LinkedIn</option></select></label>
          <label className="space-y-1 text-xs">Formato<select className={selectClass} disabled={busy} value={item.format} onChange={e=>patch(i,{format:e.target.value as ProductionItem['format']})}>{caps.filter(c=>c.platform===item.platform&&c.format!=='reel').map(c=><option key={c.format} value={c.format}>{FORMAT_LABELS[c.format]}</option>)}</select></label></div>
        <label className="block space-y-1 text-xs">Abordagem · o que esta peça acrescenta<Input aria-label={`Abordagem da peça ${i+1}`} disabled={busy} value={item.approach} maxLength={240} onChange={e=>patch(i,{approach:e.target.value})}/></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs">Editoria<select className={selectClass} disabled={busy} value={item.editorial_slug} onChange={e=>patch(i,{editorial_slug:e.target.value})}>{editorials.map(e=><option key={e.slug} value={e.slug}>{e.name}</option>)}</select></label>
          <label className="space-y-1 text-xs">Família visual<select className={selectClass} disabled={busy} value={item.template_family} onChange={e=>patch(i,{template_family:e.target.value as TemplateFamily})}>{families.map(f=><option key={f} value={f}>{FAMILY_LABELS[f]}</option>)}</select></label></div>
        <label className="block space-y-1 text-xs">Por que esta peça agora?<Textarea aria-label={`Propósito da peça ${i+1}`} disabled={busy} value={item.purpose} maxLength={600} onChange={e=>patch(i,{purpose:e.target.value})}/></label>
      </section>)}</div>
      <Button variant="outline" size="sm" disabled={busy||proposal.items.length>=40} onClick={add}><Plus className="h-4 w-4"/>Adicionar uma peça</Button>
      <p className="text-xs text-muted-foreground">Reels exigem um fluxo de vídeo ainda não disponível. Convites usam o fluxo específico de eventos. Só famílias com receitas prontas são oferecidas aqui; a fotografia depende das referências da voz.</p>
      {pending.length>0&&<label className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm"><input type="checkbox" className="mt-1" disabled={busy} checked={confirmReplace} onChange={e=>setConfirmReplace(e.target.checked)}/><span>Confirmo substituir estes {pending.length} rascunhos pela nova produção. Os rascunhos ficam arquivados; as bases validadas permanecem disponíveis.</span></label>}
      {errors.length>0&&<ul className="space-y-1 text-xs text-destructive">{errors.slice(0,5).map((e,i)=><li key={i}>{e}</li>)}</ul>}
      <Button variant="accent" size="lg" disabled={busy||errors.length>0||(pending.length>0&&!confirmReplace)} onClick={async()=>{
        setBusy(true);try{const c=await productionApi.approve(cycle,command,bases,proposal.items,pending.map(p=>p.id));onCycleChange(c);setProposal(null);setView('review');toast.success('Proposta aprovada. A Hive vai produzir as peças selecionadas.');}
        catch(e){
          toast.error((e as Error).message);
          const latest=await cycleApi.get(cycle.id).catch(()=>null);
          if(latest){onCycleChange(latest);if(latest.plan?.production?.batch_id===command){setProposal(null);setView('review');}}
          setConfirmReplace(false);await load();
        }finally{setBusy(false);}
      }}>Aprovar proposta e produzir posts <ArrowRight className="h-4 w-4"/></Button>
      <p className="text-xs text-muted-foreground">Esta aprovação libera a produção. Cada post terá sua própria revisão antes de selecionar contas e agendar.</p>
    </>}
  </div>;
}
