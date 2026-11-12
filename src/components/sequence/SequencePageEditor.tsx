import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { CanvasStudio } from '@/components/editor/canvas-studio/CanvasStudio';
import type { EditorSnapshot } from '@/lib/editorSnapshot';
import { editablePage } from '@/lib/sequence/editing';
import { applyUnitCandidate, discardUnitCandidate, proposeCoverImage, proposePageVisual, proposeDiagramOrganization, proposeText, renderPending, savePageCanvas, type UnitCandidate } from '@/lib/sequence/service';
import { loadHiveDesign } from '@/lib/hive/loadDesign';
import { composeM01 } from '@/lib/hive/composeM01';
import { composeM02 } from '@/lib/hive/composeM02';
import { composeM03 } from '@/lib/hive/composeM03';
import { composeSequencePage } from '@/lib/hive/composeSequence';
import { directionOf } from '@/lib/sequence/service';
import { renderFabricToDataUrl } from '@/lib/templates/renderPost';
import type { PostUnit, UserPost } from '@/types';

export type PageEditMode = 'canvas'|'text'|'visual';
export function SequencePageEditor({piece,units,unit,initialMode,onClose,onSaved}:{piece:UserPost;units:PostUnit[];unit:PostUnit;initialMode:PageEditMode;onClose:()=>void;onSaved:(p:UserPost)=>Promise<void>}) {
  const [mode,setMode]=useState(initialMode),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null);
  const [title,setTitle]=useState(unit.title??''),[body,setBody]=useState(unit.body??''),[instruction,setInstruction]=useState('');
  const [candidate,setCandidate]=useState<UnitCandidate|null>(null);
  const [draft,setDraft]=useState<EditorSnapshot|null>(null),[beforePreview,setBeforePreview]=useState<string|null>(null);
  const [canvasReady,setCanvasReady]=useState(false);
  const capture=useRef<(()=>EditorSnapshot|null)|null>(null);
  const initial=useMemo(()=>editablePage(unit.fabric_json),[unit.fabric_json]);
  const [choices,setChoices]=useState<Array<{id:string;name:string;url:string;theme?:'claro'|'escuro'}>>([]);
  const [loadingChoices,setLoadingChoices]=useState(false);
  const [choiceError,setChoiceError]=useState(false);
  const [retryChoices,setRetryChoices]=useState(0);
  const canvas=piece.format==='story'?{w:1080,h:1920}:{w:1080,h:1350};
  useEffect(()=>{
    if(mode!=='visual')return;
    let alive=true;setLoadingChoices(true);setChoiceError(false);
    void (async()=>{
      const d=await loadHiveDesign(),out:typeof choices=[];
      if(unit.layout==='cover'){
        for(const recipe of d.variacoes.filter(r=>['M01','M02','M03'].includes(r.manifestacao_id??''))){
          try{
            const text=[unit.title,unit.body].filter(Boolean).join(' — '),base={recipe,colors:d.colors,spiralUrl:d.spiralUrl,text,canvas};
            const decision=unit.assets?.decision as {diagram?:{poleA?:string;poleB?:string}}|undefined;
            const slide=recipe.manifestacao_id==='M03'?composeM03({...base,diagram:decision?.diagram}):recipe.manifestacao_id==='M02'?composeM02({...base,asset:(unit.assets?.asset??null) as Parameters<typeof composeM02>[0]['asset']}):composeM01({...base,assets:d.assets});
            const url=await renderFabricToDataUrl(slide,{width:canvas.w,height:canvas.h,multiplier:.2,format:'jpeg'});
            if(url)out.push({id:recipe.id,name:recipe.nome.replace(/^M\d+[-\s·:]*/,'').trim(),url});
          }catch{/* Uma receita que não comporta este texto não é oferecida como pronta. */}
        }
      }else for(const theme of ['claro','escuro'] as const){
        const slide=composeSequencePage({layout:unit.layout,title:unit.title??'',body:unit.body??'',position:unit.position,total:units.length,direction:{...directionOf(piece),theme},colors:d.colors,spiralUrl:d.spiralUrl,canvas});
        const url=await renderFabricToDataUrl(slide,{width:canvas.w,height:canvas.h,multiplier:.2,format:'jpeg'});
        if(url)out.push({id:theme,name:theme==='claro'?'Leitura em fundo claro':'Leitura em fundo escuro',url,theme});
      }
      if(alive)setChoices(out);
    })().catch(()=>{if(alive)setChoiceError(true);}).finally(()=>{if(alive)setLoadingChoices(false);});
    return()=>{alive=false;};
  // A prévia é local e não chama IA nem modifica o post.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[mode,retryChoices]);
  async function run(fn:()=>Promise<void>){setBusy(true);setError(null);try{await fn();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  async function close(){if(busy)return;if(candidate)await discardUnitCandidate(candidate).catch(()=>{});onClose();}
  async function apply(){if(!candidate)return;await run(async()=>{
    let p=await applyUnitCandidate(candidate);setCandidate(null);
    // Texto canônico muda primeiro pela transação; só a página alterada fica stale.
    if(candidate.action==='adjust_text'){
      const rendered=await renderPending(p,[],undefined,{draftPreview:true});
      if(rendered.failed){await onSaved(p);throw new Error('O texto foi salvo. Uma imagem ainda precisa de ajuste; as demais páginas estão preservadas.');}
    }
    await onSaved(p);onClose();
  });}
  const proposed=candidate?.proposal?.units?.find(u=>u.id===unit.id);
  return <Dialog open onOpenChange={open=>{if(!open)void close();}}>
    <DialogContent className={`data-[state=open]:animate-none data-[state=closed]:animate-none flex max-h-[94vh] w-[96vw] max-w-7xl flex-col overflow-y-auto p-4 ${mode==='canvas'&&!candidate?'h-[94vh]':''}`} onEscapeKeyDown={e=>{if(busy||(e.target instanceof HTMLElement&&e.target.matches('textarea[data-fabric="textarea"]')))e.preventDefault();}} onPointerDownOutside={e=>e.preventDefault()}>
      <DialogTitle>Página {unit.position} · ajustar conteúdo</DialogTitle>
      <DialogDescription>Você altera esta página. As demais páginas e a legenda permanecem preservadas.</DialogDescription>
      <div className="flex flex-wrap gap-2">
        {([['canvas','Editar na arte'],['text','Ajustar texto'],['visual','Alterar visual']] as const).map(([k,l])=><Button key={k} size="sm" variant={mode===k?'accent':'outline'} disabled={busy||!!candidate} onClick={()=>{if(mode==='canvas'){const snapshot=capture.current?.();if(snapshot)setDraft(snapshot);}setBeforePreview(null);setMode(k);}}>{l}</Button>)}
      </div>
      {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
      {candidate?<section className="space-y-4" data-testid="page-edit-candidate">
        <h3 className="font-semibold">Confira a proposta antes de aplicar</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div><p className="mb-2 text-sm">Atual</p>{unit.rendered_url&&<img src={beforePreview??unit.rendered_url} className="max-h-96 rounded border" alt="Página atual"/>}<p>{unit.title}</p><p className="whitespace-pre-wrap text-sm">{unit.body}</p></div>
          <div><p className="mb-2 text-sm">Proposta</p>{proposed?.rendered_url&&<img src={proposed.rendered_url} className="max-h-96 rounded border" alt="Visual proposto"/>}<p className="font-semibold">{proposed?.title??unit.title}</p><p className="whitespace-pre-wrap text-sm">{proposed?.body??unit.body}</p></div>
        </div>
        {candidate.impact&&<p className="text-sm text-muted-foreground">{candidate.impact}</p>}
        <div className="flex gap-2"><Button variant="accent" disabled={busy} onClick={()=>void apply()}>{busy?<Loader2 className="h-4 w-4 animate-spin"/>:null}Aplicar nesta página</Button><Button variant="outline" disabled={busy} onClick={()=>void run(async()=>{await discardUnitCandidate(candidate);setCandidate(null);})}>Descartar proposta</Button></div>
      </section>:mode==='canvas'?<>
        <p className="text-sm text-muted-foreground">Clique para selecionar e arraste para mover. Dê dois cliques no texto para editar. Nas linhas, arraste as alças das pontas para mudar a ligação. Para alcançar uma camada sobreposta, use Alt + clique no mesmo ponto.</p>
        {unit.assets?.variant==='M03-B'&&<Button size="sm" variant="outline" disabled={busy||!canvasReady} onClick={()=>void run(async()=>{const snapshot=capture.current?.();if(!snapshot)throw new Error('Aguarde a arte carregar.');setDraft(snapshot);setBeforePreview(snapshot.dataUrl);setCandidate(await proposeDiagramOrganization(piece,unit,snapshot));})}>Organizar diagrama</Button>}
        {unit.fabric_json?<div className="min-h-[260px] flex-1 overflow-hidden rounded-xl border" data-testid="sequence-page-canvas" aria-busy={busy} style={{pointerEvents:busy?'none':undefined}}><CanvasStudio embedded sequenceMode snapshotRef={capture} onReadyChange={setCanvasReady} initialFabricJson={draft?.fabricJson??initial} initialPreset={piece.format==='story'?'instagram-story':'instagram-portrait'}/></div>:<p className="text-sm">Esta página ainda não tem arte editável. Ajuste o texto ou produza a imagem primeiro.</p>}
        <Button variant="accent" disabled={busy||!unit.fabric_json||!canvasReady} onClick={()=>void run(async()=>{const s=capture.current?.();if(!s)throw new Error('A arte ainda está carregando. Aguarde antes de salvar.');const p=await savePageCanvas(piece,unit,s);await onSaved(p);onClose();})}>{busy?<Loader2 className="h-4 w-4 animate-spin"/>:null}Salvar esta página</Button>
      </>:mode==='text'?<div className="space-y-3" data-testid="sequence-page-text">
        <label className="block space-y-1 text-sm">Título<Input aria-label="Título desta página" value={title} disabled={busy} onChange={e=>setTitle(e.target.value)}/></label>
        <label className="block space-y-1 text-sm">Texto<Textarea aria-label="Texto desta página" rows={5} value={body} disabled={busy} onChange={e=>setBody(e.target.value)}/></label>
        <Button disabled={busy||!(title.trim()||body.trim())||(title===(unit.title??'')&&body===(unit.body??''))} onClick={()=>void run(async()=>setCandidate(await proposeText(piece,units,{scope:'units',unitIds:[unit.id],manual:{title,body}})))}>Conferir alteração</Button>
        <div className="space-y-2 border-t pt-3"><label className="block text-sm">O que você quer melhorar?<Textarea aria-label="Pedido de ajuste desta página" placeholder="Ex.: torne este argumento mais claro, mantendo o sentido." value={instruction} onChange={e=>setInstruction(e.target.value)} disabled={busy}/></label><Button variant="outline" disabled={busy||!instruction.trim()} onClick={()=>void run(async()=>setCandidate(await proposeText(piece,units,{scope:'units',unitIds:[unit.id],instruction})))}><Sparkles className="h-4 w-4"/>Pedir sugestão à Hive</Button></div>
      </div>:<section className="space-y-3" data-testid="sequence-page-visual">
        <p className="text-sm">Escolha pela aparência. A proposta será apresentada antes de substituir a página. As miniaturas mostram a composição; fotografias e fundos podem variar na proposta final.</p>
        {loadingChoices&&<p className="flex gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin"/>Preparando opções visuais…</p>}
        {!loadingChoices&&(choiceError||!choices.length)&&<div><p className="text-sm">Não foi possível preparar opções adequadas para este texto. Você pode editar a arte diretamente ou tentar novamente.</p><Button variant="outline" onClick={()=>setRetryChoices(n=>n+1)}>Tentar carregar opções</Button></div>}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{choices.map(c=><button key={c.id} disabled={busy} className="space-y-2 rounded-xl border p-2 text-left hover:border-accent disabled:opacity-50" onClick={()=>void run(async()=>setCandidate(await proposePageVisual(piece,units,unit,c.theme?{theme:c.theme}:{variant:c.id})))}><img src={c.url} alt={c.name} className="w-full rounded"/><p className="text-sm font-medium">{c.name}</p>{c.id===unit.assets?.variant&&<p className="text-xs text-muted-foreground">Modelo atual</p>}</button>)}</div>
        {unit.layout==='cover'&&unit.assets?.image_ref&&<Button variant="outline" disabled={busy} onClick={()=>void run(async()=>setCandidate(await proposeCoverImage(piece,units)))}>Propor outra imagem, mantendo o texto</Button>}
      </section>}
      {busy&&<p role="status" className="text-sm">Salvando ou preparando a proposta. Aguarde…</p>}
      <Button variant="ghost" disabled={busy} onClick={()=>void close()}>Voltar à revisão</Button>
    </DialogContent>
  </Dialog>;
}
