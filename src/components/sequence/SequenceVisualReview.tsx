import { useEffect, useState } from 'react';
import { Check, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { applyUnitCandidate, approveUnit, approveVisualSequence, proposeText, renderPending } from '@/lib/sequence/service';
import { needsSequenceRender, sequenceReviewSnapshot } from '@/lib/sequence/visual-state';
import { SequenceRewrite } from './SequenceRewrite';
import { Textarea } from '@/components/ui/textarea';
import { SequencePageEditor, type PageEditMode } from './SequencePageEditor';
import type { PostUnit, UserPost } from '@/types';

export function SequenceVisualReview({piece,units,onReload,onApproved,onTools,onChange}:{piece:UserPost;units:PostUnit[];onReload:()=>Promise<void>;onApproved:(p:UserPost)=>void;onTools:()=>void;onChange:(p:UserPost)=>void}) {
  const [busy,setBusy]=useState(false),[confirmed,setConfirmed]=useState(false);
  const [error,setError]=useState<string|null>(null),[progress,setProgress]=useState<{done:number;total:number}|null>(null);
  const [rewrite,setRewrite]=useState(false);
  const [editing,setEditing]=useState<{id:string;mode:PageEditMode}|null>(null);
  const [editingCaption,setEditingCaption]=useState(false),[caption,setCaption]=useState(piece.caption??'');
  useEffect(()=>setCaption(piece.caption??''),[piece.caption]);
  const snapshot=JSON.stringify(sequenceReviewSnapshot(piece,units));
  useEffect(()=>setConfirmed(false),[snapshot]);
  const pending=units.filter(needsSequenceRender);
  const locked=['scheduled','published'].includes(piece.status);
  const reviewed=units.length>0&&units.every(u=>!needsSequenceRender(u)&&u.review_status==='approved');
  const readonly=['approved','scheduled','published'].includes(piece.status);
  const label=piece.format==='story'?'Stories':'carrossel';
  async function render(){
    setBusy(true);setError(null);
    try {
      const r=await renderPending(piece,units,(done,total)=>setProgress({done,total}),{draftPreview:true});
      if(r.failed)setError(`${r.failed} imagem(ns) não ficaram prontas. As demais estão preservadas; tente novamente só as pendentes.`);
    }catch(e){setError((e as Error).message);}finally{await onReload().catch(()=>setError('Não foi possível atualizar as imagens. Reabra esta peça antes de continuar.'));setBusy(false);setProgress(null);}
  }
  async function saveCaption(){
    setBusy(true);setError(null);
    try{const c=await proposeText(piece,units,{scope:'caption',unitIds:[],manual:{caption}});onChange(await applyUnitCandidate(c));setEditingCaption(false);await onReload();}
    catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  async function markPage(u:PostUnit){
    setBusy(true);setError(null);try{await approveUnit(u,u.review_status!=='approved');await onReload();}catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  async function approve(){
    setBusy(true);setError(null);
    try{onApproved(await approveVisualSequence(piece,units));}
    catch(e){setError((e as Error).message);await onReload().catch(()=>{});}
    finally{setBusy(false);}
  }
  return <section className="min-w-0 space-y-5" data-testid="visual-review">
    <p className="text-sm text-muted-foreground">{units.length} {piece.format==='story'?'telas':'páginas'} · percorra a sequência e revise o conjunto.</p>
    <div className="flex w-full gap-4 overflow-x-auto pb-3" data-testid="visual-review-strip" aria-label={`Páginas do ${label}`}>
      {[...units].sort((a,b)=>a.position-b.position).map(u=><article key={u.id} className="w-64 shrink-0 space-y-2" data-testid="visual-review-page">
        <button type="button" disabled={busy||locked||!u.fabric_json} onClick={()=>setEditing({id:u.id,mode:'all'})} aria-label={`Editar arte da página ${u.position}`} className={`block w-full overflow-hidden rounded-xl border bg-card ${piece.format==='story'?'aspect-[9/16]':'aspect-[4/5]'}`}>
          {u.rendered_url?<img src={u.rendered_url} alt={`Página ${u.position}`} className="h-full w-full object-contain"/>:<div className="flex h-full flex-col justify-center gap-3 p-5"><p className="font-semibold">{u.title}</p><p className="text-sm">{u.body}</p><p className="text-xs text-muted-foreground">Imagem a produzir</p></div>}
        </button>
        <p className="text-xs text-muted-foreground">{u.position} / {units.length}{needsSequenceRender(u)?' · imagem pendente':u.review_status==='approved'?' · revisada':' · para revisar'}</p>
        {u.assets?.variant==='M03-A'&&!u.assets.manual_canvas&&(()=>{const d=u.assets.decision?.diagram as {poleA?:string;poleB?:string}|undefined;return !d?.poleA||!d?.poleB||['A','B'].includes(d.poleA)||['A','B'].includes(d.poleB);})()&&<p className="rounded border border-amber-500/30 p-2 text-xs">O diagrama ainda usa elementos genéricos. Edite os rótulos na arte ou escolha outro visual para representar melhor a mensagem.</p>}
        {!locked&&<div className="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" disabled={busy} onClick={()=>setEditing({id:u.id,mode:'text'})}>Ajustar texto</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={()=>setEditing({id:u.id,mode:'visual'})}>Alterar visual</Button>
          {!readonly&&<Button size="sm" variant={u.review_status==='approved'?'outline':'ghost'} disabled={busy||needsSequenceRender(u)} onClick={()=>void markPage(u)} aria-label={`Marcar página ${u.position} como ${u.review_status==='approved'?'não revisada':'revisada'}`}>{u.review_status==='approved'?<Check className="h-3 w-3"/>:null}{u.review_status==='approved'?'Revisada':'Marcar revisada'}</Button>}
        </div>}
        {u.error&&<details className="text-xs text-destructive"><summary>Ver motivo da falha</summary><p>{u.error}</p></details>}
      </article>)}
    </div>
    {piece.format!=='story'&&<section className="min-w-0 max-w-3xl space-y-2" data-testid="sequence-caption">
      <p className="text-sm font-semibold">Legenda</p>
      {editingCaption?<><Textarea aria-label="Editar legenda da sequência" rows={8} value={caption} disabled={busy} onChange={e=>setCaption(e.target.value)}/><div className="flex gap-2"><Button disabled={busy||!caption.trim()} onClick={()=>void saveCaption()}>Salvar legenda</Button><Button variant="ghost" disabled={busy} onClick={()=>{setCaption(piece.caption??'');setEditingCaption(false);}}>Cancelar</Button></div></>:<><p className="whitespace-pre-wrap break-words text-sm">{piece.caption||'Legenda ainda não definida.'}</p>{!locked&&<Button size="sm" variant="link" disabled={busy} onClick={()=>setEditingCaption(true)}>Editar legenda</Button>}</>}
    </section>}
    {error&&<p role="alert" className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{error}</p>}
    {progress&&<p role="status" className="text-sm">Produzindo imagens: {progress.done} de {progress.total}.</p>}
    {!readonly&&pending.length>0&&<Button variant="accent" disabled={busy} onClick={()=>void render()} data-testid="visual-render-pending">{busy?<Loader2 className="h-4 w-4 animate-spin"/>:<RefreshCw className="h-4 w-4"/>}Produzir {pending.length} imagem(ns) pendente(s)</Button>}
    {!readonly&&<div className="space-y-3">
      <p className="text-xs text-muted-foreground">Marque as páginas revisadas acima ou confirme a revisão do conjunto abaixo. A aprovação final é uma só e não agenda o post.</p>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={confirmed} disabled={busy||!units.length||pending.length>0} onChange={e=>setConfirmed(e.target.checked)}/>Revisei o texto e todas as imagens desta sequência.</label>
      <Button variant="accent" disabled={busy||editingCaption||(!confirmed&&!reviewed)||!units.length||pending.length>0} onClick={()=>void approve()} data-testid="visual-sequence-approve">{busy?<Loader2 className="h-4 w-4 animate-spin"/>:<Check className="h-4 w-4"/>}Aprovar {label}</Button>
    </div>}
    <Button variant="link" size="sm" disabled={busy} onClick={()=>readonly?onTools():setRewrite(true)} data-testid="visual-review-tools">{readonly?'Ver detalhes e exportação':'Reformular roteiro completo'}</Button>
    {rewrite&&<SequenceRewrite piece={piece} units={units} onClose={()=>setRewrite(false)} onSaved={async p=>{onChange(p);await onReload();}}/>}
    {editing&&units.find(u=>u.id===editing.id)&&<SequencePageEditor key={editing.id} piece={piece} units={units} unit={units.find(u=>u.id===editing.id)!} initialMode={editing.mode} onClose={()=>setEditing(null)} onSaved={async p=>{onChange(p);await onReload();}}/>}
  </section>;
}
