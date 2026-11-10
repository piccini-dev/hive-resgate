import { expect,test } from '@playwright/test';
import { canReviewProduction,editorialPieces,pendingProduction,productionProblems,type ProductionItem } from '../src/lib/campaign/production-plan';
import type { Content,FormatCapability,PiecePlan,PostUnit,UserPost } from '../src/types';
import { needsSequenceRender, sequenceReviewSnapshot, sequenceVisualTodo } from '../src/lib/sequence/visual-state';
import { NarrativeOverlapError, productionCandidateText, validateNoveltyConflicts, withNovelContribution } from '../supabase/functions/_shared/production-novelty';
const bases=[{id:'base',status:'validated'}] as Content[];
const caps=[{platform:'instagram',format:'image'},{platform:'instagram',format:'carousel'},{platform:'instagram',format:'story'},{platform:'linkedin',format:'carousel'}] as FormatCapability[];
const item=(p:Partial<ProductionItem>={}):ProductionItem=>({content_id:'base',platform:'instagram',format:'carousel',approach:'Investigar o padrão',purpose:'Dar progressão à leitura',architecture:'conceito',template_family:'M03',editorial_slug:'sistemica',...p});
const check=(items:ProductionItem[],b=bases)=>productionProblems(items,b,caps,['M01','M02','M03'],['sistemica']);
test('roteiro produzido com imagens pendentes continua na fila visual, sem regenerar a base',()=>{
  const p={id:'post',plan_id:'plan',format:'carousel',status:'pending_approval',metadata:{production_batch_id:'batch'}} as UserPost;
  const plan={id:'plan',production_batch_id:'batch',status:'produced'} as PiecePlan;
  const unit={id:'page',post_id:'post',visual_status:'pending',rendered_url:null,text_version:1,rendered_text_version:null} as PostUnit;
  expect(sequenceVisualTodo([p],[plan],[unit],'batch').map(p=>p.id)).toEqual(['post']);
  expect(sequenceVisualTodo([p],[plan],[{...unit,visual_status:'ready',rendered_url:'https://example.test/1.jpg',rendered_text_version:1}],'batch')).toEqual([]);
  expect(sequenceVisualTodo([{...p,status:'approved'}],[plan],[unit],'batch')).toEqual([]);
  expect(sequenceVisualTodo([p],[plan],[unit],'outro')).toEqual([]);
});
test('imagem desatualizada exige render, imagem pronta da versão atual é preservada',()=>{
  const u={rendered_url:'https://example.test/1.jpg',visual_status:'ready',text_version:2,rendered_text_version:1} as PostUnit;
  expect(needsSequenceRender(u)).toBe(true);
  expect(needsSequenceRender({...u,rendered_text_version:2})).toBe(false);
});
test('snapshot da revisão compara texto, legenda, imagens e ordem sem depender do estado de aprovação',()=>{
  const p={format:'carousel',version:2,caption:'Legenda'} as UserPost;
  const pages=[{id:'b',position:2,title:'B',body:'Texto',layout:'text',text_version:1,rendered_url:'b.jpg',rendered_text_version:1},{id:'a',position:1,title:'A',body:null,layout:'cover',text_version:1,rendered_url:'a.jpg',rendered_text_version:1}] as PostUnit[];
  const s=sequenceReviewSnapshot(p,pages);
  expect(s.units.map(p=>p.id)).toEqual(['a','b']);
  expect(s.units[0].body).toBe('');
  expect(sequenceReviewSnapshot(p,pages.map(u=>({...u,review_status:'approved'})))).toEqual(s);
  expect(sequenceReviewSnapshot({...p,caption:'Nova legenda'},pages)).not.toEqual(s);
  expect(sequenceReviewSnapshot(p,pages.map(u=>({...u,rendered_url:'nova.jpg'})))).not.toEqual(s);
});
test('reserva sem produção não aparece como post pronto para revisão',()=>{
  const piece={id:'post',plan_id:'plan',status:'pending_approval'} as UserPost;
  const plan={id:'plan',production_batch_id:'batch',status:'planned'} as PiecePlan;
  expect(canReviewProduction(piece,[plan],'batch')).toBe(false);
  expect(canReviewProduction(piece,[{...plan,status:'produced'}],'batch')).toBe(true);
  expect(canReviewProduction(piece,[{...plan,status:'produced'}],'outro')).toBe(false);
  expect(canReviewProduction(piece,[])).toBe(true);
});
test('sobreposição gera outro recorte antes de entregar a proposta, preservando a base',async()=>{
  const inputs:string[]=[],reviewed:string[]=[];
  const result=await withNovelContribution(async feedback=>{inputs.push(feedback);return {base:'mesma-base',text:inputs.length===1?'argumento repetido':'aplicação diferente'};},async value=>{
    reviewed.push(value.text);if(value.text==='argumento repetido')throw new NarrativeOverlapError();
  });
  expect(result).toEqual({base:'mesma-base',text:'aplicação diferente'});
  expect(reviewed).toEqual(['argumento repetido','aplicação diferente']);
  expect(inputs[1]).toContain('outro argumento');
});
test('tentativas de diferenciação são limitadas e falhas técnicas não viram repetição',async()=>{
  let n=0;
  await expect(withNovelContribution(async()=>++n,async()=>{throw new NarrativeOverlapError();})).rejects.toBeInstanceOf(NarrativeOverlapError);
  expect(n).toBe(3);
  n=0;
  await expect(withNovelContribution(async()=>++n,async()=>{throw new Error('Histórico indisponível');})).rejects.toThrow('Histórico indisponível');
  expect(n).toBe(1);
});
test('conferência só aceita sobreposição com referência real, não confunde base com post',()=>{
  expect(validateNoveltyConflicts({conflicts:[]},2,['publicado'])).toEqual([]);
  expect(validateNoveltyConflicts({conflicts:[{index:1,against_index:0,reason:'Mesmo argumento'}]},2,[])).toHaveLength(1);
  expect(()=>validateNoveltyConflicts({conflicts:[{index:0,against_id:'inventado',reason:'Mesmo argumento'}]},2,['publicado'])).toThrow('referência inválida');
  expect(()=>validateNoveltyConflicts({conflicts:[{index:0,against_index:0,reason:'Compara consigo'}]},2,[])).toThrow();
  expect(()=>validateNoveltyConflicts({},2,[])).toThrow('Não foi possível');
});
test('histórico de carrossel e Stories inclui contribuição das páginas mesmo sem legenda',()=>{
  expect(productionCandidateText({caption:'',carousel_text:{quote:'Capa'}},[{title:'Situação',body:'Um argumento'},{title:'Outra leitura',body:'Uma aplicação'}])).toContain('Uma aplicação');
  expect(productionCandidateText({caption:'Legenda',carousel_text:{quote:'Frase'}})).toBe('Frase\n\nLegenda');
});
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
