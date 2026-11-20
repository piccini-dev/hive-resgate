// Fixtures sintéticas; metadados vêm do manifesto versionado, nunca de fotos reais.
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
export async function referenceManifest() {
  const source=await readFile(new URL('../../src/lib/hive/photoCatalog.ts',import.meta.url),'utf8');
  const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  return (await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))).REFERENCE_MANIFEST;
}
export async function seedVisualFixtures(db,backend,service) {
  if(backend!=='http://127.0.0.1:54521')throw Error('Fixtures visuais exigem gateway local.');
  const refs=(await referenceManifest()).filter(r=>r.priority!=='A0');
  // O cenário F12 pede uma biblioteca maior que o manifesto mínimo. Os extras são fictícios.
  for(const [priority,total] of [['B',23],['D',4]]){
    const missing=total-refs.filter(r=>r.priority===priority).length;
    for(let i=0;i<missing;i++)refs.push({key:`e2e-local-${priority}-${i}`,priority,roles:['synthetic_fixture']});
  }
  const urls=new Set([backend+'/storage/v1/object/public/design/hive/marcos-1788357859-03.jpg']);
  for(const ref of refs){
    const path='hive/local-synthetic/'+ref.key+'.png',url=backend+'/storage/v1/object/public/design/'+path;
    await db.query(`INSERT INTO photo_references(producer_id,ref_key,priority,roles,url,storage_path,file_name,brand_id)
      VALUES('marcos_piccini',$1,$2,$3,$4,$5,$6,'0b000000-0000-4000-8000-000000000002')
      ON CONFLICT(producer_id,ref_key) DO NOTHING`,[ref.key,ref.priority,ref.roles,url,path,ref.key+'.jpg']);
    urls.add(url);
  }
  function collect(value){
    if(typeof value==='string'&&value.startsWith(backend+'/storage/v1/object/public/'))urls.add(value);
    else if(Array.isArray(value))value.forEach(collect);
    else if(value&&typeof value==='object')Object.values(value).forEach(collect);
  }
  for(const table of ['design_assets','design_tokens','design_variacoes','post_templates']){
    for(const r of (await db.query(`SELECT to_jsonb(t) row FROM public.${table} t`)).rows)collect(r.row);
  }
  for(const url of urls){
    const object=url.slice((backend+'/storage/v1/object/public/').length);
    if(!object.startsWith('design/'))throw Error('Fixture de catálogo fora do bucket design.');
    const r=await fetch(backend+'/storage/v1/object/'+object,{method:'POST',headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':'image/png','x-upsert':'true'},body:PNG});
    if(!r.ok)throw Error('Imagem sintética local: '+r.status+' '+await r.text());
  }
  console.log(`Fixtures visuais: ${refs.length} referências de cenário e ${urls.size} bitmaps sintéticos; nenhuma foto real.`);
}
