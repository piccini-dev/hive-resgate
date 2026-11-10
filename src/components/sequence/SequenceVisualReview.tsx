import { useEffect, useState } from 'react';
import { Check, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { approveVisualSequence, renderPending } from '@/lib/sequence/service';
import { needsSequenceRender, sequenceReviewSnapshot } from '@/lib/sequence/visual-state';
import type { PostUnit, UserPost } from '@/types';

export function SequenceVisualReview({piece,units,onReload,onApproved,onTools}:{piece:UserPost;units:PostUnit[];onReload:()=>Promise<void>;onApproved:(p:UserPost)=>void;onTools:()=>void}) {
  const [busy,setBusy]=useState(false),[confirmed,setConfirmed]=useState(false);
  const [error,setError]=useState<string|null>(null),[progress,setProgress]=useState<{done:number;total:number}|null>(null);
  const snapshot=JSON.stringify(sequenceReviewSnapshot(piece,units));
  useEffect(()=>setConfirmed(false),[snapshot]);
  const pending=units.filter(needsSequenceRender);
  const readonly=['approved','scheduled','published'].includes(piece.status);
  const label=piece.format==='story'?'Stories':'carrossel';
  async function render(){
    setBusy(true);setError(null);
    try {
      const r=await renderPending(piece,units,(done,total)=>setProgress({done,total}),{draftPreview:true});
      if(r.failed)setError(`${r.failed} imagem(ns) não ficaram prontas. As demais estão preservadas; tente novamente só as pendentes.`);
    }catch(e){setError((e as Error).message);}finally{await onReload().catch(()=>setError('Não foi possível atualizar as imagens. Reabra esta peça antes de continuar.'));setBusy(false);setProgress(null);}
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
        <div className={`overflow-hidden rounded-xl border bg-card ${piece.format==='story'?'aspect-[9/16]':'aspect-[4/5]'}`}>
          {u.rendered_url?<img src={u.rendered_url} alt={`Página ${u.position}`} className="h-full w-full object-contain"/>:<div className="flex h-full flex-col justify-center gap-3 p-5"><p className="font-semibold">{u.title}</p><p className="text-sm">{u.body}</p><p className="text-xs text-muted-foreground">Imagem a produzir</p></div>}
        </div>
        <p className="text-xs text-muted-foreground">{u.position} / {units.length}{needsSequenceRender(u)?' · imagem pendente':''}</p>
        {u.error&&<details className="text-xs text-destructive"><summary>Ver motivo da falha</summary><p>{u.error}</p></details>}
      </article>)}
    </div>
    {piece.format!=='story'&&piece.caption&&<div className="max-w-3xl space-y-2"><p className="text-sm font-semibold">Legenda</p><p className="whitespace-pre-wrap text-sm">{piece.caption}</p></div>}
    {error&&<p role="alert" className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{error}</p>}
    {progress&&<p role="status" className="text-sm">Produzindo imagens: {progress.done} de {progress.total}.</p>}
    {!readonly&&pending.length>0&&<Button variant="accent" disabled={busy} onClick={()=>void render()} data-testid="visual-render-pending">{busy?<Loader2 className="h-4 w-4 animate-spin"/>:<RefreshCw className="h-4 w-4"/>}Produzir {pending.length} imagem(ns) pendente(s)</Button>}
    {!readonly&&<div className="space-y-3">
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={confirmed} disabled={busy||!units.length||pending.length>0} onChange={e=>setConfirmed(e.target.checked)}/>Revisei o texto e todas as imagens desta sequência.</label>
      <Button variant="accent" disabled={busy||!confirmed||!units.length||pending.length>0} onClick={()=>void approve()} data-testid="visual-sequence-approve">{busy?<Loader2 className="h-4 w-4 animate-spin"/>:<Check className="h-4 w-4"/>}Aprovar {label}</Button>
    </div>}
    <Button variant="link" size="sm" disabled={busy} onClick={onTools} data-testid="visual-review-tools">{readonly?'Ver detalhes e exportação':'Editar texto, ajustar com a Hive ou ver detalhes'}</Button>
  </section>;
}
