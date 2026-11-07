# Estado — bee-platform

- Status: ativo · **operação resgate**
- Prioridade: alta
- Atualizado: 2026-11-07

## Objetivo
Devolver ao Marcos uma Hive que ele entende e usa: menos telas, um caminho por tarefa e fluxos curtos. A queixa dele é de fluxo confuso, longo e sem nexo, não de erro técnico.

## Agora
- O trabalho é no repositório `piccini-dev/hive-resgate` (`origin`, público). O `bee-platform` (produção) é o remoto `producao`, com o push desligado.
- **Blocos 01 a 05 integrados.** A `main` (`46566eb`, PR #39) já tem a Voz da Hive em 4 telas:
  - "Como escrevo" (Genesis + Diretrizes em abas);
  - Arsenal como aba de Editoriais;
  - Produtos e ofertas em Minha identidade;
  - `/diretrizes`, `/arsenal` e `/produtos` redirecionando.
  - Regressão completa 213/213 em 06/11, com o E2E novo `f29-voz-da-hive`. Nada publicado no banco nem nas funções.
- **Bloco atual: 06 · Visual e resultados, sem Vídeos** (branch `bloco/06-visual-resultados`, milestone 7).
  - Prontas, em paralelo: #40 (Fotos do Marcos = motor + fotos reais) e #41 (Resultados = Desempenho + Jornada ACJ).
  - Depois: #42 (rotas e menu) → #43 (`exec:claude`, E2E `f30-visual-resultados` + ajuste do `f7` + conferência visual).
  - Prompts em `.orquestra/prompts/40.md`, `41.md` e `42.md`.
- **Painel desatualizado:** as ferramentas de artifact pararam nesta sessão. Ele ainda mostra o 05 aberto e não tem o 06. Link: https://claude.ai/artifact/83PGHGYEKxe8wbgLn5Rr9k
- Relatório preliminar para o Marcos: https://claude.ai/artifact/EbE9cZXaJyQoEc1UCifNd7

## Próximos passos
1. Reiniciar o Claude Code e rodar `/painel` (05 integrado com #34–#38 validadas; 06 com #40–#43).
2. Colar no ChatGPT os prompts das #40 e #41 (em paralelo); depois a #42.
3. `/integrar` do bloco 06 quando o painel mostrar "Pronto para /integrar". Antes da regressão, conferir se o login do teste responde em menos de 1 s.
4. Vídeos na Biblioteca (resto do 06) depois da resposta do Marcos; depois, bloco 07 (Andamento).
5. `/impeccable critique` nas telas dos blocos 03 e 05.

## Bloqueios / aguardando
- Respostas do Marcos às perguntas do relatório (Pipeline, vídeo, IA distribui, Feedback, wizard): confirmam Vídeos (06) e os cortes do 07.
- **Memória do Supabase:** em 06/11 o projeto travou por *memory commitment* severo (login 504, conexões com tempo esgotado, falha no `archive command`) e voltou com o reinício. A regressão pesa no banco. Se o alerta voltar, decidir se a instância sobe de tamanho (tem custo).
- `npm run lint` quebrado desde antes do bloco 01 (sem `eslint.config.js`).

## Última sessão
2026-11-06 (noite): bloco 05 integrado (PR #39; regressão 213/213 vigiando o login). O Supabase travou por memória e o Raul reiniciou o projeto. Bloco 06 aberto sem Vídeos (#40–#43); painel pendente.
