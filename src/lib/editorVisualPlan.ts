import { validateVisualPlan, type VisualElement, type VisualPlan } from '../../supabase/functions/_shared/visual-adjust';
import { nodeBox, organizeLayerDiagram, updateConnections, type DiagramNode } from './hive/diagramConnections';
export type {VisualPlan,VisualElement};
type CanvasData={objects?:DiagramNode[];background?:unknown};
export function visualElements(value:unknown):VisualElement[]{
  const out:VisualElement[]=[];
  const walk=(objects:DiagramNode[],parent='')=>objects.forEach((o,i)=>{
    const id=parent?`${parent}.${i}`:String(i),b=nodeBox(o),kind=String(o.type??'').toLowerCase();
    out.push({id,parent,kind,name:o.name??kind,text:typeof o.text==='string'?o.text.slice(0,1500):undefined,...b,angle:Number(o.angle??0),fill:typeof o.fill==='string'?o.fill:undefined,stroke:typeof o.stroke==='string'?o.stroke:undefined,fontSize:typeof o.fontSize==='number'?o.fontSize:undefined});
    if(o.objects)walk(o.objects,id);
  });walk((value as CanvasData)?.objects??[]);return out;
}
export function applyVisualPlan(value:unknown,plan:unknown,scope:string[]|null,width:number,height:number,variant?:string|null):{fabricJson:object;plan:VisualPlan}{
  const elements=visualElements(value),allowed=scope??elements.map(e=>e.id);
  const safe=validateVisualPlan(plan,elements,allowed,scope===null,width,height);
  let copy=JSON.parse(JSON.stringify(value)) as CanvasData;
  const node=(id:string)=>id.split('.').reduce<DiagramNode>((p,k)=>(p.objects??[])[Number(k)],copy as DiagramNode);
  const affected=new Set<string>();
  const touch=(o:DiagramNode)=>{if(o.name)affected.add(o.name);};
  for(const op of safe.operations){
    if(op.kind==='repair_diagram'){copy=organizeLayerDiagram(copy,width,height,variant) as CanvasData;continue;}
    if(op.kind==='background'){copy.background=op.color;continue;}
    if(op.kind==='transform'||op.kind==='style'){
      const o=node(op.id);touch(o);
      Object.entries(op).forEach(([k,v])=>{if(k!=='id'&&k!=='kind')o[k]=v;});
    }else{
      const nodes=op.ids.map(node),boxes=nodes.map(nodeBox);
      if(op.kind==='align'){
        const horizontal=['left','center','right'].includes(op.axis),pos=horizontal?'left':'top',size=horizontal?'width':'height';
        const start=Math.min(...boxes.map(b=>b[pos])),end=Math.max(...boxes.map(b=>b[pos]+b[size]));
        nodes.forEach((o,i)=>{touch(o);o[pos]=op.axis==='left'||op.axis==='top'?start:op.axis==='right'||op.axis==='bottom'?end-boxes[i][size]:(start+end-boxes[i][size])/2;});
      }else{
        const pos=op.axis==='horizontal'?'left':'top',size=op.axis==='horizontal'?'width':'height';
        const sorted=nodes.map((o,i)=>({o,b:boxes[i]})).sort((a,b)=>a.b[pos]-b.b[pos]);
        const start=sorted[0].b[pos],end=sorted.at(-1)!.b[pos]+sorted.at(-1)!.b[size];
        const gap=(end-start-sorted.reduce((s,x)=>s+x.b[size],0))/(sorted.length-1);
        if(gap<0)throw new Error('Não há espaço para distribuir esses elementos sem sobreposição.');
        let at=start;sorted.forEach(({o,b})=>{touch(o);o[pos]=at;at+=b[size]+gap;});
      }
    }
  }
  const sync=(os:DiagramNode[])=>{updateConnections(os,affected);os.forEach(o=>{if(o.objects)sync(o.objects);});};sync(copy.objects??[]);
  // Nenhuma operação pode alterar texto, fotos ou quantidade/ordem de elementos.
  const before=visualElements(value),after=visualElements(copy);
  if(before.length!==after.length||before.some((b,i)=>b.text!==after[i].text||b.kind!==after[i].kind))throw new Error('A proposta alterou conteúdo que deveria ser preservado.');
  if(JSON.stringify(copy)===JSON.stringify(value))throw new Error(safe.summary||'A proposta não produziu mudança visual.');
  return {fabricJson:copy,plan:safe};
}
