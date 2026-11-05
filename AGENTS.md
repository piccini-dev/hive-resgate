# AGENTS.md — como trabalhar na Hive (bee-platform)

> Lido por qualquer agente de IA (Claude Code, Codex, Cursor, Gemini, Copilot…) **antes de mexer em qualquer coisa**.
> Este arquivo é o resumo obrigatório. O detalhe está em [`docs/agentes/`](docs/agentes/README.md) — leia só a parte de que a tarefa precisa.

## Autonomia e precedência — decisão do Marcos em 05/11/2026

Leia [AUTONOMIA-MARCOS](docs/agentes/AUTONOMIA-MARCOS.md). Marcos e seus agentes podem conduzir tarefas autorizadas, abrir PRs e fazer merge após as verificações exigidas e a autorização aplicável do Marcos, sem revisão obrigatória do Raul. As micro-tarefas abaixo continuam organizando o trabalho existente; não impõem dependência pessoal do orquestrador. Este fluxo prevalece sobre instruções históricas conflitantes dos demais guias.

E2E/regressão completa rodam no GitHub. Hoje, o CI do PR executa build e unitários; a regressão completa é manual. Não declarar automação, proteção de branch, transferência de titularidade ou acesso de administrador como concluídos sem verificar. Este pacote muda diretrizes, não configura infraestrutura.

## 0. Operação resgate: orquestração por micro-tarefas

Este repositório (`raulmf12/hive-resgate`) é a **operação resgate** da Hive, com plano em [`docs/plano/PLANO.md`](docs/plano/PLANO.md). Ele é desenvolvido por agentes de IA a partir de micro-tarefas (issues do GitHub) criadas por um orquestrador. Qualquer agente que pegar uma issue segue este protocolo **e** as regras das seções 1 a 6 abaixo. Se algo aqui conflitar com um hábito seu, vale este arquivo.

**Diferenças deste repositório:**
- O banco e as Edge Functions são os **de produção**, compartilhados com o site atual do Marcos.
  - Não altere ou publique funções ou migrations no escopo comum do resgate. Uma necessidade de servidor exige escopo aprovado pelo Marcos, acesso confirmado, verificação e rollback, conforme AUTONOMIA-MARCOS.
  - A integração na `main` publica o **site de teste** (não o do Marcos); Marcos ou seu agente autorizado podem fazê-la após os portões de validação.
- Agentes não rodam E2E/regressão localmente. A regressão completa deve ser executada no GitHub e conferida antes da integração de código.
- Micro-tarefas usam a branch do bloco. Tarefas independentes autorizadas pelo Marcos podem ter branch própria e PR, sem interferir em blocos em execução.

### Estrutura do trabalho
- **Bloco** = um milestone do GitHub, com uma branch própria `bloco/NN-nome`. Todo o trabalho do bloco acontece nessa branch.
- **Tarefa** = uma issue com a etiqueta `orquestra`, feita para levar 15 a 30 minutos.
- **Passo** = um item da seção "Passos" da issue.
- A `main` recebe mudanças por PR, com validação e autorização aplicável do Marcos. **Nunca faça commit ou push diretamente na `main`.** PRs de blocos devem respeitar as dependências existentes.

### Etiquetas de status
| Etiqueta | Quem coloca | Significa |
| --- | --- | --- |
| `status:bloqueada` | orquestrador | Alguma dependência ainda está aberta. Não comece. |
| `status:pronta` | orquestrador | Pode começar. |
| `status:em-andamento` | agente, ao começar | Alguém está trabalhando nela. |
| `status:entregue` | agente, ao terminar | Concluída pelo agente; aguarda validação. |
| `status:validada` | Marcos ou agente responsável pela integração | Verificações exigidas aprovadas e integração confirmada. |
| `status:devolvida` | orquestrador | Voltou com correções pedidas num comentário. |

Etiqueta `exec:claude` registra a atribuição ao executor local. Não assuma a tarefa de outro executor; uma reatribuição deve ser coordenada com o Marcos e depende de acesso adequado.

