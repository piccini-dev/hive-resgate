// Rede somente do runner descartável: o mesmo loopback atende navegador e Edge Runtime.
// Reutiliza imagem, dispatcher, verificação JWT e fontes da CLI; não muda funções do app.
import http from 'node:http';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const NAME='hive-local-edge-host';
const SNAPSHOT='hive-local-edge-snapshot';
const PORT=9998;
const redact=value=>String(value).replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g,'[JWT local omitido]').replace(/sb_(?:secret|publishable)_[\w-]+/g,'[chave local omitida]');
export function functionsUpstream(config,gateway){
  if(!/^(?:10\.(?:\d{1,3}\.){2}\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})$/.test(gateway))throw Error('Gateway Docker local inválido.');
  const lines=config.split('\n');let service=false,indent=0,changed=0;
  for(let i=0;i<lines.length;i++){
    const item=lines[i].match(/^(\s*)- name:\s*['"]?([^'"\s]+)['"]?\s*$/);
    if(item){
      if(service&&item[1].length<=indent)service=false;
      if(item[2]==='functions-v1'){service=true;indent=item[1].length;}
    }
    if(service&&lines[i].match(new RegExp('^\\s{'+(indent+2)+'}url:'))){
      lines[i]=lines[i].replace(/url:.*/,`url: http://${gateway}:${PORT}/`);changed++;service=false;
    }
  }
  if(changed!==1)throw Error('Rota functions-v1 local não identificada de forma única.');
  return lines.join('\n');
}
export function runtimePortArgs(args){
  const out=args.map(arg=>arg.replace(/--port(?:=|\s+)\d+\b/g,'--port='+PORT));
  for(let i=0;i<out.length-1;i++)if(['--port','-p'].includes(out[i])&&/^\d+$/.test(out[i+1]))out[++i]=String(PORT);
  return out;
}
const docker=args=>{
  try{return execFileSync('docker',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']});}
  catch(e){throw Error('Docker local '+args[0]+': '+String(e.stderr??'falhou').replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g,'[JWT local omitido]').slice(0,1200));}
};
export async function localGateway() {
  const server=http.createServer((req,res)=>{
    const upstream=http.request({hostname:'127.0.0.1',port:54321,
      path:req.url,method:req.method,headers:req.headers},r=>{
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
  // A CLI copia /root/index.ts para a camada gravável, fora dos mounts.
  // Snapshot só local, nunca enviado a registry; conserva dispatcher e configuração gerados.
  const image=docker(['commit','supabase_edge_runtime_hive-local',SNAPSHOT]).trim();
  const vars=original.Config.Env;
  const oldUrl=vars.find(v=>v.startsWith('SUPABASE_URL='))?.slice('SUPABASE_URL='.length);
  if(!oldUrl)throw Error('CLI não informou SUPABASE_URL local.');
  const args=['create','--name',NAME,'--network','host'];
  for(const raw of vars){
    if(raw.startsWith('EDGE_RUNTIME_PORT='))continue;
    let value=raw.replaceAll(oldUrl,backend);
    if(value.startsWith('SUPABASE_DB_URL='))value='SUPABASE_DB_URL='+database;
    args.push('--env',value);
  }
  args.push('--env','EDGE_RUNTIME_PORT='+PORT);
  for(const m of original.Mounts){
    if(!['bind','volume'].includes(m.Type))throw Error('Montagem de runtime não suportada: '+m.Type);
    args.push('--mount',`type=${m.Type},src=${m.Type==='volume'?m.Name:m.Source},dst=${m.Destination}${m.RW?'':',readonly'}`);
  }
  if(original.Config.User)args.push('--user',original.Config.User);
  const entry=original.Config.Entrypoint??[];
  if(entry.length)args.push('--entrypoint',entry[0]);
  args.push(image,...runtimePortArgs([...entry.slice(1),...(original.Config.Cmd??[])]));
  docker(args);docker(['start',NAME]);
  const kongName='supabase_kong_hive-local';
  const [kong]=JSON.parse(docker(['inspect',kongName]));
  const configPath=kong.Config.Env.find(v=>v.startsWith('KONG_DECLARATIVE_CONFIG='))?.slice('KONG_DECLARATIVE_CONFIG='.length);
  if(!configPath?.startsWith('/'))throw Error('Configuração declarativa do Kong local ausente.');
  const gateway=Object.values(kong.NetworkSettings.Networks).find(n=>n.Gateway)?.Gateway;
  const config=functionsUpstream(docker(['exec',kongName,'cat',configPath]),gateway??'');
  const dir=mkdtempSync(path.join(os.tmpdir(),'hive-local-kong-'));
  try{
    const file=path.join(dir,'kong.yml');writeFileSync(file,config,{mode:0o600});
    docker(['cp',file,kongName+':/tmp/hive-local-kong.yml']);
    if(kong.Config.User)docker(['exec','--user','0',kongName,'chown',kong.Config.User,'/tmp/hive-local-kong.yml']);
    docker(['exec',kongName,'kong','config','parse','/tmp/hive-local-kong.yml']);
    docker(['exec','--env','KONG_DECLARATIVE_CONFIG=/tmp/hive-local-kong.yml',kongName,'kong','reload']);
  }finally{rmSync(dir,{recursive:true,force:true});}
  console.log(`Edge Runtime oficial em rede do runner, porta ${PORT}; gateway e destinos somente loopback.`);
  console.log('Kong original preservado: somente upstream de funções alterado para o Docker local; plugins e autenticação intactos.');
}
export function runtimeDiagnostics(){
  try{
    const [c]=JSON.parse(docker(['inspect',NAME]));
    console.error(redact(JSON.stringify({runtime:c.Config.Image,command:c.Config.Cmd,state:c.State.Status,network:c.HostConfig.NetworkMode})));
    const logs=spawnSync('docker',['logs','--tail','20',NAME],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
    console.error(redact((logs.stdout??'')+(logs.stderr??'')).slice(-3000));
  }catch(e){console.error(redact(e.message));}
}
export function stopHostRuntime() {
  try{docker(['rm','--force',NAME]);}catch(e){if(!e.message.includes('No such container'))throw e;}
  try{docker(['image','rm','--force',SNAPSHOT]);}catch(e){if(!e.message.includes('No such image'))throw e;}
}
