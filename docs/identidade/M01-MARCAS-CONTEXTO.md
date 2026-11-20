# M01 · Marcas e contexto da Identidade

## Decisão do Marcos — 18/11/2026
Marcos aprovou este bloco e pediu: "Quero fazer tudo sem depender do Raul", seguido de "pode seguir com a criação" e "pode fazer sem o milestone então".
- Sem milestone por decisão expressa; branch única `marcos/01-marcas-contexto`.
- Execução das sete tarefas por agentes do Marcos, sem revisão ou execução obrigatória do Raul.
- Todas usam `exec:gpt`. Validação integrada é responsabilidade do agente orquestrador do Marcos, apenas no GitHub, não de um executor comum.
- Exceção limitada às referências de AGENTS.md que reservam essas responsabilidades ao Raul: a autorização do Marcos para banco/funções permanece, mas **nenhuma issue deste bloco autoriza novo DDL, deploy de Edge Function ou alteração de dados reais**.
- Se a auditoria detectar correção de backend, registrar o contrato e bloquear as dependentes; especificar uma nova issue delimitada, sem ampliar silenciosamente o escopo.
- Não publicar em redes, contornar RLS, alterar segredos/workflows ou fazer merge. Entregar PR com testes e evidências para decisão final do Marcos.
- Banco compartilhado: conexão Supabase **Bee Consulting**, projeto `djlorvdehedcupeykyes`. 403 interrompe o acesso, sem trocar de conexão/chave.
- Issues e commits são o registro de retomada. Não depender de arquivos locais não enviados.

## Entrega e limite
Primeiro dos três blocos da atualização: (1) Marcas e contexto; (2) organização das áreas da Identidade; (3) Inteligência e fronteira de Campanha.
Neste primeiro bloco: administrar marcas em `/identidade/marcas`, selecionar contexto nessa área e encaminhar à configuração guiada da marca correta. Não prometer seleção global aplicada à geração/Biblioteca/Produtos: esses consumidores serão tratados nos próximos blocos.
O menu completo de seis áreas entra no bloco 2. Aqui só se acrescenta acesso Marcas e mantém todos os acessos existentes.

Base verificada: `1ba8cfbc207b27bb1281db0953fc4244e8a67e4e` (main em 18/11). Branch criada desse SHA.
Trabalho concorrente observado: `bloco/15-hive-recomenda`, issues #96–#101, e fechamento #94 do bloco anterior; os arquivos delimitados aqui não se sobrepõem aos escopos declarados. Rever antes de executar se houver mudança.

## Estado recuperável do trabalho anterior
O PR #85 contém documentação, não a implementação. Não reutilizar seus checklists como prova de funcionalidade.
Consulta somente leitura confirmou a migration `20261117143519_identity_content_intelligence`, com 1 entrada em `statements` e 26.784 caracteres recuperáveis no histórico remoto. Não reaplicar nem gerar outra versão com o mesmo conteúdo.
RPC existente: `public.set_brand_archived(p_brand uuid, p_archived boolean) RETURNS brands`. Recusa com PT404 marca indisponível e PT409 campanhas draft/active/paused ou peças approved/scheduled ligadas por perfil. Não substituir esse contrato por PATCH direto de status.
A primeira issue registra o SQL e revisa os efeitos/limites; nenhum dado de produtor deve ir para este repositório público.

## Execução e validação
- Uma issue por vez por executor. Até três arquivos por issue; um commit por passo, corpo atualizado e relatório final.
- Todos os commits vão à branch do bloco. Antes de cada escrita, reler o arquivo remoto e a ponta da branch; não sobrescrever trabalho de outro executor.
- Issues de implementação: build e unitários sem banco podem ser executados; E2E são escritos e ficam para o fechamento. Não aguardar CI.
- A configuração atual da regressão é **manual**: `.github/workflows/regressao.yml`, entrada `specs`. Abrir PR não substitui o disparo.
- Fechamento: conferir ausência de outra suíte, specs afetados no GitHub, três repetições dos casos assíncronos no mesmo commit e regressão completa no commit final compatível com main. Sem skips/retries nem edição durante a suíte.
- Sem credencial/capacidade para disparar ou conferir: registrar BLOQUEADA com o próximo passo; não declarar verde.
- Não criar PR até implementar o bloco; não fazer merge nem deploy do app nesta fase de criação de issues.
