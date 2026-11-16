# Atualização 1 — Identidade, conteúdos e inteligência acessível

Decisões consolidadas com Marcos Piccini em 16/11/2026.

## Estado real desta entrega

- Escopo de produto consolidado e estrutura atual consultada no GitHub.
- Base consultada: main em 1cbd6370f5c3722581004441ea4a59176cc8a8a4.
- Este documento é a especificação da primeira atualização, não uma declaração de implementação.
- Nenhuma alteração de aplicação, banco, função, conteúdo real ou agendamento foi realizada para este pacote.
- Ambiente de execução desta conversa indisponível: implementação e verificações ainda não iniciadas.
- Nenhuma regressão foi iniciada para este pacote. Não há teste deste pacote em execução para aguardar.
- A retomada deve começar pela seção “Retomada exata”, atualizando a base antes de implementar.
- Planos anteriores devem ser reconciliados com estas decisões, sem integrar automaticamente propostas antigas divergentes.

## 1. Resultado esperado

O produtor consegue cadastrar suas marcas, manter suas definições e preparar bases de conhecimento sem administrar conceitos técnicos. Campanha utiliza bases validadas e produz recortes estratégicos; Produção realiza peças; Resultados devolve evidências.

Uma única atualização funcional e um PR de implementação. Os passos internos não constituem lançamentos separados. A conclusão exige comportamento e persistência corretos, além da navegação.

## 2. Navegação acordada

Substituir o grupo “Voz da Hive” por “Identidade”, com seis entradas diretas:

| Entrada | Missão | Conteúdo |
| --- | --- | --- |
| Marcas | Cadastrar e administrar os contextos do produtor. | Criar, editar e arquivar marcas; inclusive a marca pessoal. |
| Quem somos | Definir quem fala e o que representa. | Posicionamento, princípios, visão de mundo, frentes, emissores e perfis de comunicação. |
| Públicos | Desenvolver o entendimento de quem queremos alcançar. | Avatares, situações, necessidades, desejos, objeções, evidências e revisão. O aprofundamento desse processo fica para outra atualização. |
| Produtos e ofertas | Definir o que oferecemos, para quem e qual benefício entregamos. | Produtos, serviços, programas, propostas de valor e condições; referências aos públicos atendidos. |
| Conteúdos | Preparar repertório e bases temáticas reutilizáveis. | Abas Biblioteca, Conteúdos mãe e Editoriais. |
| Voz | Manter a forma de expressão de cada marca/produtor. | Tom, linguagem, estilo, orientações por canal/perfil, exemplos e aprendizados de escrita. |

Jornadas/ACJs não são menu operacional de Identidade. Arsenal também não é menu operacional próprio. “Ensinar a Hive” deve ser reconciliado: aprendizado de expressão acessível em Voz; descoberta/curadoria em Biblioteca e Inteligência. Nenhuma capacidade existente pode simplesmente perder acesso.

“Biblioteca” passa a nomear a matéria-prima hoje em Conhecimento. A tela atual /biblioteca reúne publicados e cortes de podcast: preservar seu acesso com nome inequívoco, como Histórico de publicações, sem misturar originais e peças produzidas.

Não criar três níveis expansíveis. As divisões dentro de Conteúdos são abas. Os caminhos e redirecionamentos devem preservar links antigos e seus parâmetros relevantes.

## 3. Marcas, públicos e perfis

1. Marcas é o cadastro de Bee Consulting, Bee Academy, Marcos — marca pessoal ou outros contextos criados pelo usuário. Não inserir exemplos automaticamente.
2. A marca selecionada deve ficar sempre visível nas áreas correspondentes.
3. Quem somos, Públicos, Produtos e ofertas, Conteúdos e Voz trabalham no contexto selecionado.
4. Perfil de comunicação pertence a Quem somos e combina emissor, frente, público e orientações correspondentes. Marcos falando por uma empresa não exige duplicar a pessoa como outra marca.
5. Produtos, perfis e campanhas referenciam os públicos já cadastrados. Não manter avatares independentes em cada formulário.
6. Compartilhamento entre marcas deve ser explícito e autorizado; não herdar conteúdos, fotos, regras ou posicionamento silenciosamente.
7. A seleção visual precisa corresponder aos filtros de leitura, escrita e geração. Esconder registros na tela não substitui autorização no servidor.
8. A criação de marca, edição, arquivamento e eventual restauração devem utilizar os contratos existentes ou contratos formalmente estendidos. Não presumir que criar uma marca seja criar outro workspace.
9. Arquivar uma marca não apaga ou invalida referências históricas. Nunca selecionar silenciosamente outra marca para concluir uma operação pendente.
10. Ao trocar de contexto durante carregamento ou edição, evitar respostas atrasadas e gravações na marca errada; informar e proteger alterações não salvas.

