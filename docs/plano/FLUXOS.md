# FLUXOS — linha de base dos fluxos principais (antes do resgate)

> Medição da issue #5 (bloco 01), feita em 2026-11-04 no app local (`npm run dev`, branch `bloco/01-base-resgate`), logado como o **usuário de teste E2E** (`e2e-hive`). Banco e Edge Functions de produção, IA de verdade.
> Serve de "antes" para o bloco 09: cada número aqui deve cair depois do resgate.

## Como foi medido

- **Desktop:** janela do Chrome com viewport de 1920 × 911 px (a janela não reduziu para 1440; o layout é o mesmo acima de 1280).
- **Celular:** o mesmo app num iframe de 375 × 740 px (o Chrome não estreita a janela abaixo de ~500 px). As telas foram abertas e roladas; as ações com IA foram feitas só no desktop, para não gerar tudo duas vezes.
- **Contagens** a partir da tela Início, sem contar rolagem:
  - **telas** = vistas diferentes (passos de assistente contam como telas);
  - **cliques** = cliques em botão ou link (digitar num campo não conta; ele entra em **campos**);
  - **decisões** = escolhas que o Marcos precisa fazer ou confirmar, inclusive aceitar uma sugestão da IA.
- **Tempo** = relógio, do primeiro clique até o fim do fluxo. "IA" = parte do tempo em que a tela só espera a IA.
- **Preparação:** o usuário de teste estava sem contas sociais. Com o ok do Raul, foram criadas as duas contas falsas dos testes (`seedAccounts()`: token falso, a rede recusa antes de publicar).
- **Nada foi publicado.** Os fluxos param antes de qualquer publicação real (regra 1).

## Resumo

| Fluxo | Telas | Cliques | Campos | Decisões | Tempo (IA) | Celular |
|---|---|---|---|---|---|---|
| F1 Campanha → 1ª peça aprovada | 13 | 14 | 1 | 9 | ~9 min (~8 min) | Funciona; "Aprovar conteúdo" fica a ~4 telas de rolagem |
| F2 Um conteúdo → aprovado | 6 | 6 | 2 de 8 | 4 | ~4 min 30 s (~1 min 40 s) | Funciona; formulário longo com 8 campos |
| F3 Vídeo → peça aprovada | 7 | 6 | 3 de 9 | 7 | ~2 min (~35 s) | Passos 1–2 cabem; 3–4 não verificados no celular |
| F4 Agendar uma peça aprovada | 2 | 3 | 0 | 2 | ~1 min 30 s (sem IA) | Calendário corta a semana em Dom–Ter; arrastar não funciona no toque |
| F5 Corrigir o texto e ensinar a lição | 4 | 7 | 2 | 3 | ~2 min (~40 s) | Editor: os botões do topo saem da tela |
| F6 Achar onde se muda a voz | 9 lugares em 3 grupos do menu | 2 por lugar | — | — | — | Menu em gaveta com 28 itens |

---

## F1 · Criar campanha até a primeira peça aprovada

**Caminho:** Início → Criar → Campanha de conteúdos → assistente de 6 passos (`/campanhas/nova`) → Produção do ciclo (`/producao`), com planejamento → ideias → desenvolvimento → revisão.

