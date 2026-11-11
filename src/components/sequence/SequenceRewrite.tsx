import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { applyUnitCandidate, discardUnitCandidate, proposeSequenceText, proposeText, renderPending, type UnitCandidate } from '@/lib/sequence/service';
import type { PostUnit, UserPost } from '@/types';

export function SequenceRewrite({piece,units,onClose,onSaved}:{piece:UserPost;units:PostUnit[];onClose:()=>void;onSaved:(p:UserPost)=>Promise<void>}){
  const [texts,setTexts]=useState(units.map(u=>({id:u.id,title:u.title??'',body:u.body??''})));
  const [instruction,setInstruction]=useState(''),[candidate,setCandidate]=useState<UnitCandidate|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null);
  async function run(fn:()=>Promise<void>){setBusy(true);setError(null);try{await fn();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  async function close(){if(busy)return;if(candidate)await discardUnitCandidate(candidate).catch(()=>{});onClose();}
  return <Dialog open onOpenChange={open=>{if(!open)void close();}}><DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto" onPointerDownOutside={e=>e.preventDefault()} onEscapeKeyDown={e=>{if(busy)e.preventDefault();}}>
    <DialogTitle>Reformular o roteiro completo</DialogTitle><DialogDescription>Use este espaço para rever a linha de pensamento da sequência. Para uma correção pontual, volte e ajuste apenas a página desejada. A legenda permanece preservada.</DialogDescription>
    {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
    {candidate?<div className="space-y-4" data-testid="sequence-rewrite-proposal">
      {(candidate.proposal?.units??[]).map(u=><section key={u.id} className="grid gap-3 rounded border p-3 md:grid-cols-2"><div><p className="text-xs text-muted-foreground">Atual</p><b>{units.find(x=>x.id===u.id)?.title}</b><p className="whitespace-pre-wrap text-sm">{units.find(x=>x.id===u.id)?.body}</p></div><div><p className="text-xs text-muted-foreground">Proposta</p><b>{u.title}</b><p className="whitespace-pre-wrap text-sm">{u.body}</p></div></section>)}
      <Button disabled={busy} variant="accent" onClick={()=>void run(async()=>{const p=await applyUnitCandidate(candidate);setCandidate(null);const r=await renderPending(p,[],undefined,{draftPreview:true});await onSaved(p);if(r.failed)throw new Error('Roteiro salvo. Algumas imagens precisam de ajuste; volte à revisão para retomar.');onClose();})}>Aplicar roteiro e atualizar imagens necessárias</Button>
      <Button disabled={busy} variant="outline" onClick={()=>void run(async()=>{await discardUnitCandidate(candidate);setCandidate(null);})}>Descartar proposta</Button>
    </div>:<div className="space-y-4">
      {texts.map((u,i)=><section key={u.id} className="space-y-2 rounded border p-3"><p className="text-sm font-semibold">Página {i+1}</p><Input aria-label={`Novo título da página ${i+1}`} value={u.title} disabled={busy} onChange={e=>setTexts(xs=>xs.map(x=>x.id===u.id?{...x,title:e.target.value}:x))}/><Textarea aria-label={`Novo texto da página ${i+1}`} value={u.body} rows={3} disabled={busy} onChange={e=>setTexts(xs=>xs.map(x=>x.id===u.id?{...x,body:e.target.value}:x))}/></section>)}
      <Button disabled={busy} onClick={()=>void run(async()=>setCandidate(await proposeSequenceText(piece,units,texts)))}>Conferir minhas alterações</Button>
      <label className="block space-y-2 text-sm">Ou peça uma nova abordagem à Hive<Textarea aria-label="Pedido para reformular o roteiro" value={instruction} disabled={busy} onChange={e=>setInstruction(e.target.value)} placeholder="Explique o que não funcionou e o que você quer explorar."/></label><Button variant="outline" disabled={busy||!instruction.trim()} onClick={()=>void run(async()=>setCandidate(await proposeText(piece,units,{scope:'sequence',unitIds:units.map(u=>u.id),instruction})))}>Pedir proposta de roteiro à Hive</Button>
    </div>}
    {busy&&<p role="status" className="text-sm">Preparando a proposta ou atualizando as páginas. Aguarde…</p>}
    <Button variant="ghost" disabled={busy} onClick={()=>void close()}>Voltar às imagens</Button>
  </DialogContent></Dialog>;
}
