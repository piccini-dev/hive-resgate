# CONTRATO — Estoque vivo (blocos 19–23)

Fonte única para as frentes que trabalham em paralelo. Nomes, assinaturas e formatos abaixo são **contrato**: quem implementa não muda; quem consome confia. Dúvida = parar e perguntar ao orquestrador, nunca inventar. Plano e motivos em [`PLANO.md`](PLANO.md).

Regras que valem para todas as frentes:
- Nenhum deploy, migration aplicada, push ou PR. O orquestrador faz tudo no fim, uma vez.
- `npm run sql` só para **leitura** (SELECT) do banco de produção.
- Sem dependência nova. Código, comentários e textos de tela em português do Brasil (nomes no código em inglês, como no resto do repo).
- Cada frente altera **só** os arquivos dela (seção 7). Os tipos compartilhados já existem em `src/types/discovery.ts`; não edite esse arquivo, peça a mudança.
- Portão: `npm run build` e `npx playwright test -c playwright.unit.config.ts` verdes antes de entregar.

## 1. Banco (frente A)

Migration `supabase/migrations/20261125000001_estoque_vivo.sql`, idempotente, com rollback em `supabase/rollback/20261125000001_estoque_vivo_rollback.sql`.

### 1.1 Tabelas que já existem em produção sem arquivo no repo
`knowledge_discoveries` e `knowledge_analysis_runs` foram criadas em 17/11 (migration remota `identity_content_intelligence`). O arquivo as declara com `CREATE TABLE IF NOT EXISTS` **idêntico ao schema real** (ler com `npm run sql` antes), mais as políticas `discoveries_own` e `analysis_own` com `DROP POLICY IF EXISTS` + `CREATE POLICY`.

### 1.2 Colunas novas
```sql
-- knowledge_discoveries
kind text CHECK (kind IN ('caso','conceito','pergunta','dado','historia','pratica'))   -- nulo nas linhas antigas
tags text[] NOT NULL DEFAULT '{}'
excerpt text CHECK (excerpt IS NULL OR length(excerpt) <= 600)
chunk_id uuid REFERENCES public.knowledge_chunks(id) ON DELETE SET NULL
link_similarity real
updated_at timestamptz NOT NULL DEFAULT now()
-- índices: (user_id, status), (content_id), GIN (tags)

-- knowledge_analysis_runs
next_chunk integer NOT NULL DEFAULT 0

-- contents (embedding do conteúdo-mãe para ligar descobertas)
mother_embedding vector(1536)
mother_embedding_hash text

-- content_piece_plans
discovery_ids uuid[] NOT NULL DEFAULT '{}'   -- índice GIN
```

### 1.3 View `public.discovery_availability` (`WITH (security_invoker = true)`)
Colunas: `discovery_id uuid, user_id uuid, content_id uuid, state text`. Só descobertas com `status <> 'dismissed'`.
- `usada`: existe `content_piece_plans` com `status = 'produced'` e `discovery_id = ANY(discovery_ids)`.
- `reservada`: senão, existe plano `status = 'planned'` cujo `production_batch_id::text = campaign_cycles.plan->'production'->>'batch_id'` do ciclo dele, com a descoberta em `discovery_ids`.
- `livre`: o resto.
`GRANT SELECT` para `authenticated` e `service_role`.

### 1.4 RPCs (CREATE OR REPLACE, partindo da definição atual em produção — ler com `pg_get_functiondef`)
- `approve_cycle_production` (mesma assinatura): cada `item` pode trazer `discovery_ids` (array JSON de uuid, 0 a 2). Validar: cada id é do `auth.uid()`, `status = 'active'`, `content_id = (item->>'content_id')::uuid`, `state = 'livre'` na view, e não repete entre itens do mesmo `p_items` → senão `PT409` com `'O material escolhido não está mais disponível. Peça outra proposta.'`. Gravar em `content_piece_plans.discovery_ids` (padrão `'{}'`).
- `save_production_progress` (mesma assinatura): com `p_done = true`, se alguma `discovery_id` do plano já está em outro plano `produced` → `PT409` `'Este material já foi usado em outra peça. Peça outra proposta.'`.
- Nada muda em `reserve_production_piece`, `adopt_content_base` e `validate_content_base`.

