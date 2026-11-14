# Pacote: aprovação, contas e agenda

## Resultado de uso

O editor tem uma ação principal para aprovar e continuar. A preparação da publicação mostra o material aprovado e as contas, com seleção inicial configurável e confirmação conjunta. A agenda identifica cada conta e reúne visualmente as entregas da mesma peça.

## Responsabilidades

- Revisão termina com a aprovação editorial pelo contrato existente. Aprovar não publica nem muda uma data existente.
- Preparar publicação confirma destinos compatíveis pelo `prepare_piece_destinations`, sem refazer conteúdo. Padrões ficam em Configurações → Contas; a seleção continua editável por peça.
- Agenda propõe datas e horários e só agenda após aplicação explícita pelo `schedule-piece`. Cada conta mantém seu pacote, comando e histórico próprios.

## Regras de distribuição

- IA: propõe prioridade/ordem; o calendário é calculado pelas regras do produtor. Datas inválidas da resposta não entram silenciosamente no plano.
- Semiautomático: o produtor escolhe frequência, dias e horários, partindo do padrão salvo. Os dois modos usam o mesmo planejador e as mesmas verificações.
- Cadência e limite diário são por conta. Duas contas que recebem a mesma peça não consomem duas posições na cadência de uma única conta.
- Sete conteúdos por semana sugere todos os dias, incluindo fim de semana. Dias explícitos da rede prevalecem sobre o padrão geral. A interface oferece “Todos os dias”.
- Por padrão, entregas da mesma peça na mesma rede são espelhadas no mesmo dia e horário. O produtor pode desativar esse padrão para novos planos.
- Variedade de editoria é uma preferência de ordem; não abre buracos no calendário diário. Falta de conteúdo elegível ou conflito com limites/dias/horários é explicado.
- Entregas já agendadas/publicadas ocupam capacidade e permanecem intocadas. Uma cópia pendente só acompanha uma entrega já marcada se a data atender às regras; conflitos aparecem como pendências.
- Plano salvo guarda as regras utilizadas. Retomar preserva os comandos já confirmados; datas editadas são novamente verificadas, inclusive o espelhamento.

## Aceite

- Editor com “Aprovar e seguir” e ações secundárias recolhidas. Salvar continua acessível. Falha na aprovação impede avançar.
- Artes/páginas aprovadas visíveis na preparação; contas padrão pré-selecionadas, com possibilidade de desmarcar. Confirmação em lote mostra sucesso ou falha por peça, preserva escolhas pendentes e permite retomar.
- Peças sem aprovação, destinos incompatíveis, republicação sem justificativa e material programado/publicado mantêm as proteções atuais.
- Preferências novas e existentes são mescladas, sem apagar configurações ao salvar outra seção. Nenhum padrão real é alterado automaticamente.
- Em sete conteúdos prontos para uma conta com frequência diária, ambos os modos produzem sete dias consecutivos válidos. Cópias espelhadas acompanham o mesmo calendário.
- Calendário/fila/plano exibem as contas. Agrupamento usa o vínculo entre peça e entregas, não comparação de títulos. O arraste manual continua movendo uma entrega identificada.

## Escopo técnico

Frontend, testes e documentação. Preferências no JSON `user_settings.distribution_prefs` existente. Sem migrations, Edge Functions, dependências, workflows ou alterações de dados reais. Preservar `approve_piece`, `prepare_piece_destinations`, `complete_cycle_production`, comandos de agendamento e pacotes imutáveis.

Arquivos: `src/lib/schedule.ts`, novo planejador/política em `src/lib/distribution.ts` e `src/lib/publicationDefaults.ts`; tipos; painéis de padrões/destinos, editor, agenda e fila. Testes de aprovação (F22/F24/F25), agenda (F6), destinos/produção (F29), novo F32 e testes puros das regras. Rever todos os consumidores/seletores afetados antes da regressão completa.

## Execução

1. Implementar e executar build/testes puros.
2. GitHub: testes específicos F6/F22/F24/F25/F29/F32; corrigir cenário isolado antes de repetir o conjunto quando necessário.
3. Congelar o commit e iniciar a regressão completa no GitHub. Registrar o link no PR e encerrar a etapa no chat, permitindo aguardar fora da conversa.
4. Na retomada, conferir o resultado do mesmo commit; com tudo verde, integrar e confirmar a publicação exata no Netlify.

## Estado

Implementação concluída a partir de `6c1e290da94ef2f79a9384cd5c54aa90caede74b`. Build e 77 testes puros aprovados localmente. Validação de interface/contratos pendente no GitHub (F6/F22/F24/F25/F29/F32). O PR registra os links, o commit validado e a regressão completa; este documento não antecipa o resultado desses portões.
