# Preparação das entregas — Acervo, pautas, produção e Reels

Data: 10/11/2026. **Preparado para implementação; nenhum item abaixo foi implantado por este documento.** Decisões de produto: [PLANO-IMPLEMENTACAO.md](PLANO-IMPLEMENTACAO.md). Não manter cópias concorrentes desse plano em outras iniciativas.

## 1. Portão de início

O PR #48 trata os erros da produção atual e tem prioridade. Esta preparação não altera o commit em teste nem o backend compartilhado. Antes de implementar, conferir sua conclusão, incorporar o resultado efetivamente aprovado e verificar a `main` atualizada. Não assumir que o plano documental #47 ou qualquer implementação foi integrado.

Somente documentação pode ser adiantada durante a regressão; não há nova suíte, migração, mudança em `src/` ou deploy nesta preparação. Não é necessário pedir ao produtor novamente as decisões já registradas. Apenas escolhas maiores ou impactos inesperados que alterem o escopo precisam ser levados a ele.

## 2. O que reaproveitar e o que falta confirmar

Inspeção de leitura na árvore do PR #46, complementada pelo escopo conhecido do PR #48. Não constitui auditoria remota do schema atual ou comprovação de execução das novas capacidades.

| Contrato/arquivo existente | Constatação | Trabalho necessário |
|---|---|---|
| `src/lib/campaign/bases.ts` | `saveDraft` e `validate` exigem ciclo; `archive` consulta bases validadas. | Acrescentar operações independentes de campanha, sem criar contêiner fictício e sem quebrar chamadas antigas. |
| `content_base_versions` / `content_base_uses` | Versões imutáveis e usos no ciclo já existem; uso atual é único por ciclo/base. | Preservar esse vínculo e representar várias pautas/versões de suporte sem forçar cópias da base ou afrouxar integridade. |
| `ideas.source_base_version_id`, `pauta.ts` / `PautaStep.tsx` | Há reaproveitamento de uma base por ideia e aprovação da pauta; ainda está próximo da etapa que desenvolve a base. | Inspecionar se a entidade `ideas` comporta pauta e estacionamento. Definir referências múltiplas às bases e validação própria da pauta. |
| `contents` e `DevelopStep.tsx` | Há conteúdo canônico e versões em contexto de ciclo; tipos do cliente aceitam campanha/ciclo opcionais. | Conferir constraints reais, ownership, RLS, triggers e consumidores antes de permitir a base independente. Tipo opcional no cliente não comprova que todo contrato do servidor já aceita. |
| `ProductionHub.tsx` / `production-api.ts` / `planned-produce.ts` | Há proposta, comando de aprovação, reservas e retomada por item. | Encapsular o planejamento na criação guiada; aprovar escopo progressivo e não perder reservas ao produzir um subconjunto. |
| `ReviewStep.tsx` / `SequenceWorkspace.tsx` | Revisão de peças e sequências já existe. | Reutilizar revisão por componente/página; incorporar distinção de peça pendente/pronta do #48. |
| `PublicationDestinations.tsx`, `schedule-piece`, `piece_readiness` | Destinos tardios, prontidão e agendamento são contratos centrais. | Estender para vídeo quando necessário; não criar botão ou agendador paralelo. |
| `Sidebar.tsx`, `IdentityHome.tsx`, `KnowledgeBase.tsx` | “Voz da Hive” já agrupa identidade, escrita e conhecimento. | Inserir Acervo com navegação clara e retorno, reaproveitando biblioteca/identidade. Não duplicar telas com bancos próprios. |
| `NewPost.tsx`: upload, `processVideo` e geração de legenda | Existe caminho legado que envia e analisa um vídeo, produz legenda e cria post `video`. | Extrair/reutilizar o serviço para a jornada de campanha e tipo canônico de Reel; revisar o cast de formato legado, escopo, erros e transcrição. |
| `_shared/publish.ts` | Existe `publishInstagramVideo` usando `media_type=REELS`; vídeo no LinkedIn é recusado. | Verificar contrato da API atual, arquivo, capa, prazo de processamento, retomada, permissões e reconciliação; não habilitar LinkedIn vídeo por acidente. |
| `_shared/package.ts`: ramo vídeo | O pacote atual registra URL original/tamanho e `sha256: null`, sem cópia. | Garantir recurso imutável e integridade verificável para vídeo; URL/tamanho iguais não bastam. Não presumir que o ramo existente já oferece a mesma garantia das imagens. |
| Catálogo `format_capabilities` | A jornada atual oferece imagem, carrossel e Stories; Reel é explicitamente excluído de proposta/validação. | Só habilitar Reel depois do percurso completo; apresentação de formato e capacidade de publicação não são o mesmo estado. |

## 3. Tarefas de A1 — Acervo e pautas distintos

