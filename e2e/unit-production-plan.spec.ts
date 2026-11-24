import { expect,test } from '@playwright/test';
import { canReviewProduction,editorialPieces,pendingProduction,productionProblems,needsEditorialRebrief,type ProductionItem } from '../src/lib/campaign/production-plan';
import { appPublicAssetUrl } from '../src/lib/hive/publicAsset';
import type { Content,FormatCapability,PiecePlan,PostUnit,UserPost } from '../src/types';
import { needsSequenceRender, sequenceReviewSnapshot, sequenceVisualTodo } from '../src/lib/sequence/visual-state';
import { NarrativeOverlapError, productionCandidateText, validateNoveltyConflicts, withNovelContribution, withoutNoveltyConflicts, usableProductionProposals, scopedPostHistoryQuery, verifiedRepeatEvidence } from '../supabase/functions/_shared/production-novelty';
const bases=[{id:'base',status:'validated'}] as Content[];
const caps=[{platform:'instagram',format:'image'},{platform:'instagram',format:'carousel'},{platform:'instagram',format:'story'},{platform:'linkedin',format:'carousel'}] as FormatCapability[];
const item=(p:Partial<ProductionItem>={}):ProductionItem=>({content_id:'base',platform:'instagram',format:'carousel',approach:'Investigar o padrão',purpose:'Dar progressão à leitura',architecture:'conceito',template_family:'M03',editorial_slug:'sistemica',...p});
const check=(items:ProductionItem[],b=bases)=>productionProblems(items,b,caps,['M01','M02','M03'],['sistemica']);
test('espiral cadastrada com caminho antigo funciona no Github Pages e mantém URLs externas',()=>{
  expect(appPublicAssetUrl('/bee-spiral.png','/hive-resgate/')).toBe('/hive-resgate/bee-spiral.png');
  expect(appPublicAssetUrl('/hive-resgate/bee-spiral.png','/hive-resgate/')).toBe('/hive-resgate/bee-spiral.png');
  expect(appPublicAssetUrl('/bee-spiral.png','/')).toBe('/bee-spiral.png');
  expect(appPublicAssetUrl('https://cdn.example.test/simbolo.png','/hive-resgate/')).toBe('https://cdn.example.test/simbolo.png');
  expect(appPublicAssetUrl('//cdn.example.test/simbolo.png','/hive-resgate/')).toBe('//cdn.example.test/simbolo.png');
  expect(appPublicAssetUrl('data:image/png;base64,a','/hive-resgate/')).toBe('data:image/png;base64,a');
});
test('repetição comprovada pede reformulação; falha visual e limite transitório podem retomar',()=>{
  const confirmed={generation_error:'Este texto retomou um argumento já publicado nesta marca: repetição da mesma conclusão.'} as PiecePlan;
  const render={generation_error:'Falha ao renderizar a imagem da Hive: falha ao carregar: /bee-spiral.png'} as PiecePlan;
  const worker={generation_error:'{"code":"WORKER_RESOURCE_LIMIT"}'} as PiecePlan;
  expect(needsEditorialRebrief(confirmed)).toBe(true);
  expect(needsEditorialRebrief(render)).toBe(false);
  expect(needsEditorialRebrief(worker)).toBe(false);
  expect(needsEditorialRebrief({generation_error:null} as PiecePlan)).toBe(false);
});
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
test('propostas preliminares usam bases/formats/editorias reais e descartam só inválidas, sem julgar repetição histórica',()=>{
  const options = {
    baseIds: ['base-1','base-2'],
    formats: [{platform:'instagram',format:'carousel'},{platform:'instagram',format:'image'},{platform:'linkedin',format:'image'}],
    families: ['M01','M03'],
    editorialSlugs: ['diagnostico','praticas'],
  };
  const card=(patch:Record<string,unknown>={})=>({
    content_id:'base-1',platform:'instagram',format:'carousel',
    approach:'Leitura das relações',purpose:'Abrir uma perspectiva',editorial_slug:'diagnostico',template_family:'M03',
    architecture:'perspectiva',...patch,
  });
  const proposal=usableProductionProposals([
    card(),
    card({approach:' Leitura das relações '}), // sem repetir a mesma proposta por estética
    card({approach:'Aplicação no cotidiano',purpose:'Exercício prático'}),
    card({content_id:'base-2',approach:'Leitura das relações'}), // mesma tese em outra base é legítima
    card({format:'image',architecture:'historia'}), // formato próprio
    card({content_id:'base-estranha'}), card({format:'reel'}), card({editorial_slug:'outra'}),
    card({template_family:'M02'}), card({purpose:'   '}), null, {}, 'inválido',
  ],options);
  expect(proposal).toHaveLength(4);
  expect(proposal.map(x=>x.content_id)).toEqual(['base-1','base-1','base-2','base-1']);
  expect(proposal[3].architecture).toBeNull();
  expect(proposal[0].approach).toBe('Leitura das relações');
  expect(proposal[1].approach).toBe('Aplicação no cotidiano');
});
test('proposta sem item válido devolve lista vazia, sem criar post nem aceitar opção inventada',()=>{
  const options={baseIds:['base'],formats:[{platform:'instagram',format:'carousel'}],families:['M01'],editorialSlugs:['a']};
  expect(usableProductionProposals(null,options)).toEqual([]);
  expect(usableProductionProposals([{content_id:'base',platform:'instagram',format:'carousel',template_family:'M01',editorial_slug:'a',approach:'',purpose:'propósito'}],options)).toEqual([]);
});
test('comparação de textos completos fica restrita à marca e à mesma plataforma',()=>{
  const user='dfa11979-83c5-4737-9601-56e4df05746a';
  const post='89540d44-702a-4a72-866e-599200681be6';
  const profileA='0b000000-0000-4000-8000-00000000000a';
  const profileB='0b000000-0000-4000-8000-00000000000b';
  const url=scopedPostHistoryQuery(user,'instagram',post,[profileA,profileB]);
  expect(url).toContain('user_id=eq.'+user);
  expect(url).toContain('platform=eq.instagram');
  expect(url).toContain('id=neq.'+post);
  expect(url).toContain('profile_id=in.('+profileA+','+profileB+')');
  expect(url).not.toContain('profile_id=is.null');
  expect(url).toContain('status=in.(draft,pending_approval,approved,scheduled,published)');
  expect(()=>scopedPostHistoryQuery(user,'instagram',post,[])).toThrow('não tem perfis');
  expect(()=>scopedPostHistoryQuery(user,'reel',post,[profileA])).toThrow('Plataforma não reconhecida');
});
test('só há bloqueio de repetição com post verificável e contribuição concreta',()=>{
  const a='89540d44-702a-4a72-866e-599200681be6';
  const b='091edc36-6673-4951-9276-1707e25c9bc9';
  expect(verifiedRepeatEvidence({repeat:false,against_id:a},[a,b])).toEqual({repeat:false});
  expect(verifiedRepeatEvidence({repeat:true,against_id:a,reason:'Repete o mesmo percurso e conclusão prática.'},[a,b]))
    .toEqual({repeat:true,against_id:a,reason:'Repete o mesmo percurso e conclusão prática.'});
  expect(()=>verifiedRepeatEvidence({repeat:true,against_id:'inventado',reason:'Repete o mesmo percurso.'},[a,b])).toThrow('sem identificar');
  expect(()=>verifiedRepeatEvidence({repeat:true,against_id:a,reason:'tema comum'},[a,b])).toThrow('sem identificar');
  expect(()=>verifiedRepeatEvidence({repeat:'true',against_id:a},[a,b])).toThrow('não retornou');
});
test('ao esgotar regeneração, preservar a razão concreta em vez do erro genérico',async()=>{
  let n=0;
  await expect(withNovelContribution(async feedback=>{
    n++;
    if(n===2)expect(feedback).toContain('conclusão anterior');
    return n;
  },async()=>{throw new NarrativeOverlapError('Mesma conclusão anterior sobre a escolha consciente.');})).rejects.toThrow('Mesma conclusão anterior');
  expect(n).toBe(3);
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
  // A IA pode inventar o UUID da referência. O item sinalizado continua
  // bloqueado, mas isso não deve descartar toda a proposta com erro 500.
  const suspected=validateNoveltyConflicts({conflicts:[{index:0,against_id:'inventado',reason:'Mesmo argumento'}]},2,['publicado']);
  expect(suspected).toEqual([{index:0,reason:'Mesmo argumento'}]);
  expect(withoutNoveltyConflicts(['repetido','novo'],suspected)).toEqual(['novo']);
  expect(validateNoveltyConflicts({conflicts:[{index:1,against_history_index:0,reason:'Mesmo argumento'}]},2,['publicado']))
    .toEqual([{index:1,against_id:'publicado',reason:'Mesmo argumento'}]);
  const self=validateNoveltyConflicts({conflicts:[{index:0,against_index:0,reason:'Compara consigo'}]},2,[]);
  expect(withoutNoveltyConflicts(['suspeito','novo'],self)).toEqual(['novo']);
  expect(()=>validateNoveltyConflicts({},2,[])).toThrow('lista válida');
});
test('conflito parcial preserva recortes distintos, inclusive na mesma base e plataforma',()=>{
  const proposals=[{id:'novo-1',approach:'Diagnóstico'},{id:'novo-2',approach:'Mesmo argumento'},{id:'novo-3',approach:'Prática'}];
  const conflicts=validateNoveltyConflicts({conflicts:[{index:1,against_id:'post-antigo',reason:'Mesma conclusão'}]},3,['post-antigo']);
  expect(withoutNoveltyConflicts(proposals,conflicts)).toEqual([proposals[0],proposals[2]]);
  expect(proposals).toHaveLength(3); // sem mutação
});
test('conflito entre recortes mantém somente o original não sinalizado',()=>{
  const proposals=['leitura conceitual','repetição','aplicação inédita'];
  const conflicts=validateNoveltyConflicts({conflicts:[{index:1,against_index:0,reason:'Mesmo percurso'}]},3,[]);
  expect(withoutNoveltyConflicts(proposals,conflicts)).toEqual(['leitura conceitual','aplicação inédita']);
});
test('se todos os recortes forem repetidos, a lista segura fica vazia (não libera publicação)',()=>{
  const conflicts=validateNoveltyConflicts({conflicts:[
    {index:0,against_id:'anterior',reason:'Mesmo argumento'},
    {index:1,against_index:0,reason:'Mesmo argumento'},
  ]},2,['anterior']);
  expect(withoutNoveltyConflicts(['repetido-1','repetido-2'],conflicts)).toEqual([]);
  const error = new NarrativeOverlapError('Exemplo de conflitos',conflicts);
  expect(error.conflicts).toEqual(conflicts);
});

