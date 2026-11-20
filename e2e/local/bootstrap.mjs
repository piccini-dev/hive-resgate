// #111: infraestrutura de teste descartável. Não carrega .env nem token hospedado.
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { localGateway, startHostRuntime, stopHostRuntime } from './functions.mjs';
import { seedVisualFixtures } from './fixtures.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
async function stopChild(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, 'exit');
  const signal = value => {
    try { process.kill(-child.pid, value); } catch (e) { if (e.code !== 'ESRCH') throw e; }
  };
  signal('SIGTERM');
  let timer;
  await Promise.race([exited, new Promise(resolve => { timer = setTimeout(resolve, 3000); })]);
  clearTimeout(timer);
  if (child.exitCode === null && child.signalCode === null) { signal('SIGKILL'); await exited; }
}
export function splitSql(source) {
  const statements = []; let start = 0, quote = null, escape = false, line = false, block = 0;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i], next = source[i + 1];
    if (line) { if (ch === '\n') line = false; continue; }
    if (block) {
      if (ch === '/' && next === '*') { block++; i++; }
      else if (ch === '*' && next === '/') { block--; i++; }
      continue;
    }
    if (quote) {
      if (quote.startsWith('$')) { if (source.startsWith(quote, i)) { i += quote.length - 1; quote = null; } }
      else if (escape && ch === '\\') i++;
      else if (ch === quote) { if (next === quote) i++; else quote = null; }
      continue;
    }
    if (ch === '-' && next === '-') { line = true; i++; }
    else if (ch === '/' && next === '*') { block = 1; i++; }
    else if (ch === "'" || ch === '"') { quote = ch; escape = ch === "'" && /[eE]/.test(source[i-1]??'') && !/[\w]/.test(source[i-2]??''); }
    else if (ch === '$') { const m = source.slice(i).match(/^\$(?:[A-Za-z_][\w]*)?\$/); if (m) { quote = m[0]; i += quote.length - 1; } }
    else if (ch === ';') { statements.push(source.slice(start, i + 1)); start = i + 1; }
  }
  if (quote || block) throw new Error('SQL versionado incompleto.');
  if (source.slice(start).trim()) statements.push(source.slice(start));
  return statements;
}
export function insertTable(sql) {
  let s = sql.trim();
  while (s.startsWith('--') || s.startsWith('/*')) {
    const end = s.startsWith('--') ? s.indexOf('\n') : s.indexOf('*/');
    if (end < 0) return null;
    s = s.startsWith('--') ? s.slice(end + 1).trim() : s.slice(end + 2).trim();
    if (!s) return null;
  }
  return s.match(/^INSERT\s+INTO\s+(?:public\.)?"?([a-z_][a-z0-9_]*)"?\s/i)?.[1] ?? null;
}
export function loopback(value, protocol, port) {
  const u = new URL(value);
  if (!protocol.includes(u.protocol) || u.hostname !== '127.0.0.1' || u.port !== String(port) || u.hash) throw new Error('Destino local inválido.');
  return u;
}
const allowedSeed = table => /^(genesis_|design_|bee_)/.test(table)
  || ['workspaces','brands','emitters','business_fronts','audiences','communication_profiles','communication_profile_versions',
    'post_templates','photo_references','photo_styles','acj_definitions','format_capabilities'].includes(table);

