# M01 — Auditoria de banco e contrato de marcas (#102)

**Data da auditoria:** 18/11/2026 · **Banco:** Bee Consulting, projeto `djlorvdehedcupeykyes` · **Operações:** exclusivamente `SELECT` de metadados.  
**Escopo:** documentação na branch `marcos/01-marcas-contexto`; nenhuma escrita, função mutante invocada, DDL, deploy ou leitura de registros de produtor.

## 1. Histórico aplicado, sem reaplicação

- `supabase_migrations.schema_migrations`: versão `20261117143519`, nome `identity_content_intelligence`, **1 linha**, **1 elemento** em `statements`, **26.784 caracteres**.
- Impressão digital do SQL recuperado, `md5(array_to_string(statements, E'\\n'))`: **`ecc35cc0bf2a34e314e85a3fb92343e4`**.
- A cópia **integral e literal de `statements[1]`** está em [M01-SQL-APLICADO.sql](M01-SQL-APLICADO.sql). É um documento fora de `supabase/migrations/`, **não uma nova migration**. Contém definições e comandos do histórico; **nenhum desses comandos foi executado** nesta auditoria.
- O SQL contém identificadores estruturais, não nomes/IDs retirados de tabelas reais; o uso de `token` no código é nome de variável local gerada em tempo de execução, não credencial. Triagem textual contra chave secreta/JWT/email embutidos: sem ocorrência detectada (não é teste de segurança exaustivo).

## 2. Contrato observado — marcas e workspace

**Cliente lido:** `src/types/identity.ts`, `src/lib/identityApi.ts`, `src/components/identity/CreateWorkspaceCard.tsx`; esquema prévio: `supabase/migrations/20261015000001_identidade_contextos.sql`.

- `Brand` requer `id, workspace_id, name, slug, essence, status, is_default`; `essence` pode ser nula. Colunas `brands`: `id uuid DEFAULT gen_random_uuid()`, `workspace_id uuid NOT NULL`, `name text NOT NULL`, `slug text NOT NULL` **sem default**, `essence text NULL`, `status text NOT NULL DEFAULT 'active'` (check `draft/active/archived`), `is_default boolean DEFAULT false`; `metadata` e timestamps têm defaults. `UNIQUE (workspace_id, slug)` e FK para `workspaces(id) ON DELETE CASCADE`. REST de segunda marca exige **workspace_id e slug explícitos**, além de name; resolver conflito de slug sem usar RPC de criação de workspace.
- `workspace_members`: PK `(workspace_id,user_id)`, role `owner/editor/viewer` (default `editor`), FKs com `ON DELETE CASCADE` para workspace e usuário. RLS habilitada: `ws_members_self` é `SELECT` para authenticated; `workspaces_member` também apenas `SELECT`.
- `brands`: RLS habilitada; `brands_member`, `FOR ALL TO authenticated`, `USING/WITH CHECK is_workspace_member(workspace_id)`. Função `is_workspace_member` verifica associação por `auth.uid()`; **não diferencia owner/editor/viewer**. Grants de tabela para authenticated têm SELECT/INSERT/UPDATE/DELETE; a RLS de marca permite edição de outras colunas e DELETE por membro, embora **o cliente M01 deva enviar PATCH apenas `name`/`essence`, nunca status/slug/workspace/is_default ou DELETE**. O banco **não** impõe essa lista restrita de campos.
- `public.set_brand_archived(p_brand uuid, p_archived boolean) RETURNS brands`, `SECURITY INVOKER`, `search_path=public`. `EXECUTE` concedido a **authenticated** e **service_role**; **não** a anon/PUBLIC. Busca a marca por `id=p_brand AND is_brand_member(id)` com `FOR UPDATE`; ausente/não acessível => `PT404`. Na tentativa de arquivar, recusa `PT409` quando há campanhas `draft/active/paused` **ligadas por `communication_profiles`** ou `user_posts` `approved/scheduled` **também ligadas por perfil**. Executa `status='archived'` para arquivar ou `status='active'` para restaurar e retorna linha; a guarda de vínculos só ocorre para arquivamento. **Comportamento confirmado por `pg_get_functiondef`, sem executar o RPC.**
- `public.create_my_workspace(p_workspace text, p_brand text) RETURNS uuid` é `SECURITY DEFINER`, liberada a authenticated/service_role, não anon/PUBLIC. `CreateWorkspaceCard` já a invoca para workspace próprio e primeira marca. A função recusa `PT409` se usuário já pertence a workspace; **não serve para segunda marca**.
- `identityApi.brands()` usa `status=neq.archived` com cache; **a tela administrativa deve consultar também arquivadas** e invalidar o cache depois de cada escrita, para permitir restaurar.