## 4. Conteúdos e fronteiras dos departamentos

### Biblioteca

Matéria-prima: livros, aulas, podcasts, documentos, relatos, experiências, cases, pesquisas e anotações. Manter origem e localização quando disponíveis. Importar e organizar material não significa aprovar automaticamente uma afirmação como posição do produtor.

### Arsenal, nos bastidores

Leitura preparada da Biblioteca: oportunidades, trechos destacados e relações entre fontes. Mais rico que uma tag; continua sendo descoberta, não base aprovada.

- Preservar trecho/fontes, localização e interpretação sugerida.
- Relacionar com bases existentes ou propostas, sem vínculo exclusivo com um editorial.
- Registrar uso e reaproveitamento sem tratar uma mesma peça espelhada em contas como novas ideias independentes.
- Consultar descobertas por “Ver descobertas” na Biblioteca.
- Permitir corrigir, descartar, reanalisar e consultar histórico.
- Não exigir aprovação de cada descoberta. Exigir validação quando algo for promovido a conteúdo mãe ou a orientação permanente de metodologia.
- Não apresentar o fluxo atual de mineração manual como se já houvesse monitoramento contínuo implementado.

### Conteúdos mãe

Bases temáticas amplas, desenvolvidas e validadas, com potencial para diversas frentes. Exemplos fornecidos por Marcos: “O que muda quando olhamos para um sintoma como informação?”, “Servir por obrigação ou servir por escolha?”, “Quando a realidade é mais dura do que queremos reconhecer?” e “Medir o que não se mede”.

- Podem combinar várias fontes e ser utilizadas em vários editoriais.
- Não são posts, legendas, casos pontuais nem apenas títulos soltos.
- Criação/revisão acontece nesta área, com edição manual e ajuda da inteligência.
- Validar uma base não produz nem aprova uma peça.
- Versões utilizadas por campanhas permanecem identificáveis e preservadas.

### Editoriais

Olhares predefinidos para explorar as bases. Funcionam como filtro aplicado conforme a estratégia da Campanha. A relação entre editoriais e conteúdos mãe não é exclusiva.

### Campanha e Produção

- Campanha escolhe objetivo, públicos, ofertas quando pertinentes, bases validadas, olhares editoriais e intenções relacionais.
- Campanha propõe recortes contextualizados; não cria novas bases fundadoras para substituir lacunas.
- Produção desenvolve as peças a partir dessas escolhas e das referências vinculadas.
- Uma lacuna gera pedido de aprofundamento à área de Conteúdos, preservando a fronteira.
- Ajustar uma peça não altera silenciosamente uma base, avatar, identidade ou regra de voz.
- Evitar chamadas legadas que contornem a base validada e gerem peças diretamente a partir de um item do Arsenal.
- Planejamento de campanha deve mostrar de qual base e versão cada recorte veio.

## 5. Inteligência acessível

Local de manutenção: Configurações → Inteligência.

| Área | Manutenção | Acesso contextual |
| --- | --- | --- |
| Descoberta de conteúdos — Arsenal | Fontes consideradas, descobertas, relações, critérios, estado da análise e histórico. | Biblioteca → Ver descobertas. |
| Planejamento de campanhas — ACJs | Definições das intenções, critérios de recomendação, aplicação e aprendizados existentes. | Campanha → Entender este planejamento. |

São acessos aos mesmos mecanismos e registros, não cadastros paralelos.

A interface deve mostrar atividade real, evidências, estado, versão e controles que funcionem. Estados sem informação precisam ser claros. Não simular análises, resultados, rotinas ou botões operantes.

## 6. ACJs e compatibilização com o novo conteúdo mãe

ACJ significa Arquiteturas de Conexão e Jornada:

- ACJ-01 Reconhecimento.
- ACJ-02 Identificação.
- ACJ-03 Conexão.
- ACJ-04 Experimentação.
- ACJ-05 Aprofundamento.
- ACJ-00 orquestra combinação, observação e evolução; não é atribuída como intenção de uma peça.

Não há funil linear obrigatório. O produtor informa objetivo, público e contexto; recebe uma proposta em linguagem simples. Pode entender e ajustar o planejamento sem precisar operar códigos ou percentuais.

Na arquitetura anterior, a ACJ era atribuída ao “conteúdo mãe” daquele modelo. No novo conceito, uma base ampla pode sustentar diferentes movimentos: atribuir intenção ao recorte/variante da campanha e conservar a identificação nas peças derivadas. Isso exige revisar contratos, geração e testes, preservando atribuições históricas. Não resolver apenas mudando rótulos.

