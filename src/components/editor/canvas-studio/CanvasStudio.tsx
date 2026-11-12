// Container principal do Canvas Studio.
// Layout standalone: [Toolbar topo] / [Sidebar L | Painel ativo | Canvas | Properties R]
// Layout embedded:   [MiniToolbar] / [Sidebar L | Painel ativo | Canvas | Properties R]
//                    (sem h-screen — herda altura do parent)

import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { EditorSnapshot } from '@/lib/editorSnapshot';
import { ensureFontsLoaded } from '@/lib/templates/layout';
import { Toolbar } from './Toolbar';
import { SelectionToolbar } from './SelectionToolbar';
import { EmbeddedToolbar } from './EmbeddedToolbar';
import { SidebarLeft, type PanelKey } from './SidebarLeft';
import { CanvasArea } from './CanvasArea';
import { PropertiesPanel } from './PropertiesPanel';
import { TemplatesPanel } from './panels/TemplatesPanel';
import { SlotsPanel } from './panels/SlotsPanel';
import { TextPanel } from './panels/TextPanel';
import { ElementsPanel } from './panels/ElementsPanel';
import { UploadsPanel } from './panels/UploadsPanel';
import { BrandPanel } from './panels/BrandPanel';
import { TemplatePreviewBar } from './TemplatePreviewBar';
import { useEditor, CANVAS_PRESETS } from './useEditor';

export interface CanvasStudioChangeState {
  fabricJson: object;
  dataUrl: string;
}

interface CanvasStudioProps {
  snapshotRef?: MutableRefObject<(() => EditorSnapshot | null) | null>;
  onReadyChange?: (ready:boolean)=>void;
  initialPreset?: string;
  initialFabricJson?: object;
  onBack?: () => void;
  onSave?: (state: { fabricJson: object; dataUrl: string; title: string }) => Promise<void> | void;
  onChange?: (state: CanvasStudioChangeState) => void;
  /**
   * Embedded mode: usado quando CanvasStudio vive dentro de outra pagina (ex: PostEditor).
   * - Esconde a Toolbar principal (back/title/save) — quem hospeda fornece esses controles
   * - Mostra uma mini-toolbar interna (preset/undo/redo/zoom/download)
   * - Layout sem h-screen — herda altura do parent
   */
  embedded?: boolean;
  /**
   * Template mode: usado no editor de templates (/templates/:id).
   * - Mostra o inspetor de slots (marcar campo dinamico) e a lista de campos
   * - Mostra a barra de teste (ver o template com frase curta/longa)
   * - Troca a galeria de templates pelo painel de campos
   */
  templateMode?: boolean;
  initialTitle?: string;
  /** Revisão de uma página: mantém dimensões e não oferece templates de outro catálogo. */
  sequenceMode?: boolean;
}

