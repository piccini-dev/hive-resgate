import type { PostUnit, UserPost } from '../../types';
import { layoutText } from '../templates/layout';

type Node = Record<string, unknown> & { objects?: Node[]; name?: string; text?: string };
const textTypes = ['textbox','i-text','text'];
function walk(value: unknown, visit: (n: Node) => void) {
  if (!value || typeof value !== 'object') return;
  const n = value as Node; visit(n); n.objects?.forEach(x=>walk(x,visit));
}

/** Cópia editável; não modifica o Fabric salvo nem transforma a imagem em bitmap. */
export function editablePage(value: unknown): object {
  const copy = JSON.parse(JSON.stringify(value ?? {}));
  // Os compositores travam objetos para renderização. No editor, cada camada
  // deve responder ao mouse, inclusive formas, fotos, assinatura e diagramas.
  walk(copy,n=>{
    if(!n.type)return;
    n.selectable=true;n.evented=true;
    if(textTypes.includes(String(n.type).toLowerCase()))n.editable=true;
    else n.perPixelTargetFind=true; // um caminho vazado não cobre os textos atrás dele
    if(String(n.type).toLowerCase()==='group'){n.subTargetCheck=true;n.interactive=true;}
  });
  return copy;
}

/** Mantém texto canônico e arte juntos. Não perde o corpo da capa ao editar a frase. */
export function pageTextFromCanvas(value: unknown, unit: PostUnit): {title:string;body:string} {
  const named = new Map<string,string[]>();
  walk(value,n=>{if(n.name&&typeof n.text==='string')named.set(n.name,[...(named.get(n.name)??[]),n.text]);});
  const field=(name:string,fallback:string)=>{
    const values=named.get(name);
    if(!values?.length)throw new Error('Um campo principal da página foi removido. Desfaça a remoção ou ajuste pelo campo de texto.');
    if(values.length!==1)throw new Error('Há campos principais duplicados na arte. Desfaça a duplicação antes de salvar.');
    // Compositores quebram linhas por layout; abrir/salvar não reescreve o roteiro.
    return values[0].replace(/\s+/g,' ').trim()===fallback.replace(/\s+/g,' ').trim()?fallback:values[0];
  };
  const original=unit.fabric_json as {objects?:Node[]}|null;
  if(!original?.objects?.length)throw new Error('Esta página ainda não tem arte editável completa. Produza a imagem antes de editar na arte.');
  const names=new Set<string>();walk(original,n=>{if(n.name)names.add(n.name);});
  let title=unit.title??'',body=unit.body??'';
  if(names.has('unit-title'))title=field('unit-title',title);
  if(names.has('unit-body'))body=field('unit-body',body);
  if(names.has('headline')){
    const combined=[title,body].filter(Boolean).join(' — ');
    const next=field('headline',combined);
    if(next!==combined){title=next;body='';}
  }
  if(!title.trim()&&!body.trim())throw new Error('A página precisa ter texto.');
  return {title,body};
}

/** Mudança de texto em uma arte já editada preserva o desenho e os textos do diagrama. */
export function reflowEditedPage(unit:PostUnit):object {
  const copy=JSON.parse(JSON.stringify(unit.fabric_json));
  const replacements:Record<string,string>={'unit-title':unit.title??'','unit-body':unit.body??'',headline:[unit.title,unit.body].filter(Boolean).join(' — ')};
  walk(copy,n=>{
    if(!n.name||!(n.name in replacements)||typeof n.text!=='string')return;
    const text=replacements[n.name];
    if(text.replace(/\s+/g,' ').trim()===n.text.replace(/\s+/g,' ').trim())return;
    if(!text.trim()){n.text='';n.styles={};return;}
    const fs=Number(n.fontSize)||48, min=Math.max(24,Math.round(fs*.72)),lineHeight=Number(n.lineHeight)||1.2;
    const height=Number(n.height)||fs*lineHeight*5;
    // Fabric: a primeira linha tem a altura da fonte; lineHeight espaça as linhas
    // seguintes. Multiplicá-lo também na primeira rejeitava até frases de 1 linha.
    let fitted=false;
    for(let size=fs;size>=min;size--){
      const maxLines=Math.max(1,Math.floor(((height+2)/(size*1.13)-1)/lineHeight+1));
      const layout=layoutText(text,{textWidth:Number(n.width)||800,maxLines,maxFontSize:size,minFontSize:size,fontFamily:String(n.fontFamily??'Inter'),fontWeight:String(n.fontWeight??'400'),balance:false});
      if(size*1.13*(1+(layout.lines.length-1)*lineHeight)>height+2||layout.lines.length>maxLines)continue;
      n.text=layout.lines.join('\n');n.fontSize=size;n.styles={};fitted=true;break;
    }
    if(!fitted)throw new Error('O novo texto não cabe na área da arte editada. Encurte o texto ou amplie o campo no editor visual.');
  });
  return copy;
}

export type ReviewState = 'approved'|'ready'|'producing'|'failed'|'pending';
export function visualReviewState(piece: UserPost, units: PostUnit[]): ReviewState {
  if(['approved','scheduled','published'].includes(piece.status))return 'approved';
  if(['carousel','story'].includes(piece.format)){
    if(units.some(u=>u.visual_status==='failed'))return 'failed';
    if(units.some(u=>u.visual_status==='rendering'))return 'producing';
    return units.length>0&&units.every(u=>u.rendered_url&&u.visual_status==='ready'&&u.rendered_text_version===u.text_version)?'ready':'pending';
  }
  return piece.rendered_slides?.slide1?'ready':'pending';
}
