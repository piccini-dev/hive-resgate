# Tarefas — bee-platform

## Abertas
- [ ] Raul entrar uma vez com piccini@beeconsulting.com (mesma senha) para confirmar o login e passar a senha ao Marcos, ou trocar por uma nova
- [ ] Raul mostrar ao Marcos o relatório preliminar e trazer as 5 respostas
- [ ] Bloco 09: começar pelos 2 P0 do critique (aprovação real + agendar com hora; beco das contas no assistente de campanha)
- [ ] Investigar "Post nao encontrado" intermitente ao abrir `/posts/:id` direto
- [ ] Apagar o zip `Downloads/Hive-transferencia.zip` e a cópia extraída (contém senha do usuário de teste), quando o Raul mandar
- [ ] Copiar a memória antiga (`Hive-transferencia/memoria-do-claude/`) para a memória deste projeto, se o Raul quiser
- [ ] Consertar ou remover o `npm run lint` (sem configuração do ESLint 9)
- [ ] Colar no ChatGPT os prompts #40 e #41 (em paralelo); depois #42
- [ ] `/integrar` do bloco 06 (inclui a #43 exec:claude: E2E `f30-visual-resultados`, ajuste do `f7` e conferência visual)
- [ ] Vídeos na Biblioteca (`/podcasts` → aba da Biblioteca, "novo corte" no Criar), depois da resposta do Marcos sobre vídeo
- [ ] Memória do Supabase: se o alerta de memory commitment voltar, decidir se a instância sobe de tamanho; ver no painel o que consome memória
- [ ] "Produtos e ofertas" (Minha identidade) lista os produtos da conta, não os da marca escolhida no seletor
- [ ] Aba Princípios de "Como escrevo" fica ~10 px mais recuada que o cabeçalho (o Genesis tem contêiner próprio)
- [ ] Produtos duplicados em `bee_products` (2× FLS e 2× masterclass-6d): conferir com o Raul se é dado de teste ou do Marcos antes de mexer
- [ ] `/impeccable critique` nas telas do bloco 03 (menu, Configurações, Onboarding, Criar) em 375 px e desktop: não feito na integração
- [ ] Consertar o `pasta` do projeto `liam` em `C:\central\orquestra\projetos.json` (barras perdidas: `C:projetosinternoliam`)
- [ ] Blocos 07–10 (ver docs/plano/PLANO.md §10)
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
- [x] Conta principal trocada para o Marcos: login piccini@beeconsulting.com, nome "Marcos Piccini"
- [x] Bloco 02 integrado (PR #17): #11–#16 validadas, regressão 202/202
- [x] Bloco 03 aberto: milestone 4, issues #18–#23, prompts e painel
- [x] Bloco 03 integrado (PR #25): #18–#23 validadas, regressão 202/202, tipo `BeePersona` removido na integração
- [x] Bloco 04 aberto: milestone 5, issues #26–#31, prompts e painel
- [x] Bloco 04 integrado (PR #33): #26–#31 validadas, E2E `f28-ensinar-hive`, regressão 208/208 (2×); correção da aba Conversa na integração
- [x] Bloco 05 aberto: milestone 6, issues #34–#38, prompts e painel
- [x] Bloco 05 integrado (PR #39): #34–#38 validadas, E2E `f29-voz-da-hive`, regressão 213/213 depois do reinício do Supabase
- [x] Bloco 06 aberto sem Vídeos: milestone 7, issues #40–#43, prompts e painel (08/11)
