# Decisões — bee-platform

Formato: `- AAAA-MM-DD: decisão. Motivo: ...`. Só acrescentar no fim.

- 2026-11-04: projeto criado pela matriz.
- 2026-11-04: regras iniciais com os módulos interface e producao-cliente; AGENTS.md segue como fonte das regras técnicas. Motivo: repo existente em produção para o Marcos, com processo próprio; rag-documentos e integracoes-webhooks não entram porque a arquitetura já existe e as regras genéricas conflitariam.
- 2026-11-04: relatório de enxugamento antes do plano; o PLANO.md sai com os cortes já decididos. Motivo: planejar corte sem o mapa é chute.
- 2026-11-04: uso real medido no banco de produção só com SELECT de números agregados. Motivo: separar função esquecida de função usada, sem tirar dado do Marcos da máquina.
- 2026-11-04: corte em duas fases, primeiro esconder (menu, rota, cron) e depois apagar (código, função, tabela, com rollback). Motivo: o Marcos usa em produção e pode depender do que parece morto.
- 2026-11-04: execução pelo modelo orquestra (micro-issues, agentes externos executam; Claude valida e integra). Motivo: escolha do Raul.
- 2026-11-04: operação resgate em repositório novo e privado `raulmf12/hive-resgate`; o `bee-platform` (público, ligado ao Netlify de produção) virou o remoto `producao`, com o push desligado nesta pasta. Motivo: trabalhar sem risco de publicar no site do Marcos.
- 2026-11-04: o repositório novo usa o mesmo Supabase de produção; o Marcos valida num site Netlify de teste com a faixa "versão de teste". Motivo: rapidez, sem banco divergente; a faixa evita confundir teste com produção, porque as ações valem de verdade.
- 2026-11-04: nesta operação, nada de apagar Edge Function ou tabela; o front só para de chamar. Apagar fica para depois da virada, com uso medido e rollback. Motivo: o banco e as funções são os da produção.
- 2026-11-04: o problema do Marcos é de fluxo (confuso, longo, sem nexo), não de erro técnico; o plano junta enxugamento (blocos 02–08) com simplificação de fluxo medida (blocos 01-E e 09).
- 2026-11-04: todas as issues ficam planejadas no PLANO.md; só as do bloco atual são criadas no GitHub, e as próximas no /integrar do bloco anterior. Motivo: as especificações batem com o código já integrado.
- 2026-11-04: proteção da `main` do `hive-resgate` vale só pelo protocolo do `AGENTS.md` §0 (repositório privado em conta gratuita não tem ruleset). E2E/regressão no GitHub viraram só manuais; o PR do bloco roda `ci.yml` (build + unitários).
- 2026-11-04: bloco 01 quebrado em 5 issues (#1–#5), sem dependência entre elas: 2 exec:gpt (faixa de teste, README) e 3 exec:claude (Netlify de teste, medir banco, medir fluxos). Painel em https://claude.ai/artifact/83PGHGYEKxe8wbgLn5Rr9k.
- 2026-11-04: o patch de trabalho não enviado (métricas do LinkedIn, 03–04/11) fica fora do bloco 01 até decisão do Raul. Motivo: o bloco é só base e medição; o patch mexe em `src/` e `supabase/` e pede regressão própria.
- 2026-11-04: a lista de funções e as chamadas em 30 dias foram lidas pela Management API (`/functions` e `/analytics/endpoints/logs`, 24 h por consulta) em vez da CLI do Supabase. Motivo: a CLI não está instalada e não se instala nada sem pedido; o dado é o mesmo.
- 2026-11-04: site de teste criado no Netlify como projeto `hive-resgate` (time RMF), publicando só a `main`, com branch deploys e deploy previews desligados, e publicado antes do merge do bloco 01 (ainda sem a faixa). Motivo: ordem do Raul.
- 2026-11-04: pela medição, "Teste de imagem" sai direto (0 registros) e a área de vídeo vira candidata a sair (1 vídeo em junho, 0 cortes); o `distribute-schedule` foi usado 2 vezes e depende do Marcos. Motivo: §11 do relatório.