### Limites/riscos do contrato atual

1. **Autorização ampla:** qualquer membro do workspace, inclusive `viewer`, satisfaz `is_workspace_member/is_brand_member`; UPDATE de toda a linha e RPC de arquivamento não impõem papel owner/editor. Sem uma política de papéis definida para M01, isso é risco explícito; **não inferir permissão forte pela tipagem do cliente**.
2. **Edição de campos sensíveis possível via REST:** o backend concede UPDATE/DELETE de `brands` sob RLS de associação; restringir o payload e ações na UI é contrato de cliente, não defesa contra chamadas diretas. Se o produto exigir autorização por papel/coluna no servidor, isso precisa de outra issue de backend, com autorização própria.
3. **Guardas de vínculos intencionalmente parciais:** `PT409` só alcança campanhas/peças que tenham `profile_id` alcançável; não varre vínculos sem perfil nem `content_piece_plans`. Não alegar bloqueio universal de dependências. Restauração retorna `active`, não preserva estado `draft` anterior.
4. **Slug e cache:** `slug` é obrigatório e único por workspace (inclusive para arquivadas); construir/validar o slug no cadastro e tratar colisão REST. Lista administrativa não pode reutilizar filtro que oculta arquivadas.

## 3. Auditoria separada — efeitos da migration anterior

A versão `20261117143519` é um **pacote multifuncional**; recuperar SQL não equivale a certificar compatibilidade de todo o sistema.

- **Tabelas novas presentes, com RLS ativo:** `brand_intelligence_settings` (PK/FK `brand_id`, política de leitura e escrita por `is_brand_member`); `brand_intelligence_history` (PK `id`, `UNIQUE(brand_id,version)`, FK `changed_by`, somente SELECT/INSERT por membro e `changed_by=auth.uid()`); `knowledge_analysis_runs` (PK `(document_id,user_id)`, FK document `ON DELETE CASCADE`, outras FK brand/user, política de dono + marca); `knowledge_discoveries` (unique `user_id,document_id,title`, FK document `ON DELETE SET NULL`, content `ON DELETE SET NULL`, brand/user sem cascade declarado, política de dono + marca). Checks de ACJ/status/título/resumo/sources existem.
- **Colunas verificadas:** `knowledge_documents.archived boolean NOT NULL DEFAULT false`, `source_text text NULL`; `bee_products.audience_ids uuid[] NOT NULL DEFAULT '{}'`; `content_piece_plans.acj_primary/acj_secondary/acj_rationale` como textos nullable (checks e guardas por função). `trg_product_audiences` e `trg_plan_intent_guard` presentes.
- **Funções verificadas:** `approve_cycle_production` agora recebe `p_replace uuid[] DEFAULT '{}'` e faz verificações de idempotência/concorrência, de bases e de peças (1–40). Código exige `template_family` em `M01/M02/M03`, formato em `image/carousel/story`, capacidade de formato, editoria e validações de intenção: **risco de clientes antigos sem novos campos ou valores**. O código **pode arquivar peças não aprovadas por substituição confirmada**; não testado em execução.
- `acj_piece_inherit` existe e está ligado a `user_posts` pelo trigger `trg_posts_acj_inherit`; herda ACJ do plano/contrato e congela snapshot da peça publicada. `guard_plan_intent` impede alterar ACJ de plano já ligado a post e recusa intenções desativadas conforme configuração. **Risco de incompatibilidade de fluxos que alterem ACJ depois de vincular o post**. Não foram testados fluxos reais.
- Outras funções presentes: `save_intelligence_settings`, `claim_knowledge_analysis`, `finish_knowledge_analysis`, `match_knowledge_scoped`, `set_mother_archived`, `guard_product_audiences`. Escopo/efeitos colaterais não foram objeto de testes de runtime.
- **FKs/cleanup:** o pacote introduziu referências a marcas sem `ON DELETE CASCADE` em tabelas de inteligência (restrição a exclusão física), enquanto runs dependem de documentos com CASCADE e descobertas podem perder vínculo de documento com SET NULL. Há também FKs de `content_piece_plans` com `ON DELETE RESTRICT` para perfil/versões de base. **Nenhum DROP/DELETE, limpeza ou reconstrução de rollback foi feito**. Risco de orfandade lógica, retenção ou incompatibilidade com cleanup **não resolvido**; exigir investigação separada antes de qualquer operação destrutiva.