| # | Tela / rota | Ação | Observação |
|---|---|---|---|
| 1 | Início `/` | Clica **+ Criar** (menu lateral) | Há dois botões "Criar" na mesma tela (menu e cabeçalho do Início). |
| 2 | Criar `/criar` | Clica **Campanha de conteúdos** | Três opções: Campanha, Um conteúdo, "Hive, recomende". **Vídeo não aparece aqui** (está dentro de "Um conteúdo"). |
| 3 | Nova campanha · tipo `/campanhas/nova` | Mantém "Orgânica" e o perfil; escreve a intenção; **Continuar** | A descrição do perfil mostra nota interna: "a recalibrar: Recalibrar: Academy deve priorizar…" (texto de bastidor e palavra repetida). |
| 4 | Nova campanha · momento | Espera a IA (~12 s); **Sim, continuar** | A leitura muda a cada vez: na 1ª tentativa "Construção de base", na 2ª "Retomada", com a mesma entrada. |
| 5 | Nova campanha · estratégia | Espera a IA (~25 s); **Usar estratégia recomendada** | Mix em 5 funções ("Ampliar presença"…). Mais adiante a mesma coisa aparece como "Presença". |
| 6 | Nova campanha · duração | Mantém 8 semanas; **Continuar** | O texto diz "um **ciclo** de 8 semanas", mas "ciclo" no resto do app é uma semana. |
| 7 | Nova campanha · estratégia definida | Espera a "jornada relacional" (ACJ, **~40–60 s**); **Aprovar plano ACJ**; **Ativar campanha** | **Beco sem saída:** sem conta conectada, "Ativar campanha" fica desabilitado; o aviso está no alto do cartão, longe do botão, e o link leva para Configurações. **Voltar ou recarregar perde o assistente inteiro** (≈1,5 min de IA). Jargão: "ACJ-01…05", "FLS/Masterclass", "Fase 4", "Confiança: Alta". O período começa em 02/11, dois dias no passado. |
| 8 | Campanha criada | **Revisar primeiro ciclo** | Tempo até aqui: 2 min 53 s. "Leva cerca de 3 minutos" (levou ~6). |
| 9 | Produção · planejamento `/producao?campaign=…&cycle=…` | **Confirmar planejamento e gerar ideias** | O stepper recomeça em "Campanha" e "Ciclo", que já foram escolhidos. "4 conteúdos" e "5 peças" lado a lado sem explicar a diferença. A "Frequência sugerida" põe peças em 02 e 03/11, dias que já passaram. |
| 10 | Produção · ideias | Espera a IA (~45 s); revisa 4 ideias; **Aprovar pauta e desenvolver conteúdos** | Cada ideia tem 4 ações (Trocar, Editar, Guardar, Remover) e mais 2 no fim. Repete o bloco ACJ e o bloco de estratégia. A IA inventa um "case" com números ("14 anos e 50 milhões de dólares") sem dizer de onde vem. |
| 11 | Produção · desenvolvimento (início) | **Desenvolver conteúdos** | Segunda confirmação seguida para a mesma coisa (a anterior já dizia "desenvolver conteúdos"). |
| 12 | Produção · desenvolvimento (conteúdo 1 de 4) | Espera a IA (**~5 min** para 4 conteúdos); **Aprovar conteúdo** | A barra ficou em "0 de 4" por ~2,5 min e depois sumiu. Os conteúdos aparecem um a um, mas **todos os botões ficam desabilitados** até o último terminar. Texto montado errado: "De O líder sente…" / "para A transição…". Bloco técnico "Movimento realizado (95/100)", "Mecanismo: O produtor isola…". |
| 13 | Conteúdo aprovado | — (fim) | A tela diz "**Primeira peça aprovada**" (LinkedIn), mas **no banco a peça ficou `pending_approval`** e não entra na fila da Agenda (ver F4). No F2, a mesma tela gravou `approved`. Em nenhum dos dois a imagem da peça foi mostrada antes da "aprovação". A peça do Instagram fica "A desenvolver", sem botão aqui. |

**Totais F1:**
- 13 telas · 14 cliques · 1 campo digitado (intenção; o nome vem pronto).
- 9 decisões: tipo, perfil, momento, estratégia, duração, plano ACJ, planejamento, pauta e conteúdo.
- ~9 min, dos quais ~8 min de espera de IA.
- 1 beco sem saída (sem conta) que obriga a refazer o assistente.
- A peça chamada de "aprovada" não chegou à Agenda.

**Celular (375 px):**
- O assistente da campanha cabe bem; o seletor de perfil corta o texto.
- Na Produção, os cartões "Para qual campanha?" e "Para qual ciclo?" ocupam a primeira tela inteira.
- O stepper de 6 passos sai pela direita (rolagem lateral).
- Um conteúdo tem ~3.300 px de altura: o botão **Aprovar conteúdo** fica a ~4 telas de rolagem do título.

---

## F2 · Um conteúdo avulso até aprovado

**Caminho:** Início → Criar → Um conteúdo → Imagem e texto (`/criar/conteudo`) → Produção do conteúdo avulso (`/producao`, com uma campanha oculta "Sem campanha").

