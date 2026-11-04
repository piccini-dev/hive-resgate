# Estado — bee-platform

- Status: ativo · **operação resgate**
- Prioridade: alta
- Atualizado: 2026-11-04

## Objetivo
Devolver ao Marcos uma Hive que ele entende e usa: menos telas, um caminho por tarefa e fluxos curtos. A queixa dele é de fluxo confuso, longo e sem nexo, não de erro técnico.

## Agora
- O trabalho é no repo privado `raulmf12/hive-resgate` (`origin`). O `bee-platform` (produção) é o remoto `producao`, com o push desligado.
- Plano: `docs/plano/PLANO.md`. Diagnóstico: `.central/RELATORIO-ENXUGAMENTO.md` (medição real no §11).
- **Bloco 01 · Base do resgate** (branch `bloco/01-base-resgate`; 16 commits locais, **sem push**): as 5 issues estão fechadas.
  - #1 faixa e #2 README (ChatGPT) conferidas; #3 site de teste https://hive-resgate.netlify.app; #4 medição no banco.
  - #5 feita: `docs/plano/FLUXOS.md` traz F1–F6 medidos no desktop e em 375 px, o critique (14/40) e 15 "pontos sem nexo", que são a base do bloco 09.
  - `PRODUCT.md` criado (`/impeccable init`). O snapshot do critique fica em `.impeccable/critique/`, fora do git.
- Achados graves da #5:
  - A tela de produção diz "Primeira peça aprovada", mas a peça fica `pending_approval` e não chega à Agenda.
  - Sem conta conectada, não dá para ativar a campanha, e voltar perde o assistente.
  - O vídeo grava aprovado/agendado por fora do `approve_piece`/`schedule-piece`.
  - A Agenda mostra duas sugestões de horário que se contradizem.
- Usuário de teste em produção agora tem 2 contas falsas (`seedAccounts`), 2 campanhas, 3 peças e 1 lição. Nada agendado nem publicado.
- Painel: https://claude.ai/artifact/83PGHGYEKxe8wbgLn5Rr9k (ainda sem #3, #4 e #5).

## Próximos passos
1. `/integrar` do bloco 01:
   - `/ponytail-review` em `main...bloco/01-base-resgate`;
   - faixa conferida em 375 px e no desktop;
   - push, PR e merge (**só com ordem do Raul**).
2. Bloco 09 começa pelos 2 P0 do critique: aprovação real e agendamento com hora, depois o beco das contas no assistente de campanha.
3. Decidir onde entra o patch não enviado (`Hive-transferencia/trabalho-nao-enviado.patch`, métricas do LinkedIn).
4. Mandar ao Marcos as perguntas 1 (Pipeline) e 6 (vídeo) do §9.

## Bloqueios / aguardando
- Ordem do Raul para push e merge do bloco 01.
- Decisão do Raul sobre o patch do LinkedIn (funções e migrations já em produção, código fora de repo).
- F3 (vídeo) medido só até o link do YouTube. Raul decide se mede completo com um corte de teste.
- `npm run lint` quebrado desde antes do bloco (sem `eslint.config.js`).

## Última sessão
2026-11-04: #5 feita. F1–F6 percorridos no app local com o usuário de teste, critique duplo (design + detector) e FLUXOS.md gravado; issue fechada.
