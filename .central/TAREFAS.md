# Tarefas — bee-platform

## Abertas
- [ ] Bloco 01b · Métricas do LinkedIn: #7 aplicar patch, #8 conferir produção, #9 regressão, depois /integrar
- [ ] Raul mostrar ao Marcos o relatório preliminar e trazer as 5 respostas
- [ ] Bloco 09: começar pelos 2 P0 do critique (aprovação real + agendar com hora; beco das contas no assistente de campanha)
- [ ] Investigar "Post nao encontrado" intermitente ao abrir `/posts/:id` direto
- [ ] Apagar o zip `Downloads/Hive-transferencia.zip` e a cópia extraída (contém senha do usuário de teste), quando o Raul mandar
- [ ] Copiar a memória antiga (`Hive-transferencia/memoria-do-claude/`) para a memória deste projeto, se o Raul quiser
- [ ] Consertar ou remover o `npm run lint` (sem configuração do ESLint 9)
- [ ] Blocos 03–10 (ver docs/plano/PLANO.md §10)
- [ ] Decidir se saem também `edge.acjAssign`, `edge.acjValidate` e `edge.campaignTick` (sem uso no front, fora do plano)
- [ ] Corrida possível entre importação manual do LinkedIn e o cron `linkedin-metrics` no mesmo run (pode duplicar posts importados); corrigir num bloco futuro, exige deploy da função

## Concluídas
- [x] Definir escopo e stack (plano da operação resgate)
- [x] Relatório de enxugamento
- [x] Criar .env.e2e.local e .env.local; npm ci
- [x] #1 faixa de versão de teste e #2 README (ChatGPT), conferidas
- [x] #3 site Netlify de teste (https://hive-resgate.netlify.app)
- [x] #4 medir uso real no banco (relatório §11)
- [x] #5 medir os fluxos F1–F6 + critique (`docs/plano/FLUXOS.md`, `PRODUCT.md`); F3 completo
- [x] Bloco 01 integrado (PR #6), site de teste com a faixa no ar
- [x] Relatório preliminar para o Marcos (Claude Docs)
- [x] Decidir o patch do LinkedIn (bloco 01b) e marcar os 5 posts importados como histórico
- [x] Bloco 01b integrado (PR #10): patch aplicado (#7), produção conferida (#8), regressão 202/202 (#9)
- [x] Bloco 02 aberto: milestone 3, issues #11–#16, prompts e painel
