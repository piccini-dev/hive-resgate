import {test,expect} from '@playwright/test';
import {legacyDiagram} from './helpers/diagram-fixture';
import {applyVisualPlan,visualElements} from '../src/lib/editorVisualPlan';
import {organizeLayerDiagram,type DiagramNode,nodeBox} from '../src/lib/hive/diagramConnections';
const organize={summary:'Organizar ligações',operations:[{kind:'repair_diagram'}]};
test('repara diagrama legado com ligações exatas nos anéis e no núcleo; preserva palavras e entrada',()=>{
  const old=legacyDiagram(),snapshot=JSON.stringify(old);
  const result=applyVisualPlan(old,organize,null,1080,1350,'M03-B');
  expect(JSON.stringify(old)).toBe(snapshot);
  expect(visualElements(result.fabricJson).map(e=>e.text)).toEqual(visualElements(old).map(e=>e.text));
  const os=(result.fabricJson as {objects:DiagramNode[]}).objects;
  const outer=nodeBox(os.find(o=>o.name==='diagram-ring-0')!);
  for(let i=0;i<4;i++){
    const line=os.find(o=>o.name===`diagram-connector-${i}`)!;
    const circle=os.find(o=>o.name===line.beeConnector!.from)!;const b=nodeBox(circle);
    const path=line.path as Array<[string,number,number]>;
    expect(((path[0][1]-b.left-b.width/2)/(b.width/2))**2+((path[0][2]-b.top-b.height/2)/(b.height/2))**2).toBeCloseTo(1,8);
    expect(path).toHaveLength(4);
    const label=os.find(o=>o.name===`diagram-label-${i}`)!;
    expect(Number(label.left)).toBeGreaterThan(outer.left+outer.width+20);
    expect(path.at(-1)![1]).toBe(Number(label.left)-14);
  }
  expect(os.find(o=>o.name==='diagram-connector-3')!.beeConnector!.from).toBe('diagram-core');
});
test('recusa diagrama ambíguo e reparação fora do escopo',()=>{
  expect(()=>organizeLayerDiagram({objects:[]},1080,1350,'M03-B')).toThrow('reconhecer');
  expect(()=>applyVisualPlan(legacyDiagram(),organize,['0'],1080,1350,'M03-B')).toThrow('página inteira');
});
test('plano visual não pode reescrever texto, trocar fotos ou executar propriedades extras',()=>{
  const source=legacyDiagram();
  for(const op of [{kind:'style',id:'0',text:'Outro texto'},{kind:'transform',id:'0',left:200,src:'https://example.test'},{kind:'delete',id:'0'},{kind:'style',id:'0',fill:'url(javascript:alert(1))'}])expect(()=>applyVisualPlan(source,{summary:'Pedido',operations:[op]},null,1080,1350)).toThrow();
  expect(()=>applyVisualPlan(source,{summary:'Pedido',operations:[{kind:'transform',id:'1',left:200}]},['0'],1080,1350)).toThrow('fora da seleção');
});
test('ajuste selecionado mantém textos, imagens, ordem e todas as demais propriedades',()=>{
  const source={objects:[{type:'Textbox',name:'unit-title',text:'Palavras intactas',left:100,top:100,width:500,height:100,fontSize:36},{type:'Image',src:'foto-preservada',left:200,top:300,width:300,height:300}]};
  const {fabricJson}=applyVisualPlan(source,{summary:'Mover título',operations:[{kind:'transform',id:'0',left:150}]},['0'],1080,1350);
  expect(fabricJson).toEqual({...source,objects:[{...source.objects[0],left:150},source.objects[1]]});
});
test('recusa tamanhos/posições inválidos, distribuição sobreposta e proposta sem mudança',()=>{
  const source=legacyDiagram();
  for(const op of [{kind:'transform',id:'0',left:Infinity},{kind:'style',id:'0',fontSize:5},{kind:'transform',id:'0',scaleX:0}])expect(()=>applyVisualPlan(source,{summary:'Pedido',operations:[op]},null,1080,1350)).toThrow();
  expect(()=>applyVisualPlan(source,{summary:'Sem alteração',operations:[]},null,1080,1350)).toThrow('Sem alteração');
});
test('rótulo movido atualiza apenas suas conexões; ajuste manual da linha é respeitado',()=>{
  const source=organizeLayerDiagram(legacyDiagram(),1080,1350,'M03-B') as {objects:DiagramNode[]};
  const i=source.objects.findIndex(o=>o.name==='diagram-label-1');
  const before=source.objects.find(o=>o.name==='diagram-connector-1')!.path;
  const plan={summary:'Mover rótulo',operations:[{kind:'transform',id:String(i),top:730}]};
  const result=applyVisualPlan(source,plan,[String(i)],1080,1350).fabricJson as typeof source;
  expect(result.objects.find(o=>o.name==='diagram-connector-1')!.path).not.toEqual(before);
  expect(result.objects.find(o=>o.name==='diagram-connector-0')).toEqual(source.objects.find(o=>o.name==='diagram-connector-0'));
  source.objects.find(o=>o.name==='diagram-connector-1')!.beeConnector!.manual=true;
  const manual=applyVisualPlan(source,plan,[String(i)],1080,1350).fabricJson as typeof source;
  expect(manual.objects.find(o=>o.name==='diagram-connector-1')!.path).toEqual(before);
});