### 1.5 Regressão local
Acrescentar a migration nova à lista aplicada por `e2e/local/bootstrap.mjs` (hoje só aplica `20261119000001_marcas_permissoes.sql`, linha ~166), na mesma forma.

## 2. Tipos compartilhados (prontos em `src/types/discovery.ts`)
`DiscoveryKind`, `DiscoveryStatus`, `DiscoveryState`, `DiscoverySource`, `KnowledgeDiscovery`, `DiscoveryAvailability`, `MotherStock`, `ScanResult`. `PiecePlan.discovery_ids?: string[]`.

## 3. Função `library-scan` (frente B)

`supabase/functions/library-scan/index.ts` + lógica pura em `supabase/functions/_shared/discovery.ts`.

**Autenticação:** `userIdFromAuth(req)` (app) ou `internalUserId(req)` (cron: service role + `x-bee-user-id`). Ação `tick` só com a service role **sem** `x-bee-user-id` → percorre usuários; qualquer outra ação exige um usuário. Rate limit `checkRateLimit(userId, 60_000, 10)` no modo app. `logUsage` com `metadata.fn = 'library-scan'` e `action`.

**Entrada / saída** (`jsonResponse`, sempre `success: true` no ok):
| action | corpo | faz | resposta |
| --- | --- | --- | --- |
| `tick` | `{action:'tick'}` | até 3 lotes no total, documentos mais antigos primeiro, de qualquer usuário com chave Gemini; para no primeiro 429 | `ScanResult` |
| `scan` | `{action:'scan', document_id}` | próximo lote daquele documento do usuário | `ScanResult` |
| `propose_mothers` | `{action:'propose_mothers'}` | agrupa soltas do usuário e propõe até 2 mães | `ScanResult` |

**Lote:** 12 trechos consecutivos (`chunk_index >= next_chunk`). Claim em `knowledge_analysis_runs` (`claim` uuid, `status='running'`, `started_at`); claim com mais de 10 min é retomável. Depois do lote: `next_chunk += 12`, `found += n`; `status='completed'` e `finished_at` quando `next_chunk >= chunk_count`. Documento `archived` não entra.

**Descoberta gravada:** `user_id`, `brand_id` (do documento), `document_id`, `title`, `summary`, `excerpt`, `kind`, `tags`, `chunk_id`, `sources = [{document_id, chunk_id, chunk_index, title: documento.title}]`, `status='active'`. Conflito `(user_id, document_id, title)` → ignorar.

**Ligação ao mãe:** depois do lote, para cada descoberta nova: embedding do trecho (`knowledge_chunks.embedding`) × `contents.mother_embedding` dos mães **validados** do usuário (contents com versão `validated` em `content_base_versions`). Calcula/atualiza `mother_embedding` quando falta ou `mother_embedding_hash` ≠ `hashText(frase+texto)` (`embedText` de `_shared/embed.ts`, `RETRIEVAL_DOCUMENT`, 1536). Liga (`content_id`, `link_similarity`) se a melhor similaridade ≥ `LINK_THRESHOLD = 0.78`.

**Proposta de mãe:** soltas (`status='active'`, `content_id is null`) agrupadas por `groupLoose`; para cada grupo (máx. 2 por chamada) a IA escreve `{title, frase, texto}` amplo (não é post; sem caso real/nome; 900–2500 caracteres no texto). Grava `contents` com `status='pending_validation'`, `validation_format='knowledge_base'`, `body={frase,texto}`, `profile_id` = perfil padrão da marca do documento (`communication_profiles` `is_default desc, created_at asc`), `metadata={purpose:'knowledge_base', origin:'discovery', discovery_ids:[...]}`, `versions=[]`, `position=0`; e marca as descobertas do grupo `status='drafted'`, `content_id = novo id`.