| # | Tela / rota | Ação | Observação |
|---|---|---|---|
| 1 | Início `/` | **+ Criar** | — |
| 2 | Criar `/criar` | **Um conteúdo** | — |
| 3 | Um conteúdo · tipo `/criar/conteudo` | **Imagem e texto** | É aqui que fica o **Vídeo** (F3). |
| 4 | Um conteúdo · ideia | Escreve título e direção; **Desenvolver com a Hive** | **8 campos:** perfil, título, direção, função estratégica, editorial, ACJ primária, ACJ secundária e canais. Só 2 são necessários; os outros têm padrão, mas aparecem todos. Jargão: "ACJ primária/secundária". |
| 5 | Produção · desenvolvimento (início) | **Desenvolver conteúdos** | De novo a segunda confirmação seguida. O menu passa a marcar "Produção", e não "Criar". |
| 6 | Produção · conteúdo 1 de 1 | Espera a IA (~1 min 40 s); **Aprovar conteúdo** | Mesmo bloco técnico do F1. |
| — | Conteúdo aprovado | (fim do F2) | Peça do LinkedIn aprovada (no banco: `approved`) sem ver a imagem; Instagram "A desenvolver". |

**Totais F2:** 6 telas · 6 cliques · 2 campos digitados (de 8 visíveis) · 4 decisões (tipo, ideia, desenvolver, aprovar) · ~4 min 30 s, dos quais ~1 min 40 s de IA.

**Para chegar à peça do Instagram** são mais 4 telas e 4 cliques, com ~30 s de IA:
1. **Ver resumo** ("1 conteúdos aprovados", plural errado).
2. **Desenvolver desdobramentos** ("desdobramento" não é explicado).
3. **Revisar produção** (mais um resumo com 3 números).
4. **Revisar propostas** → **Aprovar peça**. A tela mostra o código interno do template ("M01-B Tensao").

**Celular (375 px):**
- O formulário "Qual é a ideia?" ocupa ~3 telas.
- Os seletores cortam o texto ("— Sem ACJ (a Hive atribui ao desenvolv…").
- O botão "Desenvolver com a Hive" fica no fim.

---

## F3 · Vídeo (corte) até virar peça

**Caminho:** Início → Criar → Um conteúdo → Vídeo → `/podcasts/novo` ("Novo corte de podcast"), com 4 passos na mesma tela.

**Medição:** percorrido no app de ponta a ponta, com um corte de teste de 23 s (fala sintetizada em português, feito com FFmpeg) e o link de um episódio que já estava no banco.

| # | Tela / rota | Ação | Observação |
|---|---|---|---|
| 1 | Início `/` | **+ Criar** | — |
| 2 | Criar `/criar` | **Um conteúdo** | O Criar não mostra "Vídeo"; ele está um nível abaixo. |
| 3 | Um conteúdo `/criar/conteudo` | **Vídeo** | O cartão promete "Vídeo pronto ou roteiro"; **não existe opção de roteiro** nesse caminho. |
| 4 | Corte · passo 1 `/podcasts/novo` | Cola o link do YouTube e tecla Enter (ou **Buscar**); **Continuar pro upload** | **Beco sem saída:** sem episódio no YouTube não dá para continuar ("Continuar" desabilitado). Um vídeo que não é corte de podcast não tem caminho. O link cria um registro de podcast para o usuário. O menu pula para Base Hive › Vídeos. Textos sem acento ("Episodio", "titulo", "descricao", "pro upload"). |
| 5 | Corte · passo 2 | Mantém o Instagram (vem marcado sozinho; o LinkedIn fica desmarcado); **clica e escolhe o arquivo** | Upload e transcrição em ~15 s para 23 s de vídeo. A transcrição saiu fiel. A tela diz "Transcrevendo com Gemini" (nome do modelo). |
| 6 | Corte · passo 3 "Configura a geracao" | Mantém editorial "livre" e avatar "Ambos"; o briefing vem do título do episódio; **Gerar caption** | Usa um terceiro modelo de público (`bee_avatars`: "O Identificado", "O Incomodado"), diferente dos perfis da Identidade usados no F1 e no F2. Não pergunta perfil nem campanha. "Caption" em inglês. Legenda gerada em ~20 s (1.195 caracteres). |
| 7 | Corte · passo 4 "Preview e edicao" | Revisa a legenda; sem data; **Aprovar e mandar pro Kanban** | O "Título interno" é o nome do arquivo ("corte-teste-e2e"). **Fura dois contratos (regra 7):** grava `status: approved` (ou `scheduled`, se houver data) direto, por `postApi.update`, sem `approve_piece` nem `schedule-piece`. "Kanban" é o Pipeline, que o plano tira. Ao terminar, volta para o **Início** com o aviso "Post aprovado e no Kanban", não para a peça. |
| — | Agenda `/agenda` | (conferência) | A peça entra na fila "Sem campanha" com o título "corte-teste-e2e" e o rótulo **"Imagem"**, embora seja vídeo. No banco: `format: video`, `status: approved`, sem campanha e sem conteúdo-mãe. |

