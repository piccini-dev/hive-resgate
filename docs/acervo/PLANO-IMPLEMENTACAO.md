# Acervo vivo, pautas de campanha e criação acompanhada de posts

Decisões de produto de Marcos Piccini — 10/11/2026.

**Estado: especificação para implementação. Este documento não altera o aplicativo, o banco, as funções nem os conteúdos reais.**

Referência técnica inicial: árvore publicada pelo PR #46, integrada em `6a9c8b55dfad11fd2f1b243692fe6ea51989d92f`. A implementação deve conferir o estado mais recente antes de começar. Este plano refina a separação entre conhecimento reutilizável e execução de campanha; não substitui as garantias de aprovação, destinos e publicação já entregues.

## 1. Resultado esperado

A Hive mantém um acervo de conhecimento do produtor, identifica oportunidades para desenvolvê-lo e utiliza versões aprovadas para propor pautas específicas de campanhas. O produtor vê recomendações claras, conversa com a Hive e valida resultados concretos. A complexidade de planejamento permanece nos bastidores, com ajustes acessíveis.

Não exigir criar ou revalidar conteúdo-base em toda campanha. Não confundir aprovação do conhecimento, aprovação da pauta e aprovação do post.

## 2. Vocabulário único

| Elemento | O que é | Relações e limites |
|---|---|---|
| Biblioteca | Matéria-prima original: livros, aulas, entrevistas, podcasts e documentos. | Pode sustentar várias bases; indicar fontes reais e disponibilidade de leitura. |
| Conteúdo-base | Conhecimento elaborado e reutilizável, mais amplo que uma pauta de campanha: o “chassi”. | Tem versões e fontes; existe fora de campanhas; não exige conta, plataforma ou formato. “Tema-chave” é a expressão conceitual, não outra entidade ou fila. |
| Editoria | Recorte editorial que organiza a maneira de abordar o conhecimento. | Uma base pode servir a várias editorias; não duplicar a base por editoria. |
| Pauta da campanha | Recorte específico de uma ou mais versões de bases, adequado ao público, objetivo e momento de uma campanha/ciclo. | Explicita o que pretende comunicar e sua contribuição. Não é uma nova base nem um post pronto. |
| Post / peça | Expressão concreta da pauta em determinada plataforma e formato. | Tem texto/visual, revisão, versões e aprovação próprios; uma pauta pode gerar mais de uma peça. |
| Destino | Conta na qual o material aprovado será utilizado. | Escolha posterior à aprovação editorial; várias contas não multiplicam a revisão da mesma peça. |

O Acervo é o espaço que reúne biblioteca, conteúdos-base e oportunidades. “Criar conteúdo-base” não cria um novo acervo independente. A separação entre marcas e clientes continua sendo a do espaço de trabalho autorizado.

## 3. Organização na navegação

Na área hoje referida pelo produtor como “Voz da Hive”, oferecer acesso coerente a:

1. **Minha identidade:** produtor/marca, posicionamento, visão e contribuição.
2. **Como escrevo:** voz, tom e preferências gerais; calibrações específicas continuam possíveis.
3. **Editorias:** recortes editoriais.
4. **Acervo:** Biblioteca, Conteúdos-base e Oportunidades.

Reaproveitar as telas existentes de identidade, conhecimento e editorias. Evitar dois lugares com cadastros concorrentes do mesmo objeto. Conferir rótulos e rotas reais na implementação; esta organização não autoriza reconstruir todo o menu ou o setup.

## 4. De–para do processo

| Hoje, na entrega #46 | Com este ajuste |
|---|---|
| Base ampla é desenvolvida e validada dentro da jornada do ciclo. | Base pode nascer e evoluir no Acervo sem campanha. Na campanha, primeiro buscar conhecimento já aprovado. |
| Reutilização existe por versões/usos, mas a pauta e a base ainda podem ser tratadas como etapas de um mesmo desenvolvimento. | Pauta é um objeto separado: recorte da campanha com referências às versões utilizadas. |
| Nova proposta tende a encaminhar para desenvolver outra base. | Distinguir usar base existente, ampliar uma base ou criar base nova. Explicar o motivo. |
| Proposta de produção expõe seleção de base, plataforma, formato, abordagem, editoria e família em formulário por peça. | Cards de pautas e propostas prontas de posts; planejamento detalhado em “Ver proposta e ajustar”. |
| Aprovação de plano antecede geração em lote. | Manter consentimento durável para geração, com percurso simples: criar o primeiro, calibrar e permitir produzir o próximo ou os demais. |
| Acervo consultado para uma demanda atual. | Acervo também pode ser desenvolvido por iniciativa do produtor ou por oportunidades identificadas pela Hive. |

