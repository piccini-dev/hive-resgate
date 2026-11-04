# Decisões — bee-platform

Formato: `- AAAA-MM-DD: decisão. Motivo: ...`. Só acrescentar no fim.

- 2026-11-04: projeto criado pela matriz.
- 2026-11-04: regras iniciais com os módulos interface e producao-cliente; AGENTS.md segue como fonte das regras técnicas. Motivo: repo existente em produção para o Marcos, com processo próprio; rag-documentos e integracoes-webhooks não entram porque a arquitetura já existe e as regras genéricas conflitariam.
- 2026-11-04: relatório de enxugamento antes do plano; o PLANO.md sai com os cortes já decididos. Motivo: planejar corte sem o mapa é chute.
- 2026-11-04: uso real medido no banco de produção só com SELECT de números agregados. Motivo: separar função esquecida de função usada, sem tirar dado do Marcos da máquina.
- 2026-11-04: corte em duas fases, primeiro esconder (menu, rota, cron) e depois apagar (código, função, tabela, com rollback). Motivo: o Marcos usa em produção e pode depender do que parece morto.
- 2026-11-04: execução pelo modelo orquestra (micro-issues, agentes externos executam; Claude valida e integra). Motivo: escolha do Raul.
