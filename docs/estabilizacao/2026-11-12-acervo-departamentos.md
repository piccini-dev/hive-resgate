# Conteúdos mãe e estabilidade da edição

## Decisão de produto

Conteúdos mãe pertencem à Voz da Hive. Campanha seleciona bases aprovadas e propõe recortes; produção monta e revisa peças; agenda cuida dos destinos e horários. A rodada completa foi dividida em cinco blocos. Esta primeira entrega trata da entrada independente do acervo, do caminho de utilização em novas campanhas e da carga do editor.

Nenhuma peça real, agendamento, campanha ou base é migrada automaticamente. Nenhuma função remota ou migration é alterada nesta entrega.

## Implementação

- `/conteudos-mae`, no grupo Voz da Hive: catálogo, criação humana ou com a Hive, revisão manual/assistida, rascunhos, validação, versões e utilizações.
- O catálogo reconhece bases já versionadas e bases explicitamente criadas como conhecimento. Posts históricos importados não são promovidos silenciosamente.
- O espaço técnico de conteúdos avulsos existente sustenta a criação independente, sem exigir uma campanha na interface. Uma revisão de base originada em campanha ganha um contexto independente antes de salvar; o uso anterior mantém sua versão.
- Novas campanhas recebem `metadata.content_source=archive`; sua produção adota versões aprovadas e segue para a proposta de peças. Não chama `cycle-pauta`, não cria ideias mãe e não desenvolve novas bases. Solicitação de base ausente leva ao acervo.
- Campanhas anteriores conservam o percurso legado para retomada. O caminho do acervo também pode ser inspecionado com `flow=acervo`. A aposentadoria do planejamento legado e a configuração dos processos remotos precisam de entrega própria: o cron `campaign-tick` existente ainda pode propor pautas em campanhas antigas. Novas campanhas que apenas adotam bases não criam ideias, e esse cron não inicia campanhas sem ideias.
- Cada hidratação do canvas tem cancelamento e prazo de 20 segundos. Uma carga obsoleta não sinaliza prontidão da época atual. Erros oferecem nova tentativa; arte parcial não libera captura/salvamento.
- O editor completo espera a prontidão para habilitar Salvar/Aprovar.

## Verificação

- Build TypeScript/Vite local: aprovado na primeira execução; repetir após ajustes finais.
- F30 cobre catálogo versus importações, criação e validação sem post, revisão independente preservando o uso de campanha e a peça programada integralmente, adoção sem geração de ideias/bases, reaberturas e recuperação de imagem com falha.
- Testes de navegador: executar no GitHub; não executados localmente.
- A regressão completa precisa passar no mesmo commit antes do merge.
- No commit `da9367e`, os nove testes direcionados passaram; a suíte completa teve 272 aprovações e uma falha no F10: um listener de resposta tentava ler o corpo após o fim do teste. O teste agora aguarda explicitamente a resposta de status e seu corpo, confirma o registro esperado e mantém a verificação de ausência do token. Nova regressão obrigatória antes da publicação.

## Próximos blocos

3. Legenda integral, revisão compacta e galeria visual, com correspondência entre seleção e resultado.
4. Regras e diagnóstico de geração/reutilização de imagens em Templates/Visual.
5. Aprovação e continuação, contas padrão/confirmação em lote, cadência e calendário agrupado com destinos identificados.

Não declarar a rodada inteira concluída a partir desta primeira entrega.