## 5. Conteúdo-base: estrutura e classificação

Guardar título, síntese, desenvolvimento amplo, argumentos, tensões/nuances, apoios nas fontes, lacunas e perguntas ainda abertas. Não preencher lacunas com fatos ou relatos inventados. Legenda, hashtags e CTA não são requisitos de uma base.

Classificação inicial sugerida pela Hive, editável pelo produtor:

- Assuntos principais e termos relacionados.
- Editorias e públicos potencialmente relevantes, com múltiplas associações.
- Marca/voz/frente autorizada, fontes e origem da criação.
- Estado: rascunho, em validação, aprovado ou arquivado; versões preservadas.

Não transformar a classificação em formulário obrigatório. Público e editoria indicam relevância possível, não obrigação para todos os usos futuros. Não vincular conta de rede social à base. Reaproveitamento entre frentes só quando autorizado; nunca entre clientes por mera similaridade.

## 6. Criação guiada no Acervo

Botão **“Criar conteúdo-base”**, com duas entradas:

| Entrada | Condução |
|---|---|
| Quero sugestões da Hive | Consultar biblioteca e bases autorizadas, identidade, editorias e necessidades conhecidas. Apresentar poucas propostas, justificativa e recomendação de início. |
| Tenho algo para desenvolver | Aceitar ideia, pergunta, texto ou material. A Hive identifica o que já sabe e pergunta somente o necessário para desenvolver. |

Percurso comum: investigar → apresentar entendimento e estrutura → desenvolver com o produtor → revisar → **“Aprovar e guardar no acervo”**.

Permitir salvar e sair, retomar, editar diretamente, pedir ajuste à Hive ou descartar a proposta sem excluir suas fontes. Perguntas guiadas são conversas sobre o conhecimento; não exigir do produtor uma taxonomia ou briefing de marketing.

Sugestão ou rascunho da IA não entra automaticamente no conjunto de bases aprovadas. A aprovação guarda a versão e as classificações confirmadas; não gera posts, destinos nem agendamentos.

## 7. Campanha: consultar e recortar antes de produzir

1. Resolver contexto estratégico: objetivo, público(s), voz/frente, produtos/lançamentos e momento do ciclo.
2. Buscar bases aprovadas relevantes e examinar seus usos, pautas, posts em produção e publicações anteriores. Não usar apenas títulos ou uma janela pequena de posts como evidência de esgotamento de todo o acervo.
3. Propor pautas específicas, com resumo, intenção, fontes/bases, contribuição nova e identificação de origem verdadeira.
4. O produtor pode aprovar várias, ajustar, guardar boas pautas para depois ou desenvolver apenas uma agora. Guardar não equivale a autorizar produção em lote.
5. Produzir posts das pautas aprovadas pelo percurso da seção 9.

Uma pauta pode integrar conhecimento de várias bases, mantendo rastreabilidade e justificativa de coerência. A base não precisa ser alterada para registrar uma decisão pontual da campanha.

### Quando falta conhecimento

| Situação | Decisão sugerida pela Hive |
|---|---|
| Base adequada e contribuição ainda relevante | Recuperar a versão e propor novo recorte. |
| Conhecimento existente que precisa de aprofundamento/atualização | Propor nova versão da base, preservando a anterior. |
| Lacuna identificada ou ausência de recortes substantivos | Propor criar conteúdo-base; informar o que falta e por que ajudará. |
| Recuperação insuficiente, fonte inacessível ou leitura incompleta | Explicar a limitação e pedir complemento; não afirmar que não existe conteúdo nem que o acervo está esgotado. |

Abrir um percurso próprio com título **“Vamos ampliar seu acervo”**, explicando que o trabalho é mais amplo e poderá servir a outras campanhas. Salvar o estado da campanha e o ponto de retorno antes de entrar.

