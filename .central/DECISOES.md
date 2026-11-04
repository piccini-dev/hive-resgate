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
- 2026-11-04: o usuário de teste recebeu as 2 contas falsas de `seedAccounts()` para medir F1 e F4. Motivo: sem conta não se ativa campanha, e conectar conta real abre OAuth; ok do Raul.
- 2026-11-04: o F3 (vídeo) foi medido no app só até o passo 1 e o resto contado pelo código. Motivo: o fluxo exige um link de episódio no YouTube e um vídeo para subir; não se inventa link.
- 2026-11-04: o bloco 09 começa pelos 2 P0 do critique (aprovação que não aprova + agendar com hora; beco das contas no assistente de campanha). Motivo: escolha do Raul.
- 2026-11-04: PRODUCT.md registra que a Hive vai virar plataforma aberta para qualquer pessoa. Por isso nada de "Bee/Marcos" fixo na tela. Motivo: resposta do Raul no `/impeccable init`.
- 2026-11-04: o F3 (vídeo) foi medido de ponta a ponta com um corte de teste de 23 s (fala sintetizada, FFmpeg) e o episódio já cadastrado no banco. Motivo: o Raul pediu o F3 completo.
- 2026-11-04: o patch não enviado das métricas do LinkedIn vira um bloco próprio logo depois do 01, com regressão própria. Motivo: escolha do Raul; o código das funções e migrations que já estão em produção precisa voltar ao repositório sem se misturar com o resgate.
- 2026-11-04: os 5 posts importados do LinkedIn (publicados de 12 a 29/10) foram marcados `reference_status = historical` por UPDATE nos 5 ids, depois do SELECT. Rollback: voltar `reference_status` a null nesses ids. Motivo: confirmação do Raul; a regressão (f15) acusava esses 5 como referência de voz. O gatilho que protege importações futuras vem no bloco do patch.
- 2026-11-04: na integração do bloco 01, o lint segue fora do portão (quebrado desde antes do bloco, sem `eslint.config.js`). Valem o build, os 16 unitários e a regressão completa.
- 2026-11-04: regressão do bloco 01 deu 198/200. As 2 falhas não vinham do bloco: (1) os 5 posts importados acima; (2) o teste do bundle das edges comparava texto com CRLF do checkout no Windows (`autocrlf=true`) contra o LF do esbuild. O teste passou a normalizar as quebras de linha. Os dois specs rodaram de novo e passaram (6/6 e 8/8).
- 2026-11-04: bloco 01 integrado na main (PR #6), com CI verde; o Netlify publicou o site de teste com a faixa. Bloco 01b criado (milestone 2, issues #7–#9, todas exec:claude). O bloco 02 passa a depender do 01b.
