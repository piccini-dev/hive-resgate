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
| 13 | Conteúdo aprovado | — (fim) | "Primeira peça aprovada": a peça do LinkedIn foi aprovada **junto com a imagem, que o Marcos não viu**. A do Instagram fica "A desenvolver", sem botão aqui. |

**Totais F1:** 13 telas · 14 cliques · 1 campo digitado (intenção; nome vem pronto) · 9 decisões (tipo, perfil, momento, estratégia, duração, plano ACJ, planejamento, pauta, conteúdo) · ~9 min, dos quais ~8 min de espera de IA · 1 beco sem saída (sem conta) que obriga a refazer o assistente.

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
| — | Conteúdo aprovado | (fim do F2) | Peça do LinkedIn aprovada sem ver a imagem; Instagram "A desenvolver". |

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