**Puro em `_shared/discovery.ts`** (exportar exatamente):
```ts
export const SCAN_BATCH = 12;
export const LINK_THRESHOLD = 0.78;
export const DISCOVERY_KINDS = ['caso','conceito','pergunta','dado','historia','pratica'] as const;
export function scanPrompt(doc: {title: string}, chunks: {chunk_index: number; content: string}[]): { sys: string; usr: string };
export function parseDiscoveries(data: unknown, chunks: {id: string; chunk_index: number; content: string}[]):
  Array<{ title: string; summary: string; excerpt: string; kind: typeof DISCOVERY_KINDS[number]; tags: string[]; chunk_id: string; chunk_index: number }>;
  // descarta item inválido (não lança): título 1–240, resumo 1–1200, excerpt literal (comparação com espaços normalizados) do trecho indicado, ≤ 600; kind da lista; tags minúsculas, 1–6, ≤ 40 caracteres cada; máx. 4 itens por lote; sem título repetido
export function cosine(a: number[], b: number[]): number;
export function parseVector(v: unknown): number[] | null;   // aceita "[0.1,...]" (pgvector via REST) ou number[]
export function pickMother(chunkVec: number[], mothers: {id: string; vec: number[]}[], threshold?: number): { content_id: string; similarity: number } | null;
export function groupLoose(items: {id: string; vec: number[]; tags: string[]}[], opts?: {threshold?: number; minSize?: number; maxSize?: number}): string[][];
  // guloso, determinístico pela ordem de entrada; threshold padrão 0.82, minSize 3, maxSize 8
export function motherPrompt(group: {title: string; summary: string; excerpt: string; kind: string}[]): { sys: string; usr: string };
export function parseMother(data: unknown): { title: string; frase: string; texto: string } | null;
```
Testes: `e2e/unit-discovery.spec.ts` (importa de `../supabase/functions/_shared/discovery`; o arquivo não pode importar nada de Deno).

## 4. Front do estoque (frente C)

- `src/lib/discoveryApi.ts` (REST via `db` de `@/lib/db`, como o resto):
```ts
export const discoveryApi = {
  list(filter?: { content_id?: string | null; document_id?: string; status?: DiscoveryStatus; loose?: boolean }): Promise<KnowledgeDiscovery[]>;
  availability(): Promise<DiscoveryAvailability[]>;
  dismiss(id: string): Promise<void>;                     // status 'dismissed'
  update(id: string, patch: { title?: string; tags?: string[]; content_id?: string | null }): Promise<KnowledgeDiscovery>;
  scanNow(documentId: string): Promise<ScanResult>;      // edge library-scan action 'scan'
  proposeMothers(): Promise<ScanResult>;                 // edge library-scan action 'propose_mothers'
};
```
  Chamar a função pelo mesmo mecanismo de `src/lib/edge.ts` (acrescentar `edge.libraryScan(input)` lá; é o único trecho de `edge.ts` que a frente C muda).
- `src/lib/campaign/stock.ts` (puro):
```ts
export function motherStock(contentId: string, discoveries: KnowledgeDiscovery[], availability: DiscoveryAvailability[]): MotherStock;
export function freeDiscoveries(contentId: string, discoveries: KnowledgeDiscovery[], availability: DiscoveryAvailability[]): KnowledgeDiscovery[];
// esgotado = 0 livres; ignora dismissed; ordem: livres primeiro por created_at asc
```
- Tela **Descobertas**: rota `biblioteca/descobertas` (em `src/App.tsx`), página `src/pages/biblioteca/Descobertas.tsx`, link "Ver descobertas" em `Biblioteca.tsx`. Lista com filtros (tag, tipo, documento, "soltas"), trecho e origem, ações descartar e corrigir título/tags; botão "Varrer agora" por documento. Estados de vazio ("A varredura ainda não chegou nos seus documentos…"), carregando e erro (`LoadError`).
- **Conteúdos-mãe** (`src/pages/conhecimento/MotherContents.tsx`): por mãe, "N materiais ainda não usados" ou "Esgotado" (via `motherStock`); no detalhe, lista do material (livre/reservado/usado). Seção "Propostos pela Hive" (contents com `metadata.origin === 'discovery'` e `status !== 'validated'`): validar em lote, editar, descartar (`status='discarded'` + descobertas de volta a `active`, `content_id=null`). Validar uma proposta reusa o caminho atual: `startAvulso` → `contentApi.update(id,{campaign_id,cycle_id,idea_id})` → `baseApi.validate`.
- Testes: `e2e/unit-stock.spec.ts`.

## 5. Campanha e produção (frente D)

