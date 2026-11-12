// Hook central do Canvas Studio.
// Gerencia a instancia Fabric.Canvas, historico (undo/redo), zoom, selecao,
// e expoe metodos pros paineis usarem (addText, addShape, addImage, etc).
//
// Padrao: refs internas pra Fabric (nao causam re-render),
// tick state pra forcar re-render quando algo muda (selecao, historico).

import { useCallback, useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { FABRIC_CUSTOM_PROPS, type BeeSlotMeta } from '@/lib/templates/slots';
import { attachSmartGuides } from './smartGuides';
import { attachLayerPicking } from './layerPicking';
import { installConnectorControls, normalizeEditorLines, resizeConnectorHandles, syncCanvasConnections } from './connectorControls';

const HISTORY_LIMIT = 40;

// canvas.toJSON() NAO serializa props custom: `name` (identidade do slot) e
// `beeSlot` (regras) somem. Isso apagava o slot em todo save/undo. Sempre
// serialize por aqui.
//
// BUG CRÍTICO corrigido: o Fabric v6 serializa `styles` de texto num ARRAY plano
// [{start,end,style}]. Esse formato (a) às vezes NÃO recarrega -> canvas branco,
// e (b) DROPA o espaço na fronteira do destaque ao renderizar ("de casa perde"
// virou "de casaperde" num post publicado). O composeM01 usa o formato NESTED
// {linha:{char:{}}} — que renderiza certo E recarrega. Aqui preservamos o nested
// da instância VIVA no lugar do array plano, pra editar/salvar não corromper.
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}
function serialize(c: fabric.Canvas): object {
  const json = c.toObject(FABRIC_CUSTOM_PROPS) as { objects?: Array<Record<string, unknown>> };
  const preserveStyles=(objects:Array<Record<string,unknown>>,live:fabric.Object[])=>{
    for(let i=0;i<objects.length&&i<live.length;i++){
      const styles=(live[i] as unknown as {styles?:unknown}).styles;
      if(isPlainObject(styles)&&Object.keys(styles).length)objects[i].styles=JSON.parse(JSON.stringify(styles));
      if(live[i] instanceof fabric.Group)preserveStyles((objects[i].objects??[]) as Array<Record<string,unknown>>,(live[i] as fabric.Group).getObjects());
    }
  };
  preserveStyles(json.objects??[],c.getObjects());
  return json;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export const CANVAS_PRESETS: Record<string, CanvasSize & { label: string }> = {
  'linkedin-portrait': { width: 1080, height: 1350, label: 'LinkedIn 4:5 (1080x1350)' },
  'linkedin-square': { width: 1200, height: 1200, label: 'LinkedIn / IG 1:1 (1200x1200)' },
  'linkedin-landscape': { width: 1200, height: 628, label: 'LinkedIn 1.91:1 (1200x628)' },
  'instagram-square': { width: 1080, height: 1080, label: 'Instagram 1:1 (1080x1080)' },
  'instagram-portrait': { width: 1080, height: 1350, label: 'Instagram 4:5 (1080x1350)' },
  'instagram-story': { width: 1080, height: 1920, label: 'Story / Reel 9:16' },
};

// Preset que casa com um tamanho. Abrir um template num preset de dimensao
// diferente re-salvaria ele com o tamanho errado, entao isto tem que bater.
export function presetForSize(width: number, height: number): string | undefined {
  return Object.keys(CANVAS_PRESETS).find(
    (k) => CANVAS_PRESETS[k].width === width && CANVAS_PRESETS[k].height === height,
  );
}

interface UseEditorOptions {
  width: number;
  height: number;
  background?: string;
  pickAllLayers?: boolean;
  onChange?: (state: { fabricJson: object; dataUrl: string }) => void;
}

export function useEditor({ width, height, background = '#FFFFFF', pickAllLayers = false, onChange }: UseEditorOptions) {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const historyRef = useRef<{ states: string[]; index: number }>({ states: [], index: -1 });
  const mutatingRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const notifyTimerRef = useRef<number | null>(null);

  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  // Muda toda vez que um canvas Fabric NOVO nasce. Quem carrega conteudo
  // inicial precisa saber disso: em StrictMode o React monta, descarta e
  // remonta, entao o primeiro canvas e jogado fora. Sem este contador o
  // conteudo ia parar no canvas descartado e o visivel ficava vazio.
  const [canvasEpoch, setCanvasEpoch] = useState(0);
  const [zoom, setZoomState] = useState(1);
  // Espelha o zoom num ref pra os smart guides lerem o valor atual (CSS transform)
  // sem recriar handlers a cada mudança de zoom.
  const zoomRef = useRef(1);
  // Detach dos smart guides do canvas atual.
  const detachGuidesRef = useRef<(() => void) | null>(null);
  // 'fit' = ajusta automaticamente ao container; numero = zoom manual fixo.
  const zoomModeRef = useRef<'fit' | 'manual'>('fit');
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Mantém o ref de zoom em dia pros smart guides.
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // ---------- historico ----------
  const pushHistory = useCallback(() => {
    const c = fabricRef.current;
    if (!c || mutatingRef.current) return;
    const snap = JSON.stringify(serialize(c));
    const h = historyRef.current;
    if (h.states[h.index] === snap) return;
    h.states = h.states.slice(0, h.index + 1);
    h.states.push(snap);
    if (h.states.length > HISTORY_LIMIT) h.states.shift();
    h.index = h.states.length - 1;
    bump();
  }, [bump]);

  const notify = useCallback(() => {
    if (notifyTimerRef.current) window.clearTimeout(notifyTimerRef.current);
    notifyTimerRef.current = window.setTimeout(() => {
      const c = fabricRef.current;
      const cb = onChangeRef.current;
      if (!c || !cb) return;
      cb({
        fabricJson: serialize(c),
        dataUrl: c.toDataURL({ format: 'png', quality: 1, multiplier: 1 }),
      });
    }, 400);
  }, []);

  // ---------- init ----------
  // idempotente: chamado pela callback ref, lida com React.StrictMode (2x).
  // - el === null    -> dispose (componente desmontando)
  // - mesmo el       -> noop
  // - el diferente   -> dispose anterior + cria novo
  const attach = useCallback((el: HTMLCanvasElement | null) => {
    if (!el) {
      detachGuidesRef.current?.(); detachGuidesRef.current = null;
      if (fabricRef.current) {
        try { void fabricRef.current.dispose(); } catch (e) { console.warn('[useEditor] dispose', e); }
        fabricRef.current = null;
      }
      canvasElRef.current = null;
      return;
    }
    // mesmo elemento ja inicializado — nao recria
    if (fabricRef.current && canvasElRef.current === el) return;
    // diferente elemento — dispose o antigo antes
    if (fabricRef.current) {
      detachGuidesRef.current?.(); detachGuidesRef.current = null;
      try { void fabricRef.current.dispose(); } catch (e) { console.warn('[useEditor] dispose old', e); }
      fabricRef.current = null;
    }

    canvasElRef.current = el;

    const c = new fabric.Canvas(el, {
      width,
      height,
      backgroundColor: background,
      preserveObjectStacking: true,
      selection: true,
    });
    fabricRef.current = c;
    if(pickAllLayers)attachLayerPicking(c);
    // O teclado do Fabric precisa permanecer dentro do modal (focus trap do Radix).
    // Vale também para texto novo e para undo/redo, que recriam os objetos.
    const positionedInputs=new WeakSet<fabric.IText>();
    const bindTextInput = ({target}: {target: fabric.Object}) => {
      const bind = (obj: fabric.Object) => {
        if(obj instanceof fabric.IText){
          obj.hiddenTextareaContainer=containerRef.current??undefined;
          if(pickAllLayers&&!positionedInputs.has(obj)){
            positionedInputs.add(obj);
            const calc=obj._calcTextareaPosition.bind(obj);
            // O Fabric calcula coordenadas de documento. Dentro do modal e com
            // zoom CSS, o input precisa de coordenadas locais para não rolar a arte.
            obj._calcTextareaPosition=()=>{
              const position=calc(),host=containerRef.current;
              if(!host||position.charHeight===undefined)return position;
              const bounds=host.getBoundingClientRect(),art=c.upperCanvasEl.getBoundingClientRect();
              const scaleX=art.width/c.getWidth(),scaleY=art.height/c.getHeight();
              const offset=c._offset;
              const x=art.left+(parseFloat(position.left)-offset.left)*scaleX-bounds.left;
              const y=art.top+(parseFloat(position.top)-offset.top)*scaleY-bounds.top;
              return {...position,left:`${host.scrollLeft+Math.max(1,Math.min(x,host.clientWidth-2))}px`,top:`${host.scrollTop+Math.max(1,Math.min(y,host.clientHeight-2))}px`,fontSize:`${position.charHeight*scaleY}px`,charHeight:position.charHeight*scaleY};
            };
          }
        }
        if(obj instanceof fabric.Group)obj.getObjects().forEach(bind);
      };
      bind(target);
      if(pickAllLayers){installConnectorControls(target,()=>zoomRef.current);resizeConnectorHandles(c,zoomRef.current);}
    };
    c.on('object:added',bindTextInput);
    c.on('text:editing:entered',({target})=>{
      // O clique nativo e os painéis React ainda podem disputar o foco no frame
      // da entrada em edição. Reafirma o teclado após esse mesmo ciclo de layout.
      requestAnimationFrame(()=>{
        if(fabricRef.current===c&&target.isEditing&&c.getActiveObject()===target){
          target.hiddenTextarea?.focus({preventScroll:true});
        }
      });
    });

    const refreshActive = () => setActiveObject(c.getActiveObject() ?? null);
    c.on('selection:created', refreshActive);
    c.on('selection:updated', refreshActive);
    c.on('selection:cleared', () => setActiveObject(null));

    if(pickAllLayers){
      const follow=({target}:{target:fabric.Object})=>syncCanvasConnections(c,target);
      c.on('object:moving',follow);c.on('object:scaling',follow);c.on('object:rotating',follow);c.on('text:changed',follow);
      c.on('object:modified',({target,action})=>{
        const o=target as fabric.Object&{beeConnector?:{manual?:boolean}};
        if(o.beeConnector&&action==='drag')o.beeConnector.manual=true;
        else syncCanvasConnections(c,target);
      });
    }
    const onChange_ = () => {
      if (mutatingRef.current) return;
      pushHistory();
      notify();
      bump();
    };
    c.on('object:added', onChange_);
    c.on('object:removed', onChange_);
    c.on('object:modified', onChange_);
    c.on('text:changed', onChange_);

    // Réguas/guias estilo Canva (alinhamento + snap + distâncias).
    detachGuidesRef.current = attachSmartGuides(c, { getZoom: () => zoomRef.current });

    pushHistory();
    // Canvas novo em folha: avisa quem precisa (re)carregar conteudo nele.
    setCanvasEpoch((e) => e + 1);
  }, [width, height, background, pickAllLayers, pushHistory, notify, bump]);

  // dispose final ao desmontar o hook
  useEffect(() => {
    return () => {
      if (notifyTimerRef.current) window.clearTimeout(notifyTimerRef.current);
      detachGuidesRef.current?.(); detachGuidesRef.current = null;
      const c = fabricRef.current;
      if (c) {
        try { void c.dispose(); } catch (e) { console.warn('[useEditor unmount]', e); }
        fabricRef.current = null;
      }
    };
  }, []);

  // ---------- ZOOM via CSS transform ----------
  // Canvas Fabric mantém SEMPRE width x height originais (1080x1350, etc).
  // O CanvasArea aplica `transform: scale(zoom)` no wrapper visual.
  // Resultado: hit-testing Fabric perfeito, sem cortes, layout previsível.

  const fitToContainer = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // Margem pequena pra respirar. CanvasArea ja aplica padding tailwind no wrapper.
    const PAD = 32;
    const cw = el.clientWidth - PAD;
    const ch = el.clientHeight - PAD;
    if (cw <= 0 || ch <= 0) return;
    const s = Math.min(cw / width, ch / height, 1);
    setZoomState(s);
    zoomModeRef.current = 'fit';
  }, [width, height]);

  const setZoom = useCallback((z: number) => {
    const clamped = Math.max(0.1, Math.min(4, z));
    setZoomState(clamped);
    zoomModeRef.current = 'manual';
  }, []);

  const zoomIn = useCallback(() => setZoom(zoom * 1.2), [setZoom, zoom]);
  const zoomOut = useCallback(() => setZoom(zoom / 1.2), [setZoom, zoom]);
  const resetZoom = useCallback(() => fitToContainer(), [fitToContainer]);

  // ResizeObserver refit se modo for fit
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (zoomModeRef.current === 'fit') fitToContainer();
    });
    ro.observe(containerRef.current);
    fitToContainer();
    return () => ro.disconnect();
  }, [fitToContainer]);

  // Reage a mudanca de width/height do preset: atualiza canvas backstore + refit
  useEffect(() => {
    const c = fabricRef.current;
    if (!c) return;
    // Canvas sempre nas dimensoes originais (sem zoom)
    c.setDimensions({ width, height });
    c.renderAll();
    fitToContainer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // ---------- ACOES ----------
  const addText = useCallback((text = 'Clique para editar', opts?: Partial<fabric.TextboxProps>) => {
    const c = fabricRef.current;
    if (!c) return;
    const tw = Math.round(width * 0.6);
    const box = new fabric.Textbox(text, {
      left: (width - tw) / 2,
      top: height / 2 - 30,
      width: tw,
      fontSize: 56,
      fontFamily: 'Inter',
      fontWeight: 'bold',
      fill: '#2D4A5C',
      textAlign: 'center',
      ...opts,
    });
    c.add(box);
    c.setActiveObject(box);
    c.requestRenderAll();
  }, [width, height]);

  const addRect = useCallback(() => {
    const c = fabricRef.current;
    if (!c) return;
    const w = Math.round(width / 4);
    const h = Math.round(height / 6);
    c.add(new fabric.Rect({ left: (width - w) / 2, top: (height - h) / 2, width: w, height: h, fill: '#E8A04C' }));
    c.requestRenderAll();
  }, [width, height]);

  const addCircle = useCallback(() => {
    const c = fabricRef.current;
    if (!c) return;
    const r = Math.round(Math.min(width, height) / 12);
    c.add(new fabric.Circle({ left: width / 2 - r, top: height / 2 - r, radius: r, fill: '#2D4A5C' }));
    c.requestRenderAll();
  }, [width, height]);

  const addLine = useCallback(() => {
    const c = fabricRef.current;
    if (!c) return;
    c.add(new fabric.Path(`M ${width*.2} ${height*.5} L ${width*.8} ${height*.5}`, { fill:'',stroke: '#2D4A5C', strokeWidth: 4 }));
    c.requestRenderAll();
  }, [width, height]);

  const addImageFromUrl = useCallback(async (url: string) => {
    const c = fabricRef.current;
    if (!c) return;
    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      const maxSide = Math.min(width, height) * 0.7;
      const iw = img.width ?? 1;
      const ih = img.height ?? 1;
      const s = Math.min(maxSide / iw, maxSide / ih, 1);
      img.scale(s);
      img.set({ left: (width - iw * s) / 2, top: (height - ih * s) / 2 });
      c.add(img);
      c.setActiveObject(img);
      c.requestRenderAll();
    } catch (e) {
      console.error('[useEditor.addImage]', e);
    }
  }, [width, height]);

  // Troca o bitmap da Image ativa preservando o enquadramento: a caixa que voce
  // desenhou e o que importa, a imagem de exemplo so ocupa ela.
  const replaceActiveImage = useCallback(async (url: string) => {
    const c = fabricRef.current;
    const obj = c?.getActiveObject();
    if (!c || !obj) return;
    if (obj.type !== 'image' && obj.type !== 'Image') return;
    const old = obj as fabric.FabricImage;
    const boxW = (old.width ?? 1) * (old.scaleX ?? 1);
    const boxH = (old.height ?? 1) * (old.scaleY ?? 1);
    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      const iw = img.width ?? 1;
      const ih = img.height ?? 1;
      // "contain" na caixa antiga — nao distorce a nova imagem
      const s = Math.min(boxW / iw, boxH / ih);
      img.set({
        left: (old.left ?? 0) + (boxW - iw * s) / 2,
        top: (old.top ?? 0) + (boxH - ih * s) / 2,
        scaleX: s,
        scaleY: s,
        angle: old.angle ?? 0,
        opacity: old.opacity ?? 1,
        // leva junto a identidade de slot
        name: (old as unknown as { name?: string }).name,
        beeSlot: (old as unknown as { beeSlot?: BeeSlotMeta }).beeSlot,
      } as Record<string, unknown>);
      const idx = c.getObjects().indexOf(old);
      c.remove(old);
      c.add(img);
      if (idx >= 0) c.moveObjectTo(img, idx);
      c.setActiveObject(img);
      c.requestRenderAll();
      pushHistory();
      notify();
      bump();
    } catch (e) {
      console.error('[useEditor.replaceActiveImage]', e);
    }
  }, [pushHistory, notify, bump]);

  const setBackground = useCallback((color: string) => {
    const c = fabricRef.current;
    if (!c) return;
    c.backgroundColor = color;
    c.requestRenderAll();
    pushHistory();
    notify();
  }, [pushHistory, notify]);

  const editSelection = useCallback((operation:'left'|'center'|'right'|'top'|'middle'|'bottom'|'horizontal'|'vertical'|'group'|'ungroup'|'delete') => {
    const c=fabricRef.current;if(!c)return;
    const active=c.getActiveObject(),selected=c.getActiveObjects();if(!active||!selected.length)return;
    mutatingRef.current=true;
    try{
      c.discardActiveObject();
      let next=selected;
      if(operation==='delete'){selected.forEach(o=>c.remove(o));next=[];}
      else if(operation==='group'&&selected.length>1&&selected.every(o=>!o.group)){
        selected.forEach(o=>c.remove(o));const group=new fabric.Group(selected,{subTargetCheck:true,interactive:true});c.add(group);next=[group];
      }else if(operation==='ungroup'&&active instanceof fabric.Group&&!(active instanceof fabric.ActiveSelection)){
        const children=active.remove(...active.getObjects());c.remove(active);children.forEach(o=>{c.add(o);o.setCoords();});next=children;
      }else if(!['group','ungroup'].includes(operation)){
        const horizontal=['left','center','right','horizontal'].includes(operation),pos=horizontal?'left':'top',size=horizontal?'width':'height';
        const boxes=selected.map(o=>({o,b:o.getBoundingRect()}));
        const start=selected.length===1?0:Math.min(...boxes.map(x=>x.b[pos]));
        const end=selected.length===1?(horizontal?width:height):Math.max(...boxes.map(x=>x.b[pos]+x.b[size]));
        const move=(o:fabric.Object,delta:number)=>{const p=o.getXY();o.setXY(new fabric.Point(p.x+(horizontal?delta:0),p.y+(horizontal?0:delta)));o.setCoords();};
        if(operation==='horizontal'||operation==='vertical'){
          if(boxes.length>=3){boxes.sort((a,b)=>a.b[pos]-b.b[pos]);const gap=(end-start-boxes.reduce((sum,x)=>sum+x.b[size],0))/(boxes.length-1);if(gap>=0){let at=start;boxes.forEach(({o,b})=>{move(o,at-b[pos]);at+=b[size]+gap;});}}
        }else boxes.forEach(({o,b})=>{const at=operation==='left'||operation==='top'?start:operation==='right'||operation==='bottom'?end-b[size]:(start+end-b[size])/2;move(o,at-b[pos]);});
        if(pickAllLayers)selected.forEach(o=>syncCanvasConnections(c,o));
      }
      if(next.length===1)c.setActiveObject(next[0]);else if(next.length>1)c.setActiveObject(new fabric.ActiveSelection(next,{canvas:c}));
      setActiveObject(c.getActiveObject()??null);c.requestRenderAll();
    }finally{mutatingRef.current=false;}
    pushHistory();notify();bump();
  },[width,height,pickAllLayers,pushHistory,notify,bump]);
  const deleteActive = useCallback(() => editSelection('delete'),[editSelection]);

  const updateActive = useCallback((patch: Record<string, unknown>) => {
    const c = fabricRef.current;
    const obj = c?.getActiveObject();
    if (!c || !obj) return;
    obj.set(patch);
    obj.setCoords();
    if(pickAllLayers)syncCanvasConnections(c,obj);
    c.requestRenderAll();
    c.fire('object:modified', { target: obj });
    bump();
  }, [bump,pickAllLayers]);

  // Aplica/remove um filtro de cor na Image ativa (BlendColor mode tint).
  // Util pra tingir a espiral Bee (PNG honey) em outras cores.
  // Passe null pra remover o tint e voltar a cor original.
  const tintActiveImage = useCallback((color: string | null) => {
    const c = fabricRef.current;
    const obj = c?.getActiveObject();
    if (!c || !obj) return;
    const isImage = obj.type === 'image' || obj.type === 'Image';
    if (!isImage) return;
    const img = obj as fabric.FabricImage;
    if (color) {
      img.filters = [new fabric.filters.BlendColor({ color, mode: 'tint', alpha: 1 })];
    } else {
      img.filters = [];
    }
    img.applyFilters();
    c.requestRenderAll();
    c.fire('object:modified', { target: img });
    bump();
  }, [bump]);

  const moveLayer = useCallback((dir: 'up' | 'down' | 'top' | 'bottom') => {
    const c = fabricRef.current;
    const obj = c?.getActiveObject();
    if (!c || !obj) return;
    if (dir === 'up') c.bringObjectForward(obj);
    else if (dir === 'down') c.sendObjectBackwards(obj);
    else if (dir === 'top') c.bringObjectToFront(obj);
    else c.sendObjectToBack(obj);
    c.requestRenderAll();
    pushHistory();
    notify();
  }, [pushHistory, notify]);

  // ---------- HISTORY ----------
  const undo = useCallback(async () => {
    const h = historyRef.current;
    if (h.index <= 0) return;
    const c = fabricRef.current;
    if (!c) return;
    h.index -= 1;
    mutatingRef.current = true;
    try {
      await c.loadFromJSON(JSON.parse(h.states[h.index]));
      c.renderAll();
    } finally {
      mutatingRef.current = false;
    }
    bump();
    notify();
  }, [bump, notify]);

  const redo = useCallback(async () => {
    const h = historyRef.current;
    if (h.index >= h.states.length - 1) return;
    const c = fabricRef.current;
    if (!c) return;
    h.index += 1;
    mutatingRef.current = true;
    try {
      await c.loadFromJSON(JSON.parse(h.states[h.index]));
      c.renderAll();
    } finally {
      mutatingRef.current = false;
    }
    bump();
    notify();
  }, [bump, notify]);

  // ---------- LOAD/EXPORT ----------
  const loadFromJson = useCallback(async (json: object, options: {strict?:boolean} = {}) => {
    const c = fabricRef.current;
    if (!c) return;
    mutatingRef.current = true;
    const expected = (json as { objects?: unknown[] }).objects?.length ?? 0;
    let failure: unknown;
    try {
      await c.loadFromJSON(pickAllLayers?normalizeEditorLines(json):json);
      // HARDENING anti-tela-branca: às vezes o loadFromJSON resolve com 0 objetos
      // (hidratação intermitente, mais comum no dev/StrictMode) — tenta 1x de novo.
      if (expected > 0 && c.getObjects().length === 0) {
        console.warn('[useEditor] loadFromJSON carregou 0 objetos — retry');
        await c.loadFromJSON(pickAllLayers?normalizeEditorLines(json):json);
      }
    } catch (e) {
      failure=e;
      // Enliven pode falhar (ex: uma imagem não carrega). NÃO deixa o canvas
      // em branco: os objetos que carregaram já estão no canvas — renderiza o
      // que deu, em vez de abortar tudo.
      console.warn('[useEditor] loadFromJSON parcial', e);
    } finally {
      c.renderAll();
      // 2º render no próximo frame: imagens/fontes que chegaram tarde (a espiral
      // é cross-origin) às vezes não entram no 1º renderAll.
      requestAnimationFrame(() => { try { fabricRef.current?.renderAll(); } catch { /* noop */ } });
      mutatingRef.current = false;
    }
    if(options.strict&&(failure||c.getObjects().length!==expected))throw new Error('A arte não carregou por completo. Reabra a página para editar sem perder elementos.');
    pushHistory();
    notify();
  }, [pushHistory, notify,pickAllLayers]);

  // Serializa incluindo as props custom (name/beeSlot) — nunca use toJSON().
  const toJson = useCallback((): object => {
    const c = fabricRef.current;
    if (!c) return {};
    return serialize(c);
  }, []);

  // ---------- SLOTS (modo template) ----------
  // Marca/desmarca o objeto ativo como campo dinamico. Passar null desmarca.
  const setActiveSlot = useCallback((meta: BeeSlotMeta | null) => {
    const c = fabricRef.current;
    const obj = c?.getActiveObject();
    if (!c || !obj) return;
    if (meta) {
      obj.set({ beeSlot: meta, name: meta.content_key } as Record<string, unknown>);
    } else {
      obj.set({ beeSlot: undefined, name: undefined } as Record<string, unknown>);
    }
    c.requestRenderAll();
    c.fire('object:modified', { target: obj });
    bump();
  }, [bump]);

  // Todos os slots do canvas, na ordem das camadas.
  const listSlots = useCallback((): Array<{ meta: BeeSlotMeta; obj: fabric.Object }> => {
    const c = fabricRef.current;
    if (!c) return [];
    return c
      .getObjects()
      .map((o) => ({ meta: (o as unknown as { beeSlot?: BeeSlotMeta }).beeSlot, obj: o }))
      .filter((x): x is { meta: BeeSlotMeta; obj: fabric.Object } => !!x.meta?.content_key);
  }, []);

  const selectObject = useCallback((obj: fabric.Object) => {
    const c = fabricRef.current;
    if (!c) return;
    c.setActiveObject(obj);
    c.requestRenderAll();
    // setActiveObject NÃO dispara selection:created no Fabric — atualiza o estado
    // React na mão pra o painel de propriedades reagir ao clique na lista de camadas.
    setActiveObject(obj);
  }, []);

  useEffect(()=>{if(pickAllLayers&&fabricRef.current)resizeConnectorHandles(fabricRef.current,zoom);},[zoom,pickAllLayers,canvasEpoch]);

  const exportPng = useCallback((multiplier = 2): string | null => {
    const c = fabricRef.current;
    if (!c) return null;
    return c.toDataURL({ format: 'png', quality: 1, multiplier });
  }, []);

  const downloadPng = useCallback(() => {
    const url = exportPng(2);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `bee-${Date.now()}.png`;
    a.click();
  }, [exportPng]);

  // ---------- estado derivado ----------
  void tick; // forca recomputo
  const canUndo = historyRef.current.index > 0;
  const canRedo = historyRef.current.index < historyRef.current.states.length - 1;

  return {
    attach,
    containerRef,
    fabric: fabricRef,
    canvasEpoch,
    activeObject,
    zoom,
    canUndo,
    canRedo,
    // actions
    addText,
    addRect,
    addCircle,
    addLine,
    addImageFromUrl,
    replaceActiveImage,
    setBackground,
    deleteActive,
    editSelection,
    selectedCount: fabricRef.current?.getActiveObjects().length??0,
    activeIsGroup: activeObject instanceof fabric.Group&&!(activeObject instanceof fabric.ActiveSelection),
    updateActive,
    tintActiveImage,
    moveLayer,
    undo,
    redo,
    loadFromJson,
    toJson,
    exportPng,
    downloadPng,
    // slots (modo template)
    setActiveSlot,
    listSlots,
    selectObject,
    // zoom
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToContainer,
  };
}

export type EditorApi = ReturnType<typeof useEditor>;
