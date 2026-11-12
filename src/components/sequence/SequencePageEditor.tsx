import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { CanvasStudio } from '@/components/editor/canvas-studio/CanvasStudio';
import { PagePartPanel } from './PagePartPanel';
import { pageElements } from '@/lib/sequence/pageRevision';
import type { EditorSnapshot } from '@/lib/editorSnapshot';
import { editablePage } from '@/lib/sequence/editing';
import { applyUnitCandidate, discardUnitCandidate, proposeCoverImage, proposePageVisual, proposePagePart, proposeDiagramOrganization, proposeText, renderPending, savePageCanvas, type UnitCandidate } from '@/lib/sequence/service';
import { loadHiveDesign } from '@/lib/hive/loadDesign';
import { composeM01 } from '@/lib/hive/composeM01';
import { composeM02 } from '@/lib/hive/composeM02';
import { composeM03 } from '@/lib/hive/composeM03';
import { composeSequencePage } from '@/lib/hive/composeSequence';
import { directionOf } from '@/lib/sequence/service';
import { renderFabricToDataUrl } from '@/lib/templates/renderPost';
import type { PostUnit, UserPost } from '@/types';

export type PageEditMode = 'canvas'|'text'|'visual'|'part';
export function SequencePageEditor({piece,units,unit,initialMode,onClose,onSaved}:{piece:UserPost;units:PostUnit[];unit:PostUnit;initialMode:PageEditMode;onClose:()=>void;onSaved:(p:UserPost)=>Promise<void>}) {
  const [mode,setMode]=useState(initialMode),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null);
  const [title,setTitle]=useState(unit.title??''),[body,setBody]=useState(unit.body??''),[instruction,setInstruction]=useState('');
  const [candidate,setCandidate]=useState<UnitCandidate|null>(null);
  const [draft,setDraft]=useState<EditorSnapshot|null>(null),[beforePreview,setBeforePreview]=useState<string|null>(null);
  const [canvasReady,setCanvasReady]=useState(false);
  const capture=useRef<(()=>EditorSnapshot|null)|null>(null);
  const initial=useMemo(()=>editablePage(unit.fabric_json),[unit.fabric_json]);
  const partSnapshot=useMemo(()=>draft??{fabricJson:initial,dataUrl:unit.rendered_url??''},[draft,initial,unit.rendered_url]);
  const hasDiagram=pageElements(partSnapshot.fabricJson,unit.assets?.variant as string|undefined).some(e=>e.diagram);
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
  function changeMode(next:PageEditMode){
    if(mode==='canvas'){
      const snapshot=capture.current?.();
      if(unit.fabric_json&&!snapshot){setError('Aguarde a arte carregar antes de revisar.');return;}
      if(snapshot)setDraft(snapshot);
    }
    setBeforePreview(null);setError(null);setMode(next);
  }
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
      <div className="flex flex-wrap items-center gap-2">
        {([['canvas','Editar na arte'],['text','Ajustar texto principal'],['part','Revisar diagrama e textos']] as const).map(([k,l])=><Button key={k} size="sm" variant={mode===k?'accent':'outline'} disabled={busy||!!candidate||(k==='part'&&!unit.fabric_json)} onClick={()=>changeMode(k)}>{l}</Button>)}
        <Button size="sm" className="md:ml-auto" variant={mode==='visual'?'accent':'ghost'} disabled={busy||!!candidate} onClick={()=>changeMode('visual')}>Refazer esta página</Button>
      </div>
      {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
      {candidate?<section className="space-y-4" data-testid="page-edit-candidate">
        <h3 className="font-semibold">Confira a proposta antes de aplicar</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div><p className="mb-2 text-sm">Atual</p>{(beforePreview||unit.rendered_url)&&<img src={beforePreview??unit.rendered_url!} className="max-h-96 rounded border" alt="Página atual"/>}<p>{unit.title}</p><p className="whitespace-pre-wrap text-sm">{unit.body}</p></div>
          <div><p className="mb-2 text-sm">Proposta</p>{proposed?.rendered_url&&<img src={proposed.rendered_url} className="max-h-96 rounded border" alt="Visual proposto"/>}<p className="font-semibold">{proposed?.title??unit.title}</p><p className="whitespace-pre-wrap text-sm">{proposed?.body??unit.body}</p></div>
        </div>
        {candidate.impact&&<p className="text-sm text-muted-foreground">{candidate.impact}</p>}
        <div className="flex gap-2"><Button variant="accent" disabled={busy} onClick={()=>void apply()}>{busy?<Loader2 className="h-4 w-4 animate-spin"/>:null}Aplicar nesta página</Button><Button variant="outline" disabled={busy} onClick={()=>void run(async()=>{await discardUnitCandidate(candidate);setCandidate(null);})}>Descartar proposta</Button></div>
      </section>:mode==='canvas'?<>
        <p className="text-sm text-muted-foreground">Clique para selecionar e arraste para mover. Dê dois cliques no texto para editar. Nas linhas, arraste as alças das pontas para mudar a ligação. Para alcançar uma camada sobreposta, use Alt + clique no mesmo ponto.</p>
        <div className="flex flex-wrap items-center gap-2"><Button size="sm" variant="outline" disabled={busy||!canvasReady} onClick={()=>changeMode('part')}>Revisar elementos selecionados</Button><span className="text-xs text-muted-foreground">Selecione na arte e revise apenas essa parte.</span></div>
        {unit.assets?.variant==='M03-B'&&<Button size="sm" variant="outline" disabled={busy||!canvasReady} onClick={()=>void run(async()=>{const snapshot=capture.current?.();if(!snapshot)throw new Error('Aguarde a arte carregar.');setDraft(snapshot);setBeforePreview(snapshot.dataUrl);setCandidate(await proposeDiagramOrganization(piece,unit,snapshot));})}>Organizar diagrama</Button>}
        {unit.fabric_json?<div className="min-h-[260px] flex-1 overflow-hidden rounded-xl border" data-testid="sequence-page-canvas" aria-busy={busy} style={{pointerEvents:busy?'none':undefined}}><CanvasStudio embedded sequenceMode snapshotRef={capture} onReadyChange={setCanvasReady} initialFabricJson={draft?.fabricJson??initial} initialPreset={piece.format==='story'?'instagram-story':'instagram-portrait'}/></div>:<p className="text-sm">Esta página ainda não tem arte editável. Ajuste o texto ou produza a imagem primeiro.</p>}
        <Button variant="accent" disabled={busy||!unit.fabric_json||!canvasReady} onClick={()=>void run(async()=>{const s=capture.current?.();if(!s)throw new Error('A arte ainda está carregando. Aguarde antes de salvar.');const p=await savePageCanvas(piece,unit,s);await onSaved(p);onClose();})}>{busy?<Loader2 className="h-4 w-4 animate-spin"/>:null}Salvar esta página</Button>
      </>:mode==='part'?null:mode==='text'?<div className="space-y-3" data-testid="sequence-page-text">
        <p className="text-sm text-muted-foreground">Estes campos são o texto principal da página. Para revisar rótulos e explicações dentro da imagem, use “Revisar diagrama e textos”.</p>
        <label className="block space-y-1 text-sm">Título<Input aria-label="Título desta página" value={title} disabled={busy} onChange={e=>setTitle(e.target.value)}/></label>
        <label className="block space-y-1 text-sm">Texto<Textarea aria-label="Texto desta página" rows={5} value={body} disabled={busy} onChange={e=>setBody(e.target.value)}/></label>
        <Button disabled={busy||!(title.trim()||body.trim())||(title===(unit.title??'')&&body===(unit.body??''))} onClick={()=>void run(async()=>setCandidate(await proposeText(piece,units,{scope:'units',unitIds:[unit.id],manual:{title,body}})))}>Conferir alteração</Button>
        <div className="space-y-2 border-t pt-3"><label className="block text-sm">O que você quer melhorar?<Textarea aria-label="Pedido de ajuste desta página" placeholder="Ex.: torne este argumento mais claro, mantendo o sentido." value={instruction} onChange={e=>setInstruction(e.target.value)} disabled={busy}/></label><Button variant="outline" disabled={busy||!instruction.trim()} onClick={()=>void run(async()=>setCandidate(await proposeText(piece,units,{scope:'units',unitIds:[unit.id],instruction})))}><Sparkles className="h-4 w-4"/>Pedir sugestão à Hive</Button></div>
      </div>:<section className="space-y-3" data-testid="sequence-page-visual">
        <p className="text-sm">Refaça o texto e a composição desta página. Escolha um modelo para conferir a proposta completa antes de aplicar. As demais páginas e a legenda permanecem preservadas.</p>
        {hasDiagram&&<Button variant="outline" disabled={busy} onClick={()=>changeMode('part')}>Trocar só o diagrama por texto, blocos ou etapas</Button>}
        <details className="rounded-lg border p-3"><summary className="cursor-pointer text-sm font-medium">Revisar também o texto principal</summary><div className="mt-3 space-y-3">
          <label className="block space-y-1 text-sm">Título<Input aria-label="Título da página refeita" value={title} disabled={busy} onChange={e=>setTitle(e.target.value)}/></label>
          <label className="block space-y-1 text-sm">Texto<Textarea aria-label="Texto da página refeita" rows={4} value={body} disabled={busy} onChange={e=>setBody(e.target.value)}/></label>
        </div></details>
        <p className="text-xs text-muted-foreground">As miniaturas mostram os modelos com o texto atual. A comparação final incluirá o texto que você revisou.</p>
        {loadingChoices&&<p className="flex gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin"/>Preparando opções visuais…</p>}
        {!loadingChoices&&(choiceError||!choices.length)&&<div><p className="text-sm">Não foi possível preparar opções adequadas para este texto. Você pode editar a arte diretamente ou tentar novamente.</p><Button variant="outline" onClick={()=>setRetryChoices(n=>n+1)}>Tentar carregar opções</Button></div>}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{choices.map(c=><button key={c.id} disabled={busy||!(title.trim()||body.trim())} className="space-y-2 rounded-xl border p-2 text-left hover:border-accent disabled:opacity-50" onClick={()=>void run(async()=>setCandidate(await proposePageVisual(piece,units,unit,{...(c.theme?{theme:c.theme}:{variant:c.id}),text:{title,body}})))}><img src={c.url} alt={c.name} className="w-full rounded"/><p className="text-sm font-medium">{c.name}</p>{c.id===unit.assets?.variant&&<p className="text-xs text-muted-foreground">Modelo atual</p>}</button>)}</div>
        {unit.layout==='cover'&&unit.assets?.image_ref&&<Button variant="outline" disabled={busy} onClick={()=>void run(async()=>setCandidate(await proposeCoverImage(piece,units)))}>Propor outra imagem, mantendo o texto</Button>}
      </section>}
      {mode==='part'&&<div hidden={!!candidate}><PagePartPanel snapshot={partSnapshot} variant={unit.assets?.variant as string|undefined} height={canvas.h} busy={busy||!!candidate} onCanvas={()=>changeMode('canvas')} onPropose={req=>void run(async()=>{setBeforePreview(partSnapshot.dataUrl||unit.rendered_url);setCandidate(await proposePagePart(piece,unit,partSnapshot,req));})}/></div>}
      {busy&&<p role="status" className="text-sm">Salvando ou preparando a proposta. Aguarde…</p>}
      <Button variant="ghost" disabled={busy} onClick={()=>void close()}>Voltar à revisão</Button>
    </DialogContent>
  </Dialog>;
}
