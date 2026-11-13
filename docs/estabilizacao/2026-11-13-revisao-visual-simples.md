# Pacote: revisão e visual

## Resultado esperado

O produtor lê a legenda inteira e revisa uma página em um painel compacto: texto, imagem, diagrama (incluindo seus textos) ou página inteira. Um pedido à Hive gera uma comparação antes de aplicar. A edição manual continua disponível como opção secundária; o canvas completo abre somente quando solicitado.

Templates são escolhidos por miniaturas com o texto da peça. A escolha explícita do produtor é obrigatória na composição. Um pedido de nova foto não pode terminar silenciosamente com a foto de referência anterior.

## Critérios de aceite

- Legenda de produção sem corte por quantidade de linhas.
- Revisão assistida por um campo de pedido; edição manual recolhida por padrão.
- Revisar somente o diagrama preserva o texto principal, a assinatura, as fotos, a legenda e as outras páginas. Trocar sua representação continua possível.
- Revisar a página inteira pode alterar seus textos e sua imagem quando o modelo permite, preservando a legenda e as outras páginas. Composições manuais mistas exigem pedido separado para foto e diagrama.
- Toda alteração usa candidatos e comparação/aplicação existentes; nenhum material agendado/publicado é reescrito por esta entrega.
- Galerias mostram a composição real disponível. O modelo selecionado não é substituído por outra decisão da IA. Textos não são truncados silenciosamente.
- Templates permite definir fotos como referência para geração ou reutilizáveis em peças. A regra vale para novas escolhas, sem modificar peças existentes. Nenhuma preferência real é alterada automaticamente.
- Falha de geração ou ausência de estilo aprovado é explicada; uma foto antiga não é apresentada como nova.

## Contratos e limites

Frontend, testes e documentação. Sem migrations, Edge Functions, dependências ou alterações de workflows. Revisão textual usa `edit-text` com contexto da peça; aplicação usa `apply_unit_candidate`/`applyCandidate`. Regras de uso das fotos ficam no JSON semântico já existente, com controle de concorrência.

## Validação

1. Build e testes puros.
2. Testes específicos de revisão de páginas, templates, fotos e preservação de dados; corrigir falhas isoladamente.
3. Somente após os específicos verdes, congelar o commit e executar uma regressão completa.
4. Integrar e confirmar a implantação do mesmo código no Netlify.

## Fora deste pacote

Aprovação e continuação, contas padrão, confirmação em lote, distribuição diária e calendário agrupado pertencem ao próximo pacote.

## Verificação inicial

Build TypeScript/Vite e 61 testes puros aprovados localmente. Nenhum E2E foi executado localmente. F31 cobre revisão assistida e de página inteira com comparação e preservação das demais páginas/legenda, falha de geração sem estilo aprovado, leitura da legenda inteira e configuração de uso de foto preservando os metadados. F5 força uma resposta de modelo divergente e exige o formato realmente escolhido pelo produtor. F29 mantém seus cenários manuais e abre explicitamente a edição avançada.

Validação específica no GitHub: execução 43489376971 (F31, F5 e F29) com 14 aprovados e uma falha de automação, que tentava conferir controles dentro da seção recolhida de opções. O teste passou a abrir essa seção, mantendo suas asserções. Repetição isolada do cenário manual na execução 43491492038: 2 aprovados, zero falhas (incluindo preparação). A regressão completa no commit final permanece como portão obrigatório; seu resultado será registrado no PR antes da integração.