- `ProductionItem` (em `src/lib/campaign/production-plan.ts`) ganha `discovery_ids: string[]` (0–2). `productionProblems(items, bases, caps, families, editorials, available?: Map<string, string[]>)`: com `available` (mãe → ids livres), recusa `discovery_ids` fora do mãe, não livre ou repetido no lote (`Peça N: escolha material ainda não usado deste conteúdo-mãe.`).
- `_shared/cycle-production.ts` `recommendCycleProduction`: as bases passam a ser **o estoque**: mães validados do usuário (contents com versão `validated`; `body` da última versão validada) que tenham ≥ 1 descoberta `livre` (view) — mais os já adotados no ciclo. Cada base vai com `material: [{id, title, summary, excerpt, kind}]` (até 6 livres) e o `ja_publicado` atual. Regra no texto que a IA recebe: cada item usa 1–2 `discovery_ids` do material do próprio mãe, que nenhum outro item do lote usa; mãe sem material não entra; se faltar estoque, dizer no `summary`. Resposta: `items[].discovery_ids` e `items[].version_id` (versão validada usada).
- `_shared/production-novelty.ts` `usableProductionProposals(raw, choices)`: `choices` ganha `material: ReadonlyMap<string, readonly string[]>` (mãe → ids livres); item sem 1–2 ids válidos do próprio mãe, ou repetindo id usado por item anterior aceito, é descartado. Manter o resto do comportamento e os testes existentes.
- `sequence-script` (`image` e `script`, fluxo `base_v2`): ler `content_piece_plans.discovery_ids` do plano → `knowledge_discoveries` (title, summary, excerpt, kind) e acrescentar ao texto que a IA recebe o bloco `MATERIAL NOVO DESTA PEÇA` com a regra: desenvolver a peça a partir desse material; caso real vira princípio ou exemplo explicitamente fictício; nada de nomes.
- Front:
  - `src/pages/producao/Production.tsx`: no fluxo novo (`archiveFlow`), não mostrar mais o `CampaignBasePicker`; ir direto ao `ProductionHub`.
  - `ProductionHub.tsx`: `bases` = estoque (`baseApi.catalog()` validados) em vez de só o ciclo; cada recorte mostra o conteúdo-mãe e o material (título + tipo); "Trocar" no item abre a escolha de outro mãe e de 1–2 materiais livres; aviso de estoque insuficiente com link para `/conteudos-mae`.
  - `production-api.ts` `approve`: para cada mãe dos itens que ainda não está no ciclo, `baseApi.adopt(version_id, cycle.id)` antes do RPC; `p_bases` com o `version_id`; `p_items` levam `discovery_ids`.
- Testes: casos novos em `e2e/unit-production-plan.spec.ts` (`usableProductionProposals` com material e `productionProblems` com `available`).

## 6. E2E (orquestrador, no fim)
`e2e/f35-estoque-vivo.spec.ts` com `mockEdge` (`library-scan`, `sequence-script`), tabelas novas no cleanup (`knowledge_discoveries`, `knowledge_analysis_runs` em `E2E_OWNED_TABLES`), ajustes em `f29`/`f33` se a tela da produção mudar.

## 7. Arquivos por frente
- **A · Banco:** `supabase/migrations/20261125000001_estoque_vivo.sql`, `supabase/rollback/20261125000001_estoque_vivo_rollback.sql`, `e2e/local/bootstrap.mjs`.
- **B · Varredura:** `supabase/functions/library-scan/index.ts`, `supabase/functions/_shared/discovery.ts`, `e2e/unit-discovery.spec.ts`.
- **C · Front do estoque:** `src/lib/discoveryApi.ts`, `src/lib/edge.ts` (só `libraryScan`), `src/lib/campaign/stock.ts`, `src/pages/biblioteca/Descobertas.tsx`, `src/pages/biblioteca/Biblioteca.tsx`, `src/App.tsx` (só a rota), `src/pages/conhecimento/MotherContents.tsx`, `e2e/unit-stock.spec.ts`.
- **D · Campanha e produção:** `supabase/functions/_shared/cycle-production.ts`, `supabase/functions/_shared/production-novelty.ts`, `supabase/functions/sequence-script/index.ts`, `src/lib/campaign/production-plan.ts`, `src/lib/campaign/production-api.ts`, `src/components/production/ProductionHub.tsx`, `src/pages/producao/Production.tsx`, `e2e/unit-production-plan.spec.ts`.
