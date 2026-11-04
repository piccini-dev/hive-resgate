# Estado — bee-platform

- Status: ativo · **operação resgate**
- Prioridade: alta
- Atualizado: 2026-11-04

## Objetivo
Devolver ao Marcos uma Hive que ele entende e usa: menos telas, um caminho por tarefa e fluxos curtos. A queixa dele é de fluxo confuso, longo e sem nexo, não de erro técnico.

## Agora
- O trabalho é no repo privado `raulmf12/hive-resgate` (`origin`). O `bee-platform` (produção) é o remoto `producao`, com o push desligado.
- **Bloco 01 integrado** (PR #6, merge na `main`): o site de teste https://hive-resgate.netlify.app já mostra a faixa "Versão de teste". As issues #1–#5 estão validadas e o milestone, fechado.
  - Regressão 198/200; as 2 falhas foram corrigidas: teste do bundle com CRLF no Windows, e os 5 posts importados do LinkedIn marcados como histórico (ok do Raul).
  - `docs/plano/FLUXOS.md`: F1–F6 medidos (o F3 de ponta a ponta), critique 14/40 e 15 pontos sem nexo.
- **Bloco atual: 01b · Métricas do LinkedIn** (branch `bloco/01b-metricas-linkedin`, milestone 2). Traz para o repo o patch de 03–04/11 (16 arquivos), que hoje só existe no zip.
  - #7 aplicar o patch (pronta); #8 conferir produção por leitura (aguarda #7); #9 regressão (aguarda #7 e #8). Todas `exec:claude`.
  - O patch entra limpo na `main` (base `8350a79`).
- O relatório preliminar para o Marcos, em linguagem simples, está no Claude Docs: https://claude.ai/artifact/EbE9cZXaJyQoEc1UCifNd7
- Painel: https://claude.ai/artifact/83PGHGYEKxe8wbgLn5Rr9k (bloco 01 integrado; 01b aberto).

## Próximos passos
1. Fazer a #7: extrair só o `.patch` do zip, `git apply`, build e unitários.
2. Fazer a #8 (conferir as migrations 05/06/07 e a `linkedin-import` em produção, só leitura) e a #9 (regressão completa).
3. `/integrar` do 01b, depois as issues do bloco 02 (Fora o morto).
4. O Raul mostra o relatório ao Marcos e traz as 5 respostas (Pipeline, vídeo, IA distribui, Simular público, jornada ACJ).

## Bloqueios / aguardando
- Respostas do Marcos às perguntas do relatório: elas confirmam os cortes dos blocos 03, 06 e 07.
- `npm run lint` quebrado desde antes do bloco 01 (sem `eslint.config.js`).

## Última sessão
2026-11-04: #5 feita (F1–F6 + critique) e F3 completo. Bloco 01 integrado e site de teste no ar. Relatório para o Marcos publicado. Bloco 01b criado (#7–#9).
