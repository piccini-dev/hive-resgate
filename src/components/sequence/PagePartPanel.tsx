import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { pageElements, type PageRepresentation, type revisePagePart } from '@/lib/sequence/pageRevision';
import type { EditorSnapshot } from '@/lib/editorSnapshot';

type Request = Parameters<typeof revisePagePart>[1];
const representations: Array<[PageRepresentation, string, string]> = [
  ['diagram', 'Manter diagrama', 'Revisar os textos ligados às formas atuais.'],
  ['text', 'Texto', 'Explicar a ideia sem formas e conexões.'],
  ['blocks', 'Blocos', 'Separar os pontos em quadros.'],
  ['steps', 'Etapas', 'Mostrar uma sequência numerada.'],
];

export function PagePartPanel({ snapshot, variant, height, busy, onPropose, onCanvas, onAskHive }: {
  snapshot: EditorSnapshot; variant?: string; height: number; busy: boolean;
  onPropose: (req: Request) => void; onCanvas: () => void; onAskHive: (req: Request, instruction: string) => void;
}) {
  const [manual,setManual]=useState(false),[instruction,setInstruction]=useState('');
  const elements = useMemo(() => pageElements(snapshot.fabricJson, variant), [snapshot, variant]);
  const [scope, setScope] = useState<'selected' | 'diagram'>(snapshot.selectedPaths?.length ? 'selected' : 'diagram');
  const [selected, setSelected] = useState(snapshot.selectedPaths ?? []);
  const [representation, setRepresentation] = useState<PageRepresentation>('diagram');
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [content, setContent] = useState(() => elements.filter(e => e.diagram && e.text !== undefined).map(e => e.text!.replace(/\s+/g, ' ').trim()).join('\n'));
  const selectedKeys = new Set(selected.map(p => p.join('.')));
  const targets = elements.filter(e => scope === 'diagram' ? e.diagram : selectedKeys.has(e.path.join('.')) || selected.some(p => e.path.join('.').startsWith(p.join('.') + '.')));
  const blocked = targets.some(e => e.protected), hasDiagram = elements.some(e => e.diagram);
  const fields = targets.filter(e => e.text !== undefined && !e.protected);
  return <section className="space-y-4" data-testid="page-part-panel">
    <p className="text-sm">Revise a ideia representada e os textos que fazem parte dela. O texto principal acima da imagem permanece preservado.</p>
    <details className="rounded-lg border p-3"><summary className="cursor-pointer text-sm">Escopo e forma de representar a ideia</summary><div className="mt-3 space-y-3">
    <fieldset disabled={busy} className="flex flex-wrap gap-3 text-sm">
      <legend className="mb-2 font-medium">O que será revisado?</legend>
      <label className="flex items-center gap-2"><input type="radio" name="part-scope" checked={scope === 'selected'} onChange={() => { setScope('selected'); setRepresentation('diagram'); }}/>Elementos selecionados</label>
      <label className="flex items-center gap-2"><input type="radio" name="part-scope" checked={scope === 'diagram'} disabled={!hasDiagram} onChange={() => setScope('diagram')}/>Diagrama completo e seus textos</label>
    </fieldset>
    {scope === 'selected' && <details className="rounded-lg border p-3" open={!selected.length}>
      <summary className="cursor-pointer text-sm">{selected.length ? `${selected.length} elemento(s) selecionado(s) · escolher outros` : 'Selecione na lista ou diretamente na arte'}</summary>
      <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">{elements.filter(e => !e.protected || selectedKeys.has(e.path.join('.'))).map(e => <label key={e.path.join('.')} className="flex items-start gap-2 text-sm"><input type="checkbox" checked={selectedKeys.has(e.path.join('.'))} disabled={busy} onChange={ev => setSelected(old => ev.target.checked ? [...old, e.path] : old.filter(p => p.join('.') !== e.path.join('.')))}/>{e.label}{e.protected && ' (preservado)'}</label>)}</div>
      <Button size="sm" variant="ghost" disabled={busy} onClick={onCanvas}>Selecionar na arte</Button>
    </details>}
    {blocked && <p role="alert" className="text-sm text-destructive">A seleção inclui texto principal, assinatura ou fotografia. Retire esses elementos da seleção ou use “Refazer esta página”.</p>}
    {scope === 'diagram' && <fieldset disabled={busy}>
      <legend className="mb-2 text-sm font-medium">Como representar esta ideia?</legend>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{representations.map(([value, label, description]) => <button key={value} type="button" aria-label={label} aria-pressed={representation === value} className={`rounded-lg border p-3 text-left text-sm ${representation === value ? 'border-accent bg-accent/10' : ''}`} onClick={() => setRepresentation(value)}><span className="block font-medium">{label}</span><span className="text-xs text-muted-foreground">{description}</span></button>)}</div>
    </fieldset>}
    </div></details>
    <div className="flex gap-2"><Button size="sm" variant={!manual?'accent':'outline'} disabled={busy} onClick={()=>setManual(false)}>Pedir à Hive</Button><Button size="sm" variant={manual?'accent':'outline'} disabled={busy} onClick={()=>setManual(true)}>Editar manualmente</Button></div>
    {!manual ? <div className="space-y-3"><label className="block space-y-2 text-sm">O que você quer diferente?<Textarea aria-label="Pedido de revisão do diagrama" rows={3} value={instruction} onChange={e=>setInstruction(e.target.value)} disabled={busy} placeholder="Ex.: este diagrama não explica a relação entre causa e sintoma. Torne a ideia mais clara."/></label><Button variant="accent" disabled={busy||!instruction.trim()||!targets.length||blocked} onClick={()=>onAskHive({variant,scope,selected,texts,representation,content,height},instruction)}>Conferir sugestão da Hive</Button></div> : <>
    {representation === 'diagram' ? <div className="space-y-3">
      {fields.map((e, i) => <label key={e.path.join('.')} className="block space-y-1 text-sm">Texto ligado à imagem {i + 1}<Textarea aria-label={`Texto ligado à imagem ${i + 1}`} value={texts[e.path.join('.')] ?? e.text} rows={2} disabled={busy} onChange={ev => setTexts(old => ({ ...old, [e.path.join('.')]: ev.target.value }))}/></label>)}
      {!fields.length && <p className="text-sm text-muted-foreground">Para mover formas, trocar imagens ou ajustar linhas, volte à arte. Selecione um texto para revisá-lo aqui.</p>}
    </div> : <label className="block space-y-1 text-sm">Conteúdo da nova representação<Textarea aria-label="Conteúdo da nova representação" rows={8} value={content} disabled={busy} onChange={ev => setContent(ev.target.value)}/><span className="block text-xs text-muted-foreground">{representation === 'text' ? 'Escreva a explicação que substituirá o diagrama.' : 'Use uma linha por bloco ou etapa. A ordem das linhas será mantida.'}</span></label>}
    <div className="flex flex-wrap gap-2"><Button variant="accent" disabled={busy || !targets.length || blocked || (representation === 'diagram' ? !fields.some(e => texts[e.path.join('.')] !== undefined && texts[e.path.join('.') ] !== e.text) : !content.trim())} onClick={() => onPropose({ variant, scope, selected, texts, representation, content, height })}>Conferir proposta desta parte</Button></div></>}<div><Button variant="outline" disabled={busy} onClick={onCanvas}>Voltar à arte</Button></div>
  </section>;
}
