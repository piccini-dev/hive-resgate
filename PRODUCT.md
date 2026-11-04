# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Hoje:** Marcos Piccini (Bee Consulting), especialista e produtor de conteúdo, não técnico. Usa todo dia, principalmente no desktop; o celular é para conferir e aprovar.
- **Raul:** dono técnico; usa as ferramentas internas (custos, calibração, prévias).
- **Futuro:** plataforma aberta para qualquer pessoa criar conteúdo na própria voz e usar as mesmas funções. Por isso nada de "Bee/Marcos" fixo em texto de tela ou prompt: o contexto vem da Identidade do workspace.

## Product Purpose
A Hive organiza a produção de conteúdo para LinkedIn e Instagram: Campanha → Ciclo → Ideia → Conteúdo → Peças → Agenda → Publicação. A IA escreve na voz de quem fala, a partir de uma metodologia guardada no banco (Genesis, diretrizes, arsenal e RAG).

Sucesso, depois do resgate: a pessoa cria uma campanha ou um conteúdo e chega à Agenda sem se perder. Menos telas, um caminho por tarefa, fluxos curtos, e a voz dela preservada.

## Positioning
Não é um gerador de posts genérico: a voz vem de uma metodologia curada pelo próprio autor (nada que a IA minera entra sem curadoria humana), e a arte vem de templates como dado, não de texto livre da IA.

## Operating Context
- Fluxos principais: campanha (leitura do momento → estratégia → ciclos → pauta → ideias → desenvolvimento → revisão), conteúdo avulso, corte de vídeo, agendar e publicar, ensinar a voz (Coach, Curadoria), ajustar a base (Identidade, Genesis, Diretrizes, Editoriais, Conhecimento).
- Publicação real em rede social só com autorização; publicado é histórico e não muda.

## Capabilities and Constraints
- Stack existente: React 18 + Vite + TypeScript + Tailwind + Zustand; Supabase; deploy Netlify.
- Interface em português do Brasil.
- Em aberto: como será o cadastro e o workspace de usuários novos quando a plataforma abrir para outras pessoas.

## Brand Commitments
- Nome do produto: Hive (da Bee Consulting). Logo em `src/components/shared/BeeLogo`.

## Product Principles
1. Um caminho por tarefa: juntar ou tirar antes de criar tela nova.
2. A voz é do autor: a IA sugere, o humano cura.
3. A tela diz o que vai acontecer antes do clique, sobretudo em agendar e publicar.
4. Serve a quem não é técnico: termos do dia a dia, sem jargão interno.

## Accessibility & Inclusion
Contraste legível, foco visível, texto alternativo em imagens; conferir em 375 px e no desktop.