**Totais F3:** 7 telas · 6 cliques · 3 campos usados de 9 visíveis (link, plataforma, arquivo; editorial, avatar, briefing, título, legenda e data com padrão) · 7 decisões · ~2 min, dos quais ~35 s de IA.

**Celular (375 px):**
- Passos 1 e 2 conferidos: cabem; o campo do link corta o texto de exemplo.
- Os passos 3 e 4 não foram abertos no celular: o upload de arquivo não funciona dentro do iframe de 375 px. Pelo código, são um cartão de uma coluna (`sm:grid-cols-2`).

---

## F4 · Agendar uma peça aprovada

**Caminho:** Início → Agenda → clicar na peça da fila → gaveta "Detalhes da peça" → **Agendar na janela sugerida**.

| # | Tela / rota | Ação | Observação |
|---|---|---|---|
| 1 | Agenda `/agenda` | Clica na 1ª peça de "Conteúdos para agendar" | Antes da fila aparecem 3 painéis: Campanhas ativas, Repetição de conteúdo e Jornada relacional (ACJ). O painel ACJ diz "ACJ-01… ainda sem peça", mas o F1 aprovou uma peça ACJ-01. No topo há **três** botões de distribuir ("Configurar", "Semi-auto", "IA distribuir"). **A peça do F1, que a tela chamou de "Primeira peça aprovada", não está na fila:** no banco ela está `pending_approval` (conferido por SELECT). |
| 2 | Gaveta da peça | **Agendar na janela sugerida** | Agendou para hoje, 18:00. Logo abaixo, a mesma gaveta sugere "**Publicar às 08:00** · Aplicar": duas sugestões de horário que se contradizem. A gaveta mostra o código interno "BEE-041126-G2-D2" e "🚀 88/100". |

**Totais F4:** 2 telas · 3 cliques · 0 campos · 2 decisões (qual peça, quando) · ~1 min 30 s, sem IA.

**Depois da medição:** a peça foi tirada da agenda ("Remover da agenda", sem confirmação), para o publicador não tentar publicar às 18:00, mesmo com a conta falsa. O banco confirma que nada ficou agendado.

**Caminho alternativo:** arrastar a peça para o dia. Existe e não foi testado.

**Celular (375 px):**
- A fila fica uma tela abaixo dos 3 painéis.
- O calendário mostra só Dom–Ter e o resto exige rolagem lateral.
- "Arraste pro dia" não funciona no toque. No celular, o caminho que resta é tocar na peça e usar a gaveta.

---

## F5 · Corrigir o texto de uma peça e ensinar a lição

**Caminho:** Agenda → peça → **Editar** → editor `/posts/:id` → corrige a legenda → **Salvar** → **Coach: corrigir este post** → descreve o problema → **Salvar** a regra proposta.

| # | Tela / rota | Ação | Observação |
|---|---|---|---|
| 1 | Agenda `/agenda` | Clica na peça | — |
| 2 | Gaveta da peça | **Editar** | — |
| 3 | Editor da peça `/posts/:id` | Troca a 1ª frase da legenda; **Salvar** | O título da tela é o nome do editorial ("Diagnóstico Sistêmico"), não o da peça. O status aparece duas vezes (selo e seletor). Há um botão verde **Publicar** em destaque ao lado de "Salvar". O rótulo "Aprovar · Stand-by" não diz o que faz. Há um **terceiro** lugar para pôr data ("Data de publicação (opcional) · Sem data — fica no Kanban"). **Salvar uma correção devolve a peça para "Pendente de aprovação"** e ela sai da fila da Agenda. O único aviso é um quadro pequeno, "Para agendar falta: aprove a peça antes". |
| 4 | Editor · painel Coach | Escreve "a abertura ficou formal demais…"; envia; espera (~40 s); **Salvar** na regra proposta | O Coach devolve 2 legendas novas ("Aplicar na legenda") e 1 regra ("Abra a legenda com uma frase curta e coloquial…"). Ao salvar, o cartão some sem confirmação. A lição foi gravada e está ativa (`ai_learnings`, conferido por SELECT). A correção manual do passo 3 vira só um contador ("Edições manuais: 2"); não fica claro se ela também ensina. |

