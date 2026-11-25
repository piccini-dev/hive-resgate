import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadError } from '@/components/shared/LoadState';
import { baseApi } from '@/lib/campaign/bases';
import { buildCyclePlan } from '@/lib/campaign/plan';
import { cycleApi, pieceApi } from '@/lib/campaignApi';
import { db } from '@/lib/db';
import { productionApi } from '@/lib/campaign/production-api';
import { FAMILY_LABELS, pendingProduction, productionProblems, type ProductionItem, type ProductionProposal, type TemplateFamily } from '@/lib/campaign/production-plan';
import { loadHiveDesign } from '@/lib/hive/loadDesign';
import { planApi } from '@/lib/sequence/service';
import { capabilities, FORMAT_LABELS } from '@/lib/sequence/service';
import { ReviewStep } from './ReviewStep';
import { PublicationDestinations } from './PublicationDestinations';
import type { BeeEditorial, Campaign, CampaignCycle, Content, DiscoveryAvailability, DiscoveryKind, FormatCapability, Idea, KnowledgeDiscovery, SocialAccount, UserPost } from '@/types';

// stock = fluxo do estoque vivo (campanhas do acervo): a Hive escolhe mães e material.
type Props = { campaign: Campaign; cycle: CampaignCycle; ideas: Idea[]; editorials: BeeEditorial[]; accounts: SocialAccount[]; onCycleChange: (c: CampaignCycle) => void; stock?: boolean };
type Material = Pick<KnowledgeDiscovery, 'id' | 'title' | 'kind' | 'content_id'>;
const selectClass = 'w-full rounded-md border border-input bg-background p-2 text-sm';
const KIND_LABELS: Record<DiscoveryKind, string> = { caso: 'caso', conceito: 'conceito', pergunta: 'pergunta', dado: 'dado', historia: 'história', pratica: 'prática' };
const materialLabel = (d: Material) => d.kind ? `${d.title} · ${KIND_LABELS[d.kind]}` : d.title;
export function ProductionHub(props: Props) {
  // Changing cycles remounts this hub: no proposal/account choice can bleed into another campaign.
  const { cycle, campaign, editorials, onCycleChange, stock = false } = props;
  const [bases, setBases] = useState<Content[] | null>(null);
  const [material, setMaterial] = useState<Map<string, Material[]>>(new Map());
  const [exhausted, setExhausted] = useState(0);
  const [swapping, setSwapping] = useState<number | null>(null);
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
  // Estoque: mães validados (última versão validada) + os já adotados no ciclo (versão congelada), com o material livre de cada um.
  async function loadStock() {
    const [catalog, inCycle, free, found] = await Promise.all([
      baseApi.catalog(), baseApi.listByCycle(cycle.id,false),
      db.select<DiscoveryAvailability>('discovery_availability',{state:'eq.livre',select:'discovery_id'}),
      db.select<Material>('knowledge_discoveries',{status:'eq.active',content_id:'not.is.null',select:'id,title,kind,content_id',order:'created_at.asc'}),
    ]);
    const all=new Map<string,Content>();
    for(const {content,version} of catalog){
      if(!version||(campaign.profile_id&&content.profile_id&&content.profile_id!==campaign.profile_id))continue;
      all.set(content.id,{...content,body:version.body,status:'validated',metadata:{...content.metadata,base_version_id:version.id}});
    }
    const adopted=inCycle.filter(c=>c.status==='validated');
    for(const c of adopted)all.set(c.id,c);
    const freeIds=new Set(free.map(f=>f.discovery_id)), byMother=new Map<string,Material[]>();
    for(const d of found)if(d.content_id&&freeIds.has(d.id))byMother.set(d.content_id,[...(byMother.get(d.content_id)??[]),d]);
    const mothers=[...all.values()];
    setMaterial(byMother);
    setExhausted(mothers.filter(c=>!byMother.get(c.id)?.length).length);
    return mothers.filter(c=>byMother.get(c.id)?.length||adopted.some(a=>a.id===c.id));
  }
  async function load() {
    setFailed(false);
    try {
      const [b,p,c,d] = await Promise.all([stock?loadStock():baseApi.listByCycle(cycle.id,false),pieceApi.listByCycle(cycle.id),capabilities(),loadHiveDesign()]);
      setBases(b.filter(c=>c.status==='validated')); setPieces(p); setCaps(c);
      setFamilies([...new Set(d.variacoes.map(v=>v.manifestacao_id))].filter((f):f is TemplateFamily=>['M01','M02','M03'].includes(f??'')));
    } catch { setFailed(true); }
  }
  useEffect(()=>{void load();},[cycle.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{try{if(proposal)localStorage.setItem(key,JSON.stringify(proposal));else localStorage.removeItem(key);}catch{/* Approval always checks the server even when browser storage is unavailable. */}},[proposal,key]);
  function update(items: ProductionItem[]) { setProposal(p=>({summary:p?.summary??'',items})); setCommand(crypto.randomUUID()); setConfirmReplace(false); }
  async function replanFailed() {
    // Reaproveita os recortes do último plano para que o produtor possa mudar
    // apenas os repetidos, sem reconstruir bases ou recomeçar a campanha.
    if (!proposal && cycle.plan?.production?.batch_id) {
      try {
        const existing=await planApi.byCycle(cycle.id);
        const items:ProductionItem[]=existing
          .filter(p=>p.production_batch_id===cycle.plan?.production?.batch_id&&p.status!=='removed')
          .map(p=>({
            content_id:p.content_id,platform:p.platform,format:p.format,
            approach:p.approach??'',purpose:p.purpose??'',architecture:p.architecture??null,
            template_family:(p.template_family??'M01') as TemplateFamily,
            editorial_slug:p.editorial_slug??bases?.find(b=>b.id===p.content_id)?.editorial_slug??editorials[0]?.slug??'',
            discovery_ids:p.discovery_ids??[],
          }));
        if(items.length) setProposal({
          summary:'Plano anterior recuperado para reformulação. Revise as abordagens repetidas antes de aprovar uma nova produção; os rascunhos existentes só serão substituídos com sua confirmação.',
          items,
        });
      } catch (e) {
        toast.error('Não foi possível recuperar os recortes anteriores. Você ainda pode solicitar outra proposta.');
      }
    }
    setView('plan');
    void load();
  }
  async function recommend() {
    setBusy(true);
    try {
      // O seletor de bases montava o plano do ciclo; sem ele, a proposta ainda precisa da cadência das contas.
      if (stock && !cycle.plan) onCycleChange(await cycleApi.update(cycle.id,{plan:buildCyclePlan(campaign,cycle,props.accounts)}));
      setProposal(await productionApi.recommend(cycle.id,stock)); setCommand(crypto.randomUUID()); setConfirmReplace(false);
    }
    catch(e){toast.error((e as Error).message);}finally{setBusy(false);}
  }
  if(failed)return <LoadError what={stock?'o estoque de conteúdos-mãe':'a proposta de produção'} onRetry={()=>void load()}/>;
  if(!bases)return <Loader2 className="m-8 h-5 w-5 animate-spin"/>;
  if(view==='destinations')return <PublicationDestinations {...props} onBack={()=>setView('review')}/>;
  if(view==='review'||view==='legacy')return <div className="space-y-4">
    <Button variant="ghost" onClick={()=>void replanFailed()}><ArrowLeft className="h-4 w-4"/>Ver bases e proposta de produção</Button>
    <ReviewStep {...props} allowAutoProduction={view==='review'&&!!cycle.plan?.production} productionBatchId={view==='review'?cycle.plan?.production?.batch_id:undefined}
      onPreparePublication={view==='review'&&cycle.plan?.production?()=>setView('destinations'):undefined}
      onReplan={()=>void replanFailed()}/>
  </div>;
  const available=stock?new Map([...material].map(([id,list])=>[id,list.map(d=>d.id)])):undefined;
  const errors=proposal?productionProblems(proposal.items,bases,caps,families,editorials.map(e=>e.slug),available):[];
  const patch=(index:number,p:Partial<ProductionItem>)=>update(proposal!.items.map((item,i)=>i===index?{...item,...p}:item));
  const withMaterial=bases.filter(b=>material.get(b.id)?.length);
  const freeCount=withMaterial.reduce((n,b)=>n+(material.get(b.id)?.length??0),0);
  const planned=cycle.plan?.totals?.contents??0;
  const usedBy=(except:number)=>new Set((proposal?.items??[]).flatMap((p,i)=>i===except?[]:p.discovery_ids??[]));
  const firstFree=(contentId:string,except:number)=>{const used=usedBy(except);return material.get(contentId)?.find(d=>!used.has(d.id))?.id;};
  const add=()=>{
    const cap=caps.find(c=>c.format==='carousel'&&c.platform==='instagram')??caps.find(c=>c.format==='image');
    // Peça manual também leva material: o primeiro livre de um mãe com estoque.
    const c=stock?withMaterial.find(b=>firstFree(b.id,-1)):bases[0];
    if(stock&&!c){toast.error('Nenhum conteúdo-mãe tem material livre para uma nova peça. Veja Conteúdos-mãe.');return;}
    if(!c||!cap||!families.length)return;
    const first=stock?firstFree(c.id,-1):undefined;
    update([...(proposal?.items??[]),{content_id:c.id,platform:cap.platform as ProductionItem['platform'],format:cap.format,approach:'',purpose:'',architecture:cap.format==='image'?null:'conceito',template_family:families[0],editorial_slug:c.editorial_slug??editorials[0]?.slug??'',discovery_ids:first?[first]:[]}]);
  };
  const toggleMaterial=(i:number,id:string)=>{const ids=proposal!.items[i].discovery_ids??[];patch(i,{discovery_ids:ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]});};
  const noStock=stock&&!withMaterial.length;
  return <div className="space-y-5" data-testid="production-plan">
    <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Criar posts · proposta de produção</p>
      <h1 className="mt-1 font-display text-2xl font-bold">Como este conhecimento vai ganhar forma?</h1>
      <p className="mt-2 text-sm text-muted-foreground">{stock
        ?`Você tem ${withMaterial.length} conteúdos-mãe com material novo (${freeCount} materiais ainda não usados). A Hive escolhe no seu estoque o que combina com esta campanha e propõe peças com contribuições distintas. As contas serão escolhidas depois da aprovação dos posts.`
        :`Você tem ${bases.length} bases validadas. A Hive conecta esse conhecimento às necessidades da campanha e propõe peças com contribuições distintas. As contas serão escolhidas depois da aprovação dos posts.`}</p>
    </div>
    {stock&&(noStock||exhausted>0||freeCount<planned)&&<div role="status" className="space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm" data-testid="stock-warning">
      <p className="font-semibold">{noStock?'Seus conteúdos-mãe estão sem material novo.':freeCount<planned?`O estoque está curto: ${freeCount} materiais livres para ${planned} conteúdos previstos neste ciclo.`:`${exhausted} conteúdo(s)-mãe já usaram todo o material.`}</p>
      <p className="text-muted-foreground">Valide os conteúdos-mãe propostos pela Hive ou aguarde a leitura da Biblioteca para ter material novo.</p>
      <Link className="inline-block font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to="/conteudos-mae">Ver conteúdos-mãe</Link>
    </div>}
    <details className="rounded-xl border bg-card p-4"><summary className="cursor-pointer text-sm font-semibold">{stock?`Ver os ${withMaterial.length} conteúdos-mãe com material`:`Ver as ${bases.length} bases disponíveis`}</summary>
      <ul className="mt-3 space-y-2 text-sm">{(stock?withMaterial:bases).map(b=><li key={b.id}><b>{b.title}</b>{stock&&<span className="text-muted-foreground"> · {material.get(b.id)?.length} materiais</span>}<p className="text-muted-foreground">{b.body.frase}</p></li>)}</ul>
    </details>
    {pieces.some(p=>p.status!=='archived'&&!p.metadata?.delivery_of)&&<section className="space-y-2 rounded-xl border bg-card p-4">
      <p className="text-sm">{pending.length} rascunhos de posts aguardam revisão. Seus conteúdos-base estão preservados. Peças aprovadas, agendadas e publicadas permanecem no histórico.</p>
      <Button variant="outline" size="sm" onClick={()=>setView(cycle.plan?.production?'review':'legacy')}>Ver produção existente</Button>
      {cycle.plan?.production&&<Button variant="outline" size="sm" onClick={()=>setView('review')}>Retomar plano aprovado</Button>}
    </section>}
    <div className="flex flex-wrap gap-2"><Button variant="accent" disabled={busy||!bases.length||noStock} onClick={()=>void recommend()}>{busy?<Loader2 className="h-4 w-4 animate-spin"/>:<Sparkles className="h-4 w-4"/>}{proposal?'Pedir outra proposta à Hive':'Propor produção com a Hive'}</Button>
      <Button variant="outline" disabled={busy||!bases.length||!families.length||noStock} onClick={add}><Plus className="h-4 w-4"/>Eu já sei o que quero criar</Button></div>
    {proposal&&<>
      {proposal.summary&&<div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm" data-testid="production-rationale"><b>Leitura da Hive</b><p className="mt-1">{proposal.summary}</p></div>}
      <p className="text-sm font-semibold">{proposal.items.length} peças propostas · ajuste ou remova antes de produzir</p>
      <div className="space-y-4">{proposal.items.map((item,i)=>{
        const ids=item.discovery_ids??[], mine=material.get(item.content_id)??[], taken=usedBy(i);
        return <section key={i} className="space-y-3 rounded-xl border bg-card p-4" data-testid="production-plan-item">
        <div className="flex items-center justify-between gap-3"><b className="text-sm">Peça {i+1}</b><Button aria-label={`Remover peça ${i+1}`} variant="ghost" size="sm" disabled={busy} onClick={()=>{setSwapping(null);update(proposal.items.filter((_,n)=>n!==i));}}><Trash2 className="h-4 w-4"/></Button></div>
        {stock?<div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm" data-testid="production-item-stock">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><p className="text-xs text-muted-foreground">Conteúdo-mãe</p><p className="font-semibold">{bases.find(b=>b.id===item.content_id)?.title??'Conteúdo-mãe indisponível'}</p></div>
            <Button variant="outline" size="sm" disabled={busy} aria-expanded={swapping===i} aria-controls={`swap-${i}`} onClick={()=>setSwapping(swapping===i?null:i)}>{swapping===i?'Fechar':'Trocar'}</Button>
          </div>
          <div><p className="text-xs text-muted-foreground">Material novo desta peça</p>
            {ids.length?<ul className="mt-1 list-disc space-y-0.5 pl-5">{ids.map(id=>{const d=mine.find(m=>m.id===id);return <li key={id}>{d?materialLabel(d):'Material que não está mais livre'}</li>;})}</ul>
              :<p className="mt-1 text-destructive">Nenhum material escolhido.</p>}
          </div>
          {swapping===i&&<div id={`swap-${i}`} className="space-y-3 border-t pt-3">
            <label className="block space-y-1 text-xs">Escolha outro conteúdo-mãe<select className={selectClass} disabled={busy} value={item.content_id} onChange={e=>{const first=firstFree(e.target.value,i);patch(i,{content_id:e.target.value,discovery_ids:first?[first]:[]});}}>
              {bases.filter(b=>material.get(b.id)?.length||b.id===item.content_id).map(b=><option key={b.id} value={b.id}>{b.title} · {material.get(b.id)?.length??0} materiais</option>)}</select></label>
            <fieldset className="space-y-1.5"><legend className="text-xs">Material (escolha 1 ou 2)</legend>
              {mine.length?mine.map(d=>{const on=ids.includes(d.id),blocked=!on&&(ids.length>=2||taken.has(d.id));
                return <label key={d.id} className={`flex items-start gap-2 rounded-md p-1.5 text-sm ${blocked?'text-muted-foreground':''}`}>
                  <input type="checkbox" className="mt-1 h-4 w-4" disabled={busy||blocked} checked={on} onChange={()=>toggleMaterial(i,d.id)}/>
                  <span>{materialLabel(d)}{taken.has(d.id)&&!on?' · já está em outra peça':''}</span></label>;})
                :<p className="text-sm text-muted-foreground">Este conteúdo-mãe não tem material livre. Escolha outro.</p>}
            </fieldset>
          </div>}
        </div>
        :<label className="block space-y-1 text-xs">Base de conhecimento<select className={selectClass} disabled={busy} value={item.content_id} onChange={e=>patch(i,{content_id:e.target.value})}>{bases.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</select></label>}
        <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs">Plataforma<select className={selectClass} disabled={busy} value={item.platform} onChange={e=>{const platform=e.target.value as ProductionItem['platform'];patch(i,{platform,format:caps.some(c=>c.platform===platform&&c.format===item.format)?item.format:'image'});}}><option value="instagram">Instagram</option><option value="linkedin">LinkedIn</option></select></label>
          <label className="space-y-1 text-xs">Formato<select className={selectClass} disabled={busy} value={item.format} onChange={e=>patch(i,{format:e.target.value as ProductionItem['format']})}>{caps.filter(c=>c.platform===item.platform&&c.format!=='reel').map(c=><option key={c.format} value={c.format}>{FORMAT_LABELS[c.format]}</option>)}</select></label></div>
        <label className="block space-y-1 text-xs">Abordagem · o que esta peça acrescenta<Input aria-label={`Abordagem da peça ${i+1}`} disabled={busy} value={item.approach} maxLength={240} onChange={e=>patch(i,{approach:e.target.value})}/></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs">Editoria<select className={selectClass} disabled={busy} value={item.editorial_slug} onChange={e=>patch(i,{editorial_slug:e.target.value})}>{editorials.map(e=><option key={e.slug} value={e.slug}>{e.name}</option>)}</select></label>
          <label className="space-y-1 text-xs">Família visual<select className={selectClass} disabled={busy} value={item.template_family} onChange={e=>patch(i,{template_family:e.target.value as TemplateFamily})}>{families.map(f=><option key={f} value={f}>{FAMILY_LABELS[f]}</option>)}</select></label></div>
        <label className="block space-y-1 text-xs">Por que esta peça agora?<Textarea aria-label={`Propósito da peça ${i+1}`} disabled={busy} value={item.purpose} maxLength={600} onChange={e=>patch(i,{purpose:e.target.value})}/></label>
      </section>;})}</div>
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
