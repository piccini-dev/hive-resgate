import { expect,test } from '@playwright/test';
import { editorialPieces,pendingProduction,productionProblems,type ProductionItem } from '../src/lib/campaign/production-plan';
import type { Content,FormatCapability,UserPost } from '../src/types';
const bases=[{id:'base',status:'validated'}] as Content[];
const caps=[{platform:'instagram',format:'image'},{platform:'instagram',format:'carousel'},{platform:'instagram',format:'story'},{platform:'linkedin',format:'carousel'}] as FormatCapability[];
const item=(p:Partial<ProductionItem>={}):ProductionItem=>({content_id:'base',platform:'instagram',format:'carousel',approach:'Investigar o padrão',purpose:'Dar progressão à leitura',architecture:'conceito',template_family:'M03',editorial_slug:'sistemica',...p});
const check=(items:ProductionItem[],b=bases)=>productionProblems(items,b,caps,['M01','M02','M03'],['sistemica']);
test('mesma base sustenta abordagens distintas em vários formatos e plataformas',()=>{
  expect(check([item(),item({format:'image',approach:'Uma pergunta'}),item({format:'story',approach:'Experimento breve'}),item({platform:'linkedin'})])).toEqual([]);
});
test('abordagem idêntica não cria duas peças só por família visual diferente',()=>{
  expect(check([item(),item({template_family:'M01',approach:'  investigar o padrão '})])).toContain('Peça 2: repete a mesma abordagem de outra peça. Diferencie sua contribuição.');
});
test('não oferece Reels sem pipeline nem Stories para LinkedIn',()=>{
  expect(check([item({format:'reel'}),item({platform:'linkedin',format:'story'})]).filter(x=>x.includes('formato'))).toHaveLength(2);
});
test('receita ausente e base não validada impedem a aprovação do plano',()=>{
  expect(productionProblems([item()], [{id:'base',status:'pending_validation'}] as Content[],caps,['M01'],['sistemica'])).toEqual(['Peça 1: escolha uma base validada.','Peça 1: família visual indisponível nesta marca.']);
});
test('plano vazio ou sem contribuição e editoria exige ajuste antes de gerar',()=>{
  expect(check([])).toContain('Selecione de 1 a 40 peças.');
  expect(check([item({approach:'',purpose:'',editorial_slug:'outra'})])).toHaveLength(2);
});
test('entrega para outra conta não multiplica a revisão editorial; histórico protegido não é substituído',()=>{
  const ps=[{id:'a',status:'approved',metadata:{}},{id:'b',status:'scheduled',metadata:{}},{id:'c',status:'published',metadata:{}},{id:'d',status:'pending_approval',metadata:{}},{id:'e',status:'approved',metadata:{delivery_of:'a'}}] as UserPost[];
  expect(editorialPieces(ps).map(p=>p.id)).toEqual(['a','b','c','d']);
  expect(pendingProduction(ps).map(p=>p.id)).toEqual(['d']);
});
