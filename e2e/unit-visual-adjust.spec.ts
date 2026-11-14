import {test,expect} from '@playwright/test';
import {legacyDiagram} from './helpers/diagram-fixture';
import {organizeLayerDiagram,type DiagramNode,nodeBox,updateConnections} from '../src/lib/hive/diagramConnections';
import {pageElements,revisePagePart} from '../src/lib/sequence/pageRevision';
import {partFields,readRevision,revisionText} from '../src/lib/sequence/assistedRevision';
import {photoUsage,requireNewImage,generationUnavailable} from '../src/lib/hive/imagePolicy';
import {composeM01,type M01Recipe} from '../src/lib/hive/composeM01';
type Diagram={objects:DiagramNode[]};

test('revisão assistida preserva o escopo e recusa resposta incompleta, duplicada ou com elemento protegido',()=>{
  const source=legacyDiagram(),fields=partFields(source,partRequest());
  expect(Object.values(fields)).not.toContain('Título do diagrama');expect(Object.values(fields)).not.toContain('AUTOR DE TESTE');
  const id=Object.keys(fields).find(id=>fields[id]==='Visível')!,answer={...fields,[id]:'Aparente'};
  expect(readRevision(revisionText(answer),fields)).toEqual(answer);
  expect(()=>readRevision(revisionText(fields),fields)).toThrow('manteve');
  expect(()=>readRevision(`[[0]]\nOutro título\n${revisionText(answer)}`,fields)).toThrow('fora');
  expect(()=>readRevision(revisionText(answer)+`\n[[${id}]]\nDuplicado`,fields)).toThrow('fora');
  expect(()=>readRevision(`[[${id}]]\nAparente`,fields)).toThrow('incompleta');
  expect(()=>readRevision('Texto sem identificação',fields)).toThrow('completa');
  expect(()=>partFields(source,{...partRequest(),scope:'selected',selected:[[0]]})).toThrow('apenas');
});

test('referência não é reutilização; trocar a imagem recusa URL antiga mesmo com outro cache-buster',()=>{
  expect(photoUsage({usage_policy:'reference_only',nivel:'A0'})).toBe('reference_only');
  expect(photoUsage({})).toBe('reusable');
  expect(()=>requireNewImage('https://x/foto.jpg?v=2','https://x/foto.jpg?v=1')).toThrow('existente');
  expect(()=>requireNewImage('https://x/ref.jpg',null,['https://x/ref.jpg'])).toThrow('existente');
  expect(()=>requireNewImage(null)).toThrow('não conseguiu');
  expect(requireNewImage('https://x/nova.jpg','https://x/antiga.jpg')).toBe('https://x/nova.jpg');
  expect(generationUnavailable('needs_real_photo','Um evento ocorrido.').message).toContain('foto real');
  expect(generationUnavailable('no_approved_style','').message).toContain('estilo fotográfico aprovado');
});

test('fundo vertical cobre o canvas e frase em zona inferior mantém distância da assinatura',()=>{
  const recipe:M01Recipe={id:'M01-E',nome:'Matéria',manifestacao_id:'M01',limites:{max_linhas:5},layer_stack:[
    {role:'texture'},{role:'headline',geometry:{w:70,cy:68}},{role:'bee_spiral_official',geometry:{w:10,cy:80}},
  ]};
  const result=composeM01({recipe,colors:{},spiralUrl:'espiral',text:'Uma frase longa precisa de espaço para ser lida sem invadir a assinatura do autor.',canvas:{w:1080,h:1350},assets:{textures:[{url:'textura',width:768,height:1536}]},layout:{zone:'bottom'}}) as {objects:Array<Record<string,unknown>>};
  const bg=result.objects.find(o=>o.name==='texture')!,headline=result.objects.find(o=>o.name==='headline')!,spiral=result.objects.find(o=>o.name==='bee-spiral')!;
  expect(768*Number(bg.scaleX)).toBeGreaterThanOrEqual(1080);expect(1536*Number(bg.scaleY)).toBeGreaterThanOrEqual(1350);
  const bottom=Number(headline.top)+String(headline.text).split('\n').length*Number(headline.fontSize)*1.08;
  expect(bottom).toBeLessThan(Number(spiral.top)-40);
});
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

