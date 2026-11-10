# Retomada das imagens e revisão visual de sequências

Estado: implementação preparada; registrar aplicação e resultado efetivo da regressão no PR antes de anunciar liberação. Base: PR #48, árvore `92aff54f445b66bd6d705f503f3ec2472a5bfe36`.

## Causa confirmada por leitura

O lote investigado tinha os dez planos como `produced`. As quatro imagens únicas estavam renderizadas; os quatro carrosséis e duas sequências de Stories tinham roteiro em rascunho e páginas sem render. A geração antiga marcava a tarefa como produzida ao salvar o roteiro, e a fila buscava somente planos `planned`. Assim, repetir a geração encontrava zero tarefas mesmo havendo imagens pendentes. Não havia indicação de reserva ativa ou falha atual de rede para explicar essa retomada vazia.

Além disso, a revisão das sequências abria primeiro um formulário de roteiro/direção e a galeria mostrava somente `slide1`. Era uma limitação do percurso, não conversão deliberada de carrossel em imagem única.

## Lista detalhada de ajustes

1. **Fila de imagens independente da fila de roteiros.** Considerar páginas canônicas sem imagem, com falha ou renderizadas de uma versão anterior, inclusive com o plano já produzido.
2. **Retomada pelo mesmo comando.** “Retomar produção pendente” produz somente o que falta. Não gerar uma nova base, novo roteiro ou novas cópias do post para obter imagens.
3. **Produção completa da proposta visual.** No novo fluxo, após gerar o roteiro a Hive produz as imagens de prévia. Roteiro e páginas permanecem em rascunho/pendentes de aprovação humana; gerar imagem não aprova conteúdo.
4. **Legado preservado.** O fluxo anterior mantém a exigência de aprovar roteiro antes de renderizar. A prévia sem aprovação antecipada só é permitida em peça `base_v2`, `pending_approval`, com roteiro `draft`.
5. **Páginas prontas preservadas.** O renderizador existente ignora imagens prontas da versão atual; erro numa página não obriga refazer as outras.
6. **Contagens verdadeiras.** Separar conteúdo aguardando geração, sequência com imagem pendente e post disponível para revisar. A mensagem de conclusão não chama apenas o roteiro de post visual pronto.
7. **Galeria com a sequência.** Carrosséis/Stories ocupam uma linha com as páginas em ordem, lado a lado, com rolagem horizontal. O conjunto não se resume à capa.
8. **Revisão centrada no resultado.** Prévia de todas as páginas em tamanho de leitura, legenda quando aplicável e ações principais. Para página sem imagem, mostrar o texto e a indicação de imagem a produzir, sem fingir que o visual ficou pronto.
9. **Detalhes sob demanda.** Roteiro, função narrativa, direção visual, template e ferramentas completas permanecem acessíveis por “Editar texto, ajustar com a Hive ou ver detalhes”, com retorno às imagens. Informações de proposta/ACJ ficam secundárias no novo percurso.
10. **Aprovação explícita do conjunto.** Confirmar “Revisei o texto e todas as imagens desta sequência” habilita a aprovação. Peça incompleta ou desatualizada não pode ser aprovada.
11. **Aprovação atômica e fiel ao que foi visto.** O novo comando compara texto, legenda, formato, ordem, versões de texto/render e URLs das imagens com o material mostrado. Se mudou, rejeita e pede nova revisão; não aprova silenciosamente outro material.
12. **Reuso do contrato canônico.** Após conferir o material e registrar a revisão explícita do texto/páginas, o comando chama `approve_sequence`. As operações são uma transação: falha desfaz aprovações intermediárias. Destinos, pacotes e publicação continuam nos contratos existentes.
13. **Permissões preservadas.** Funções novas são `SECURITY INVOKER`, restritas ao proprietário pelo contexto autenticado; sem acesso anônimo e sem leitura/aprovação de peça alheia.
14. **Identificação correta de formato.** Confirmação de aprovação informa carrossel ou Stories, em vez de sempre “Imagem”.
15. **Erro de imagem visível e recuperável.** A revisão informa o que ficou pendente, mantém as páginas prontas e oferece produzir apenas as pendentes. Detalhe técnico do motivo pode ser aberto quando necessário.

## Contratos e implantação

- Cliente: `loadProductionVisuals` / `sequenceVisualTodo` consultam `post_units`, a fonte canônica, para determinar trabalho visual restante.
- `renderPending` recebe opção explícita de prévia em rascunho, com as restrições acima; não muda o status do roteiro para aprovado.
- Migration `20261110151214_visual_sequence_review.sql`: acrescenta `sequence_review_material` e `approve_sequence_review`. Não altera linhas existentes, não substitui `approve_sequence` e não cria outro publicador.
- Aplicar a migration antes de liberar o cliente novo. O cliente atual continua usando os contratos existentes durante a validação.
- Não há deploy de Edge Function neste pacote.

## Verificação

- Testes puros cobrem roteiro concluído com visual pendente, preservação de páginas prontas, detecção de render desatualizado e snapshot do material revisado.
- F29 passa a conferir recusa de sequência sem imagens, material divergente e usuário alheio; valida aprovação atômica tanto de carrossel quanto de Stories.
- Novo cenário de interface parte de roteiro pronto, provoca falha de uma página e verifica retomada preservando as outras, galeria com todas as imagens, revisão sem formulário técnico inicial e confirmação humana antes de aprovar.
- Build, testes puros e compilação do spec são verificações locais. E2E e regressão rodam no GitHub, com usuário isolado; não executar publicação real nem testar aprovando posts do produtor.
- Dados reais foram consultados apenas para diagnóstico. A correção não deve arquivar, reescrever, aprovar ou publicar conteúdos reais por migração.

## Reversão e limites

Reverter o cliente por correção via Git antes de remover as funções novas. O rollback remove somente essas funções e preserva imagens, textos, versões e aprovações. Nenhuma reversão precisa apagar posts ou reativar rascunhos arquivados.

O Acervo e Reels permanecem no plano #47. Esta entrega trata do percurso atual de produção/revisão de imagens e sequências, sem antecipar geração de vídeo nem reconstruir o módulo inteiro.

## Estado de validação na preparação do PR

- Build aprovado; 40 testes puros aprovados; spec F29 compilado sem erros.
- Migration aplicada; funções confirmadas como invoker, sem execução anônima e com execução autenticada. Nenhuma linha real alterada.
- E2E e regressão completa ainda precisam de resultado no GitHub antes da integração do aplicativo. A versão de interface publicada permanece a do PR #48 até essa aprovação.
