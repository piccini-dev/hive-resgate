# Estado — bee-platform

- Status: ativo · **operação resgate**
- Prioridade: alta
- Atualizado: 2026-11-04

## Objetivo
Devolver ao Marcos uma Hive que ele entende e usa: menos telas, um caminho por tarefa e fluxos curtos. A queixa dele é de fluxo confuso, longo e sem nexo, não de erro técnico.

## Agora
- O trabalho é no repositório privado `raulmf12/hive-resgate` (`origin`). O `bee-platform` (produção) é o remoto `producao`, com o push desligado.
- **Blocos 01 e 01b integrados.** A `main` (`c59f4b8`) já tem o patch das métricas do LinkedIn (PR #10).
  - Produção conferida contra o repositório (só leitura): migrations 05/06/07 e `linkedin-import` v9 batem.
  - Regressão completa 202/202 (04/11, 33 min). Nada a publicar no banco nem nas funções.
- **Bloco atual: 02 · Fora o morto** (branch `bloco/02-fora-o-morto`, milestone 3). São 6 issues `exec:gpt`, #11–#16, só remoção de código de front:
  - prontas agora: #11 (Linhas editoriais e GateLock), #12 (telas M01/M02), #13 (cadeado do menu);
  - em cadeia, porque mexem em `src/lib/api.ts`: #14 kanban no login (depois da #11), #15 `almaApi` (depois da #14), #16 métodos sem uso (depois da #15).
- **Conta principal agora é do Marcos:** entra com `piccini@beeconsulting.com` (a senha não mudou) e aparece como "Marcos Piccini". O login `raulmfaria12@gmail.com` não entra mais. Ver DECISOES de 04/11.
- Painel: https://claude.ai/artifact/83PGHGYEKxe8wbgLn5Rr9k (01b integrado, 02 aberto, prompts das #11–#16).
- O relatório preliminar para o Marcos está no Claude Docs: https://claude.ai/artifact/EbE9cZXaJyQoEc1UCifNd7

## Próximos passos
1. Entrar uma vez com o login novo para confirmar e passar a senha ao Marcos.
2. Colar no ChatGPT os prompts das #11, #12 e #13 (painel); depois #14 → #15 → #16, uma por vez.
3. Quando o painel mostrar "Pronto para /integrar": `/integrar` do bloco 02 (build, regressão, PR e merge).
4. No `/integrar` do 02, criar as issues do bloco 03 (Menu novo).
5. O Raul mostra o relatório ao Marcos e traz as 5 respostas (Pipeline, vídeo, IA distribui, Simular público, jornada ACJ).

## Bloqueios / aguardando
- Respostas do Marcos às perguntas do relatório: elas confirmam os cortes dos blocos 03, 06 e 07.
- `npm run lint` quebrado desde antes do bloco 01 (sem `eslint.config.js`).

## Última sessão
2026-11-04: bloco 01b integrado (PR #10, regressão 202/202) e bloco 02 aberto com #11–#16. A conta principal passou para o Marcos (login piccini@beeconsulting.com, nome "Marcos Piccini").