Após **“Aprovar e guardar no acervo”**, voltar à campanha com uma proposta de recorte. A aprovação da base não pré-aprova a pauta. Se o produtor interromper, base em rascunho e campanha permanecem recuperáveis. Nunca exigir criar uma campanha fictícia para salvar uma base independente.

## 8. Repetição: verificar contribuição, não exigir novidade artificial

- Reuso da mesma base é permitido; compartilhar tema/editoria não prova duplicidade.
- Comparar tese, argumento, exemplo autorizado, perspectiva, aplicação e conclusão da pauta/post. Mudança apenas de título, palavras, formato ou imagem não basta para alegar contribuição nova.
- Considerar o conjunto planejado e o histórico disponível; informar limites de cobertura da análise.
- Sobreposição relevante durante a geração leva a explicar e propor outro recorte, complementar conhecimento ou criar nova base. Não criar base nova automaticamente para contornar um alerta.
- Duplicação do material final continua sendo verificada no destino correto, conta + plataforma, incluindo fila e histórico. Mesma peça em contas diferentes não é automaticamente erro.
- Republicação intencional mantém confirmação e registro próprios. A proposta estratégica de novos caminhos não enfraquece o portão de publicação.

Não prometer detecção semântica infalível nem resultados de desempenho garantidos.

## 9. Criação de posts: visão do conjunto e execução simples

Apresentar cards de **pautas da campanha**, não cartões que confundam bases universais com posts. Nove bases não determinam nove pautas ou nove peças. Os números devem contar entidades e estados reais.

Cada card mostra título, breve intenção e estado: a criar, em produção, em revisão, aprovado ou deixado para depois. A Hive recomenda por onde começar, sem impedir escolher outro. Mostrar também quantas pautas guardadas podem ser retomadas.

Ao pedir para criar o primeiro post, a Hive prepara o planejamento necessário e apresenta a proposta concreta: texto, legenda quando aplicável e prévia visual/páginas. Indicar plataforma/formato recomendados e abrir ajustes sem impor o formulário completo. Não gerar visual caro automaticamente ao apenas abrir a tela; comunicar e persistir o comando de criação antes de executá-lo.

Ações principais: **Aprovar**, **Editar**, **Ajustar com a Hive**, **Pedir outra proposta**, **Deixar para depois**. Edição de texto e visual é independente; distinguir ajuste da peça e pedido de nova abordagem. Reprovar uma peça não elimina a pauta nem a base.

Após o primeiro aprovado: **“Criar o próximo”** ou **“Preparar os demais com esta orientação”**. O lote é opcional, informa escopo/quantidade e exige comando explícito; os demais continuam sujeitos a revisão individual. Calibração do primeiro orienta o lote daquela campanha, sem sobrescrever a voz geral ou impor um único formato/família a tudo.

Preservar o contrato de plano aprovado/reservas no servidor, adaptando a interface para aprovação progressiva. Não remover o portão de autorização nem reutilizar uma aprovação antiga para itens novos. Reentrada, duas abas, falha parcial ou nova tentativa não podem duplicar posts. Exibir o que concluiu, o que falta e como retomar.

Carrossel/Stories precisam de revisão de todas as páginas. Sugerir apenas formatos realmente produzíveis; roteiro de vídeo não equivale a vídeo pronto. Contas são escolhidas depois da aprovação editorial. Alterações posteriores continuam invalidando confirmações de material quando aplicável.

## 10. Oportunidades na tela inicial

A Hive avalia o acervo ao receber materiais, preparar campanhas, gerar conteúdo e receber resultados; revisões periódicas podem complementar esses eventos quando houver infraestrutura de execução.

Tipos: conhecimento da biblioteca ainda pouco elaborado; base desatualizada; lacuna estratégica; conexão promissora entre bases; necessidade de entrevistar o produtor; repetição crescente; bases já existentes pouco utilizadas.

Cada oportunidade deve registrar: razão, evidências autorizadas, materiais/bases envolvidos, ação sugerida, contribuição esperada e estado (nova, vista, adiada, em desenvolvimento, resolvida ou dispensada). Priorizar poucas recomendações; agrupar duplicatas e não reapresentar uma oportunidade dispensada sem fato novo relevante.

Na home: uma recomendação principal, explicação curta e ações **“Ver proposta”**, **“Desenvolver com a Hive”**, **“Agora não”**. Um clique inicia o percurso do Acervo, com retorno definido. Oportunidade não é tarefa automática obrigatória.