**Totais F5:** 4 telas · 7 cliques · 2 campos (legenda, mensagem ao Coach) · 3 decisões (o que corrigir, o que dizer ao Coach, qual proposta salvar) · ~2 min, dos quais ~40 s de IA.

**Outros lugares que também "ensinam":** Coach de voz (`/coach`), Feedback contínuo (`/feedback`) e Aprendizado (`/aprendizado`, lista de lições + "portão" por conjunto). Os três aparecem no menu Inteligência.

**Celular (375 px):**
- A 1ª abertura direta de `/posts/:id` mostrou "**Post nao encontrado**"; recarregando, abriu. É intermitente e não foi investigado.
- Os botões do topo (Hive, Salvar, Aprovar, Publicar) saem pela direita da tela.

---

## F6 · Achar onde se muda a voz

**Pergunta:** "quero que a Hive escreva diferente; onde mexo?"

| Lugar | Rota | Cliques desde o Início | O que a tela diz |
|---|---|---|---|
| Minha identidade | `/identidade` | 2 (Base Hive → item) | "Quem fala… e como a Hive deve escrever". Mostra a "Voz" herdada do Genesis e tem atalhos para Genesis e Diretrizes. É o melhor ponto de entrada hoje. |
| Genesis | `/genesis` | 2 | "Constituição Cognitiva… Editar aqui **muda a voz do sistema**". Jargão: "estados de consciência", "Fluxo Cognitivo". |
| Diretrizes de Criação | `/diretrizes` | 2 | "O ofício"; 32 diretrizes. Fala de "prompt" e "autochecagem da IA". |
| Editoriais | `/editoriais` | 2 | Tipos de post. |
| Arsenal | `/arsenal` | 2 | Histórias e exemplos. |
| Configurações › **Voz Bee** | `/configuracoes` | 2 (item → aba) | "A voz da Bee é única… você ajusta texto livre aqui" e "A IA usa todas essas camadas em cada geração". **Nenhum código lê esses campos** (relatório §3.6): a tela promete o que não faz. |
| Coach de voz | `/coach` | 2 (Inteligência → item) | "Converse pra corrigir os erros de geração… propõe regras". |
| Feedback contínuo | `/feedback` | 2 | "A IA destila cada [observação] em lições". |
| Aprendizado | `/aprendizado` | 2 | Fala de "conjunto liberado", "facetas ≥ 90%" (o "portão" do piloto automático que saiu). |

**Totais F6:**
- **9 lugares** em 3 grupos do menu (Base Hive, Inteligência, Configurações), cada um a 2 cliques.
- O menu tem **28 itens**; só um diz "voz" ("Coach de voz").
- O lugar que diz "Voz" com todas as letras (Configurações › Voz Bee) é o único que não muda nada.

**Celular (375 px):** o menu abre como gaveta, com a lista inteira (28 itens). O Genesis cabe e se lê bem.

---

## Critique de interface (`/impeccable critique`, telas de F1 a F4)

**Método:** duas avaliações isoladas.
- **A · design:** leu o código de `/criar`, `/criar/conteudo`, `/campanhas/nova`, `/producao` (+ `components/production`), `/agenda` e `/podcasts/novo`, e abriu as telas só para olhar.
- **B · detector:** `impeccable detect`, mais o overlay no navegador em 4 páginas.
- **Não avaliado ao vivo pela A:** o formulário "Imagem e texto", o celular e os passos 2–4 do vídeo (avaliados pelo código e por esta medição; o F3 foi medido ao vivo depois).

**Nota de usabilidade (Nielsen): 14/40, faixa "Ruim".**