export function CanvasStudio({
  snapshotRef,
  onReadyChange,
  initialPreset = 'linkedin-portrait',
  initialFabricJson,
  onBack,
  onSave,
  onChange,
  embedded = false,
  templateMode = false,
  initialTitle,
  sequenceMode = false,
}: CanvasStudioProps) {
  const [preset, setPreset] = useState(initialPreset);
  const size = CANVAS_PRESETS[preset] ?? CANVAS_PRESETS['linkedin-portrait'];
  const [title, setTitle] = useState(initialTitle ?? 'Sem título');
  // Em embedded, comeca sem painel aberto pra economizar largura.
  const [activePanel, setActivePanel] = useState<PanelKey>(
    embedded ? null : templateMode ? 'slots' : 'templates',
  );
  const [saving, setSaving] = useState(false);
  const [lastState, setLastState] = useState<CanvasStudioChangeState | null>(null);
  const [loadError,setLoadError]=useState<string|null>(null);
  // Modo template: enquanto o preview esta ligado o canvas mostra o texto de
  // exemplo hidratado, mas o desenho de verdade fica aqui — e e ele que salva.
  const [previewing, setPreviewing] = useState(false);
  const designSnapshotRef = useRef<object | null>(null);

  const api = useEditor({
    width: size.width,
    height: size.height,
    pickAllLayers: sequenceMode,
    onChange: (s) => {
      setLastState(s);
      onChange?.(s);
    },
  });

  // Carrega initialFabricJson uma vez POR CANVAS — nao por instancia do
  // componente. Em StrictMode o React monta, descarta e remonta: a trava
  // "ja carreguei" presa ao componente fazia o conteudo ir pro canvas
  // descartado e o visivel ficar vazio (so nao aparecia quando a prop chegava
  // async, depois da remontagem — por isso o PostEditor escapava e o editor de
  // template, que espera tudo antes de montar, caia direto na corrida).
  // canvasEpoch muda a cada canvas novo, entao a carga acompanha.
  const readyEpochRef = useRef<number>(-1);
  const [readyEpoch,setReadyEpoch]=useState(-1);
  const loadedEpochRef = useRef<number>(-1);
  useEffect(() => {
    readyEpochRef.current = -1;setReadyEpoch(-1);
    return () => { readyEpochRef.current = -1; };
  }, [api.canvasEpoch]);
  useEffect(() => {
    const canvas = api.fabric.current;
    if (!canvas || loadedEpochRef.current === api.canvasEpoch) return;
    loadedEpochRef.current = api.canvasEpoch;
    readyEpochRef.current = -1;setReadyEpoch(-1);
    void (async()=>{
      if(sequenceMode)await ensureFontsLoaded([{family:'Playfair Display',weight:'bold'},{family:'Inter',weight:'400'},{family:'Inter',weight:'600'}]);
      if(api.fabric.current!==canvas)return;
      if(initialFabricJson)await api.loadFromJson(initialFabricJson,{strict:sequenceMode});
      if(sequenceMode){
        api.fitToContainer();
        // A edição só libera quando fontes, tamanho e posição do canvas estão
        // prontos. Não basta a camada já existir durante a abertura do modal.
        let previous='',stable=0;
        for(let i=0;i<60&&stable<3;i++){
          await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
          if(api.fabric.current!==canvas)return;
          const rect=canvas.upperCanvasEl.getBoundingClientRect();
          const signature=[rect.x,rect.y,rect.width,rect.height].map(v=>Math.round(v*10)).join(':');
          stable=signature===previous&&rect.width>0&&rect.height>0?stable+1:0;previous=signature;
        }
        if(stable<3)throw new Error('A janela ainda está mudando de tamanho. Reabra a arte quando ela estiver estável.');
        canvas.calcOffset();canvas.requestRenderAll();
      }
      if(api.fabric.current===canvas){readyEpochRef.current=api.canvasEpoch;setReadyEpoch(api.canvasEpoch);}
    })().catch((e)=>{if(sequenceMode&&api.fabric.current===canvas)setLoadError((e as Error).message);});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFabricJson, api.canvasEpoch]);

  useEffect(()=>{
    onReadyChange?.(!sequenceMode||readyEpoch===api.canvasEpoch);
    return()=>onReadyChange?.(false);
  },[onReadyChange,sequenceMode,readyEpoch,api.canvasEpoch]);

  useEffect(() => {
    if (!snapshotRef) return;
    const capture = () => {
      if (readyEpochRef.current !== api.canvasEpoch || !api.fabric.current) return null;
      const dataUrl = api.exportPng(1);
      return dataUrl ? { fabricJson: api.toJson(), dataUrl } : null;
    };
    snapshotRef.current = capture;
    return () => { if (snapshotRef.current === capture) snapshotRef.current = null; };
  }, [snapshotRef, api.canvasEpoch, api.exportPng, api.toJson, api.fabric]);

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave({
        // designSnapshotRef so tem valor durante o preview — nesse caso o canvas
        // esta exibindo a frase de exemplo, e salvar isso apagaria os slots.
        fabricJson: designSnapshotRef.current ?? lastState?.fabricJson ?? api.toJson(),
        dataUrl: lastState?.dataUrl ?? api.exportPng(1) ?? '',
        title,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div data-canvas-ready={!sequenceMode||readyEpoch===api.canvasEpoch?'true':'false'} className={embedded ? 'relative flex h-full min-h-0 flex-col bg-background' : 'relative flex h-screen flex-col bg-background'} onPointerDownCapture={e=>{if(sequenceMode&&readyEpoch!==api.canvasEpoch){e.preventDefault();e.stopPropagation();}}}>
      {sequenceMode&&readyEpoch!==api.canvasEpoch&&!loadError&&<div role="status" className="absolute inset-0 z-30 grid place-items-center bg-background/80 text-sm">Preparando arte…</div>}
      {loadError&&<p role="alert" className="p-3 text-sm text-destructive">{loadError}</p>}
      {embedded ? (
        <EmbeddedToolbar api={api} preset={preset} onPresetChange={setPreset} lockPreset={sequenceMode} />
      ) : (
        <Toolbar
          api={api}
          title={title}
          onTitleChange={setTitle}
          onBack={onBack}
          onSave={onSave ? handleSave : undefined}
          saving={saving}
          preset={preset}
          onPresetChange={setPreset}
        />
      )}

      {sequenceMode&&<SelectionToolbar api={api}/>}
      {templateMode && (
        <TemplatePreviewBar
          api={api}
          width={size.width}
          height={size.height}
          previewing={previewing}
          setPreviewing={setPreviewing}
          designSnapshotRef={designSnapshotRef}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <SidebarLeft active={activePanel} onChange={setActivePanel} templateMode={templateMode} hideTemplates={sequenceMode} />

        {/* Painel ativo (slide-in) */}
        {activePanel && (
          <div className="w-72 shrink-0 border-r border-border bg-card/40 overflow-y-auto">
            {activePanel === 'templates' && <TemplatesPanel api={api} />}
            {activePanel === 'slots' && <SlotsPanel api={api} />}
            {activePanel === 'text' && <TextPanel api={api} />}
            {activePanel === 'elements' && <ElementsPanel api={api} />}
            {activePanel === 'uploads' && <UploadsPanel api={api} />}
            {activePanel === 'brand' && <BrandPanel api={api} />}
          </div>
        )}

        <CanvasArea api={api} width={size.width} height={size.height} />

        <PropertiesPanel api={api} templateMode={templateMode} />
      </div>
    </div>
  );
}