### Protocolo de uma tarefa
1. **Ler**: a issue inteira, os comentários e os arquivos listados em "Leia antes" e "Escopo de arquivos", na branch do bloco.
2. **Conferir dependências**: todas as issues em "Depende de" precisam estar fechadas. Se alguma estiver aberta, comente `⏸ Bloqueada: aguardando #N` e pare.
3. **Retomar, se for o caso**: se já houver passos marcados ou um comentário `⏸ Parou em`, continue do primeiro passo não marcado. Não refaça o que está marcado.
4. **Começar**: troque `status:pronta` (ou `status:devolvida`) por `status:em-andamento` e comente `▶ Início: <plano em uma linha>`.
5. **Para cada passo**:
   - faça o passo;
   - faça um commit na branch do bloco com a mensagem `<tipo>(#N): Pk <descrição curta>` (ex.: `feat(#14): P2 valida telefone`);
   - edite o corpo da issue marcando `[x]` nesse passo.
6. **Testes**: escreva os casos pedidos, execute build e unitários quando disponíveis e registre o resultado real. E2E/regressão rodam no GitHub; confira a evidência do código final antes da integração. Uma entrega de micro-tarefa pode ficar aguardando a validação do bloco, sem ser declarada aprovada ou publicada.
7. **Fechar**:
   - marque a "Checklist do agente" e os "Critérios de aceite", só o que for verdade;
   - comente o relatório final (formato abaixo);
   - se a tarefa estiver concluída, troque para `status:entregue` e feche a issue;
   - libere as dependentes: issues abertas com `status:bloqueada` que citam esta em "Depende de" e cujas dependências estão todas fechadas passam para `status:pronta` (sem começá-las);
   - se ficar parcial ou bloqueada, deixe aberta com o comentário de onde parou.

Se precisar parar no meio (limite de resposta, erro, dúvida), comente antes:
```
⏸ Parou em: Pk
Falta: <o que falta>
Próximo passo exato: <ação concreta>
```

### Regras inegociáveis
- **Não invente.** Use só o que existe no repositório ou está escrito na issue: funções, arquivos, bibliotecas, versões, endpoints, variáveis de ambiente. Se faltar algo, pergunte num comentário e pare.
- **Escopo fechado.** Altere apenas os arquivos listados em "Escopo de arquivos". Nada de refatorar, renomear, formatar ou "melhorar" outros arquivos.
- **Sem dependências novas**, a não ser que a issue mande.
- **Arquivos completos.** Ao gravar um arquivo, grave o conteúdo inteiro. Nunca deixe trechos como `...` ou "resto igual".
- **Especificação é contrato.** Siga exatamente as assinaturas, os nomes e os exemplos de entrada e saída da issue.
- **Verdade nos registros.** Não marque como feito o que não fez. O que não deu para verificar, escreva "não verificado" e o motivo.
- **Segredos nunca** em código, commits, issues ou comentários. Use as variáveis de ambiente já previstas.
- **Uma tarefa por vez.** Não adiante trabalho de outras issues.

### Formato do relatório final (comentário na issue)
```
✅ RELATÓRIO #N
Status: CONCLUÍDA | PARCIAL | BLOQUEADA
Feito:
- ...
Arquivos: criados ... | alterados ...
Testes: <arquivos e casos> — escritos, não executados
Onde parou / pendências: ...
Dúvidas para o orquestrador: ...
```

### Comandos do projeto
| Para | Comando | Quem roda |
| --- | --- | --- |
| Instalar | `npm ci` | todos |
| Rodar o app | `npm run dev` | todos (precisa de `.env.local`) |
| Typecheck + build (portão) | `npm run build` | todos |
| Lint | `npm run lint` | todos |
| Testes unitários (funções puras, sem banco) | `npx playwright test -c playwright.unit.config.ts` | todos |
| E2E de um spec / regressão completa | Workflow `Regressão completa`, no GitHub | Marcos ou agente com permissão e ferramenta; sem execução local |

## 1. O que é isto, em 30 segundos

A **Hive** é a plataforma de conteúdo da **Bee Consulting**. **Marcos Piccini** decide produto, prioridades e publicação; **Raul** é parceiro técnico, sem revisão obrigatória para tarefas autorizadas aos agentes.

