# Revisão direta dos posts e navegação da produção

Estado: implementação preparada a partir do PR #49; conferir resultado efetivo no PR antes de anunciar publicação.

## Resultado para o produtor

A produção aprovada abre a lista visual da campanha, em vez de exigir resumo → galeria → peça → confirmação → galeria. Cada peça informa seu estado. Uma sequência apresenta as imagens em ordem e permite ajustar uma página sem reaprovar o roteiro inteiro. Aprovar conclui a revisão editorial; contas e agenda continuam em um processo posterior.

## Ajustes do pacote, em detalhe

1. Carregar `post_units` em todas as entradas de revisão, com ou sem um lote selecionado. A ausência do filtro de lote não pode ser interpretada como ausência de imagens.
2. Manter o filtro de lote na geração automática, para não retomar peças antigas de outros lotes ao simplesmente consultar a produção existente.
3. Abrir o lote aprovado diretamente na lista visual da campanha.
4. Mostrar campanha, ciclo/período, total previsto, aprovadas e efetivamente prontas para revisar.
5. Distinguir produção pendente, imagens em produção, produção interrompida, pronta para revisar e aprovada.
6. Não contar roteiro pronto com páginas faltantes/desatualizadas como post pronto.
7. Manter progresso e retomada na mesma lista, preservando o que já ficou pronto.
8. Direcionar “produção existente” do lote atual para a mesma revisão, sem um percurso paralelo com outra leitura de prontidão.
9. Retornar à lista após aprovação e manter a peça recém-aprovada em foco, com seu estado atualizado.
10. Preservar as páginas lado a lado em cada sequência; organizar as peças da campanha verticalmente.
11. Oferecer “Ir para a próxima pendente”, sem obrigar o produtor a perder a visão do conjunto.
12. Exibir “Ver peça aprovada” para conferir o resultado já revisado.
13. Tornar o retorno “Voltar à lista de peças” explícito.
14. Não exibir “Ver detalhes da proposta” quando a abordagem está vazia.
15. Clicar na arte da página abre o Canvas Studio existente; o texto permanece editável, sem rasterizar a composição para simular edição.
16. Expor “Ajustar texto” e “Alterar visual” por página. A edição da arte também oferece campos para o texto selecionado.
17. Manter o tamanho da página fixo na revisão (carrossel 4:5, Stories 9:16). Não oferecer o catálogo paralelo de templates do editor genérico, que aplicaria exemplos apagando o texto.
18. Capturar a arte viva ao salvar, sem depender do debounce da miniatura. Bloquear salvamento se a hidratação perder elementos.
19. Sincronizar título/corpo canônicos com os campos nomeados da arte; assinatura e textos do diagrama não são tratados como corpo editorial. Recusar campos principais removidos/duplicados.
20. Salvar uma página pelo contrato `piece_candidates` → `apply_unit_candidate`, com versão esperada e histórico, sem atualizar diretamente as projeções de publicação.
21. Salvar imagens em URLs imutáveis; invalidar a aprovação do material alterado, preservando páginas não alteradas e a legenda.
22. Preservar composição editada, geometria e rótulos ao pedir uma correção posterior de texto; detectar texto que não cabe na área, sem cortar silenciosamente.
23. Comparar antes/depois nas alterações de texto e sugestões da Hive. Aplicar ou descartar explicitamente.
24. Oferecer miniaturas reais das receitas executáveis para a capa e prévias claras/escuras com o próprio texto nas páginas de leitura. Propor um visual não o aplica automaticamente.
25. Gerar miniaturas localmente, sem consumir geração de IA ou alterar o post. Fotografias/fundos podem diferir no resultado proposto; o produtor vê a proposta antes de aplicar.
26. Preservar texto, legenda e outras páginas ao trocar o visual de uma página. Troca de tipo de recurso de imagem é informada antes de aplicar.
27. Manter rótulos semânticos do diagrama nos re-renders com variante fixa, em vez de descartar os polos da decisão visual.
28. Alertar quando o diagrama relacional ainda usa polos genéricos. Permitir corrigir os rótulos diretamente na arte ou escolher outro visual.
29. Recusar receita ausente no motor visual; não executar silenciosamente a primeira receita do catálogo quando outra foi escolhida.
30. Mostrar a legenda integralmente com quebra de linhas/palavras e crescimento natural da tela; permitir editar a legenda sem abrir o roteiro.
31. Registrar páginas revisadas com ação e indicação claras. Revisar todas as páginas ou confirmar a revisão do conjunto habilita uma única aprovação final.
32. Não exigir “aprovar roteiro”, depois “aprovar páginas”, depois “aprovar tudo” para uma correção pontual no novo fluxo.
33. Separar “Reformular roteiro completo” em um espaço próprio: edição do conjunto ou pedido guiado à Hive, comparação e aplicação via o contrato de candidatos. Não tentar regenerar um lote já concluído sem reserva de geração.
34. Preservar os percursos legados e a exportação/detalhes do material aprovado. Material agendado/publicado não ganha edição direta nesta tela.
35. Aprovar não agenda nem publica. Escolher contas e preparar publicação permanece uma ação posterior, com os contratos existentes.

## Diagnóstico das imagens e inventário visual

Consulta somente de leitura confirmou imagens prontas em todas as seis sequências do ciclo investigado. O percurso sem lote retornava uma lista vazia de páginas, produzindo o falso aviso de material não produzido. Não é necessário apagar, regenerar ou alterar os dados reais para reparar essa exibição.

O catálogo consultado contém receitas congeladas/ativas de M01, M02, M03 e M04. O fluxo corrente executa M01 (5 receitas), M02 (4) e M03 (4); M04 (3) tem processo específico de convites/eventos. As capas existentes distribuíram-se pelas três famílias correntes. Isso não prova adequação semântica de cada escolha; é diferente de não conseguir acessar uma família.

Limite explícito: este pacote abre e organiza a curadoria visual e elimina perda silenciosa da receita escolhida. Não habilita M04 em posts comuns nem torna todos os diagramas do catálogo semanticamente dinâmicos. O alerta de polos genéricos e a edição visual evitam esconder essa limitação. Uma revisão mais ampla das receitas/modelos deve respeitar seus contratos e seus contextos próprios.

## Contratos, preservação e implantação

Sem migration ou deploy de Edge Function. O cliente reutiliza `post_units`, `piece_candidates`, `apply_unit_candidate`, `approve_sequence_review` e os fluxos existentes de destinos/agendamento. Não mexer em permissões ou contornar recusas do servidor.

Nenhum conteúdo real é apagado, gerado, aprovado ou publicado para validar a mudança. Diagnósticos sem textos/IDs reais neste documento público. Testes de interface só pelo GitHub, com dados isolados e IA simulada. Sem publicação em contas sociais reais.

## Verificação

Build e 44 testes puros aprovados na preparação; recompilar após a última edição e registrar a evidência final no PR. Testes novos cobrem estados, sincronização da arte e preservação do desenho. F29 valida edição imediata na arte, ajuste por campo, comparação visual, troca local de fundo, legenda longa, preservação de páginas, aprovação sem agendamento e perda da aprovação somente quando o material muda.

Rodar F29 de produção, F18 e F20 no GitHub primeiro; corrigir falhas se houver. Depois rodar regressão completa sobre o mesmo commit, sem outra suíte concorrente. Publicar somente após os resultados aprovados. Retornar por correção via Git, sem apagar conteúdos.