## 4. Consultas SQL exatas (executadas apenas como SELECT, em 18/11/2026)

A query H1 retornou o SQL integral do histórico, armazenado somente no arquivo documental; não se imprime aqui a linha longa. As demais consultas retornaram metadados de catálogo, não registros de cliente.

**H1 — SQL bruto**

```sql
SELECT version, name, statements FROM supabase_migrations.schema_migrations WHERE version='20261117143519';
```

**H2 — unicidade e impressão digital**

```sql
SELECT count(*) AS entradas,coalesce(max(name),'') AS nome,coalesce(max(cardinality(statements)),0) AS statements,coalesce(max(length(array_to_string(statements,E'\n'))),0) AS caracteres,md5(coalesce(max(array_to_string(statements,E'\n')),'')) AS md5 FROM supabase_migrations.schema_migrations WHERE version='20261117143519';
```

**F1 — definições e EXECUTE**

```sql
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args, pg_get_function_result(p.oid) AS retorno, p.prosecdef AS security_definer, p.proconfig AS config, COALESCE(p.proacl::text, '<default>') AS acl, has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute, has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute, has_function_privilege('service_role',p.oid,'EXECUTE') AS service_execute, EXISTS(SELECT 1 FROM aclexplode(COALESCE(p.proacl,acldefault('f',p.proowner))) a WHERE a.grantee=0 AND a.privilege_type='EXECUTE') AS public_execute, pg_get_functiondef(p.oid) AS definition FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('set_brand_archived','create_my_workspace','is_workspace_member','is_brand_member') ORDER BY p.proname, pg_get_function_identity_arguments(p.oid);
```

**T1 — colunas**

```sql
SELECT table_name,column_name,data_type,udt_name,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('brands','workspace_members','workspaces') ORDER BY table_name,ordinal_position;
```

**T2 — constraints**

```sql
SELECT cls.relname AS tabela,c.conname AS restricao,c.contype AS tipo,pg_get_constraintdef(c.oid) AS definicao FROM pg_constraint c JOIN pg_class cls ON cls.oid=c.conrelid JOIN pg_namespace n ON n.oid=cls.relnamespace WHERE n.nspname='public' AND cls.relname IN ('brands','workspace_members','workspaces') ORDER BY cls.relname,c.conname;
```

**T3 — RLS**

```sql
SELECT c.relname AS tabela,c.relrowsecurity AS rls_ativo,c.relforcerowsecurity AS rls_forcado,p.policyname,p.cmd,p.roles,p.qual,p.with_check FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace LEFT JOIN pg_policies p ON p.schemaname=n.nspname AND p.tablename=c.relname WHERE n.nspname='public' AND c.relname IN ('brands','workspace_members','workspaces') ORDER BY c.relname,p.policyname;
```

**T4 — grants**

```sql
SELECT c.relname AS tabela,has_table_privilege('authenticated',c.oid,'SELECT') AS auth_select,has_table_privilege('authenticated',c.oid,'INSERT') AS auth_insert,has_table_privilege('authenticated',c.oid,'UPDATE') AS auth_update,has_table_privilege('authenticated',c.oid,'DELETE') AS auth_delete,has_table_privilege('anon',c.oid,'SELECT') AS anon_select FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('brands','workspace_members','workspaces') ORDER BY c.relname;
```

**M1 — políticas e RLS complementares**

```sql
SELECT c.relname AS tabela,c.relrowsecurity AS rls_ativo, string_agg(DISTINCT p.policyname||':'||p.cmd||':'||array_to_string(p.roles,','), '; ' ORDER BY p.policyname||':'||p.cmd||':'||array_to_string(p.roles,',')) AS policies FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace LEFT JOIN pg_policies p ON p.schemaname='public' AND p.tablename=c.relname WHERE n.nspname='public' AND c.relname IN ('brand_intelligence_settings','brand_intelligence_history','knowledge_analysis_runs','knowledge_discoveries','knowledge_documents','bee_products','content_piece_plans') GROUP BY c.relname,c.relrowsecurity ORDER BY c.relname;
```

**M2 — funções alteradas**