Intenção planejada e resultado observado devem continuar distintos. Engajamento isolado não comprova realização de conexão ou de outro movimento.

## 7. Uso e manutenção

Em cada área, oferecer entrada do zero e manutenção incremental:

1. Começar por conversa guiada e materiais já disponíveis; aproveitar o percurso de identidade existente.
2. Apresentar propostas e distinguir declarações, evidências e hipóteses.
3. Permitir edição manual e revisão com a inteligência.
4. Conferir exemplos e alcance da mudança antes de ativar definições permanentes.
5. Adicionar, revisar, excluir ou arquivar conforme uso e vínculos; preservar história e permitir recuperação quando aplicável.
6. Salvar e continuar; oferecer carregamento, erro e tentativa novamente.
7. Evitar formulários técnicos e configuração integral obrigatória antes de qualquer avanço útil.

Não criar outro onboarding concorrente nem armazenar definições permanentes apenas no navegador.

## 8. Tratamento do acervo existente

Antes de qualquer migração, realizar inventário somente de leitura e apresentar classificação revisável. A natureza do item, não seu título ou nome de tabela, define o destino:

| Conteúdo real | Tratamento |
| --- | --- |
| Pensamento amplo com potencial de vários recortes | Candidato a conteúdo mãe; revisão e validação explícitas. |
| Caso, relato, pesquisa, trecho ou anotação | Matéria-prima/repertório da Biblioteca. |
| Oportunidade ou conexão extraída | Descoberta do Arsenal com origem rastreável. |
| Perspectiva recorrente de abordagem | Candidato a definição editorial. |
| Item misto, duplicado ou sem origem clara | Revisão; não promover nem apagar automaticamente. |

Preservar identificadores/referências, fontes, relações e histórico de uso. Não copiar todos os arsenais para bases validadas. Não eliminar o Arsenal antes de substituir seus consumidores.

Este pacote não autoriza apagar em massa conteúdo real. Não modificar conteúdo aprovado, pacotes de publicação, datas ou destinos agendados.

## 9. Fora desta primeira atualização

- Reconstrução aprofundada do processo de desenvolvimento dos avatares.
- Ciclo completo de diagnóstico de desempenho e recomendações autônomas de novos temas, editoriais ou fontes.
- Reescrever todo o motor de aprendizado.
- Reorganizar novamente Agenda, aprovação, publicação, Tráfego ou editor visual.
- Alterar permissões, segredos, dependências ou workflows para viabilizar o pacote.

Preservar o aprendizado existente e seu acesso. A segunda atualização ampliará a evolução contínua sobre esta estrutura.

## 10. Pontos de partida verificados no código

| Arquivo/área | Situação observada | Trabalho a especificar/implementar |
| --- | --- | --- |
| src/components/layout/Sidebar.tsx | Voz da Hive, Ensinar a Hive e Visual separados. | Nova navegação e acessos mantidos, inclusive celular. |
| src/App.tsx | /produtos e /arsenal redirecionam; /biblioteca é histórico. | Rotas canônicas e compatibilidade dos links. |
| src/pages/identidade/IdentityHome.tsx | Percurso guiado, marcas, perfis, públicos e produtos reunidos. | Separação das áreas sem duplicar dados nem perder o percurso existente. |
| src/lib/identityApi.ts e src/types/identity.ts | Existem marcas, emissores, frentes, públicos, perfis e sessões. | Escopo consistente e contratos de manutenção. |
| src/components/identity/CreateWorkspaceCard.tsx | create_my_workspace atende cliente novo. | Conferir contrato próprio para nova marca dentro de workspace existente. |
| src/pages/conhecimento/KnowledgeBase.tsx | Importação/remoção de documentos com vocabulário técnico. | Biblioteca, revisão da experiência e escopo real de marca na ingestão. |
| src/pages/conhecimento/MotherContents.tsx | Criação, edição, aprofundamento, validação, versões e utilizações. | Contexto de marca, manutenção completa e fontes. |
| src/lib/campaign/bases.ts | content_base_versions, content_base_uses e contratos de validação/adoção. | Reutilizar a versão aprovada; não criar outro contrato paralelo. |
| src/pages/editoriais e src/pages/arsenal | Editorial e repertório ainda ligados. | Separar perspectiva de descoberta e reconciliar referências legadas. |
| src/pages/genesis/ComoEscrevo.tsx | Princípios e ofício reunidos. | Princípios em Quem somos; expressão em Voz; nenhuma perda de acesso. |
| src/pages/produtos/Produtos.tsx | CRUD de produtos existente. | Separar área, relacionar público e conferir escopo da marca. |
| src/pages/settings/SettingsPage.tsx | Perfil, contas e integrações. | Entrada Inteligência sem interferir nas integrações/contas. |
| src/lib/acj | Biblioteca de intenções, planejamento de ciclos e aprendizado. | Inspeção acessível e atribuição coerente ao recorte. |

