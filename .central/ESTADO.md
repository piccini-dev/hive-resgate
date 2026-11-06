# Estado — bee-platform

- Status: ativo · **operação resgate**
- Prioridade: alta
- Atualizado: 2026-11-06

## Objetivo
Devolver ao Marcos uma Hive que ele entende e usa: menos telas, um caminho por tarefa e fluxos curtos. A queixa dele é de fluxo confuso, longo e sem nexo, não de erro técnico.

## Agora
- O trabalho é no repositório `piccini-dev/hive-resgate` (`origin`), **público** desde 06/11 (transferido pelo Raul). O `bee-platform` (produção) é o remoto `producao`, com o push desligado.
- **Blocos 01, 01b, 02 e 03 integrados.** A `main` (`3f2f274`, PR #25) já tem o menu novo:
  - grupos Voz da Hive, Ensinar a Hive, Visual e Ferramentas internas;
  - Configurações só com Perfil, Contas e Integrações; Onboarding só com a chave do Gemini;
  - fora Simular público e Teste de imagem; Convite no Criar.
  - Regressão completa 202/202 em 06/11. Nada publicado no banco nem nas funções.
- **Bloco atual: 04 · Ensinar a Hive** (branch `bloco/04-ensinar-hive`, milestone 5). `/coach` ganha as abas Conversa, Observações e Lições; `/feedback` e `/aprendizado` redirecionam; o portão da IA sai do cliente.
  - prontas: #26 (aba Lições) e #27 (aba Observações);
  - em cadeia: #28 (abas no Coach) → #29 (redirecionar e apagar telas) → #30 (limpar `api.ts`/`types`) → #31 (`exec:claude`, E2E `f28-ensinar-hive`).
- Painel: https://claude.ai/artifact/83PGHGYEKxe8wbgLn5Rr9k (03 integrado, 04 aberto com os prompts).
- Relatório preliminar para o Marcos: https://claude.ai/artifact/EbE9cZXaJyQoEc1UCifNd7

## Próximos passos
1. Colar no ChatGPT os prompts das #26 e #27 (painel); depois #28, #29 e #30.
2. Quando o painel mostrar "Pronto para /integrar": `/integrar` do bloco 04 (fazer a #31, regressão, PR e merge) e abrir o bloco 05 (Voz da Hive).
3. Rodar `/impeccable critique` nas telas do bloco 03 (não feito na integração).
4. Entrar uma vez com o login novo para confirmar e passar a senha ao Marcos.
5. O Raul mostra o relatório ao Marcos e traz as respostas (Pipeline, vídeo, IA distribui, Feedback, wizard).

## Bloqueios / aguardando
- Respostas do Marcos às perguntas do relatório: confirmam os cortes dos blocos 06 e 07.
- `npm run lint` quebrado desde antes do bloco 01 (sem `eslint.config.js`).
- Regressão pesa na memória: rodou com 8 GB livres em 06/11; com 4 GB, já falhou antes.

## Última sessão
2026-11-06: bloco 03 integrado (PR #25, regressão 202/202; correção: `BeePersona` sem uso). Repositório migrado para `piccini-dev/hive-resgate`, com as referências atualizadas. Bloco 04 aberto com #26–#31 (Correções recentes sai junto com Aprendizado, por decisão do Raul).
