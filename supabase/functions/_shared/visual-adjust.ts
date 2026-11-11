// Contrato de ajustes visuais: dados declarativos, nunca código/HTML/URLs da IA.
export interface VisualElement {
  id:string; parent:string; kind:string; name:string; text?:string;
  left:number; top:number; width:number; height:number; angle:number;
  fill?:string; stroke?:string; fontSize?:number;
}
export type VisualOperation =
  | {kind:'transform';id:string;left?:number;top?:number;angle?:number;scaleX?:number;scaleY?:number}
  | {kind:'style';id:string;fill?:string;stroke?:string;strokeWidth?:number;fontSize?:number}
  | {kind:'align';ids:string[];axis:'left'|'center'|'right'|'top'|'middle'|'bottom'}
  | {kind:'distribute';ids:string[];axis:'horizontal'|'vertical'}
  | {kind:'repair_diagram'}
  | {kind:'background';color:string};
export interface VisualPlan {summary:string;operations:VisualOperation[]}
const hex=(v:unknown)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
const finite=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;

export function validateVisualPlan(value:unknown, elements:VisualElement[], allowedIds:string[], wholePage:boolean, width:number,height:number):VisualPlan {
  if(!value||typeof value!=='object')throw new Error('A Hive não retornou uma proposta visual válida.');
  const plan=value as Record<string,unknown>;
  if(typeof plan.summary!=='string'||!Array.isArray(plan.operations)||plan.operations.length>40)throw new Error('Proposta visual incompleta ou extensa demais.');
  const allowed=new Set(allowedIds),byId=new Map(elements.map(e=>[e.id,e]));
  const operations=plan.operations.map(raw=>{
    if(!raw||typeof raw!=='object')throw new Error('Operação visual inválida.');
    const op=raw as Record<string,unknown>;
    const keys=(list:string[])=>{if(Object.keys(op).some(k=>!list.includes(k)))throw new Error('A proposta tentou alterar uma propriedade não permitida.');};
    const ids=(xs:unknown,min:number)=>{
      if(!Array.isArray(xs)||xs.length<min||new Set(xs).size!==xs.length||xs.some(id=>typeof id!=='string'||!byId.has(id)||!allowed.has(id)))throw new Error('A proposta tentou alterar elementos fora da seleção.');
      return xs as string[];
    };
    if(op.kind==='repair_diagram'){keys(['kind']);if(!wholePage)throw new Error('Para reorganizar o diagrama, escolha a página inteira.');}
    else if(op.kind==='background'){keys(['kind','color']);if(!wholePage||!hex(op.color))throw new Error('Cor de fundo ou escopo inválido.');}
    else if(op.kind==='transform'){
      keys(['kind','id','left','top','angle','scaleX','scaleY']);ids([op.id],1);
      if(Object.keys(op).length<3)throw new Error('A proposta não contém alteração de posição.');
      for(const [key,min,max] of [['left',0,width],['top',0,height],['angle',-180,180],['scaleX',.05,8],['scaleY',.05,8]] as const)if(op[key]!==undefined&&!finite(op[key],min,max))throw new Error('A proposta contém uma posição ou dimensão inválida.');
    }else if(op.kind==='style'){
      keys(['kind','id','fill','stroke','strokeWidth','fontSize']);ids([op.id],1);
      if(Object.keys(op).length<3)throw new Error('A proposta não contém alteração visual.');
      if((op.fill!==undefined&&!hex(op.fill))||(op.stroke!==undefined&&!hex(op.stroke))||(op.strokeWidth!==undefined&&!finite(op.strokeWidth,1,12))||(op.fontSize!==undefined&&(!finite(op.fontSize,14,180)||!['textbox','text','i-text'].includes(byId.get(op.id as string)!.kind))))throw new Error('A proposta contém um estilo não permitido.');
    }else if(op.kind==='align'||op.kind==='distribute'){
      keys(['kind','ids','axis']);const group=ids(op.ids,op.kind==='align'?2:3);
      if(new Set(group.map(id=>byId.get(id)!.parent)).size!==1)throw new Error('Selecione elementos do mesmo grupo para alinhar ou distribuir.');
      if(!(op.kind==='align'?['left','center','right','top','middle','bottom']:['horizontal','vertical']).includes(String(op.axis)))throw new Error('Direção de alinhamento inválida.');
    }else throw new Error('A Hive propôs uma operação que este editor ainda não oferece.');
    return op as unknown as VisualOperation;
  });
  return {summary:plan.summary.trim().slice(0,600),operations};
}