test('contratos inválidos do avaliador nunca transformam suspeita em aprovação',()=>{
  // Sem índice do item, nem o conjunto seguro pode ser determinado.
  expect(()=>validateNoveltyConflicts({conflicts:[{index:5,against_history_index:0,reason:'repete'}]},2,['antigo']))
    .toThrow('não identificou o item');
  expect(()=>validateNoveltyConflicts({conflicts:[{index:0,against_index:0,reason:'igual'}]},2,[])).not.toThrow();
  const selfReference=validateNoveltyConflicts({conflicts:[{index:0,against_index:0,reason:'mesma ideia'}]},2,[]);
  expect(withoutNoveltyConflicts(['marcado','outro'],selfReference)).toEqual(['outro']);
  expect(()=>validateNoveltyConflicts({},2,[])).toThrow('lista válida');
  expect(()=>validateNoveltyConflicts({conflicts:[{index:0,reason:''}]},2,[])).toThrow('não identificou o item');
});
test('conflito sinalizado contra histórico fora do alcance é descartado, nunca liberado',()=>{
  const flagged=validateNoveltyConflicts({conflicts:[{index:1,against_history_index:999,reason:'repetição com post anterior'}]},3,['antigo']);
  expect(flagged).toEqual([{index:1,reason:'repetição com post anterior'}]);
  expect(withoutNoveltyConflicts(['primeiro','suspeito','terceiro'],flagged)).toEqual(['primeiro','terceiro']);
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

// Revisão direta: arte e fonte canônica permanecem coerentes; estado visual não é confundido com roteiro pronto.
test('sequência sem páginas ou com imagem desatualizada não está pronta para revisar',async()=>{
  const {visualReviewState}=await import('../src/lib/sequence/editing');
  const p={format:'story',status:'pending_approval'} as UserPost;
  const u={visual_status:'ready',rendered_url:'x.jpg',text_version:2,rendered_text_version:2} as PostUnit;
  expect(visualReviewState(p,[])).toBe('pending');
  expect(visualReviewState(p,[u])).toBe('ready');
  expect(visualReviewState(p,[{...u,rendered_text_version:1}])).toBe('pending');
  expect(visualReviewState(p,[{...u,visual_status:'rendering'}])).toBe('producing');
  expect(visualReviewState(p,[{...u,visual_status:'failed'}])).toBe('failed');
  expect(visualReviewState({...p,status:'approved'},[u])).toBe('approved');
});
test('edição na arte sincroniza os campos principais sem incluir assinatura ou textos do diagrama no roteiro',async()=>{
  const {pageTextFromCanvas,editablePage}=await import('../src/lib/sequence/editing');
  const fabric={objects:[{type:'Textbox',name:'unit-title',text:'Título'},{type:'Textbox',name:'unit-body',text:'Uma\nleitura'},{type:'Textbox',name:'signature',text:'Autor',selectable:false},{type:'Textbox',text:'Polo A',selectable:false}]};
  const u={title:'Título',body:'Uma leitura',fabric_json:fabric} as unknown as PostUnit;
  expect(pageTextFromCanvas(fabric,u)).toEqual({title:'Título',body:'Uma leitura'});
  const edited=editablePage(fabric) as typeof fabric;
  edited.objects[0].text='Novo título';edited.objects[3].text='Planejamento';
  expect(pageTextFromCanvas(edited,u)).toEqual({title:'Novo título',body:'Uma leitura'});
  expect(edited.objects[3].selectable).toBe(true);
  expect(edited.objects[2].selectable).toBe(true);
  expect(fabric.objects[0].text).toBe('Título');
});
test('não salva arte que perdeu ou duplicou um campo principal',async()=>{
  const {pageTextFromCanvas}=await import('../src/lib/sequence/editing');
  const n={type:'Textbox',name:'unit-title',text:'Título'};
  const u={title:'Título',body:'',fabric_json:{objects:[n]}} as unknown as PostUnit;
  expect(()=>pageTextFromCanvas({objects:[]},u)).toThrow('removido');
  expect(()=>pageTextFromCanvas({objects:[n,n]},u)).toThrow('duplicados');
});
test('recompor texto de uma arte editada mantém posições, cores e rótulos do diagrama',async()=>{
  const {reflowEditedPage}=await import('../src/lib/sequence/editing');
  const f={background:'#fefefe',objects:[{name:'unit-title',type:'Textbox',text:'Antes',left:100,top:80,width:800,height:200,fontSize:60,fontFamily:'Inter',lineHeight:1.2},{type:'Textbox',text:'Planejamento',left:200,fill:'#123456'}]};
  const u={title:'Depois',body:'',fabric_json:f} as unknown as PostUnit;
  const r=reflowEditedPage(u) as typeof f;
  expect(r.objects[0]).toMatchObject({text:'Depois',left:100,top:80});
  expect(r.objects[1]).toEqual(f.objects[1]);
  expect(f.objects[0].text).toBe('Antes');
  expect(()=>reflowEditedPage({...u,title:'Um texto que não cabe. '.repeat(100)})).toThrow('não cabe');
});
test('altura real de uma linha no Fabric permite corrigir a frase ou apagar só o corpo',async()=>{
  const {reflowEditedPage}=await import('../src/lib/sequence/editing');
  const f={objects:[{type:'Textbox',name:'unit-body',text:'Antes',width:864,height:51.98,fontSize:46,lineHeight:1.42,fontFamily:'Inter'}]};
  const u={title:'Título',body:'Depois',fabric_json:f} as unknown as PostUnit;
  const r=reflowEditedPage(u) as typeof f;
  expect(r.objects[0]).toMatchObject({text:'Depois',fontSize:46});
  expect((reflowEditedPage({...u,body:''}) as typeof f).objects[0].text).toBe('');
});

// Seleção direta: a revisão libera também os elementos que o compositor travou.
test('edição na arte libera formas, imagens e grupos sem alterar o original',async()=>{
  const {editablePage}=await import('../src/lib/sequence/editing');
  const source={objects:[{type:'Circle',selectable:false,evented:false,radius:90},{type:'Image',selectable:false,src:'foto.jpg'},{type:'Group',objects:[{type:'Path',selectable:false,path:'M 0 0 L 20 20'}]}]};
  const copy=editablePage(source) as {objects:Array<Record<string,unknown>>};
  for(const o of copy.objects){expect(o.selectable).toBe(true);expect(o.evented).toBe(true);expect(o.perPixelTargetFind).toBe(true);}
  expect(copy.objects[2].subTargetCheck).toBe(true);expect(copy.objects[2].interactive).toBe(true);
  expect((copy.objects[2].objects as Array<Record<string,unknown>>)[0].selectable).toBe(true);
  expect(source.objects[0].selectable).toBe(false);expect(source.objects[0].evented).toBe(false);
  expect(source.objects[1].src).toBe('foto.jpg');
});
