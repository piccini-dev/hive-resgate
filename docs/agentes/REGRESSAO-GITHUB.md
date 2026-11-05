# Alterações, regressão e publicação pelo GitHub

Decisão do Marcos em 05/11/2026: trabalhar com seus agentes sem revisão obrigatória do Raul. Leia o `AGENTS.md` e [AUTONOMIA-MARCOS](AUTONOMIA-MARCOS.md), que rege responsabilidades e limites. Preserve as dependências dos blocos do resgate e não assuma trabalho em execução.

## 1. Preparar a mudança

- Confira conta, remoto e titularidade atual: a transferência do repositório está em andamento; não presuma que terminou.
- Atualize a base e use uma branch de trabalho. Micro-tarefas atribuídas continuam na branch do bloco; uma entrega independente autorizada pelo Marcos pode usar branch própria.
- Faça um assunto por PR, com diff mínimo e os testes pertinentes. Não use `skip`, `only`, `retries` ou expectativas enfraquecidas para esconder falhas.
- Não envie diretamente à `main`. Não abra PR duplicado sobre trabalho em execução.

## 2. Abrir o PR

O agente pode enviar a branch e abrir o PR dentro da tarefa autorizada. Descreva:
1. O que muda para o Marcos.
2. Arquivos e motivo.
3. Validações realizadas, com resultado real.
4. Dependências de implantação, quando houver.

PRs prontos para `main` acionam o CI existente. Um rascunho não deve ser tratado como entrega pronta para integrar.

## 3. Executar a regressão no GitHub

**Estado observado em 05/11/2026:**
- `ci.yml`: build e testes unitários nos PRs.
- `regressao.yml`: regressão completa **manual**, via `workflow_dispatch`.
- A `main` consultada estava sem proteção. As regras escritas não comprovam proteção técnica.

Este ajuste documental não instala automação, configura segredos nem muda proteção de branch. O objetivo é ter regressão completa no GitHub e verificações obrigatórias antes do merge; até essa infraestrutura estar configurada, usar o workflow manual e conferir a evidência.

O Marcos, ou agente com ferramenta e permissão adequadas, seleciona no GitHub o workflow **Regressão completa**, a branch correta e executa com `specs` vazio para a suíte inteira. O botão fica disponível somente conforme as permissões do GitHub; se não houver ferramenta para acioná-lo daqui, informar ao Marcos o passo necessário no GitHub. Não pedir execução no PowerShell.

Nunca rodar simultaneamente contra o mesmo usuário de teste, inclusive no repositório antigo. Conferir execuções ativas antes de iniciar: a fila atual é por repositório, não entre repositórios.

Acompanhar a execução até o resultado e registrar URL, ref/SHA testado, número de testes, duração e falhas. O workflow manual atual mostra o resumo na página da execução; não presumir que haverá comentário no PR. CI verde de build/unitários não substitui regressão completa de código.

**Somente documentação:** build basta, conforme a regra do projeto. Isso não significa afirmar que uma regressão completa foi executada.

## 4. Se houver falhas

- Código quebrou comportamento: corrigir o código.
- Teste contradiz decisão de produto já aprovada: atualizar o teste e explicar a decisão.
- Erros de rede/infraestrutura: verificar a evidência antes de classificar; repetir a execução pertinente sem enfraquecer testes. Um 403 exige parar e informar o Marcos.
- Agrupar correções em um único envio e revalidar o código atualizado. Não integrar com falhas ou testes não executados.

## 5. Integrar e confirmar publicação

1. Confirmar todos os portões exigidos verdes, no código final integrado à base atual. Se a base ou o código mudar, atualizar a branch e revalidar antes do merge.
2. Conferir dependências de implantação; não integrar cliente incompatível com o servidor.
3. Com autorização aplicável do Marcos, ele ou o agente faz o merge. A revisão do Raul não é obrigatória. Se a ferramenta ou permissão recusar, informar o impedimento sem contornar.
4. Conferir que o Netlify publicou a versão e o site esperado. Não confundir commit, merge e deploy concluído.

Hoje, a `main` do resgate publica `https://hive-resgate.netlify.app`, o site de teste. Trocar o domínio da Hive atual exige decisão explícita do Marcos e um caminho de retorno.

## 6. Banco, funções e configurações

O merge publica somente o app; não aplica migrations ou Edge Functions. O resgate continua limitado ao front-end. Uma tarefa de servidor exige impacto, sequência de implantação, verificação, rollback, acesso confirmado e escopo autorizado pelo Marcos. Não depende obrigatoriamente do Raul nem é autorizada apenas por existir uma conexão administrativa.

Não alterar workflows, segredos, proteção de branches, domínios ou crons como efeito incidental de um pedido de documentação. Configurações de infraestrutura são tarefas próprias, com autorização aplicável.

## 7. Prévia e dados reais

Os sites do resgate e da Hive atual compartilham banco e funções. Ações de aprovar, agendar ou publicar no site de teste valem de verdade. Não usá-lo para testar ações na conta do Marcos. Testes usam somente o usuário isolado e contas com token falso. Segredos nunca em arquivos versionados, PRs ou logs.

Segundo o plano atual, deploy previews e deploys de branches estão desligados; não presumir que abrir um PR produzirá uma prévia. Revalidar a ligação do Netlify com o Git após a transferência de titularidade.