| # | Heurística | Nota | Problema principal |
|---|---|---|---|
| 1 | Status do sistema | 1 | "Primeira peça aprovada" com a peça `pending_approval`; a barra "0 de 4" para e some; carga inicial com ~20 s de spinner sem texto |
| 2 | Linguagem do usuário | 1 | ACJ-01, desdobramento, "Movimento realizado (90/100)", BEE-041126-…, Caption, Kanban, Gemini; "ciclo" ora é semana, ora campanha |
| 3 | Controle e saída | 1 | Voltar ou recarregar perde o assistente; botões travados até o último conteúdo terminar; "Remover da agenda" sem confirmação |
| 4 | Consistência | 1 | 3 botões de distribuir, 2 sugestões de horário, Perfil (Identidade) × Avatar (vídeo), 3 jeitos de "voltar", vídeo sem acentos |
| 5 | Prevenção de erro | 1 | A falta de conta só aparece no passo 5; datas no passado; vídeo grava `approved`/`scheduled` por fora dos contratos |
| 6 | Reconhecer em vez de lembrar | 2 | O stepper ajuda, mas recomeça em "Campanha/Ciclo"; as pílulas 01–04 não têm rótulo |
| 7 | Flexibilidade | 2 | Ajustar, editar, nova versão e "Hive, recomende" existem; não há ação em lote |
| 8 | Minimalismo | 2 | Paleta calma, mas os blocos ACJ e estratégia se repetem; 3 painéis antes da fila na Agenda |
| 9 | Recuperação de erro | 2 | `LoadError` com "tentar de novo" é bom; os toasts mostram `error.message` cru |
| 10 | Ajuda | 1 | Os ícones "i" do planejamento não têm dica; não há ajuda no ponto de decisão |

**Carga cognitiva: alta** (6 de 8 itens falham). Decisões com mais de 4 opções:
- **Validação do conteúdo:** 9 ou mais controles.
- **Pauta:** 4 ações × 4 ideias, mais 3.
- **Formulário "Um conteúdo":** 8 campos, só 2 necessários.
- **Topo da Agenda:** 8 controles.
- **Gaveta da peça:** 6 ações.

**Detector (B):**
- Pelo código não acha nada: em `.tsx` ele só roda regex, então esse resultado conta a menos.
- **No navegador:**
  - ~18 de contraste baixo, quase todas pelo **âmbar de destaque #E7A14B usado como cor de texto sobre o creme (~2:1)**: kickers "Nova campanha", "Um conteúdo", "A Hive desenvolveu…", "Ver contrato completo".
  - Faixa de campanha na Agenda: branco sobre verde (2,5:1).
  - ~21 textos de 9–11 px: selos, "Hive sugere", "Recomendado", o "Consulting" do logo.
- **Prováveis escolhas de marca, não erro:** "Inter em excesso" e "paleta creme".

**O que funciona:**
- Uma pergunta por tela em `/criar` e no 1º passo da campanha (`WizardShell`/`ChoiceCard`).
- O cartão de validação "Frase + Texto" e a prévia da arte na gaveta da Agenda.
- A caixa "O que acontecerá a seguir" no planejamento: diz o que o clique faz e é o padrão a repetir.

**Problemas prioritários:**
1. **[P0] Aprovação que não aprova e agendamento sem hora.**
   - A tela de "aprovado" precisa ler o status real e mostrar a arte.
   - O próximo passo é Agendar.
   - O botão diz a hora ("Agendar para qua 05/11 às 18:00"), e só fica uma sugestão de horário.
   - Comandos: `harden` e depois `clarify`.
2. **[P0] Beco do assistente de campanha.**
   - Conferir as contas no 1º passo.
   - Guardar o rascunho (URL ou armazenamento local) para não perder a IA ao voltar.
   - Comandos: `harden` e `onboard`.
3. **[P1] Jargão interno nas telas de decisão.**
   - ACJ atrás de um "por quê?".
   - Códigos escondidos.
   - Termos do dia a dia.
   - Comando: `clarify`.
4. **[P1] Validação e pauta sobrecarregadas.**
   - Barra fixa com "Aprovar" e "Pedir mudança"; o resto num menu.
   - Contrato ACJ e "o que a Hive considerou" recolhidos.
   - Formulário com só título e direção, e "Mais opções" para o resto.
   - Comandos: `distill` e `layout`.
5. **[P2] Vídeo como mundo à parte.**
   - "Vídeo" no Criar.
   - Mesmo assistente e mesmo seletor de perfil.
   - Termina na peça.
   - Comando: `shape`.

---

## Pontos sem nexo (para o bloco 09)

Ordenados por impacto no Marcos. Cada linha traz o fluxo, a tela e a proposta.