Não houve inventário dos registros reais nem inspeção de todos os consumidores de geração nesta etapa. Esta lista não substitui a leitura dos arquivos e contratos na retomada.

## 11. Critérios de conclusão do pacote

- [ ] Menu Identidade com os seis nomes acordados; nenhum menu operacional Arsenal ou Jornadas.
- [ ] Marcas permite cadastro, edição e arquivamento pelos contratos corretos.
- [ ] Marca selecionada visível e persistência/geração coerentes com a seleção.
- [ ] Troca de contexto não exibe nem grava resposta atrasada da outra marca.
- [ ] Frentes, emissores e perfis continuam distintos e reutilizáveis.
- [ ] Públicos têm acesso próprio e referências consistentes nos produtos e perfis.
- [ ] Produtos e ofertas têm acesso próprio e contexto correto.
- [ ] Conteúdos tem Biblioteca, Conteúdos mãe e Editoriais com fluxos reais.
- [ ] Princípios ficam acessíveis em Quem somos e regras de expressão em Voz.
- [ ] Histórico de publicações e cortes continua acessível com nome inequívoco.
- [ ] Configurações → Inteligência permite consultar e manter Arsenal e ACJs.
- [ ] Acessos contextuais abrem os mesmos mecanismos e preservam a marca.
- [ ] Descobertas não aprovadas não entram como posição validada do produtor.
- [ ] Campanha utiliza base validada, propõe recorte e identifica origem/versão.
- [ ] Conteúdo mãe amplo não fica preso a um único editorial ou ACJ.
- [ ] ACJ atribuída ao recorte/variante tem rastreabilidade nas peças derivadas.
- [ ] Geração não continua usando o atalho legado do Arsenal no novo fluxo.
- [ ] Classificação do acervo existente é revisável e não destrutiva.
- [ ] Onboarding existente é aproveitado; edição e manutenção têm continuidade.
- [ ] Erros, carregamentos, cancelamento e repetição de ações foram verificados.
- [ ] Dados e pacotes aprovados/publicados/agendados foram preservados.
- [ ] Build, testes puros e specs afetados aprovados.
- [ ] Cenários assíncronos alterados aprovados em três repetições no mesmo commit.
- [ ] Regressão completa aprovada no commit final e base compatível.
- [ ] Dependências de banco/funções resolvidas antes de qualquer integração.
- [ ] Resultado documentado com evidências e limite real das verificações.

## 12. Implementação e validação

Seguir AGENTS.md e docs/agentes/REGRESSAO-GITHUB.md e 09-VALIDACAO-POR-PACOTE.md.

- Um pacote, uma branch e um PR; execução interna por partes, sem várias entregas de produto.
- Começar auditando contratos e consumidores. Não inventar endpoints, campos ou persistência.
- Na operação resgate, banco e funções são compartilhados de produção: não alterar/publicar migration ou Edge Function. Se o pacote exigir extensão, documentar o contrato e a dependência para o responsável técnico; não mascarar isso com uma adaptação apenas visual.
- Não modificar dados reais em massa. Qualquer operação futura precisa de inventário equivalente e alcance explícito.
- Não tocar em src/ enquanto houver regressão ativa.
- Testes E2E são exclusivos do GitHub e do usuário isolado previsto no projeto.
- Aplicar primeiro verificação curta dos specs afetados e três repetições dos cenários assíncronos; depois congelar o commit e rodar a regressão completa.
- Não reutilizar verde de outro commit, afrouxar expectativas, introduzir skips/retries ou executar suítes concorrentes.
- PR só fica pronto para liberação após pacote funcional, dependências atendidas e evidências registradas. Documento de planejamento não é atualização publicada.

## 13. Retomada exata

1. Reabrir este documento e verificar AGENTS.md e a main atual; a referência histórica deste levantamento é 1cbd6370f5c3722581004441ea4a59176cc8a8a4.
2. Recuperar o ambiente de execução do projeto, sem pedir novas decisões de produto já registradas.
3. Atualizar a branch do pacote a partir da base real, respeitando mudanças concorrentes.
4. Conferir regressões ativas e contratos existentes de marca, ingestão, repertório, bases, geração e atribuição ACJ.
5. Identificar quais contratos já suportam o desenho e quais dependem do responsável técnico, antes de iniciar apenas a troca de menus.
6. Implementar o pacote e seus testes de comportamento, preservando os contratos e dados históricos.
7. Registrar no PR os resultados reais e pendências; executar a sequência de validação do projeto.
