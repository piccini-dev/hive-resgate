# M01 · Prompts de execução

Branch: `marcos/01-marcas-contexto`.
Bloco criado sem milestone, conforme autorização do Marcos em 18/11/2026.
Todas as tarefas são `exec:gpt`; nenhuma exige o Raul. Apenas #102 e #103 estão liberadas neste momento.

## Ordem e estado inicial

| Issue | Tarefa | Estado | Depende de |
| --- | --- | --- | --- |
| [#102](https://github.com/piccini-dev/hive-resgate/issues/102) | Conferir o estado do banco para manutenção de marcas | pronta | — |
| [#103](https://github.com/piccini-dev/hive-resgate/issues/103) | Definir a seleção explícita da marca de trabalho | pronta | — |
| [#104](https://github.com/piccini-dev/hive-resgate/issues/104) | Preparar os contratos de manutenção de marcas | bloqueada | #102, #103 |
| [#105](https://github.com/piccini-dev/hive-resgate/issues/105) | Mostrar a marca de trabalho no contexto da Identidade | bloqueada | #103, #104 |
| [#106](https://github.com/piccini-dev/hive-resgate/issues/106) | Disponibilizar a manutenção de marcas | bloqueada | #104, #105 |
| [#107](https://github.com/piccini-dev/hive-resgate/issues/107) | Adicionar o acesso a Marcas na navegação | bloqueada | #105, #106 |
| [#108](https://github.com/piccini-dev/hive-resgate/issues/108) | Validar o bloco de marcas no GitHub | bloqueada | #102, #103, #104, #105, #106, #107 |

Cole cada prompt liberado numa conversa nova de execução. Cada conversa executa somente sua issue. Ao concluir, volte ao orquestrador para conferir relatórios e liberar os próximos prompts. A lista acima é o estado da criação; o GitHub é a fonte atual de status.

## Issue 102

````text
Você é um engenheiro de software sênior executando UMA micro-tarefa da Hive com a integração GitHub. Execute somente esta issue e registre cada avanço no GitHub.

REPOSITÓRIO: piccini-dev/hive-resgate
TAREFA: #102 — Conferir o estado do banco para manutenção de marcas
URL: https://github.com/piccini-dev/hive-resgate/issues/102
BRANCH: marcos/01-marcas-contexto (nunca main)
DEPENDÊNCIAS: nenhuma

1. ANTES DE ESCREVER
- Leia a issue inteira, comentários, AGENTS.md e docs/identidade/M01-MARCAS-CONTEXTO.md na branch do bloco. Leia todos os arquivos de Leia antes e Escopo.
- O Marcos autorizou execução sem Raul. A autorização específica está no documento do bloco e no corpo da issue. Não solicitar revisão/execução pessoal do Raul. Os demais limites continuam: nenhuma escrita em banco, DDL, função/deploy, alteração de dados reais, segredo, workflow, publicação social ou merge nesta tarefa.
- Confira dependências. Se aberta ou parecer técnico não for APTO_PARA_M01 quando exigido, comente "⏸ Bloqueada: aguardando #N", mantenha aberta e pare.
- Retome passos marcados e o último "⏸ Parou em"; não refaça trabalho concluído.
- Troque status:pronta/status:devolvida por status:em-andamento e comente "▶ Início: " com plano de uma linha.

2. ESCOPO E COMMITS
- Altere somente os arquivos delimitados; contratos e tipos devem seguir exatamente a issue. Novos arquivos/funções somente os explicitamente especificados. Nenhuma dependência nova.
- Um commit por passo: docs(#102): Pk descrição curta. Inclua o rodapé Co-Authored-By com seu modelo. Envie cada commit à branch do bloco; atualize [x] no passo da issue.
- Antes de gravar, releia o arquivo remoto e a ponta da branch para preservar mudanças concorrentes. Grave conteúdo completo, sem omissões.
- Se faltar arquivo que a issue diz que existe, contrato/acesso ou capacidade de gravação, comente a dúvida e pare. Não invente ou use outro token/chave.

3. TESTES
- Escreva os testes exigidos. Execute apenas build e testes puros explicitamente permitidos na seção Validação.
- Não execute E2E nem regressão localmente. Não consulte nem espere CI durante esta microtarefa.
- Registre teste executado versus apenas escrito. A validação integrada é #108, no GitHub, pelo orquestrador do Marcos.

4. RETOMADA OBRIGATÓRIA
Se interromper antes do fim, registre ANTES de sair:
"⏸ Parou em: Pk · Falta: ... · Próximo passo exato: ..."
Informe o mesmo aqui. Toda alteração já feita deve ficar em commit na branch, sem depender de cópia local.

5. AO TERMINAR
- Marque checklist e aceite somente quando verdadeiros.
- Comente na issue:
✅ RELATÓRIO #102
Status: CONCLUÍDA | PARCIAL | BLOQUEADA
Feito: lista
Arquivos: criados ... | alterados ...
Testes: casos, resultado e quais não foram executados
Onde parou / pendências: ...
Dúvidas para o orquestrador: ...
- Só se CONCLUÍDA: status:entregue e fechar. Se PARCIAL/BLOQUEADA, manter aberta com a pendência.
- Conferir dependentes status:bloqueada que citam esta issue; liberar para status:pronta somente quando TODAS as dependências estiverem concluídas/fechadas. Não começar outra issue.
- Responder no chat com o mesmo relatório e quais issues foram liberadas. Não fazer merge nem alterar main.

6. CÓPIA DA ISSUE
Se divergir, vale a versão atual do GitHub, com a autorização do Marcos documentada.
## Objetivo
Registrar o SQL recuperável da migration anterior e emitir um parecer objetivo sobre o contrato de marcas, sem alterar o banco.

## Contexto
- Bloco: M01 — Marcas e contexto da Identidade · branch `marcos/01-marcas-contexto` · **sem milestone**, autorizado pelo Marcos.
- Origem: Marcos · área: identidade · executor: exec:gpt. Sem dependência do Raul.
- Por que existe: separar marcas do produtor e preparar a organização da Identidade sem misturar contexto ou alterar materiais existentes.
- Base inspecionada: main `1ba8cfbc207b27bb1281db0953fc4244e8a67e4e`.
- Leia antes: `AGENTS.md`, `docs/identidade/M01-MARCAS-CONTEXTO.md` (autorização expressa e limites), `supabase/migrations/20261015000001_identidade_contextos.sql` (brands, workspace_members e RLS), `src/types/identity.ts`, `src/lib/identityApi.ts`, `src/components/identity/CreateWorkspaceCard.tsx`.
- A autorização do Marcos substitui somente a reserva pessoal de execução/revisão ao Raul neste bloco. Sem novo DDL, deploy ou alteração de dados reais autorizados por esta issue. Não fazer merge. Commits por passo enviados à branch do bloco são autorizados.

## Depende de
- Nenhuma

## Escopo de arquivos
- Criar: `docs/identidade/M01-AUDITORIA-BANCO.md`.
- Criar: `docs/identidade/M01-SQL-APLICADO.sql` (cópia documental, não executável pelo fluxo de migrations).
- Não tocar: qualquer outro arquivo; nenhuma operação de escrita no Supabase.

## Especificação
Conexão Bee Consulting, projeto `djlorvdehedcupeykyes`. Consultar somente metadados, não registros reais.
1. Recuperar `version,name,statements` de `supabase_migrations.schema_migrations WHERE version='20261117143519'`. Gravar o SQL integral recuperado, sem tokens/dados privados, no arquivo documental; não reaplicar nem mover para migrations como nova alteração.
2. Conferir pg_proc/pg_get_functiondef de `set_brand_archived(p_brand uuid, p_archived boolean) RETURNS public.brands`, permissões EXECUTE, RLS de brands/workspace_members e colunas/defaults/constraints. Não copiar nomes ou IDs reais para o relatório.
3. Contrato esperado no cliente: `Brand` de `src/types/identity.ts`; cadastro via REST em brands com workspace explícito; edição só name/essence; arquivar/restaurar somente pelo RPC. Workspace próprio e marca inicial usam `create_my_workspace(p_workspace text,p_brand text)` já chamado em CreateWorkspaceCard; ele não serve para segunda marca em workspace existente.
4. Confirmar a recusa PT404 para marca indisponível e PT409 para vínculos em andamento, sem invocar RPC mutante em marcas reais. Verificar o corpo do RPC, não inferir autorização pelos tipos do front.
5. Auditar as outras mudanças da migration (approve_cycle_production, acj_piece_inherit, tabelas novas, RLS/FKs) e registrar riscos de compatibilidade/cleanup em seção separada. Não corrigir nesta tarefa.
6. Parecer: `APTO_PARA_M01` somente se o contrato existente atende às operações delimitadas. Se não atender, relatório `CORRECAO_REQUERIDA`, issue PARCIAL aberta e dependentes bloqueadas. Descrever correção exata para nova issue, não chamar Raul.
7. Reversão operacional do M01: não integrar o novo front e manter o anterior; nenhum rollback/DELETE/DROP em banco autorizado. O SQL recuperado é documentação do estado já aplicado, não uma nova migration. Registrar que reconstrução de rollback integral do pacote anterior exige conferência própria e fica fora desta microtarefa.

| Entrada | Saída esperada |
| --- | --- |
| Histórico contém versão 20261117143519 | SQL integral registrado, nenhuma execução |
| RPC compatível com archive/restore e vínculos protegidos | Parecer APTO_PARA_M01, com evidências |
| RPC/GRANT ausente ou diferença relevante | CORRECAO_REQUERIDA; não fechar nem liberar dependentes |

## Passos (marque cada um ao concluir, com um commit por passo)
- [ ] P1 Recuperar e registrar o SQL do histórico, sem executá-lo
- [ ] P2 Registrar os contratos, consultas de conferência e riscos de compatibilidade
- [ ] P3 Emitir parecer e registrar testes de auditoria e reversão operacional

## Testes obrigatórios
- Arquivo: `docs/identidade/M01-AUDITORIA-BANCO.md` (testes de auditoria SQL somente leitura, com nome, consulta, resultado e data).
- Caso: AUD01: versão aplicada recuperável, sem duplicação no histórico
- Caso: AUD02: assinatura, grants e guarda de vínculos do RPC conferidos
- Caso: AUD03: RLS e workspace explícito em brands conferidos
- Caso: AUD04: nenhuma escrita ou dado real no relatório
- Caso: AUD05: compatibilidade e FKs da migration anterior descritas, sem chamar de resolvidas se não verificadas

## Validação
`npm run build` (somente documentação). Executar apenas SELECTs de metadados pela conexão autorizada; registrar as consultas exatas e resultados agregados. Não executar DDL, RPC mutante nem E2E nesta issue.
Não confundir criação desta issue com implementação, teste ou publicação. Se não puder verificar, registrar 'não verificado' e o motivo.

## Critérios de aceite
- [ ] SQL documental corresponde ao histórico remoto e não foi reaplicado
- [ ] Parecer e riscos permitem à próxima issue decidir sem adivinhação
- [ ] Sem dados privados, alterações de banco ou declaração de regressão executada

## Checklist do agente (preencher ao final; só marque o que for verdade)
- [ ] Li AGENTS.md, a issue, os comentários e todos os arquivos de Leia antes
- [ ] Conferi que as dependências estavam fechadas
- [ ] Alterei somente os arquivos do escopo
- [ ] Não inventei contratos ou dependências fora da especificação
- [ ] Um commit por passo na branch do bloco, com passos marcados nesta issue
- [ ] Testes exigidos escritos e resultados reais registrados (não executado quando aplicável)
- [ ] Relatório final comentado nesta issue

## Se travar
Comentar `⏸ Parou em: Pk · Falta: ... · Próximo passo exato: ...` e manter aberta. Não improvisar contrato nem ampliar escopo. Se concluída, usar status:entregue, fechar e liberar apenas dependentes cujas dependências estejam todas concluídas. Relatório: Status CONCLUÍDA | PARCIAL | BLOQUEADA; Feito; Arquivos; Testes (executados ou só escritos); Pendências; Dúvidas.

## Fora do escopo
Correções de SQL/RLS, rollback executado, Edge Functions, migração de acervo, campanhas/peças reais, geração e menus.

````

## Issue 103

````text
Você é um engenheiro de software sênior executando UMA micro-tarefa da Hive com a integração GitHub. Execute somente esta issue e registre cada avanço no GitHub.

REPOSITÓRIO: piccini-dev/hive-resgate
TAREFA: #103 — Definir a seleção explícita da marca de trabalho
URL: https://github.com/piccini-dev/hive-resgate/issues/103
BRANCH: marcos/01-marcas-contexto (nunca main)
DEPENDÊNCIAS: nenhuma

1. ANTES DE ESCREVER
- Leia a issue inteira, comentários, AGENTS.md e docs/identidade/M01-MARCAS-CONTEXTO.md na branch do bloco. Leia todos os arquivos de Leia antes e Escopo.
- O Marcos autorizou execução sem Raul. A autorização específica está no documento do bloco e no corpo da issue. Não solicitar revisão/execução pessoal do Raul. Os demais limites continuam: nenhuma escrita em banco, DDL, função/deploy, alteração de dados reais, segredo, workflow, publicação social ou merge nesta tarefa.
- Confira dependências. Se aberta ou parecer técnico não for APTO_PARA_M01 quando exigido, comente "⏸ Bloqueada: aguardando #N", mantenha aberta e pare.
- Retome passos marcados e o último "⏸ Parou em"; não refaça trabalho concluído.
- Troque status:pronta/status:devolvida por status:em-andamento e comente "▶ Início: " com plano de uma linha.

2. ESCOPO E COMMITS
- Altere somente os arquivos delimitados; contratos e tipos devem seguir exatamente a issue. Novos arquivos/funções somente os explicitamente especificados. Nenhuma dependência nova.
- Um commit por passo: feat(#103): Pk descrição curta. Inclua o rodapé Co-Authored-By com seu modelo. Envie cada commit à branch do bloco; atualize [x] no passo da issue.
- Antes de gravar, releia o arquivo remoto e a ponta da branch para preservar mudanças concorrentes. Grave conteúdo completo, sem omissões.
- Se faltar arquivo que a issue diz que existe, contrato/acesso ou capacidade de gravação, comente a dúvida e pare. Não invente ou use outro token/chave.

3. TESTES
- Escreva os testes exigidos. Execute apenas build e testes puros explicitamente permitidos na seção Validação.
- Não execute E2E nem regressão localmente. Não consulte nem espere CI durante esta microtarefa.
- Registre teste executado versus apenas escrito. A validação integrada é #108, no GitHub, pelo orquestrador do Marcos.

4. RETOMADA OBRIGATÓRIA
Se interromper antes do fim, registre ANTES de sair:
"⏸ Parou em: Pk · Falta: ... · Próximo passo exato: ..."
Informe o mesmo aqui. Toda alteração já feita deve ficar em commit na branch, sem depender de cópia local.

5. AO TERMINAR
- Marque checklist e aceite somente quando verdadeiros.
- Comente na issue:
✅ RELATÓRIO #103
Status: CONCLUÍDA | PARCIAL | BLOQUEADA
Feito: lista
Arquivos: criados ... | alterados ...
Testes: casos, resultado e quais não foram executados
Onde parou / pendências: ...
Dúvidas para o orquestrador: ...
- Só se CONCLUÍDA: status:entregue e fechar. Se PARCIAL/BLOQUEADA, manter aberta com a pendência.
- Conferir dependentes status:bloqueada que citam esta issue; liberar para status:pronta somente quando TODAS as dependências estiverem concluídas/fechadas. Não começar outra issue.
- Responder no chat com o mesmo relatório e quais issues foram liberadas. Não fazer merge nem alterar main.

6. CÓPIA DA ISSUE
Se divergir, vale a versão atual do GitHub, com a autorização do Marcos documentada.
## Objetivo
Disponibilizar funções puras que escolham somente marcas disponíveis e preservem o contexto nos links.

## Contexto
- Bloco: M01 — Marcas e contexto da Identidade · branch `marcos/01-marcas-contexto` · **sem milestone**, autorizado pelo Marcos.
- Origem: Marcos · área: identidade · executor: exec:gpt. Sem dependência do Raul.
- Por que existe: separar marcas do produtor e preparar a organização da Identidade sem misturar contexto ou alterar materiais existentes.
- Base inspecionada: main `1ba8cfbc207b27bb1281db0953fc4244e8a67e4e`.
- Leia antes: `AGENTS.md`, `docs/identidade/M01-MARCAS-CONTEXTO.md` (autorização expressa e limites), `src/types/identity.ts` (Brand), `src/lib/navigation.ts` (convenções de navegação), `playwright.unit.config.ts` (testMatch explícito).
- A autorização do Marcos substitui somente a reserva pessoal de execução/revisão ao Raul neste bloco. Sem novo DDL, deploy ou alteração de dados reais autorizados por esta issue. Não fazer merge. Commits por passo enviados à branch do bloco são autorizados.

## Depende de
- Nenhuma

## Escopo de arquivos
- Criar: `src/lib/identity/brand-context.ts`.
- Criar: `e2e/unit-identity-context.spec.ts`.
- Alterar: `playwright.unit.config.ts` (acrescentar somente identity-context ao testMatch).
- Não tocar: qualquer outro arquivo.

## Especificação
Exportar:
```ts
export interface BrandSelection { brand: Brand | null; invalidRequested: boolean }
export function resolveBrandSelection(brands: readonly Brand[], requestedId: string | null, rememberedId: string | null): BrandSelection;
export function brandContextUrl(path: string, params: URLSearchParams, brandId: string): string;
export function brandStorageKey(userId: string): string;
```
Importar Brand apenas como tipo. Sem React, Supabase, fetch, storage ou variáveis globais mutáveis.
- Excluir status archived antes de resolver.
- requestedId !== null tem prioridade absoluta: se não existe/está arquivada, devolver brand:null e invalidRequested:true, inclusive string vazia. Não trocar silenciosamente para outra marca.
- Sem pedido explícito: marca lembrada disponível; senão primeira is_default disponível; senão primeira marca disponível; sem nenhuma, null/false.
- brandContextUrl recebe pathname interno começando com / e sem host; clonar params, setar marca=brandId, manter todos os demais parâmetros e não mutar a entrada. Recusar path externo, //, query ou hash embutidos com Error('Caminho de contexto inválido.'); parâmetros pertencem ao argumento params.
- brandStorageKey retorna `hive.identity.brand:` seguido do userId. Não compartilhar preferência entre usuários.
- Não alterar identityApi.defaultBrandId nem interpretação de campanhas já criadas.

| Entrada | Saída esperada |
| --- | --- |
| [A padrão,B], requested=B, remembered=A | B/false |
| [A], requested=X | null/true |
| [A padrão,B], requested=null, remembered=B | B/false |
| [A archived], requested=null | null/false |
| /identidade/marcas, aba=ativas, B | /identidade/marcas?aba=ativas&marca=B |

## Passos (marque cada um ao concluir, com um commit por passo)
- [ ] P1 Implementar a resolução de marca e a chave por usuário
- [ ] P2 Implementar a construção de URL sem mutação dos parâmetros
- [ ] P3 Escrever os testes puros e incluir o arquivo no testMatch

## Testes obrigatórios
- Arquivo: `e2e/unit-identity-context.spec.ts`.
- Caso: seleção explícita prevalece sobre preferência e padrão
- Caso: marca explícita desconhecida, vazia ou arquivada não provoca fallback
- Caso: preferência inválida usa padrão disponível
- Caso: lista vazia retorna contexto vazio
- Caso: URL mantém parâmetros e não modifica entrada
- Caso: URL externa ou com query/hash embutidos é recusada
- Caso: chave distingue dois usuários

## Validação
`npm run build` e `npx playwright test -c playwright.unit.config.ts e2e/unit-identity-context.spec.ts`. Sem banco, navegador, E2E ou consulta a CI.
Não confundir criação desta issue com implementação, teste ou publicação. Se não puder verificar, registrar 'não verificado' e o motivo.

## Critérios de aceite
- [ ] Todas as assinaturas e prioridades descritas estão implementadas
- [ ] Nenhuma leitura/gravação real ou mudança de marca padrão
- [ ] Testes passam com configuração pura do repositório

## Checklist do agente (preencher ao final; só marque o que for verdade)
- [ ] Li AGENTS.md, a issue, os comentários e todos os arquivos de Leia antes
- [ ] Conferi que as dependências estavam fechadas
- [ ] Alterei somente os arquivos do escopo
- [ ] Não inventei contratos ou dependências fora da especificação
- [ ] Um commit por passo na branch do bloco, com passos marcados nesta issue
- [ ] Testes exigidos escritos e resultados reais registrados (não executado quando aplicável)
- [ ] Relatório final comentado nesta issue

## Se travar
Comentar `⏸ Parou em: Pk · Falta: ... · Próximo passo exato: ...` e manter aberta. Não improvisar contrato nem ampliar escopo. Se concluída, usar status:entregue, fechar e liberar apenas dependentes cujas dependências estejam todas concluídas. Relatório: Status CONCLUÍDA | PARCIAL | BLOQUEADA; Feito; Arquivos; Testes (executados ou só escritos); Pendências; Dúvidas.

## Fora do escopo
Interface, persistência em storage, consultas ao banco, alteração de perfis/campanhas e novas dependências.

````
