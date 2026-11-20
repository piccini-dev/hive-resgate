// Rede somente do runner descartável: o mesmo loopback atende navegador e Edge Runtime.
// Reutiliza imagem, dispatcher, verificação JWT e fontes da CLI; não muda funções do app.
import http from 'node:http';
import { execFileSync } from 'node:child_process';

const NAME='hive-local-edge-host';
const docker=args=>execFileSync('docker',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']});
export async function localGateway() {
  const server=http.createServer((req,res)=>{
    const isFunction=req.url.startsWith('/functions/v1/');
    const upstream=http.request({hostname:'127.0.0.1',port:isFunction?9999:54321,
      path:isFunction?req.url.slice('/functions/v1'.length):req.url,method:req.method,headers:req.headers},r=>{
      res.writeHead(r.statusCode,r.headers);r.pipe(res);
    });
    upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502);res.end('Serviço local indisponível');});
    req.pipe(upstream);
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(54521,'127.0.0.1',resolve);});
  return server;
}
export function startHostRuntime(backend,database) {
  if(backend!=='http://127.0.0.1:54521'||new URL(database).hostname!=='127.0.0.1')throw Error('Runtime exige destinos locais explícitos.');
  const [original]=JSON.parse(docker(['inspect','supabase_edge_runtime_hive-local']));
  if(!original.Config.Image.includes('supabase/edge-runtime:'))throw Error('Imagem de runtime inesperada.');
  const vars=original.Config.Env;
  const oldUrl=vars.find(v=>v.startsWith('SUPABASE_URL='))?.slice('SUPABASE_URL='.length);
  if(!oldUrl)throw Error('CLI não informou SUPABASE_URL local.');
  const args=['create','--name',NAME,'--network','host'];
  for(const raw of vars){
    let value=raw.replaceAll(oldUrl,backend);
    if(value.startsWith('SUPABASE_DB_URL='))value='SUPABASE_DB_URL='+database;
    args.push('--env',value);
  }
  for(const m of original.Mounts){
    if(!['bind','volume'].includes(m.Type))throw Error('Montagem de runtime não suportada: '+m.Type);
    args.push('--mount',`type=${m.Type},src=${m.Type==='volume'?m.Name:m.Source},dst=${m.Destination}${m.RW?'':',readonly'}`);
  }
  if(original.Config.User)args.push('--user',original.Config.User);
  const entry=original.Config.Entrypoint??[];
  if(entry.length)args.push('--entrypoint',entry[0]);
  args.push(original.Config.Image,...entry.slice(1),...(original.Config.Cmd??[]));
  docker(args);docker(['start',NAME]);
  console.log('Edge Runtime oficial em rede do runner; gateway e destinos somente loopback.');
}
export function stopHostRuntime() {
  try{docker(['rm','--force',NAME]);}catch(e){if(!String(e.stderr).includes('No such container'))throw e;}
}
