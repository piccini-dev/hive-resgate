# Estado — bee-platform

- Status: aguardando-cliente · **operação resgate, 1ª etapa concluída**
- Prioridade: alta
- Atualizado: 2026-11-08

## Objetivo
Devolver ao Marcos uma Hive que ele entende e usa: menos telas, um caminho por tarefa e fluxos curtos. A queixa dele é de fluxo confuso, longo e sem nexo, não de erro técnico.

## Agora
- O trabalho é no repositório `piccini-dev/hive-resgate` (`origin`, público). O `bee-platform` (produção) é o remoto `producao`, com o push desligado.
- **Blocos 01 a 06 integrados; a 1ª etapa do resgate terminou.** O Marcos quis o plano só até o 06. A `main` (`71f630f`, PR #44) tem:
  - Voz da Hive em 4 telas (bloco 05): Minha identidade, Como escrevo, Editoriais (com Arsenal) e Conhecimento;
  - "Fotos do Marcos" (motor + fotos reais em abas) e "Resultados" (Desempenho + Jornada ACJ em abas) (bloco 06);
  - `/hive/marcos`, `/jornada`, `/diretrizes`, `/arsenal` e `/produtos` redirecionando.
  - Regressão completa 217/217 em 08/11. Nada publicado no banco nem nas funções.
- Blocos 07–10 do `docs/plano/PLANO.md` (Andamento, wizard, fluxos curtos, virada) ficam parados até nova missão.
- Painel em dia (06 integrado): https://claude.ai/artifact/83PGHGYEKxe8wbgLn5Rr9k
- Relatório preliminar para o Marcos: https://claude.ai/artifact/EbE9cZXaJyQoEc1UCifNd7

## Próximos passos
1. Esperar o Raul trazer a próxima missão; ao abrir, reler o `PLANO.md` §10 e ver se os blocos 07–10 ainda valem.
2. Se o Marcos for usar o site de teste: confirmar o login piccini@beeconsulting.com e passar a senha.
3. Pendências pequenas da lista (Produtos por marca, recuo da aba Princípios, `npm run lint`).

## Bloqueios / aguardando
- Nova missão do Raul/Marcos. Vídeos na Biblioteca (resto do 06) e os cortes do 07 dependiam das respostas do Marcos.
- **Memória do Supabase:** travou em 06/11 por *memory commitment* severo e voltou com o reinício; a regressão de 08/11 rodou sem problema. Se o alerta voltar, decidir se a instância sobe de tamanho (tem custo).
- `npm run lint` quebrado desde antes do bloco 01 (sem `eslint.config.js`).

## Última sessão
2026-11-08: painel atualizado e bloco 06 integrado (PR #44, regressão 217/217, E2E `f30`). O Raul informou que o Marcos queria só até o 06: 1ª etapa do resgate encerrada.
