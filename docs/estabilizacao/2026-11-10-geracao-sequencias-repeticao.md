# Geração de sequências e diferenciação dos desdobramentos

## Problema confirmado

Na tentativa de produção investigada em 10/11/2026, a proposta aprovada incluía imagem única, carrossel e Stories. Apenas imagens únicas concluíram a geração. Foram identificadas duas causas independentes:

1. Sobreposição de contribuição devolvida como erro genérico HTTP 500 de roteiro, escondendo a causa. A proposta consultava apenas até 80 posts aprovados/agendados/publicados; a conferência posterior incluía pendências e podia contradizer a sugestão inicial.
2. `save_production_progress` não parentetizava a extração de `metadata` antes da subtração das chaves protegidas. O erro foi reproduzido por SELECT sintético: `22P02`, token `metadata` inválido. A função de roteiro convertia qualquer falha de salvamento em “A produção mudou em outra tela”, inclusive HTTP 400 sem concorrência.

Nenhum título, texto, ID de pessoa ou material real da campanha é incluído nesta ficha pública.

## Ajustes deste pacote

1. **Salvar o roteiro com suas notas.** Corrigir a precedência JSON sem mudar assinatura, permissões, reserva ou estados protegidos. Não atualizar conteúdos reais por migration.
2. **Conferir recortes antes de apresentá-los.** A recomendação compara a proposta ao histórico e internamente ao lote; referências de conflitos precisam existir. Temas/bases semelhantes não são, por si, repetição de post.
3. **Usar histórico coerente.** Proposta e geração incluem rascunhos, pendências, aprovados, agendados e publicados; desconsideram cópias de distribuição e arquivados. A análise é por plataforma, com até 100 registros recentes. A proteção final por conta/destino continua independente.
4. **Ler a contribuição das sequências.** Incluir os textos canônicos das páginas de carrosséis/Stories; Stories sem legenda não desaparecem da análise. Essa janela não equivale a auditoria de todo o acervo.
5. **Falhar honestamente quando não consegue ler o histórico.** Não substituir uma falha de consulta por lista vazia que supostamente comprova novidade.
6. **Tentar outro desdobramento automaticamente.** Até três tentativas quando a conferência identifica sobreposição, tanto na proposta quanto na geração final. Preservar base e intenção; variar a contribuição. Falhas técnicas não acionam essa tentativa editorial.
7. **Manter uma proteção final.** Se as tentativas não produzirem contribuição distinta, devolver orientação editorial HTTP 422 para pedir outra proposta/ajustar abordagem. Não apresentar repetição como pane técnica nem permitir publicação duplicada em silêncio.
8. **Distinguir falha ao salvar de concorrência.** Apenas HTTP 409 recebe orientação de produção não ativa. Outros erros informam que o roteiro não foi salvo e as bases permanecem disponíveis. Logs novos registram status/código, sem corpo ou conteúdo privado.
9. **Evitar mistura de limites em requisições simultâneas.** Limites de texto de Stories/carrossel passam a ser locais à execução da função.
10. **Distinguir peça reservada de peça pronta.** No novo fluxo, plano ainda pendente não entra na contagem de posts disponíveis para revisão; o card informa produção pendente e mostra o formato. Peças prontas continuam revisáveis.
11. **Preservar retomada.** Não apagar ou recriar o lote, bases ou posts concluídos. O comando existente “Retomar peças pendentes” continua atuando só no que falta, com as mesmas reservas.
12. **Cobrir a falha que escapou.** O teste autenticado passa a enviar `metadata.script_notes` com roteiro e verifica que chaves protegidas não podem ser substituídas. Testes puros cobrem diferenciação limitada, leitura de páginas, referências de conflitos e prontidão da revisão.

## Capacidades e limite de escopo

- Carrosséis e Stories já têm roteiro, edição por página, produção visual, revisão e contratos de publicação. O bug de salvamento impede esse caminho no caso afetado; não há conversão intencional para imagem única.
- Reels têm suporte parcial no publicador para vídeo existente, mas não têm geração/revisão completa nesta jornada nem capacidade habilitada no catálogo. Não adicionar uma opção meramente nominal nem aprovar um roteiro como vídeo pronto.
- **Próxima entrega de formato: Reels.** Percurso mínimo a implementar: sugestão pertinente → roteiro/cenas e orientações de gravação → gravação/envio ou produção do vídeo por recurso efetivamente integrado → prévia do vídeo final, capa e legenda → aprovação → destinos/agendamento. A produção deve distinguir claramente “roteiro pronto”, “aguardando vídeo” e “vídeo pronto”.
- Reels precisam de contrato de armazenamento, arquivo final verificável, revisão de alterações e cobertura de publicação com token falso. Não usar clonagem de voz, avatar sintético ou serviço pago adicional sem decisão específica. Este pacote **não entrega Reels**.
- O redesenho Acervo/pautas/cards permanece no plano do PR #47; esta correção não o antecipa nem mistura bases com pautas.

## Verificação e implantação

Estado inicial: código preparado em branch, não confundir com versão publicada. Registrar resultados efetivos no PR.

- Build local: aprovado.
- Testes puros: 37 aprovados, sem banco/navegador.
- Teste de contrato com banco e regressão completa: executar no GitHub; não afirmar aprovação antes do resultado.
- Geração real com IA: não executada automaticamente na conta do produtor. A qualidade semântica é probabilística; as tentativas podem consumir mais tempo/tokens e terminar sem um recorte adequado.
- Migration e deploy de `sequence-script` precisam ser aplicados e conferidos antes da regressão que cobre o contrato novo. O merge do app não publica backend.

## Preservação e reversão

A migration substitui só a definição de `save_production_progress`, preservando linhas/IDs/versões e RLS. Guardar bundle remoto anterior de `sequence-script` antes de publicar; manter dependências não alteradas exatamente como implantadas. Rollback SQL restaura a definição anterior e reintroduz a limitação: preferir correção para frente. Nenhuma reversão apaga roteiros/peças ou reativa rascunhos arquivados.

Não gerar, aprovar, agendar ou publicar posts reais para testar a correção. O produtor pode revisar as peças já concluídas; as pendentes exigem retomada explícita após a correção.