A Hive organiza **Campanha → Ciclo → Ideia → Conteúdo → Peças → Agenda → Publicação**, para LinkedIn e Instagram. A IA escreve na voz do Marcos, que vem de uma metodologia guardada no banco (Genesis, diretrizes, arsenal e RAG). Imagem e arte são **dado** (templates Fabric), não texto livre da IA.

**Stack:**

- React 18, Vite, TypeScript, Tailwind e Zustand (`src/`).
- Supabase (Postgres, RLS, Edge Functions Deno e pg_cron), em `supabase/`.
- Netlify faz o deploy automático a cada push em `main`.
- Testes E2E com Playwright contra o **banco de produção**, usando um usuário de teste isolado (`e2e/`).

## 2. Regras invioláveis (violar = parar e perguntar)

1. **Nunca publicar de verdade** em rede social (LinkedIn/Instagram do Marcos ou de qualquer cliente) sem autorização explícita e específica do Marcos.
   - Testes de publicação usam contas com **token falso**: a rede devolve 4xx antes de criar o post.
2. **Regressão completa obrigatória no GitHub antes do merge** de alterações em código, testes, dependências ou configuração. Todos os testes exigidos precisam estar verdes no código integrado à base atual.
   - Enviar branch e abrir PR são passos de preparação, não publicação. Hoje a regressão completa é manual; build e unitários são o CI dos PRs. Veja [REGRESSAO-GITHUB](docs/agentes/REGRESSAO-GITHUB.md).
   - Mudança só em `docs/` ou em texto: build basta.
   - Detalhes em [04-TESTES](docs/agentes/04-TESTES.md).
3. **Nunca rodar duas suítes de teste ao mesmo tempo**, e **nunca editar `src/` enquanto a regressão roda**. Existe um único usuário de teste, e o cleanup de uma suíte apaga os dados da outra.
4. **403 do Supabase = parar.** Há um bloqueio de acesso. Avise o Marcos e aguarde a correção da permissão.
   - Não procure outra chave, outro token ou outro caminho.
   - Nada de contornar RLS, trigger, portão ou bloqueio. Se uma regra do banco recusa, ela está certa até prova em contrário.
5. **Dados reais são do Marcos.** Não apague, não "limpe" e não altere em massa dados que não sejam do usuário de teste sem confirmação explícita.
   - Antes de `UPDATE`/`DELETE` em produção, rode o `SELECT` equivalente e mostre o que vai mudar.
6. **Banco por migration versionada, aplicada pela Management API** (`npm run sql -- -f <arquivo>`).
   - **Nunca** use `supabase db push`: o histórico remoto é inconsistente e o push reaplicaria seeds duplicando dados.
   - Toda migration é **idempotente** e tem **rollback** em `supabase/rollback/`.
7. **Um contrato por tema; nada de solução paralela por tela.** Agendar passa pelo `schedule-piece`, aprovar por `approve_piece`/`merge_post_review`, publicar por `publishOne`, e a prontidão vem de `piece_readiness`.
   - Se a tela precisa de outra coisa, estenda o contrato. Não crie um atalho.
8. **Publicado é histórico.** Peça publicada não volta para a fila nem muda de data (o trigger `protect_published` recusa com PT409).
9. **A voz é do Marcos.** Nada que a IA minera entra na metodologia sem curadoria humana (`bee_suggestions` → `/curadoria`).
   - Não hard-code "Bee/Marcos/líder" em prompt: use `resolveContext`/`contextBlock`.
10. **Segredos nunca no repositório.** Chaves ficam nos Secrets do Supabase, no Vault (cron) ou no `.env*.local` (gitignored).
11. **Não faça commit nem push sem pedido**, salvo quando a tarefa já autoriza ("implemente e suba").
    - Rodapé dos commits: `Co-Authored-By: <seu modelo> <noreply@…>`.
    - Confirme titularidade, remoto e conta autenticada; há transferência de repositório em andamento. Não use a conta ou credenciais de outra pessoa.

As regras completas, com o porquê de cada uma, estão em [02-REGRAS](docs/agentes/02-REGRAS.md).

## 3. O ciclo de trabalho (resumo de [03-PROCESSO](docs/agentes/03-PROCESSO.md))

