// Ligações semânticas entre os elementos. Metadados não usam a chave `type`
// (o Fabric tenta hidratá-la como construtor).
export interface Connection {from:string;to:string;angle?:number;route?:'elbow'|'straight';lane?:number;manual?:boolean}
export interface DiagramNode extends Record<string,unknown> {name?:string;type?:string;left?:number;top?:number;width?:number;height?:number;radius?:number;fontSize?:number;scaleX?:number;scaleY?:number;angle?:number;objects?:DiagramNode[];beeConnector?:Connection}
const n=(x:unknown,f=0)=>typeof x==='number'&&Number.isFinite(x)?x:f;
export function nodeBox(o:DiagramNode){
  const width=n(o.width,n(o.radius)*2)*n(o.scaleX,1),height=n(o.height,n(o.radius)*2||n(o.fontSize,24)*1.13)*n(o.scaleY,1);
  return {left:n(o.left),top:n(o.top),width,height};
}
export function connectionPoints(from:DiagramNode,to:DiagramNode,meta:Connection,laneX?:number):number[][]{
  const f=nodeBox(from),t=nodeBox(to),angle=n(meta.angle)*Math.PI/180;
  const start={x:f.left+f.width/2+Math.cos(angle)*f.width/2,y:f.top+f.height/2+Math.sin(angle)*f.height/2};
  const end={x:t.left-14,y:t.top+n(to.fontSize,24)*.56};
  if(meta.route==='straight')return [[start.x,start.y],[end.x,end.y]];
  const bend=laneX??Math.max(start.x+12,end.x-18-n(meta.lane)*9);
  return [[start.x,start.y],[bend,start.y],[bend,end.y],[end.x,end.y]];
}
export const pathForPoints=(points:number[][])=>points.map((p,i)=>[i?'L':'M',p[0],p[1]]);
export function updateConnections(objects:DiagramNode[],affected?:Set<string>):void{
  const named=new Map(objects.filter(o=>o.name).map(o=>[o.name!,o]));
  const circles=objects.filter(o=>o.name?.startsWith('diagram-ring-')||o.name==='diagram-core');
  const right=Math.max(0,...circles.map(o=>{const b=nodeBox(o);return b.left+b.width;}));
  for(const o of objects){const m=o.beeConnector;if(!m||m.manual||(affected&&!affected.has(m.from)&&!affected.has(m.to)))continue;const from=named.get(m.from),to=named.get(m.to);if(!from||!to)continue;
    const target=nodeBox(to),bend=right+(target.left-14-right)*(1-(n(m.lane)+1)/5);
    o.path=pathForPoints(connectionPoints(from,to,m,bend));
    // Um path absoluto novo terá sua caixa calculada pelo Fabric ao carregar.
    for(const key of ['left','top','width','height','pathOffset','scaleX','scaleY','angle'])delete o[key];
  }
}

/** Reconhece também o M03-B legado; não adivinha relações em desenhos ambíguos. */
export function organizeLayerDiagram(value:unknown,width:number,height:number,variant?:string|null):object{
  const copy=JSON.parse(JSON.stringify(value)) as {objects?:DiagramNode[]};const os=copy.objects??[];
  let labels=os.filter(o=>o.name?.startsWith('diagram-label-')).sort((a,b)=>a.name!.localeCompare(b.name!));
  if(!labels.length){
    const circles=os.filter(o=>o.type?.toLowerCase()==='circle').sort((a,b)=>n(b.radius)-n(a.radius));
    const texts=os.filter(o=>['textbox','i-text','text'].includes(o.type?.toLowerCase()??'')&&!['headline','signature'].includes(o.name??''));
    const lines=os.filter(o=>o.type?.toLowerCase()==='path'&&(typeof o.path==='string'?/^M[^MLCQZ]+L[^MLCQZ]+$/i.test(o.path):Array.isArray(o.path)&&o.path.length===2));
    if(variant!=='M03-B'||circles.length!==5||texts.length!==8||lines.length!==4||n(circles[4].radius)>n(circles[0].radius)*.12)throw new Error('Não foi possível reconhecer as relações deste diagrama com segurança. Ajuste os elementos selecionados ou escolha outro visual.');
    circles.forEach((o,i)=>{o.name=i===4?'diagram-core':`diagram-ring-${i}`;});
    texts.forEach((o,i)=>{o.name=i%2?`diagram-description-${Math.floor(i/2)}`:`diagram-label-${Math.floor(i/2)}`;});
    lines.forEach((o,i)=>{o.name=`diagram-connector-${i}`;o.beeConnector={from:i===3?'diagram-core':`diagram-ring-${i}`,to:`diagram-label-${i}`,angle:[-55,-20,0,65][i],lane:i,route:'elbow'};});
    labels=texts.filter((_,i)=>i%2===0);
  }
  if(labels.length!==4)throw new Error('Este diagrama precisa de uma revisão das suas relações antes de reorganizar.');
  const shapes=os.filter(o=>o.name?.startsWith('diagram-ring-')||o.name==='diagram-core');
  const right=Math.max(...shapes.map(o=>{const b=nodeBox(o);return b.left+b.width;}));
  const x=Math.max(width*.66,right+width*.04),w=width*.94-x;
  if(w<width*.18||shapes.some(o=>n(o.angle)!==0))throw new Error('O diagrama não tem espaço suficiente para reorganizar os rótulos. Reduza os círculos ou ajuste o desenho primeiro.');
  labels.forEach((o,i)=>{const y=height*(.43+.38*i/3);Object.assign(o,{left:x,top:y,width:w});const d=os.find(o=>o.name===`diagram-description-${i}`);if(d)Object.assign(d,{left:x,top:y+width*.03,width:w});});
  // Pedido explícito restaura o trajeto canônico inclusive após um ajuste manual.
  os.forEach(o=>{const match=o.name?.match(/^diagram-connector-([0-3])$/);if(!match)return;const i=Number(match[1]);o.beeConnector={from:i===3?'diagram-core':`diagram-ring-${i}`,to:`diagram-label-${i}`,angle:[-55,-20,0,65][i],lane:i,route:'elbow',manual:false};});
  updateConnections(os);return copy;
}