Não afirmar que há monitoramento contínuo quando existir apenas uma consulta manual ou avaliação por evento. Sem dados de desempenho suficientes, apresentar hipótese, não conclusão. Registrar última avaliação e permitir pedir nova leitura.

## 11. Preservação e compatibilidade

- As nove bases já validadas no cenário em andamento são ponto de partida do acervo, sem reescrita, perda de status ou reaprovação compulsória. Uma ampliação universal será nova versão opcional; a campanha continua referenciando o conhecimento já aprovado.
- Preservar os rascunhos existentes até confirmação explícita de substituição. Arquivar somente pendências confirmadas, com registro recuperável; não atingir peças aprovadas, agendadas ou publicadas.
- Não fazer migração automática que transforme cada base antiga em uma nova pauta e gere posts. Recuperar o contexto real de cada vínculo e distinguir legado de proposta nova.
- Uma base aprovada pode ser usada em várias campanhas. Edição posterior não muda silenciosamente versões já usadas, posts aprovados nem pacotes agendados.
- Identidade e escrita usam o contexto autorizado; fatos/contexto de campanhas não vazam para o acervo universal sem revisão.
- Toda entidade, busca, sugestão e tarefa respeita isolamento por espaço de trabalho, marca/voz e permissões. Não presumir que tudo que um usuário pode ler pertence à mesma marca.
- **Nunca revelar casos reais de clientes, alunos ou pessoas**, inclusive por resumos, exemplos ou combinações reconhecíveis da biblioteca. Usar conhecimento para formular hipóteses, não para expor histórias; rastreabilidade interna restrita não autoriza divulgar trechos sensíveis nos posts.

## 12. Mapa técnico inicial — reaproveitar, não reconstruir

Inspeção estática da árvore do PR #46; não é auditoria de permissões/schema remoto.

| Ponto existente | Trabalho necessário na implementação |
|---|---|
| `src/lib/campaign/bases.ts` e `base-state.ts` | Aproveitar versões/usos; hoje salvar/validar exige ciclo. Criar contrato de base independente e manter compatibilidade de uso em ciclo. |
| `content_base_versions` e `content_base_uses` | Preservar IDs, versões e histórico; conferir escopo/ownership real antes de propor evolução aditiva. |
| `PautaStep.tsx`, `pauta.ts`, `DevelopStep.tsx` | Separar recorte da campanha de desenvolvimento do acervo; manter retomada e origem correta. |
| `ProductionHub.tsx`, `production-plan.ts`, `production-api.ts`, `planned-produce.ts` | Substituir formulário principal por percurso guiado; preservar validação, autorização, reservas, vínculo às bases e repetição. |
| `ReviewStep.tsx` e `PublicationDestinations.tsx` | Reutilizar revisão e destinos tardios; não criar editor/publicador paralelo. |
| `src/pages/identidade/IdentityHome.tsx` e `src/pages/conhecimento/KnowledgeBase.tsx` | Reaproveitar identidade e biblioteca na organização do Acervo. Não alterar identidade apenas para rearranjar navegação. |
| Home e inteligência de campanha existentes | Localizar contratos efetivos de leitura/avaliação antes de implementar oportunidades. Não inventar um agente residente ou scheduler já disponível. |

Não fixar nomes de novas tabelas/RPCs/rotas neste plano. Definir contratos após inspeção das relações, RLS, consumidores e capacidade atual. Evolução de backend, caso necessária, deve ser planejada e autorizada conforme diretrizes vigentes; nenhum DDL ou redeploy está sendo feito por este registro.

## 13. Entregas incrementais

| Pacote | O que o produtor percebe | Dependências / limite |
|---|---|---|
| A1 — Acervo e pautas distintos | Acessa bases existentes, cria/salva/valida uma base fora da campanha; a campanha recupera versões e propõe recortes próprios. | Primeiro definir/inspecionar contratos e compatibilidade. Entregar o percurso completo, incluindo criação de base por necessidade da campanha e retorno. |
| A2 — Produção acompanhada | Vê cards de pautas e um post concreto por vez; ajusta texto/visual e pode optar por produzir os demais. | Usa A1 e preserva portões da entrega #46. Não liberar interface que perca o comando de plano aprovado ou encaminhe ao gerador legado. |
| A3 — Acervo propositivo | Recebe sugestões justificadas no Acervo/home, pode desenvolver ou adiar e não recebe alertas repetidos. | Usa A1; pode ser entregue separadamente de A2. Começar com avaliação sob demanda/por evento; só anunciar periodicidade quando implementada e verificada. |