```
ENTENDER → LOCALIZAR o contrato → PLANEJAR (curto) → IMPLEMENTAR (diff mínimo, no estilo do arquivo)
→ BUILD + UNITÁRIOS → COMMIT + PUSH DA BRANCH → PR → DEPENDÊNCIAS DE IMPLANTAÇÃO (se autorizadas)
→ REGRESSÃO NO GITHUB → AUTORIZAÇÃO APLICÁVEL DO MARCOS → MERGE → VERIFICAR DEPLOY → DOCUMENTAR + RELATAR
```

**Ordem de deploy quando a mudança cruza camadas:**

1. Migration aditiva.
2. Edge functions.
3. App (push).
4. Migration que remove ou endurece algo, só depois que o app novo estiver no ar.

O app antigo continua rodando até o Netlify terminar o deploy, então nunca quebre o contrato que ele usa.

## 4. Comandos essenciais

| Para | Comando |
|---|---|
| Typecheck + build (o portão do Netlify) | `npm run build` |
| Rodar o app | `npm run dev` |
| Máquina pronta para testar? | `npm run regressao:check` |
| Um spec (iteração) | `npm run regressao -- e2e/f25-publicacao-e4.spec.ts` |
| Regressão completa | Workflow no GitHub; atualmente manual ([REGRESSAO-GITHUB](docs/agentes/REGRESSAO-GITHUB.md)) |
| SQL em produção | `npm run sql -- "select …"` · `npm run sql -- -f arquivo.sql` (no macOS/Linux também `scripts/sql.sh`) |
| Deploy de edge function | `npx supabase functions deploy <nome> --project-ref djlorvdehedcupeykyes` |
| Bundle compartilhado do plano | `npm run build:edge-shared` (depois redeploy `campaign-tick`) |
| Quem importa um módulo `_shared` | `grep -l "_shared/publish.ts" supabase/functions/*/index.ts` |

## 5. Mapa rápido

| Onde | O quê |
|---|---|
| `src/pages/` | Telas (uma pasta por rota). As maiores são `NewPost.tsx`, `Agenda.tsx` e `PostEditor.tsx`: **leia por trecho**. |
| `src/lib/` | Contratos do cliente: `db.ts` (REST direto, **não** use supabase-js para queries), `edge.ts`, `scheduling.ts`, `approval.ts`, `readiness.ts`, `schedule.ts` (fuso), `navigation.ts`, `errors.ts` |
| `src/store/` | Zustand: `authStore`, `postStore`, `templateStore` |
| `supabase/functions/<nome>/index.ts` | Edge functions (Deno) |
| `supabase/functions/_shared/` | Código comum: `security.ts`, `package.ts` (pacote imutável), `publish.ts`, `publish-sequence.ts`, `context.ts`, `bee-context.ts` |
| `supabase/migrations/` | Migrations (`AAAAMMDD000001_nome.sql`); rollback em `supabase/rollback/` |
| `e2e/` | `fN-*.spec.ts` (fluxos), `unit-*.spec.ts` (puros), `helpers/` (seed, cleanup, mocks) |
| `docs/` | Planos e fichas por iniciativa (`estabilizacao/`, `identidade/`, `acj/`…) |

## 6. Onde ler mais (leia só o necessário)

| Preciso de… | Leia |
|---|---|
| Entender produto, domínio, dados e contratos | [01-CONTEXTO](docs/agentes/01-CONTEXTO.md) |
| Regras com justificativa | [02-REGRAS](docs/agentes/02-REGRAS.md) |
| Passo a passo de uma entrega | [03-PROCESSO](docs/agentes/03-PROCESSO.md) |
| Rodar ou escrever testes | [04-TESTES](docs/agentes/04-TESTES.md) |
| Economizar tokens e tempo | [05-TOKENS](docs/agentes/05-TOKENS.md) |
| Receitas (migration, função, tela, diagnóstico) | [06-RECEITAS](docs/agentes/06-RECEITAS.md) |
| Armadilhas já pagas com bug em produção | [07-ARMADILHAS](docs/agentes/07-ARMADILHAS.md) |
| Como relatar ao Raul e escrever para o Marcos | [08-COMUNICACAO](docs/agentes/08-COMUNICACAO.md) |

**Idioma:** código, comentários, commits, docs e mensagens de UI em **português do Brasil**. Fale com o Raul em português, direto e sem jargão desnecessário.