```sql
SELECT p.proname,pg_get_function_identity_arguments(p.oid) AS argumentos,pg_get_function_result(p.oid) AS retorno,p.prosecdef AS security_definer,length(pg_get_functiondef(p.oid)) AS chars,md5(pg_get_functiondef(p.oid)) AS definicao_md5 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('approve_cycle_production','acj_piece_inherit','guard_plan_intent','guard_product_audiences','save_intelligence_settings','claim_knowledge_analysis','finish_knowledge_analysis','match_knowledge_scoped','set_mother_archived') ORDER BY p.proname;
```

**M3 — colunas novas**

```sql
SELECT table_name,column_name,udt_name,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' AND (table_name='knowledge_documents' AND column_name IN ('archived','source_text') OR table_name='bee_products' AND column_name='audience_ids' OR table_name='content_piece_plans' AND column_name IN ('acj_primary','acj_secondary','acj_rationale')) ORDER BY table_name,column_name;
```

**M4 — FKs e checks das tabelas novas**

```sql
SELECT c.conrelid::regclass::text AS tabela,c.conname,c.contype,pg_get_constraintdef(c.oid) AS definicao FROM pg_constraint c WHERE c.conrelid IN ('public.brand_intelligence_settings'::regclass,'public.brand_intelligence_history'::regclass,'public.knowledge_analysis_runs'::regclass,'public.knowledge_discoveries'::regclass) ORDER BY tabela,c.conname;
```

**M5 — políticas detalhadas das tabelas novas**

```sql
SELECT tablename,policyname,cmd,roles,qual,with_check FROM pg_policies WHERE schemaname='public' AND tablename IN ('brand_intelligence_settings','brand_intelligence_history','knowledge_analysis_runs','knowledge_discoveries') ORDER BY tablename,policyname;
```

**M6 — triggers relevantes**

```sql
SELECT c.relname AS tabela,t.tgname AS trigger_name,pg_get_triggerdef(t.oid) AS definicao FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND NOT t.tgisinternal AND t.tgname IN ('trg_plan_intent_guard','trg_product_audiences','trg_posts_inherit_acj') ORDER BY c.relname,t.tgname;
```

**M7 — ACJ herança**

```sql
SELECT c.relname AS tabela,t.tgname,pg_get_triggerdef(t.oid) AS definicao FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND NOT t.tgisinternal AND t.tgfoid IN (SELECT p.oid FROM pg_proc p WHERE p.pronamespace='public'::regnamespace AND p.proname='acj_piece_inherit');
```

**M8 — checagem de presença**

```sql
SELECT 'brand_intelligence_settings' AS tabela, to_regclass('public.brand_intelligence_settings') IS NOT NULL AS existe UNION ALL SELECT 'brand_intelligence_history',to_regclass('public.brand_intelligence_history') IS NOT NULL UNION ALL SELECT 'knowledge_analysis_runs',to_regclass('public.knowledge_analysis_runs') IS NOT NULL UNION ALL SELECT 'knowledge_discoveries',to_regclass('public.knowledge_discoveries') IS NOT NULL;
```

## 5. Resultados agregados da conferência (18/11/2026)

| Conferência | Resultado observado |
| --- | --- |
| H1/H2 | 1 versão `20261117143519` / 1 statement / 26.784 caracteres / MD5 `ecc35cc0bf2a34e314e85a3fb92343e4` |
| F1 | 4 funções consultadas; assinatura e retorno de RPC de marca conformes; EXECUTE authenticated=true, service_role=true, anon=false, PUBLIC=false; `PT404`/`PT409` nos ramos descritos |
| T1/T2 | `brands` 10 colunas, 4 constraints; `workspace_members` 4 colunas, 4 constraints; `workspaces` 4 colunas, 2 constraints |
| T3/T4 | RLS ativa nas 3 tabelas; `brands_member` ALL/authenticated por associação ao workspace; `workspace_members` SELECT/autenticado. Grants nominais de tabela para authenticated incluem DML, mas RLS restringe por política |
| M1/M4/M5/M8 | 4 tabelas novas presentes, RLS ativa e FKs/checks de catálogo presentes; detalhes descritos na seção 3 |
| M2/M3/M6/M7 | 9 funções-alvo presentes; 6 colunas-alvo presentes; triggers de público, intenção e herança ACJ encontrados. A verificação foi de definição/presença, **não** de execução ou compatibilidade ponta-a-ponta |

## 6. Validação, parecer e reversão operacional

_Preparação P2: o parecer final, as evidências AUD01–AUD05, os testes executados/não executados e a decisão de entrega serão registrados no P3. Não há autorização para executar RPC mutante sobre marcas, nem testes E2E nesta issue._
