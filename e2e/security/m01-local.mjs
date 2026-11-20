#!/usr/bin/env node
// #111: PostgreSQL/PostgREST reais, JWTs locais e fixtures descartáveis.
// Sem .env, credencial de produção, Docker ou dependência nova da aplicação.
// Preparar ferramentas FORA do repo:
// npm install --prefix /tmp/hive111-runtime --no-save --no-audit --no-fund embedded-postgres@17.11.0-beta.19
// PostgREST 16.6: binário oficial em /tmp/hive111-runtime/postgrest.
// HIVE_SECURITY_RUNTIME=/tmp/hive111-runtime node e2e/security/m01-local.mjs
import assert from 'node:assert/strict';
import { createHmac, randomBytes, randomUUID, createHash } from 'node:crypto';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import os from 'node:os';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const tools = process.env.HIVE_SECURITY_RUNTIME;
if (!tools || !path.isAbsolute(tools)) throw new Error('Informe HIVE_SECURITY_RUNTIME absoluto, fora do repositório.');
if (path.resolve(tools).startsWith(ROOT + path.sep)) throw new Error('Ferramentas devem permanecer fora das dependências da aplicação.');
if (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_ACCESS_TOKEN) {
  throw new Error('Não execute este teste com ambiente/credenciais Supabase: ele cria seu próprio ambiente local.');
}
const { default: EmbeddedPostgres } = await import(pathToFileURL(path.join(tools, 'node_modules/embedded-postgres/dist/index.js')));
const restVersion = execFileSync(path.join(tools, 'postgrest'), ['--version'], {encoding:'utf8'}).trim();
assert.equal(restVersion, 'PostgREST 16.6', 'Use a versão de PostgREST registrada neste teste.');
const read = (p) => readFile(path.join(ROOT, p), 'utf8');
const migrationFile = 'supabase/migrations/20261119000001_marcas_permissoes.sql';
const rollbackFile = 'supabase/rollback/20261119000001_marcas_permissoes_rollback.sql';
const migration = await read(migrationFile), rollback = await read(rollbackFile);
const identity = await read('supabase/migrations/20261015000001_identidade_contextos.sql');
const isolation = await read('supabase/migrations/20261020000001_isolamento_clientes.sql');
const historical = await read('docs/identidade/M01-SQL-APLICADO.sql');
const temp = await mkdtemp(path.join(os.tmpdir(), 'hive111-local-'));
const secret = randomBytes(48).toString('base64url');
const password = randomBytes(24).toString('hex');
const localPort = () => new Promise((resolve, reject) => {
  const s = createServer(); s.on('error', reject);
  s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const dbPort = await localPort(), restPort = await localPort();
let databaseLog = '';
const db = new EmbeddedPostgres({ databaseDir: path.join(temp, 'db'), port: dbPort,
  user: 'postgres', password, persistent: false, autoRehydrateSymlinks: true,
  postgresFlags: ['-h', '127.0.0.1', '-k', ''], onLog: (m) => { databaseLog += m; }, onError: () => {} });
let client, rest;
const results = [];
async function test(name, f) {
  try { await f(); results.push({ name, status: 'PASS' }); console.log('PASS ' + name); }
  catch (e) { results.push({ name, status: 'FAIL', error: e.message }); console.error('FAIL ' + name + ': ' + e.message); }
}
function table(name) {
  const match = identity.match(new RegExp('CREATE TABLE IF NOT EXISTS public\\.' + name + ' \\([\\s\\S]*?\\n\\);'));
  assert.ok(match, 'DDL versionado ausente: ' + name); return match[0];
}
function sqlFunction(source, name, delimiter) {
  const start = source.indexOf('CREATE OR REPLACE FUNCTION public.' + name + '(');
  assert.ok(start >= 0, 'Função versionada ausente: ' + name);
  const bodyStart = source.indexOf(delimiter, start), end = source.indexOf(delimiter + ';', bodyStart + delimiter.length);
  assert.ok(bodyStart >= 0 && end >= 0, 'Corpo da função incompleto: ' + name);
  return source.slice(start, end + delimiter.length + 1);
}
const jwt = (uid, role = 'authenticated', extra = {}) => {
  const encode = (x) => Buffer.from(JSON.stringify(x)).toString('base64url');
  const data = encode({ alg: 'HS256', typ: 'JWT' }) + '.' + encode({ role, sub: uid,
    exp: Math.floor(Date.now() / 1000) + 3600, ...extra });
  return data + '.' + createHmac('sha256', secret).update(data).digest('base64url');
};
async function api(token, target, method = 'GET', body) {
  const url = new URL(target, `http://127.0.0.1:${restPort}`);
  assert.equal(url.hostname, '127.0.0.1'); assert.equal(url.port, String(restPort));
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Prefer: 'return=representation',
    ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text(); let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: r.status, data };
}
function denied(r) { assert.ok(r.status >= 400 || (Array.isArray(r.data) && r.data.length === 0), JSON.stringify(r)); }
function ok(r) { assert.ok(r.status >= 200 && r.status < 300, JSON.stringify(r)); }
async function row(id) { return (await client.query('SELECT * FROM public.brands WHERE id=$1', [id])).rows[0]; }
async function state() {
  return (await client.query(`SELECT jsonb_build_object(
    'grants',(SELECT jsonb_agg(to_jsonb(g) ORDER BY role,priv) FROM (
      SELECT pg_get_userbyid(a.grantee) role,a.privilege_type priv,a.is_grantable
      FROM pg_class c CROSS JOIN LATERAL aclexplode(c.relacl) a WHERE c.oid='public.brands'::regclass) g),
    'columns',(SELECT jsonb_agg(jsonb_build_object('name',attname,'acl',attacl::text) ORDER BY attnum)
      FROM pg_attribute WHERE attrelid='public.brands'::regclass AND attnum>0 AND NOT attisdropped),
    'policies',(SELECT jsonb_agg(to_jsonb(p) ORDER BY policyname) FROM pg_policies p WHERE schemaname='public' AND tablename='brands'),
    'function',(SELECT pg_get_functiondef('public.set_brand_archived(uuid,boolean)'::regprocedure)),
    'function_acl',(SELECT proacl::text FROM pg_proc WHERE oid='public.set_brand_archived(uuid,boolean)'::regprocedure),
    'manager_helper',(SELECT count(*) FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname='can_manage_workspace_brand')
    ) AS value`)).rows[0].value;
}
async function reload() {
  await client.query("NOTIFY pgrst, 'reload schema'");
  await new Promise((resolve) => setTimeout(resolve, 400));
}

try {
  await db.initialise();
  try { await db.start(); } catch { throw new Error('PostgreSQL local não iniciou: ' + databaseLog.slice(-1800)); }
  client = db.getPgClient('postgres', '127.0.0.1'); await client.connect();
  // Projeção de dependências: campaigns/user_posts servem somente à guarda PT409.
  // Não representa bootstrap completo da Hive, Auth, Storage ou Edge Functions.
  await client.query(`
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE ROLE authenticator LOGIN NOINHERIT PASSWORD '${password}';
    GRANT anon,authenticated,service_role TO authenticator;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT nullif(current_setting('request.jwt.claims',true)::jsonb->>'sub','')::uuid $$;
    GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
    ${['workspaces','workspace_members','brands','emitters','business_fronts','audiences','communication_profiles'].map(table).join('\n')}
    CREATE TABLE public.campaigns(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),profile_id uuid REFERENCES public.communication_profiles(id),status text);
    CREATE TABLE public.user_posts(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),profile_id uuid REFERENCES public.communication_profiles(id),status text,metadata jsonb DEFAULT '{}');
    ${sqlFunction(identity,'is_workspace_member','$$')}
    ${sqlFunction(identity,'is_brand_member','$$')}
    ${sqlFunction(isolation,'create_my_workspace','$$')}
    ${sqlFunction(historical,'set_brand_archived','$$')}
    REVOKE ALL ON FUNCTION public.create_my_workspace(text,text),public.set_brand_archived(uuid,boolean) FROM PUBLIC,anon;
    GRANT EXECUTE ON FUNCTION public.create_my_workspace(text,text),public.set_brand_archived(uuid,boolean) TO authenticated,service_role;
    ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
    CREATE POLICY brands_member ON public.brands TO authenticated USING(public.is_workspace_member(workspace_id)) WITH CHECK(public.is_workspace_member(workspace_id));
    CREATE POLICY ws_members_self ON public.workspace_members FOR SELECT TO authenticated USING(public.is_workspace_member(workspace_id));
    CREATE POLICY workspaces_member ON public.workspaces FOR SELECT TO authenticated USING(public.is_workspace_member(id));
    GRANT ALL ON public.brands TO anon,authenticated,service_role;
    GRANT SELECT ON public.workspaces,public.workspace_members TO authenticated;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
  `);
  const users = Object.fromEntries(['owner','editor','viewer','foreign','newcomer'].map((k) => [k,randomUUID()]));
  for (const id of Object.values(users)) await client.query('INSERT INTO auth.users VALUES($1)', [id]);
  const wa = randomUUID(), wb = randomUUID(), a = randomUUID(), b = randomUUID();
  await client.query("INSERT INTO public.workspaces(id,name,slug) VALUES($1,'Fixture A','e2e-local-a'),($2,'Fixture B','e2e-local-b')",[wa,wb]);
  for (const role of ['owner','editor','viewer']) await client.query('INSERT INTO public.workspace_members(workspace_id,user_id,role) VALUES($1,$2,$3)',[wa,users[role],role]);
  await client.query("INSERT INTO public.workspace_members(workspace_id,user_id,role) VALUES($1,$2,'owner')",[wb,users.foreign]);
  await client.query("INSERT INTO public.brands(id,workspace_id,name,slug) VALUES($1,$2,'Marca A','a'),($3,$4,'Marca B','b')",[a,wa,b,wb]);
  const tokens = Object.fromEntries(Object.entries(users).map(([k,id]) => [k,jwt(id)]));
  const conf = path.join(temp,'postgrest.conf');
  await writeFile(conf,`db-uri = "postgresql://authenticator:${password}@127.0.0.1:${dbPort}/postgres"\ndb-schemas = "public"\ndb-anon-role = "anon"\njwt-secret = "${secret}"\nserver-host = "127.0.0.1"\nserver-port = ${restPort}\n`,{mode:0o600});
  let restLog='';
  // PGRST_* herdado não pode sobrepor o db-uri local do arquivo.
  rest=spawn(path.join(tools,'postgrest'),[conf],{stdio:['ignore','pipe','pipe'],
    env:{PATH:process.env.PATH,LANG:'C.UTF-8'}});
  rest.stderr.on('data',(x)=>{restLog+=x.toString();});
  rest.stdout.on('data',(x)=>{restLog+=x.toString();});
  for(let i=0;;i++) {
    try { const r=await api(tokens.owner,'/brands?limit=0');if(r.status===200)break; }
    catch { /* processo local ainda inicializando */ }
    if(i>50)throw new Error('PostgREST local indisponível: '+restLog.slice(-1500));
    await new Promise((resolve)=>setTimeout(resolve,100));
  }
  const baseline=await state();
  await test('PRE: falha anterior reproduzida com JWT viewer na API real',async()=>{
    ok(await api(tokens.viewer,`/brands?id=eq.${a}`,'PATCH',{name:'Viewer indevido'}));
    assert.equal((await row(a)).name,'Viewer indevido');
    await client.query("UPDATE public.brands SET name='Marca A' WHERE id=$1",[a]);
  });
  await client.query(migration); const applied=await state();
  await client.query(migration); await reload();
  await test('DDL: segunda aplicação é idempotente',async()=>assert.deepEqual(await state(),applied));
  for(const role of ['owner','editor','viewer']) await test(`${role}: SELECT permitido no próprio workspace`,async()=>{
    const r=await api(tokens[role],`/brands?id=eq.${a}`);ok(r);assert.equal(r.data[0].id,a);
  });
  for(const role of ['foreign','anon']) await test(`${role}: não lê marca de outro workspace`,async()=>{
    const r=await api(tokens[role],`/brands?id=eq.${a}`);
    denied(r);
  });
  for(const role of ['owner','editor']) await test(`${role}: INSERT e PATCH name/essence permitidos`,async()=>{
    const r=await api(tokens[role],'/brands','POST',{workspace_id:wa,name:role,slug:'e2e-'+role});ok(r);
    assert.equal((await row(r.data[0].id)).workspace_id,wa);
    const u=await api(tokens[role],`/brands?id=eq.${a}`,'PATCH',{name:role,essence:'Essência local'});ok(u);
    assert.equal((await row(a)).name,role);
  });
  for(const role of ['viewer','foreign','anon']) {
    await test(`${role}: INSERT negado no workspace A`,async()=>{
      denied(await api(tokens[role],'/brands','POST',{workspace_id:wa,name:'indevida',slug:'e2e-denied-'+role}));
      assert.equal((await client.query('SELECT count(*)::int n FROM brands WHERE slug=$1',['e2e-denied-'+role])).rows[0].n,0);
    });
    await test(`${role}: PATCH negado e linha preservada`,async()=>{
      const before=await row(a);denied(await api(tokens[role],`/brands?id=eq.${a}`,'PATCH',{name:'proibido'}));assert.deepEqual(await row(a),before);
    });
  }
  const immutable={status:'archived',slug:'mudou',workspace_id:wb,is_default:true,metadata:{intrusao:true},id:randomUUID(),created_at:new Date(0).toISOString(),updated_at:new Date(0).toISOString()};
  for(const role of ['owner','editor']) for(const [column,value] of Object.entries(immutable)) {
    await test(`${role}: PATCH ${column} proibido no REST`,async()=>{
      const before=await row(a);const r=await api(tokens[role],`/brands?id=eq.${a}`,'PATCH',{[column]:value});
      assert.ok(r.status>=400,JSON.stringify(r));assert.deepEqual(await row(a),before);
    });
  }
  for(const role of ['owner','editor','viewer','foreign','anon']) await test(`${role}: DELETE proibido`,async()=>{
    denied(await api(tokens[role],`/brands?id=eq.${a}`,'DELETE'));assert.ok(await row(a));
  });
  for(const role of ['owner','editor']) await test(`${role}: RPC arquiva/restaura e mantém ID`,async()=>{
    const before=await row(a);
    let r=await api(tokens[role],'/rpc/set_brand_archived','POST',{p_brand:a,p_archived:true});ok(r);assert.equal(r.data.status,'archived');
    r=await api(tokens[role],'/rpc/set_brand_archived','POST',{p_brand:a,p_archived:false});ok(r);
    assert.equal(r.data.id,a);assert.equal(r.data.status,'active');assert.equal(r.data.slug,before.slug);assert.equal(r.data.workspace_id,before.workspace_id);
  });
  for(const role of ['viewer','foreign','anon']) await test(`${role}: RPC mutante negada`,async()=>{
    const before=await row(a),r=await api(tokens[role],'/rpc/set_brand_archived','POST',{p_brand:a,p_archived:true});
    assert.ok(r.status>=400,JSON.stringify(r));if(role!=='anon')assert.equal(r.data.code,'PT404');assert.deepEqual(await row(a),before);
  });
  for(const role of ['owner','editor']) await test(`${role}: RPC não acessa workspace B`,async()=>{
    const before=await row(b),r=await api(tokens[role],'/rpc/set_brand_archived','POST',{p_brand:b,p_archived:true});
    assert.equal(r.status,404);assert.equal(r.data.code,'PT404');assert.deepEqual(await row(b),before);
  });
  await test('RPC: marca inexistente retorna PT404',async()=>{
    const r=await api(tokens.owner,'/rpc/set_brand_archived','POST',{p_brand:randomUUID(),p_archived:true});assert.equal(r.status,404);assert.equal(r.data.code,'PT404');
  });
  const em=randomUUID(),front=randomUUID(),profile=randomUUID();
  await client.query("INSERT INTO emitters(id,brand_id,kind,name) VALUES($1,$2,'person','Fixture')",[em,a]);
  await client.query("INSERT INTO business_fronts(id,brand_id,name,slug) VALUES($1,$2,'Fixture','fixture')",[front,a]);
  await client.query("INSERT INTO communication_profiles(id,brand_id,emitter_id,front_id,name) VALUES($1,$2,$3,$4,'Fixture')",[profile,a,em,front]);
  for(const [table,statuses] of [['campaigns',['draft','active','paused']],['user_posts',['approved','scheduled']]]) {
    for(const status of statuses) for(const role of ['owner','editor']) await test(`RPC ${role}: ${table}/${status} impede arquivo com PT409`,async()=>{
      const id=randomUUID();await client.query(`INSERT INTO ${table}(id,profile_id,status) VALUES($1,$2,$3)`,[id,profile,status]);
      const before=await row(a),r=await api(tokens[role],'/rpc/set_brand_archived','POST',{p_brand:a,p_archived:true});
      assert.equal(r.status,409);assert.equal(r.data.code,'PT409');assert.deepEqual(await row(a),before);
      assert.equal((await client.query(`SELECT status FROM ${table} WHERE id=$1`,[id])).rows[0].status,status);
      await client.query(`DELETE FROM ${table} WHERE id=$1`,[id]);
    });
  }
  await test('Histórico: arquivar preserva post publicado e seu perfil',async()=>{
    const id=randomUUID();await client.query("INSERT INTO user_posts(id,profile_id,status,metadata) VALUES($1,$2,'published',$3)",[id,profile,{snapshot:'fixture-local'}]);
    const before=(await client.query('SELECT to_jsonb(p) value FROM user_posts p WHERE id=$1',[id])).rows[0];
    const profileBefore=(await client.query('SELECT to_jsonb(p) value FROM communication_profiles p WHERE id=$1',[profile])).rows[0];
    ok(await api(tokens.owner,'/rpc/set_brand_archived','POST',{p_brand:a,p_archived:true}));
    assert.deepEqual((await client.query('SELECT to_jsonb(p) value FROM user_posts p WHERE id=$1',[id])).rows[0],before);
    assert.deepEqual((await client.query('SELECT to_jsonb(p) value FROM communication_profiles p WHERE id=$1',[profile])).rows[0],profileBefore);
    ok(await api(tokens.owner,'/rpc/set_brand_archived','POST',{p_brand:a,p_archived:false}));
  });
  await test('Papel revogado: JWT anterior não conserva permissão de editor',async()=>{
    await client.query("UPDATE workspace_members SET role='viewer' WHERE workspace_id=$1 AND user_id=$2",[wa,users.editor]);
    const r=await api(tokens.editor,'/rpc/set_brand_archived','POST',{p_brand:a,p_archived:true});assert.equal(r.data.code,'PT404');
    await client.query("UPDATE workspace_members SET role='editor' WHERE workspace_id=$1 AND user_id=$2",[wa,users.editor]);
  });
  await test('JWT: metadados owner não promovem viewer',async()=>{
    const r=await api(jwt(users.viewer,'authenticated',{app_metadata:{role:'owner'},user_metadata:{role:'owner'}}),'/rpc/set_brand_archived','POST',{p_brand:a,p_archived:true});
    assert.equal(r.data.code,'PT404');
  });
  await test('JWT: authenticated sem sub não autoriza RPC',async()=>{
    const r=await api(jwt(undefined),'/rpc/set_brand_archived','POST',{p_brand:a,p_archived:true});assert.equal(r.data.code,'PT404');
  });
  await test('JWT: assinatura inválida recusada antes da função',async()=>{
    const r=await api(tokens.owner.slice(0,-5)+'xxxxx','/rpc/set_brand_archived','POST',{p_brand:a,p_archived:true});assert.equal(r.status,401);
  });
  for(const role of ['authenticated','anon']) for(const priv of ['DELETE','TRUNCATE','TRIGGER','REFERENCES','MAINTAIN']) await test(`ACL: ${role} sem ${priv}`,async()=>{
    const r=await client.query('SELECT has_table_privilege($1,\'public.brands\',$2) allowed',[role,priv]);assert.equal(r.rows[0].allowed,false);
  });
  await test('ACL: helper/RPC não executáveis por PUBLIC/anon; search_path vazio',async()=>{
    const r=await client.query(`SELECT proname,prosecdef,proconfig,has_function_privilege('anon',oid,'EXECUTE') anon,
      EXISTS(SELECT 1 FROM aclexplode(proacl) x WHERE grantee=0 AND privilege_type='EXECUTE') public_execute
      FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname IN ('set_brand_archived','can_manage_workspace_brand')`);
    assert.equal(r.rows.length,2);for(const f of r.rows){assert.equal(f.anon,false);assert.equal(f.public_execute,false);assert.equal(f.prosecdef,true);assert.ok(f.proconfig.includes('search_path=""'));}
  });
  await test('Onboarding: novo usuário cria workspace e primeira marca pela RPC existente',async()=>{
    const r=await api(tokens.newcomer,'/rpc/create_my_workspace','POST',{p_workspace:'Fixture nova',p_brand:'Marca nova'});ok(r);
    const brand=await row(r.data);assert.equal(brand.name,'Marca nova');assert.equal(brand.is_default,true);
    const m=await client.query('SELECT role FROM workspace_members WHERE workspace_id=$1 AND user_id=$2',[brand.workspace_id,users.newcomer]);assert.equal(m.rows[0].role,'owner');
    const again=await api(tokens.newcomer,'/rpc/create_my_workspace','POST',{p_workspace:'Outra',p_brand:'Outra'});assert.equal(again.data.code,'PT409');
  });
  const dataBeforeRollback=(await client.query('SELECT to_jsonb(b) value FROM brands b ORDER BY id')).rows;
  await client.query(rollback);await reload();
  await test('Rollback: restaura políticas, ACLs, colunas, função e remove helper novo',async()=>assert.deepEqual(await state(),baseline));
  await test('Rollback: nenhuma marca/dado removido ou reescrito',async()=>assert.deepEqual((await client.query('SELECT to_jsonb(b) value FROM brands b ORDER BY id')).rows,dataBeforeRollback));
  await client.query(migration);await reload();
  await test('Reaplicação após rollback volta a recusar viewer',async()=>{
    const r=await api(tokens.viewer,'/rpc/set_brand_archived','POST',{p_brand:a,p_archived:true});assert.equal(r.data.code,'PT404');
  });
  const summary={engine:(await client.query('SELECT version()')).rows[0].version,
    postgrest:restVersion,migrationSha256:createHash('sha256').update(migration).digest('hex'),
    rollbackSha256:createHash('sha256').update(rollback).digest('hex'),
    passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length,
    productionRequests:0,scope:'Segurança de Marcas: PostgreSQL/PostgREST/JWT reais; dependências PT409 projetadas. Não é regressão completa da Hive.',results};
  if(process.env.HIVE_SECURITY_REPORT)await writeFile(process.env.HIVE_SECURITY_REPORT,JSON.stringify(summary,null,2));
  console.log(JSON.stringify({passed:summary.passed,failed:summary.failed,productionRequests:0}));
  if(summary.failed)process.exitCode=1;
} finally {
  if(rest && rest.exitCode===null){rest.kill('SIGTERM');await once(rest,'exit').catch(()=>{});}
  if(client)await client.end();
  if(db.process && db.process.exitCode===null)await db.stop().catch(()=>{});
  await rm(temp,{recursive:true,force:true});
}