Uma entrega por PR de implementação. Este documento é a referência única desta evolução; não reabrir todas as decisões de produto a cada pacote. Perguntar apenas sobre decisões maiores ainda não cobertas ou impactos materiais inesperados. Cancelamento de campanha segue iniciativa independente, sem ser incluído silenciosamente.

## 14. Critérios de aceite

| Código | Comportamento verificável |
|---|---|
| C01 | Criar/editar/salvar e retomar base sem campanha, ciclo, plataforma ou conta. |
| C02 | Aprovar base cria zero posts/agendamentos; sugestão da IA continua não aprovada até validação humana. |
| C03 | Mesma versão de base serve a duas pautas/campanhas; editar uma pauta não altera a base ou a outra campanha. |
| C04 | Pauta informa origem, versões e contribuição; admite várias bases e editorias sem duplicar conhecimento. |
| C05 | Campanha abre criação de base, salva progresso, retorna e propõe recorte sem aprová-lo automaticamente. |
| C06 | Base semelhante é recuperada/aprofundada; mera troca de palavras não é aceita como contribuição nova. Falha de busca não vira alegação de acervo esgotado. |
| C07 | Cards contam pautas/posts reais; primeiro post é criado por comando explícito e revisto sem configurar todos os campos. |
| C08 | Após primeira revisão, lote é opcional e tem escopo explícito; suas peças não herdam aprovação editorial nem alteram a voz global automaticamente. |
| C09 | Falha parcial, recarga e duas abas retomam sem duplicar; deixar para depois preserva pauta e base. |
| C10 | Alterar só texto ou só imagem preserva o outro componente e aplica as invalidações de revisão necessárias. |
| C11 | Duas contas reutilizam revisão editorial, mas exigem confirmação do material/destino; pacote agendado não muda silenciosamente. |
| C12 | Bases e rascunhos legados mantêm IDs, versões, estados e vínculos; substituição só afeta pendências explicitamente autorizadas. |
| C13 | Recomendação informa evidência e limite; adiar/dispensar não ressuscita aviso idêntico; retomar chega ao ponto salvo. |
| C14 | Marca/cliente não acessa acervo/oportunidades alheios; geração não revela caso real nem trata fonte sensível como exemplo publicável. |
| C15 | Usuário novo sem materiais recebe entrevista guiada; não aparecem supostos resultados ou fontes inexistentes. |
| C16 | Avulso mantém a mesma separação de acervo, pauta de uso e peça, sem exigir criar campanha real. |

Os testes de implementação devem verificar esses comportamentos e os contratos reaproveitados, sem publicar em redes reais. Build e testes puros apropriados; regressão completa no GitHub antes de merge de código de aplicação. Apenas uma suíte com banco por vez. Documento não comprova funcionalidade implementada.

## 15. Implantação, reversão e relatório de atualização

Antes de mudanças: inventário privado recuperável das bases, versões, pautas, usos, planos, peças e estados relacionados. Não anexar dados reais ou fontes privadas a PR público. Comparar o inventário após migração; não usar uma simples contagem como prova suficiente de preservação.

Contratos novos devem ser aditivos/compatíveis, com migrations versionadas e rollback quando autorizados. Reversão deve preservar acervo, versões/usos e material protegido; não apagar dados para restaurar uma tela antiga nem reativar gerador que ignore os novos vínculos.

Cada entrega registra lista detalhada no mesmo diretório e nota breve ao produtor: antes/depois por ajuste, caminhos de uso, preservação, testes executados, limitações, pendências e reversão. Identificar claramente o que está publicado e o que permanece planejado.

## 16. Estado deste registro

- Decisões de produto e ordem de implementação consolidadas neste documento.
- Mapa técnico inicial baseado em inspeção local da árvore publicada.
- Funcionalidades novas: **não implementadas** por este registro.
- Dados reais, funções remotas e banco: **não alterados**.
- Próximo passo: A1, começando pela inspeção dos contratos de base independente e pauta de campanha; implementar em branch própria, testar e entregar para uso antes dos pacotes seguintes.