| # | Fluxo | Tela | Ponto sem nexo | Proposta |
|---|---|---|---|---|
| 1 | F1, F4 | Produção · "Conteúdo aprovado" | Diz "Primeira peça aprovada", mas a peça fica `pending_approval` e não chega à Agenda (no F2 a mesma tela grava `approved`) | A tela mostra o status real, vindo do banco, e a arte; a aprovação passa por `approve_piece`; o botão seguinte leva à Agenda |
| 2 | F1 | `/campanhas/nova` · passo 5 | Sem conta conectada, "Ativar" fica desabilitado no último passo, e voltar ou recarregar perde ~1,5 min de IA | Conferir as contas no passo 1 e guardar o rascunho do assistente |
| 3 | F4, F5, F3 | Agenda, gaveta, editor, vídeo | Quatro lugares põem data (gaveta, "janela sugerida", editor, vídeo) e duas sugestões de horário se contradizem (18:00 × 08:00); o vídeo agenda por fora do `schedule-piece` | Um só jeito de agendar (`schedule-piece`), uma só sugestão (a janela da Hive), e o botão diz dia e hora |
| 4 | F1, F2 | Produção · desenvolvimento | ~5 min de espera com a barra parada em "0 de 4" e todos os botões travados até o último conteúdo | Liberar cada conteúdo assim que fica pronto e mostrar o progresso real por conteúdo |
| 5 | F1, F2 | Produção · pauta → desenvolvimento | Duas confirmações seguidas para a mesma coisa ("Aprovar pauta e desenvolver" e depois "Desenvolver conteúdos"; "Desenvolver com a Hive" e depois "Desenvolver conteúdos") | Um clique: aprovar a pauta já começa o desenvolvimento |
| 6 | F1, F2, F4 | Assistente, pauta, validação, Agenda | Jargão interno: ACJ-01…05, "Movimento realizado 90/100", "desdobramento", "BEE-041126-G2-D2", "M01-B Tensao", "Caption", "Kanban", "a recalibrar: Recalibrar" | Termos do dia a dia; ACJ e códigos só atrás de "ver detalhes" |
| 7 | F5 | Editor da peça | Salvar uma correção devolve a peça para "pendente" e ela some da fila sem aviso claro | Ao salvar, mostrar "Esta peça precisa de nova aprovação" com o botão Aprovar ao lado |
| 8 | F6, F5 | Menu (Base Hive, Inteligência, Configurações) | 9 lugares mexem na voz; o único que diz "Voz" (Configurações › Voz Bee) não é lido por nenhum código | Tirar a aba Voz Bee; juntar Coach, Feedback e Aprendizado em "Ensinar a Hive"; Identidade como porta de entrada (relatório §3.3, §3.5, §3.6) |
| 9 | F3 | Criar → Um conteúdo → Vídeo | Vídeo escondido em "Um conteúdo"; promete "roteiro" que não existe; exige episódio no YouTube; outro modelo de público (Avatar); termina no Início; na Agenda aparece como "Imagem", com o nome do arquivo como título | "Vídeo" no Criar, com o mesmo assistente, o mesmo seletor de perfil e a mesma esteira até a peça (relatório §3.1) |
| 10 | F1, F2 | Produção · validação (celular) | 9 ou mais controles por conteúdo; no celular o "Aprovar" fica a ~4 telas de rolagem | Barra fixa "Aprovar · Pedir mudança"; blocos técnicos recolhidos |
| 11 | F2 | `/criar/conteudo` · ideia | 8 campos (2 ACJ), quando só título e direção são necessários | Mostrar só título e direção; o resto em "Mais opções" |
| 12 | F2 | Produção · revisão | Três telas de resumo seguidas ("Ver resumo", "Desenvolver desdobramentos", "Revisar produção") para chegar à peça do Instagram | Ir direto para as peças a revisar depois de aprovar o conteúdo |
| 13 | F1 | Produção · planejamento | O stepper repete "Campanha" e "Ciclo", já escolhidos; o "ciclo atual" inclui dias passados; "Recomendado" pula para o ciclo seguinte antes de terminar o atual | O stepper começa em Planejamento; o ciclo começa hoje; "Recomendado" só depois de fechar o atual |
| 14 | F4 | Agenda (celular) | Três painéis antes da fila; o calendário corta em Dom–Ter; "arraste pro dia" não funciona no toque | Fila primeiro; no celular, lista por dia em vez de grade; agendar pela gaveta |
| 15 | Todos | Textos e cores | Contraste ~2:1 no âmbar como texto; 9–11 px em selos; textos sem acento ("Configuracoes", "Episodio", "pro upload"); plurais errados ("1 conteúdos") | Passada de `clarify` + `polish`: âmbar só em fundo, mínimo de 12 px, acentos e plurais |