export async function seedCatalogs(db, userId, backend) {
  const entries = new Map(), updates=[];
  for (const name of (await readdir(path.join(ROOT, 'supabase/migrations'))).filter(n => n.endsWith('.sql')).sort()) {
    for (const sql of splitSql(await readFile(path.join(ROOT, 'supabase/migrations', name), 'utf8'))) {
      const clean=sql.replace(/^(?:\s|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)+/,'');
      if(/^UPDATE\s+(?:public\.)?design_[a-z_]+\s/i.test(clean))updates.push({name,sql:sql.replaceAll('https://djlorvdehedcupeykyes.supabase.co',backend)});
      const table = insertTable(sql); if (!table || !allowedSeed(table)) continue;
      // Não se reutiliza conteúdo de usuário. Apenas catálogos versionados, no dono sintético.
      if (!entries.has(table)) entries.set(table, []);
      entries.get(table).push({ name, sql: sql.replaceAll('dfa11979-83c5-4737-9601-56e4df05746a', userId)
        .replaceAll('https://djlorvdehedcupeykyes.supabase.co', backend) });
    }
  }
  const existing = new Set((await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rows.map(x => x.tablename));
  for (const table of entries.keys()) if (!existing.has(table)) entries.delete(table); // catálogo legado encerrado, ausente do baseline
  const deps = (await db.query(`SELECT child.relname child,parent.relname parent FROM pg_constraint k
    JOIN pg_class child ON child.oid=k.conrelid JOIN pg_class parent ON parent.oid=k.confrelid
    WHERE k.contype='f' AND child.relnamespace='public'::regnamespace AND parent.relnamespace='public'::regnamespace`)).rows;
  const pending = new Set(entries.keys()), done = new Set(); let total = 0;
  await db.query("SELECT set_config('request.jwt.claims',$1,false)", [JSON.stringify({ sub:userId,role:'authenticated' })]);
  while (pending.size) {
    const table = [...pending].find(t => !deps.some(d => d.child === t && d.parent !== t && pending.has(d.parent)));
    if (!table) throw new Error('Catálogos com dependência circular: '+[...pending].join(','));
    for (const entry of entries.get(table)) {
      try { await db.query(entry.sql); total++; }
      catch (e) { throw new Error(`Catálogo ${table} (${entry.name}): ${e.message}`); }
    }
    pending.delete(table); done.add(table);
  }
  for(const entry of updates){try{await db.query(entry.sql);}catch(e){throw Error(`Atualização de catálogo ${entry.name}: ${e.message}`);}}
  await db.query("SELECT set_config('request.jwt.claims','{}',false)");
  const workspace = '0b000000-0000-4000-8000-000000000001';
  if ((await db.query('SELECT 1 FROM workspaces WHERE id=$1',[workspace])).rowCount) {
    await db.query("INSERT INTO workspace_members(workspace_id,user_id,role) VALUES($1,$2,'owner') ON CONFLICT(workspace_id,user_id) DO NOTHING",[workspace,userId]);
  }
  console.log(`Catálogos versionados: ${done.size} tabelas, ${total} INSERTs; nenhum dado exportado de produção.`);
}

async function main() {
  if (process.env.HIVE_E2E_LOCAL !== '1') throw new Error('Este bootstrap exige HIVE_E2E_LOCAL=1.');
  for (const p of ['.env.local','.env.e2e.local','supabase/.env']) {
    try { await access(path.join(ROOT,p)); } catch { continue; }
    throw new Error(`Arquivo de ambiente preexistente recusado: ${p}`);
  }
  const stateFile=process.env.HIVE_LOCAL_STATUS;
  const pgModule=process.env.HIVE_LOCAL_PG_MODULE;
  if (!stateFile || !pgModule || !path.isAbsolute(stateFile) || !path.isAbsolute(pgModule)) throw new Error('Informe status local e módulo pg fora da aplicação.');
  const state=JSON.parse(await readFile(stateFile,'utf8'));
  loopback(state.API_URL,['http:'],54321);
  const backend='http://127.0.0.1:54521';
  const database=loopback(state.DB_URL,['postgresql:','postgres:'],54322);
  if (database.pathname!=='/postgres') throw new Error('Banco local inesperado.');
  const anon=state.ANON_KEY, service=state.SERVICE_ROLE_KEY;
  if (!anon || !service) throw new Error('CLI local não forneceu chaves legadas compatíveis; não usar chaves hospedadas.');
  if (process.env.GITHUB_ACTIONS==='true') for (const value of [anon,service,database.password]) console.log('::add-mask::'+value);
  const {default:pg}=await import(pathToFileURL(pgModule));
  // Management API preserva microssegundos; Date do pg perderia precisão e causaria PT409 falso.
  pg.types.setTypeParser(1184,value=>value);pg.types.setTypeParser(1114,value=>value);
  const db=new pg.Client({connectionString:database.href});await db.connect();
  const gateway=await localGateway();
  const adminKey='local-'+randomBytes(32).toString('hex');
  const management=http.createServer(async(req,res)=>{
    res.setHeader('Content-Type','application/json');
    if(req.headers.authorization!=='Bearer '+adminKey){res.writeHead(401);res.end('{}');return;}
    const url=new URL(req.url,'http://127.0.0.1:54330');
    if(url.pathname==='/v1/projects/hive-local/api-keys'){res.end(JSON.stringify([{name:'service_role',type:'secret',api_key:service},{name:'anon',type:'publishable',api_key:anon}]));return;}
    if(url.pathname==='/v1/projects/hive-local/database/query'&&req.method==='POST'){
      try{let text='';for await(const data of req){text+=data;if(text.length>16*1024*1024)throw Error('SQL de teste muito grande');}
        const {query}=JSON.parse(text);if(typeof query!=='string')throw Error('query ausente');
        const result=await db.query(query);res.end(JSON.stringify((Array.isArray(result)?result.at(-1)?.rows:result.rows)??[]));
      }catch(e){res.writeHead(400);res.end(JSON.stringify({message:e.message,code:e.code}));}return;
    }res.writeHead(404);res.end('{}');
  });
  let functions, tests;
  try {
    if((await db.query("SELECT to_regclass('public.user_posts') present")).rows[0].present) throw new Error('Banco já contém a Hive; recusei sobrescrever dados existentes.');
    await db.query("CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public; DO $$ BEGIN IF (SELECT extnamespace FROM pg_extension WHERE extname='vector')<>'public'::regnamespace THEN ALTER EXTENSION vector SET SCHEMA public; END IF; END $$;");
    await db.query(await readFile(path.join(ROOT,'e2e/local/schema.sql'),'utf8'));
    await db.query('SET search_path=public,extensions');
    await db.query(await readFile(path.join(ROOT,'e2e/local/storage.sql'),'utf8'));
    await db.query(await readFile(path.join(ROOT,'supabase/migrations/20261119000001_marcas_permissoes.sql'),'utf8'));
    const password='LocalOnly!'+randomBytes(20).toString('hex'),email='e2e-local@example.test';
    const created=await fetch(backend+'/auth/v1/admin/users',{method:'POST',headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json'},body:JSON.stringify({email,password,email_confirm:true})});
    const user=await created.json();if(!created.ok)throw Error('Auth local: '+created.status+' '+JSON.stringify(user));
    const userId=user.id??user.user?.id;if(!userId)throw Error('Auth local sem usuário.');
    if(process.env.GITHUB_ACTIONS==='true')console.log('::add-mask::'+password);
    await db.query("INSERT INTO user_settings(user_id,gemini_api_key) VALUES($1,'local-fake-key-no-ai') ON CONFLICT(user_id) DO UPDATE SET gemini_api_key=excluded.gemini_api_key",[userId]);
    await seedCatalogs(db,userId,backend);
    await db.query("NOTIFY pgrst,'reload schema'");
    for(const id of ['media','design','packages']){
      const bucket={id,name:id,public:true,...(id==='media'?{file_size_limit:209715200,allowed_mime_types:['image/*','video/*','application/pdf','application/zip']}:{})};
      const response=await fetch(backend+'/storage/v1/bucket',{method:'POST',headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json'},body:JSON.stringify(bucket)});
      if(!response.ok&&response.status!==409)throw Error('Bucket local '+id+': '+response.status+' '+await response.text());
    }
    await seedVisualFixtures(db,backend,service);
    await new Promise(r=>management.listen(54330,'127.0.0.1',r));
    const cliLog=createWriteStream(path.join(process.env.RUNNER_TEMP??'/tmp','hive-local-functions.log'));
    functions=spawn('npx',['--yes','supabase@3.2.0','functions','serve'],{cwd:ROOT,env:{...process.env,SUPABASE_ACCESS_TOKEN:''},detached:true,stdio:['ignore','pipe','pipe']});
    functions.stdout.pipe(cliLog);functions.stderr.pipe(cliLog);
    // A CLI monta e configura seu dispatcher antes de clonar apenas o runtime para loopback.
    let prepared=false;
    for(let i=0;i<60;i++){
      try{const r=await fetch(state.API_URL+'/functions/v1/identity-setup',{method:'POST',headers:{apikey:service,Authorization:'Bearer '+service,'x-bee-user-id':userId,'Content-Type':'application/json'},body:JSON.stringify({action:'context_probe'})});if(r.ok){prepared=true;break;}}catch{}
      await new Promise(r=>setTimeout(r,1000));
    }
    if(!prepared)throw Error('Dispatcher da CLI não ficou pronto.');
    startHostRuntime(backend,database.href);
    let ready=false;
    for(let i=0;i<60;i++){
      if(functions.exitCode!==null)throw Error('Servidor local de funções encerrou; consultar log privado do runner.');
      try{const r=await fetch(backend+'/functions/v1/identity-setup',{method:'POST',headers:{apikey:service,Authorization:'Bearer '+service,'x-bee-user-id':userId,'Content-Type':'application/json'},body:JSON.stringify({action:'context_probe'})});if(r.ok){ready=true;break;}}catch{}
      await new Promise(r=>setTimeout(r,1000));
    }
    if(!ready)throw Error('Funções locais não ficaram prontas.');
    const args=process.argv.slice(2);if(args.some(a=>a.includes('@live')||a.includes('--project')||a.includes('--config')))throw Error('Argumento de execução não permitido no runner local.');
    const guard=pathToFileURL(path.join(ROOT,'e2e/local/deny-hosted.mjs')).href;
    const env={...process.env,NODE_OPTIONS:`${process.env.NODE_OPTIONS??''} --import ${guard}`,HIVE_E2E_LOCAL:'1',HIVE_E2E_BACKEND_URL:backend,HIVE_E2E_MANAGEMENT_URL:'http://127.0.0.1:54330',VITE_SUPABASE_URL:backend,VITE_SUPABASE_PUBLISHABLE_KEY:anon,SUPABASE_ACCESS_TOKEN:adminKey,E2E_EMAIL:email,E2E_PASSWORD:password,E2E_USER_ID:userId};
    tests=spawn(process.execPath,[path.join(ROOT,'node_modules/@playwright/test/cli.js'),'test','--project=e2e','--reporter=list',...args],{cwd:ROOT,env,detached:true,stdio:'inherit'});
    const [exit]=await once(tests,'exit');if(exit!==0)process.exitCode=exit||1;
  } finally {
    console.log('Encerrando processos de teste e funções locais.');
    await stopChild(tests); await stopChild(functions);
    stopHostRuntime();
    functions?.stdout?.destroy(); functions?.stderr?.destroy();
    if(management.listening){management.closeAllConnections();await new Promise(r=>management.close(r));}
    gateway.closeAllConnections();await new Promise(r=>gateway.close(r));
    await db.end();
    console.log('Bootstrap local encerrado; o workflow descartará a instância local.');
  }
}

if(process.argv.includes('--self-test')){
  assert.equal(splitSql("INSERT INTO x VALUES('a;b'); SELECT 2;").length,2);
  assert.equal(splitSql("DO $$ BEGIN PERFORM 1; END $$; SELECT 2;").length,2);
  assert.equal(splitSql("/* ; /* ; */ */ SELECT 1; -- ;\nSELECT 'it''s;ok';").length,2);
  assert.equal(splitSql("SELECT E'it\\'s;ok'; SELECT 2;").length,2);
  assert.throws(()=>splitSql("SELECT 'sem fim"));
  assert.equal(insertTable('-- início\nINSERT INTO public.brands (id) VALUES(1);'),'brands');
  assert.equal(insertTable('DO $$ BEGIN INSERT INTO brands VALUES(1); END $$;'),null);
  assert.equal(insertTable('-- comentário final sem newline'),null);
  assert.throws(()=>loopback('https://example.supabase.co',['http:'],54321));
  assert.equal(loopback('http://127.0.0.1:54321',['http:'],54321).origin,'http://127.0.0.1:54321');
  const stubborn=spawn(process.execPath,['-e',"process.on('SIGTERM',()=>{});process.stdout.write('ready');setInterval(()=>{},1000)"],{detached:true,stdio:['ignore','pipe','ignore']});
  await once(stubborn.stdout,'data'); await stopChild(stubborn);
  assert.equal(stubborn.signalCode,'SIGKILL');
  console.log('10 verificações puras e 1 encerramento real de processo passaram.');
}else if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  await main().catch(e=>{console.error(e.message);process.exitCode=1;});
}