| ID | Tarefa | Saída verificável | Dependência |
|---|---|---|---|
| A1.1 | Inspecionar relações/constraints/RLS e todos os consumidores de base, ideia e uso. | Mapa de contratos e compatibilidade; desenho aditivo de persistência, incluindo marca/voz/fontes. | PR #48 concluído. |
| A1.2 | Permitir criar/salvar/validar base sem campanha e guardar associações sugeridas. | Rascunho e versão aprovada independentes, isolamento e histórico preservados; chamadas por ciclo continuam válidas. | A1.1. |
| A1.3 | Disponibilizar Acervo com bases existentes, pesquisa, filtros leves, resumo e origem. | Produtor encontra o conhecimento que já aprovou sem recriá-lo. | A1.2. |
| A1.4 | Implementar os dois percursos guiados: sugestões da Hive / tenho algo para desenvolver. | Conversa persistida, estrutura proposta, edição humana/IA e aprovação explícita; não exigir briefing de marketing. | A1.2–A1.3. |
| A1.5 | Separar pauta da campanha da base; recuperar versões e criar recortes estratégicos. | Origem verdadeira e contribuição clara; pauta aceita várias bases; nenhuma plataforma/conta obrigatória na base. | A1.2. |
| A1.6 | Criar base a partir de lacuna da campanha e retornar ao ponto salvo. | Base aprovada no Acervo; campanha recebe uma pauta ainda sujeita à validação. | A1.4–A1.5. |
| A1.7 | Guardar várias boas pautas e permitir retomar uma, várias ou nenhuma. | Estacionamento persistente com contagem real; aprovação não dispara lote sem comando. | A1.5. |
| A1.8 | Conferir legado, permissões e retorno entre telas; entregar o percurso completo. | Critérios C01–C06, C12, C14–C16 cobertos por testes e regressão. | A1.3–A1.7. |

Não expor na produção um novo menu que apenas encaminha a base independente para o desenvolvimento antigo preso ao ciclo. A fundação pode ser integrada antes, mas o percurso só é liberado quando completo.

## 4. Tarefas de A2 — Produção acompanhada

| ID | Tarefa | Saída verificável | Dependência |
|---|---|---|---|
| A2.1 | Mostrar cards de pautas, respectivos posts e próximo movimento recomendado. | Contagens separam pauta, peça prevista, em produção e pronta. Sem nove bases = nove posts por pressuposto. | A1. |
| A2.2 | Persistir comando progressivo de produção, escopo aprovado e referência à pauta/versões. | “Criar o primeiro” não gera todos; aprovação não é reaproveitada em itens novos. Reentrada/duas abas são idempotentes. | A2.1. |
| A2.3 | Gerar primeira proposta concreta com recomendações e ajustes opcionais recolhidos. | Preview, texto/legenda/páginas; não exigir preencher planejamento antes de avaliar a peça. | A2.2. |
| A2.4 | Integrar edição, ajuste com Hive, outra proposta, reprovação e deixar para depois. | Alterar texto não troca imagem silenciosamente; rejeitar post não apaga base ou pauta. | A2.3. |
| A2.5 | Calibrar pela primeira revisão e oferecer próximo / preparar demais. | Lote opcional com quantidade/escopo; cada peça continua sujeita a revisão; não sobrescreve voz geral. | A2.4. |
| A2.6 | Conectar destinos e agenda e testar retomada parcial. | Uma revisão para o mesmo material; múltiplos destinos confirmados; critérios C07–C11. | A2.2–A2.5. |

Incorporar a correção de repetição do #48 e evoluir seu alcance conforme o acervo cresce. Falta de dados/histórico não equivale a prova de originalidade. Não desativar o portão final por conta/plataforma.

## 5. Tarefas de A4 — Reels completos na jornada

| ID | Tarefa | Saída verificável | Dependência |
|---|---|---|---|
| A4.1 | Verificar capacidades atuais do Instagram e inventariar upload/análise/publicação existentes. | Contrato documentado com requisitos, versão/data de verificação, limites de arquivo, tipos canônicos e consumidores afetados. | A2; documentação oficial atual. |
| A4.2 | Criar recurso de vídeo versionado, validação e processamento retomável. | Upload sem sobrescrita; erro recuperável; metadados técnicos e integridade; acesso por proprietário/marca; política de retenção. | A4.1. |
| A4.3 | Gerar/revisar roteiro da pauta e orientar gravação ou seleção de vídeo próprio. | Conhecimento vira fala/cenas com progressão, sem inventar biografia/caso; roteiro aprovado não aparece como vídeo publicável. | A4.1. |
| A4.4 | Receber ou selecionar vídeo, analisar material e preparar capa/legenda. | Player reproduz o arquivo efetivo; diferenças para o roteiro são sinalizadas; transcrição é verificável/editável. Material silencioso não é recusado só por não ter fala. | A4.2–A4.3. |
| A4.5 | Implementar revisão/aprovação do vídeo completo, capa e legenda. | Alteração invalida componentes corretos e confirmações; capa de template elegível; nova legenda não refaz vídeo. | A4.4. |
| A4.6 | Fechar pacote imutável e integrar destinos/agendamento/publicador. | O vídeo agendado é o aprovado; troca de URL/bytes não passa silenciosamente; falha/incerteza tem retomada/reconciliação. | A4.2, A4.5. |
| A4.7 | Habilitar formato no catálogo, proposta e cards após validação completa. | “Reels” não é imagem única disfarçada; C17–C20 e contratos de aprovação/publicação cobertos, com tokens falsos. | A4.3–A4.6. |

