# Estado — bee-platform

- Status: ativo · **operação resgate**
- Prioridade: alta
- Atualizado: 2026-11-04

## Objetivo
Devolver ao Marcos uma Hive que ele entende e usa: menos telas, um caminho por tarefa e fluxos curtos. A queixa dele é de fluxo confuso, longo e sem nexo, não de erro técnico.

## Agora
- O trabalho é no repo privado `raulmf12/hive-resgate` (`origin`). O `bee-platform` (produção) é o remoto `producao`, com o push desligado.
- Plano: `docs/plano/PLANO.md`. Diagnóstico: `.central/RELATORIO-ENXUGAMENTO.md`, agora com a medição real no §11.
- **Bloco 01 · Base do resgate** (branch `bloco/01-base-resgate`; 12 commits locais, **sem push**):
  - #1 (faixa) e #2 (README) entregues pelo ChatGPT e conferidos: seguem a especificação, o build passa e os 16 unitários estão verdes.
  - #3 feita: site de teste em https://hive-resgate.netlify.app (só a `main`, sem previews, `VITE_APP_ENV=teste`). Ainda sem a faixa, que chega com o merge.
  - #4 feita: medição só leitura (tabelas, crons, 48 funções, chamadas em 30 dias, uso de IA em 60 dias); vereditos de §2, §4, §5 e §9 marcados ✔ ou ✎.
  - #5 (percorrer F1–F6 no app e gravar `docs/plano/FLUXOS.md`): **falta**.
- Máquina pronta: `.env.local`, `.env.e2e.local` (com `SUPABASE_ACCESS_TOKEN`), `supabase/.temp`, `npm ci` e Chromium; `regressao:check` verde.
- Painel: https://claude.ai/artifact/83PGHGYEKxe8wbgLn5Rr9k (ainda não atualizado com #3 e #4).

## Próximos passos
1. Fazer a #5 (Raul autoriza; cria dados do usuário de teste em produção, para antes de publicar).
2. Seguir o `/integrar` do bloco 01: `/ponytail-review` em `main...bloco/01-base-resgate`, faixa conferida em 375 px e no desktop, push, PR e merge (**só com ordem do Raul**).
3. Decidir onde entra o patch não enviado (`Hive-transferencia/trabalho-nao-enviado.patch`, métricas do LinkedIn, 16 arquivos; aplica limpo na branch atual).
4. Mandar ao Marcos as perguntas restantes do §9 (1: Pipeline; 6: vídeo). As 2 a 5 já têm resposta pela medição.

## Bloqueios / aguardando
- Ordem do Raul para push e merge do bloco 01.
- Decisão do Raul sobre o patch do LinkedIn. As funções e migrations dele **já estão em produção**, mas o código não está em repo nenhum.
- `npm run lint` quebrado desde antes do bloco (sem `eslint.config.js`).

## Última sessão
2026-11-04: ambiente montado a partir do zip de transferência; #1 e #2 conferidas; #4 (medição no banco) e #3 (site Netlify de teste) feitas e fechadas.
