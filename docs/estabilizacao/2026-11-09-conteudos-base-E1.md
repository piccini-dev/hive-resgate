# Conteúdos-base — fundação E1 em preparação

Plano: `docs/plano/CONTEUDOS-BASE-E-PRODUCAO.md` no PR #45. Base de código inspecionada: `71f630f2d032b9f203f092e0235d590032812154`.

**Estado: rascunho de implementação. Não publicar o app desta branch.** E1/E2 precisam de integração antes de disponibilizar o novo caminho de produção. Esta etapa ainda não oferece o plano de formatos, a revisão sem duplicação por conta, a seleção visual ampliada ou o cancelamento de campanha.

## O que foi preparado nesta etapa

1. `content-develop` aceita a finalidade explícita `knowledge_base`. Requisições antigas continuam utilizando o contrato legado.
2. Nessa finalidade, a Hive utiliza conhecimento autorizado, contexto de voz e recuperação da biblioteca para desenvolver pensamento, argumentos, relações, nuances, possíveis desdobramentos e lacunas. Sem escolher plataforma, formato, conta ou template.
3. As instruções distinguem princípios do produtor das regras de acabamento de posts. Hashtags, CTA, headline e pontuação de viralidade não definem a base.
4. A resposta identifica a finalidade. O cliente recusa um servidor antigo que ignore esse pedido e devolva um post, preservando o trabalho já salvo.
5. Desenvolver a base deixa de registrar um post LinkedIn e suas métricas. O aprendizado editorial da peça continua pertencendo à etapa de produção; a história da base é registrada por versões.
6. A validação utiliza um contrato do banco e não cria nem aprova post. O corpo apresentado é conferido contra o que será validado, evitando aprovação silenciosa de um texto alterado em outra sessão.
7. A migration adiciona versões de base e vínculos de utilização por campanha/ciclo. Não faz backfill, não modifica os textos existentes e não reconstrói peças reais.
8. A versão validada tem corpo, referências e contexto imutáveis. Uma edição posterior cria um rascunho; a utilização de outra campanha continua apontando para a versão validada anterior.
9. Edição de rascunhos usa controle de concorrência, com identificação do rascunho e estado da base que foi aberto.
10. Referências entre base, versão, pauta e ciclo são conferidas no banco. RLS por proprietário é preservada; os contratos novos são `SECURITY INVOKER`, com autorização explícita e sem `SECURITY DEFINER`.
11. A nova visão geral mostra validados, rascunhos e pautas a desenvolver. Permite abrir uma base, editar, ajustar com IA, validar, escolher a próxima ou voltar à visão geral.
12. Bases legadas já validadas continuam validadas. Não é necessário regenerá-las nem reaprovar seu pensamento para continuar o trabalho.
13. A infraestrutura de reaproveitamento foi adicionada à API. A sugestão e seleção visual de pautas do acervo ainda precisa ser conectada na próxima entrega; a existência do contrato não significa que essa tela esteja pronta.
14. Peças novas que futuramente apontarem a uma versão congelada não receberão a sinalização de fonte desatualizada apenas porque o acervo evoluiu. O comportamento legado é mantido para peças sem versão fixada.
15. Há rollback que revoga os contratos novos e restaura a função antiga, preservando tabelas e versões. Reverter o app vem antes; dados não são apagados para desfazer a implantação.
16. A limpeza dos testes reconhece as novas relações, apenas no usuário de teste isolado. O spec F4 foi reescrito porque a exigência antiga de criar LinkedIn na aprovação da base mudou por decisão de produto.

## Verificações realizadas

- Build TypeScript/Vite: aprovado (última execução Vite em 7,44 s).
- Unitários puros: 24/24 aprovados; oito novos cenários de resolução de versões, isolamento entre ciclos, manutenção do legado e rejeição de resposta no contrato antigo.
- `deno check supabase/functions/content-develop/index.ts`: aprovado.
- Parser PostgreSQL e PL/pgSQL: migration e rollback aceitos. Isso verifica sintaxe, não a semântica nem o RLS em execução.
- Descoberta do spec F4: quatro cenários mais o setup existente. **Não foram executados no navegador.**
- Comparação em leitura: `content-develop` remoto versão 10 coincide com a base do repositório anterior às alterações desta branch.
- Health Advisor: sem avisos na consulta realizada.

## Bloqueio de implantação

As duas solicitações de `apply_migration` pelo conector Supabase retornaram confirmação expirada. A operação não foi contornada por SQL direto ou outro token. Uma leitura posterior confirmou que as tabelas novas não existem e que os conteúdos aprovados da campanha corrente permanecem preservados.

A migration local foi aperfeiçoada depois dessas tentativas. Ao retomar, ler **o arquivo local/commit atual**, não reutilizar o corpo das solicitações expiradas.

Não foi aplicado DDL ou DML de produção, não houve deploy de Edge Function, merge ou publicação do app. Foi salvo um registro privado recuperável da campanha/ciclo antes das tentativas, sem credenciais de contas sociais; o arquivo não está no repositório público.

## Próximos passos de implementação

1. Resolver a confirmação do conector para aplicar a migration atual; verificar os contratos e RLS com o usuário de teste, sem tocar nas bases reais.
2. Verificar os testes de integração de versão imutável, aprovação com corpo esperado, concorrência, autorização e idempotência. Aprovação no parse não substitui essas verificações.
3. Concluir o plano de produção por plataforma/formato, famílias visuais e confirmação tardia de contas. Retomar o ciclo legado em proposta de produção sem disparo automático do gerador antigo.
4. Fazer a nova geração/revisão usar os snapshots aprovados. Preservar as peças legadas e exigir confirmação para substituir apenas pendências indicadas pelo produtor.
5. Conectar acervo e pautas, atualizar os consumidores de memória e ACJ e completar os testes afetados (inclusive os que ainda pressupõem validação LinkedIn).
6. Concluir o cancelamento como entrega independente, com proteção de tarefas/agendamentos no servidor.
7. Executar regressão completa no GitHub sobre o código integrado à main atual. Só depois considerar merge e publicação; CI de build/unitários isolado não libera este rascunho.

## Retomada técnica

Branch: `feat/bases-producao-campanhas`. Migration: `supabase/migrations/20261109185634_content_base_production.sql`; rollback com o mesmo nome em `supabase/rollback/`.

Os novos contratos esperados pelo cliente são `save_base_draft`, `validate_content_base` e `adopt_content_base`. Não habilitar a interface antes de existirem e serem verificados. O trecho que segue para a produção ainda precisa ser integrado ao novo contrato de plano; manter o PR em rascunho até isso estar completo.