Primeira entrega completa usa material próprio: gravação enviada pelo produtor ou vídeo dele já disponível. Recurso automatizado de corte/montagem precisa de execução real antes de ser descrito como aplicado. Geração automática de vídeo pode ampliar o mesmo contrato depois; não contratar motor nem ativar clonagem de voz/avatar nesta preparação.

## 6. Tarefas de A3 — Acervo propositivo

| ID | Tarefa | Saída verificável | Dependência |
|---|---|---|---|
| A3.1 | Definir eventos de avaliação e estado persistido das oportunidades. | Novos materiais, necessidades de campanha, usos e resultados podem motivar análise com evidências. | A1. |
| A3.2 | Propor aprofundar, atualizar, conectar ou criar base; distinguir recuperação insuficiente. | Sugestão explica motivo/contribuição e não inventa esgotamento. | A3.1. |
| A3.3 | Exibir uma prioridade na home e lista no Acervo com ações de adiar/dispensar/desenvolver. | Sem avalanche de alertas, duplicação ou reapresentação sem fato novo; retorno ao trabalho salvo. | A3.2. |
| A3.4 | Acrescentar avaliação periódica somente com executor, orçamento e observabilidade. | Horário/última avaliação/resultados reais; falha não aparece como “nenhuma oportunidade”. | A3.1–A3.3. |

A3.4 não é pré-requisito para o produtor criar conteúdo-base nem para receber sugestões sob demanda. A periodicidade é capacidade distinta de monitoramento por evento e não deve ser prometida como já ativa.

## 7. Contratos a fechar antes do código de cada pacote

| Operação | Entradas mínimas de domínio | Garantias |
|---|---|---|
| Salvar base | Identidade autorizada da base/marca, conteúdo, fontes/associações, versão esperada e comando. | Funciona sem campanha; conflito não sobrescreve versão; nada entra aprovado por ser gerado pela IA. |
| Aprovar base | Rascunho e versão esperados; classificação confirmada. | Cria versão imutável; zero posts; eventual uso em campanha fica separado. |
| Salvar/aprovar pauta | Campanha/ciclo autorizados, texto específico, intenção, versões de suporte, contribuição e versão esperada. | Não altera bases; distinguível de aprovação de post; aceita guardar para depois. |
| Pedir produção | Pauta(s), itens/formatos propostos ou recomendação aceita, escopo/quantidade e comando. | Cria/reserva só o que foi autorizado; lote e retomada são explícitos; não depende de escolher conta. |
| Salvar revisão | Peça, componente, versão esperada e alteração solicitada. | Preserva componentes não afetados; invalida aprovações correspondentes; pacote agendado não muda. |
| Anexar vídeo | Peça autorizada, arquivo/recurso próprio e versão esperada. | Versão nova; não altera upload original; processamento só da conta/marca autorizada. |
| Aprovar Reel | IDs/versões do vídeo, capa, legenda e evidência de validação/revisão. | Material aprovado integralmente; não confundir roteiro com arquivo final. |
| Avaliar Acervo | Escopo, motivo/evento, fontes/versões acessíveis e cobertura conhecida. | Busca privada; resultado rastreável; sem mutação automática de identidade, bases ou editorias. |

Esses são requisitos de domínio, não RPCs já existentes. Nomes finais, payloads, constraints e migrations devem partir do levantamento do servidor; não copiar a tabela como API implementada. Usar os contratos existentes quando puderem ser estendidos com compatibilidade.

## 8. Verificação, liberação e preservação

Antes de cada mudança de persistência, guardar inventário privado recuperável e comparar IDs, versões, estados, conteúdo e vínculos depois. Não reescrever as bases atuais para universalizá-las nem reaprovar o trabalho já validado. Preservar peças concluídas/rascunhos e as decisões de arquivamento efetivamente tomadas pelo produtor, sem congelar uma contagem antiga como se fosse o estado atual.

Cada pacote tem build e testes próprios, com regressão no GitHub antes de integrar aplicação. Somente uma suíte de banco por vez. Não alterar fonte ou backend sob teste durante a regressão. Publicação em rede social real não faz parte da validação.

O plano não libera Reels parcialmente, não refaz automaticamente campanhas e não altera contas. Cada liberação precisa incluir lista detalhada de mudanças, roteiro curto de conferência pelo produtor, resultado efetivo dos testes, limitações e reversão que preserve dados.

## 9. Estado da preparação

- Fluxos, decisões, dependências e critérios preparados no PR documental #47.
- 25 tarefas identificadas: 8 de A1, 6 de A2, 7 de A4 e 4 de A3. Conferência de contratos, preservação, testes e liberação estão incluídos no escopo de cada pacote.
- Inspeção estática dos pontos de reaproveitamento concluída. Schema/RLS remotos e especificações atuais de mídia serão conferidos na implementação.
- Código de aplicação, banco, funções remotas e dados reais: não alterados por esta preparação.
- Implantação, regressão nova e ativação de capacidades: não iniciadas por este documento.
