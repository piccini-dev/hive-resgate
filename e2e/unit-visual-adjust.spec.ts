import {test,expect} from '@playwright/test';
import {legacyDiagram} from './helpers/diagram-fixture';
import {organizeLayerDiagram,type DiagramNode,nodeBox,updateConnections} from '../src/lib/hive/diagramConnections';
type Diagram={objects:DiagramNode[]};
test('repara diagrama legado com ligações exatas nos anéis e no núcleo; preserva palavras e entrada',()=>{
  const old=legacyDiagram(),snapshot=JSON.stringify(old);
  const result=organizeLayerDiagram(old,1080,1350,'M03-B') as Diagram;
  expect(JSON.stringify(old)).toBe(snapshot);
  expect(result.objects.map(o=>o.text)).toEqual(old.objects.map(o=>o.text));
  const os=result.objects,outer=nodeBox(os.find(o=>o.name==='diagram-ring-0')!);
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
test('recusa diagrama ambíguo ou sem espaço em vez de adivinhar relações',()=>{
  expect(()=>organizeLayerDiagram({objects:[]},1080,1350,'M03-B')).toThrow('reconhecer');
  const invalid=legacyDiagram();invalid.objects[1].radius=600;
  expect(()=>organizeLayerDiagram(invalid,1080,1350,'M03-B')).toThrow('espaço');
});
test('organização preserva texto, fotografias, assinatura, círculos e ordem',()=>{
  const source=legacyDiagram();source.objects.push({type:'Image',src:'foto-preservada',left:50,top:60,width:70,height:80});
  const result=organizeLayerDiagram(source,1080,1350,'M03-B') as Diagram;
  expect(result.objects).toHaveLength(source.objects.length);
  expect(result.objects.map(o=>o.type)).toEqual(source.objects.map(o=>o.type));
  result.objects.forEach((o,i)=>{expect(o.text).toBe(source.objects[i].text);expect(o.src).toBe(source.objects[i].src);});
  expect(result.objects.at(-1)).toEqual(source.objects.at(-1));
  expect(result.objects.find(o=>o.name==='signature')).toEqual(source.objects.find(o=>o.name==='signature'));
});
test('rótulo movido atualiza apenas suas conexões; ajuste manual da linha é respeitado',()=>{
  const source=organizeLayerDiagram(legacyDiagram(),1080,1350,'M03-B') as Diagram;
  const label=source.objects.find(o=>o.name==='diagram-label-1')!;
  const line=source.objects.find(o=>o.name==='diagram-connector-1')!;
  const other=JSON.stringify(source.objects.find(o=>o.name==='diagram-connector-0'));
  const before=JSON.stringify(line.path);label.top=730;updateConnections(source.objects,new Set([label.name!]));
  expect(JSON.stringify(line.path)).not.toBe(before);
  expect(JSON.stringify(source.objects.find(o=>o.name==='diagram-connector-0'))).toBe(other);
  line.beeConnector!.manual=true;const manual=JSON.stringify(line.path);label.top=760;updateConnections(source.objects,new Set([label.name!]));
  expect(JSON.stringify(line.path)).toBe(manual);
});
test('reorganização repetida mantém o mesmo desenho e restaura ligações manuais só a pedido',()=>{
  const source=organizeLayerDiagram(legacyDiagram(),1080,1350,'M03-B') as Diagram;
  expect(organizeLayerDiagram(source,1080,1350,'M03-B')).toEqual(source);
  const manual=structuredClone(source);const line=manual.objects.find(o=>o.name==='diagram-connector-1')!;line.beeConnector!.manual=true;line.path=[['M',0,0],['L',100,200]];
  expect(organizeLayerDiagram(manual,1080,1350,'M03-B')).toEqual(source);
});
