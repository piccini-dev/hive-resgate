import { pageElements, type revisePagePart } from './pageRevision';

export type PartRequest = Parameters<typeof revisePagePart>[1];
export function partFields(art: object, req: PartRequest): Record<string,string> {
  const selected = new Set(req.selected.map(p=>p.join('.')));
  const targets = pageElements(art,req.variant).filter(e=>req.scope==='diagram'?e.diagram:selected.has(e.path.join('.'))||req.selected.some(p=>e.path.join('.').startsWith(p.join('.')+'.')));
  if (!targets.length || targets.some(e=>e.protected)) throw new Error('Selecione apenas os elementos do diagrama que deseja revisar.');
  return req.representation==='diagram' ? Object.fromEntries(targets.filter(e=>e.text!==undefined).map(e=>[e.path.join('.'),req.texts[e.path.join('.')]??e.text!])) : {content:req.content};
}
export const revisionText = (fields:Record<string,string>) => Object.entries(fields).map(([id,text])=>`[[${id}]]\n${text}`).join('\n');

/** Uma resposta incompleta, extra ou ambígua nunca vira proposta aplicável. */
export function readRevision(answer:string, original:Record<string,string>,allowUnchanged=false):Record<string,string> {
  const markers=[...answer.matchAll(/^\[\[([a-z0-9.]+)\]\][ \t]*\r?\n/gm)],result:Record<string,string>={};
  if(!markers.length||answer.slice(0,markers[0].index).trim())throw new Error('A Hive não retornou uma revisão completa. Detalhe o pedido ou use a edição manual.');
  markers.forEach((m,i)=>{
    const id=m[1],text=answer.slice(m.index!+m[0].length,markers[i+1]?.index??answer.length).trim();
    if(!(id in original)||id in result||(!text&&id!=='body'&&id!=='title'))throw new Error('A proposta incluiu elementos fora da seleção ou deixou um texto vazio. Tente novamente.');
    result[id]=text;
  });
  if(Object.keys(result).length!==Object.keys(original).length)throw new Error('A revisão ficou incompleta. Nenhuma alteração foi aplicada.');
  if(!allowUnchanged&&Object.entries(result).every(([id,text])=>text.replace(/\s+/g,' ').trim()===original[id].replace(/\s+/g,' ').trim()))throw new Error('A Hive manteve os textos atuais. Detalhe o que deseja diferente ou edite manualmente.');
  return result;
}