const partRequest=()=>({variant:'M03-B',scope:'diagram' as 'diagram'|'selected',selected:[] as number[][],texts:{} as Record<string,string>,representation:'diagram' as 'diagram'|'text'|'blocks'|'steps',content:'Visível\nPadrões\nEstruturas\nEssência',height:1350});
test('revisão interna altera apenas o rótulo selecionado e mantém o texto aprovado byte a byte',()=>{
  const source=legacyDiagram(),before=structuredClone(source),path=pageElements(source,'M03-B').find(e=>e.text==='Visível')!.path;
  const result=revisePagePart(source,{...partRequest(),scope:'selected',selected:[path],texts:{[path.join('.') ]:'Aparente'}}) as Diagram;
  result.objects.forEach((o,i)=>{if(i===path[0])expect(o.text).toBe('Aparente');else expect(o).toEqual(before.objects[i]);});
  expect(source).toEqual(before);
});
test('seleção protegida e grupo misto são recusados, inclusive quando o texto principal está dentro de grupo',()=>{
  const source=legacyDiagram();
  expect(()=>revisePagePart(source,{...partRequest(),scope:'selected',selected:[[0]],texts:{'0':'Título diferente'}})).toThrow('preservados');
  const group={objects:[{type:'Group',objects:[source.objects[0],source.objects[1]]},...source.objects.slice(2)]};
  expect(()=>revisePagePart(group,{...partRequest(),scope:'selected',selected:[[0]],texts:{'0.0':'Outro título'}})).toThrow('preservados');
  expect(()=>revisePagePart(group,{...partRequest(),representation:'text'})).toThrow('agrupado');
});
for(const representation of ['text','blocks','steps'] as const)test(`alternativa ${representation} substitui somente o diagrama e preserva fotos, título, assinatura e entrada`,()=>{
  const source=legacyDiagram();source.objects.push({type:'Image',name:'foto',src:'fotografia-preservada',left:40,top:60,width:70,height:80});
  const before=structuredClone(source),result=revisePagePart(source,{...partRequest(),representation}) as Diagram;
  expect(source).toEqual(before);
  for(const name of ['headline','signature','foto'])expect(result.objects.find(o=>o.name===name)).toEqual(source.objects.find(o=>o.name===name));
  expect(result.objects.some(o=>o.type==='Circle')).toBe(false);
  const text=result.objects.filter(o=>o.name?.startsWith('diagram-content-')).map(o=>o.text).join(' ').replace(/\s+/g,' ');
  for(const word of ['Visível','Padrões','Estruturas','Essência'])expect(text).toContain(word);
  if(representation==='steps')expect(text).toContain('1. Visível');
});
test('revisão recusa escopo vazio, troca parcial de representação e conteúdo que não cabe',()=>{
  const source=legacyDiagram();
  expect(()=>revisePagePart(source,{...partRequest(),scope:'selected'})).toThrow('Selecione');
  expect(()=>revisePagePart(source,{...partRequest(),scope:'selected',selected:[[1]],representation:'text'})).toThrow('diagrama completo');
  expect(()=>revisePagePart(source,{...partRequest(),representation:'text',content:''})).toThrow('Escreva');
  expect(()=>revisePagePart(source,{...partRequest(),representation:'text',content:'Uma ideia muito longa. '.repeat(500)})).toThrow('não cabe');
  expect(()=>revisePagePart(source,{...partRequest(),representation:'blocks',content:'Uma linha\n'.repeat(13)})).toThrow('não cabe');
  expect(()=>revisePagePart(source,{...partRequest(),scope:'selected',selected:[[8]],texts:{'8':'W'.repeat(500)}})).toThrow('maior');
});
test('seleção de texto dentro de grupo preserva os vizinhos e não inclui assinatura nem fotografias no diagrama',()=>{
  const source={objects:[{type:'Group',objects:[{type:'Textbox',text:'Dentro',width:200,fontSize:28,height:40},{type:'Circle',radius:30}]},{type:'Textbox',name:'signature',text:'AUTOR'},{type:'Image',src:'foto'}]};
  const before=structuredClone(source),result=revisePagePart(source,{...partRequest(),scope:'selected',selected:[[0,0]],texts:{'0.0':'Novo'}}) as Diagram;
  expect(result.objects[0].objects![0].text).toBe('Novo');expect(result.objects[0].objects![1]).toEqual(before.objects[0].objects![1]);
  expect(result.objects.slice(1)).toEqual(before.objects.slice(1));
  expect(pageElements(source,'M03-B').filter(e=>e.diagram).map(e=>e.path)).toEqual([[0],[0,0],[0,1]]);
});
