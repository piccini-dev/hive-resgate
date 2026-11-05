# Autonomia do Marcos e dos agentes — 05/11/2026

Decisão do Marcos: desenvolver e publicar melhorias da Hive com seus agentes, sem revisão obrigatória ou execução na máquina do Raul. Este documento rege responsabilidades, testes e publicação neste repositório e prevalece sobre instruções anteriores que reservem essas ações ao Raul ou ao orquestrador. Não muda o escopo funcional do plano de resgate.

## Responsabilidades e limites

- Marcos decide produto, prioridades, ampliação de escopo e publicação. Raul pode colaborar, mas sua revisão não é requisito obrigatório.
- O agente pode investigar, implementar, escrever testes, criar branches, commits e PRs dentro de uma tarefa autorizada. Não precisa pedir novamente autorização para passos já abrangidos pelo pedido.
- Um merge exige autorização aplicável do Marcos, testes exigidos verdes no código final integrado à base atual e ausência de dependências de implantação pendentes. Nunca enviar diretamente à `main`.
- Preserve a organização por blocos e as dependências das issues em andamento. Trabalhos independentes autorizados pelo Marcos podem usar branch própria e PR para `main`, sem alterar o trabalho de outro agente. Uma issue fechada por implementação não prova que os testes passaram.
- Não assumir uma tarefa em execução nem executar etapas que dependam de acesso local indisponível. As etiquetas `exec:claude` registram a atribuição atual, não uma exigência de aprovação pessoal do Raul; sua reatribuição depende de coordenação com o Marcos e de acesso adequado.
- Somente documentação: build basta. Mudanças de comportamento, testes, dependências ou configuração exigem build, unitários e regressão completa antes do merge.

## Regressão no GitHub

- E2E e regressão completa rodam no GitHub, sem pedir ao Marcos para instalar ferramentas, fornecer token pelo chat ou executar testes no PowerShell.
- **Estado observado em 05/11:** `ci.yml` executa build e unitários nos PRs; `regressao.yml` é acionado manualmente (`workflow_dispatch`). Este ajuste de diretrizes não altera workflows, segredos, permissões ou proteção de branches.
- Até a automação completa estar configurada, o Marcos ou um agente com ferramenta e permissão de acionamento inicia a regressão no GitHub para a branch correta. Sem esse acesso, informar o impedimento ao Marcos. Não considerar o CI de unitários como regressão completa e não fazer merge de código sem a evidência necessária.
- Registrar URL da execução, SHA/ref testado, resultado, quantidade de testes e duração. O teste deve cobrir o código que será integrado com a base atual. Se o código ou a base mudar, revalidar antes do merge.
- Nunca rodar duas suítes contra o mesmo usuário de teste, inclusive entre `bee-platform` e `hive-resgate`. Uma fila por repositório não garante exclusão entre repositórios.
- Corrigir falhas sem `skip`, `only`, retentativas artificiais ou expectativas enfraquecidas. Falha de infraestrutura não é aprovação.

## Publicação e banco

- O merge da `main` do resgate publica o site de teste, conforme a configuração atual. Só afirmar que foi publicado depois de confirmar o deploy e a versão acessível.
- A migração do domínio para a Hive nova exige decisão explícita do Marcos, validação e caminho de retorno. Não a executar como parte de uma alteração comum de interface.
- Banco e Edge Functions são compartilhados com a produção. O resgate continua limitado ao front-end: não alterar tabelas, funções, crons ou dados reais apenas porque a conexão permite.
- Se uma tarefa precisar mudar banco ou funções, apresentar ao Marcos o impacto, a sequência de implantação, a verificação e o rollback. Com escopo autorizado e acesso técnico confirmado, um agente habilitado pode executar; a participação do Raul não é obrigatória. Sem esses requisitos, registrar a dependência e não publicar o cliente incompatível.
- Migrations continuam versionadas, idempotentes e com rollback; nunca usar `supabase db push`. Conservar os contratos de aprovação, agendamento e publicação e a imutabilidade do histórico publicado.
- Publicar posts reais nas redes exige autorização específica do Marcos para aquela ação. Testes só usam o usuário isolado e contas de token falso. O site de teste usa dados reais e não serve para experimentar ações na conta do Marcos.
- Um 403 exige parar e informar o Marcos, sem trocar credenciais ou contornar o bloqueio. Segredos nunca em código, issues, PRs ou logs. A conta conectada ao ChatGPT não configura automaticamente tokens no GitHub ou na máquina local.

## Configuração ainda necessária

Esta decisão não comprova configuração técnica. Confirmar separadamente:
1. Transferência do repositório e permissões efetivas da conta e da integração GitHub.
2. Segredos do usuário de teste no GitHub e execução bem-sucedida da regressão no novo repositório.
3. Proteção da `main`: PR, verificações exigidas e base atualizada, sem revisão obrigatória do Raul.
4. Acesso ao Netlify para consultar deploys/logs, reverter versão e administrar variáveis e domínios quando necessário. Revalidar a ligação do Git após a transferência.
5. Permissões do Supabase para cada operação solicitada; acesso de leitura não prova implantação de funções ou migrations.

## Entrega

PRs descrevem o que muda no uso, arquivos/motivos, validações e **Dependências de implantação** (em vez de atribuir qualquer pendência automaticamente ao Raul). O agente informa separadamente: preparado, testes aprovados, integrado e publicado. Não confundir essas etapas.
