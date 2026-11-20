# Regressão sem dados de produção (#111)

O workflow `regressao-local.yml` usa um runner padrão do GitHub em repositório público. Auth, PostgreSQL, REST, Storage e Edge Functions executam na instância Supabase **local daquele runner**. Não cria projetos/branches hospedados, não usa secrets, caches ou upload de artefatos e não acessa dados reais. Não dispara `regressao.yml`, que usa produção.

## Execução sequencial no PR

Na branch do PR, adicione **um label por vez**, aguardando o encerramento completo antes do próximo. Para repetir uma etapa, remova e adicione novamente o mesmo label.

| Label | O que executa |
| --- | --- |
| `validar:local:alvos` | f34 (Marcas), f17 (Identidade) e f19 (isolamento) |
| `validar:local:estabilidade` | Cenários de atraso, recuperação e envio concorrente do f34, três repetições cada |
| `validar:local:completa` | Todos os testes do projeto `e2e`, sem `@live`/`@tool` |

Cada execução faz build, unitários, selfchecks do bootstrap e a matriz real de segurança antes dos E2E. Workers=1, retries=0. A aprovação exige os resultados no mesmo HEAD final. Não confundir descoberta de testes, sucesso de casos individuais ou CI unitário com regressão completa aprovada. Uma execução cancelada continua cancelada, mesmo que os casos tenham passado antes do encerramento.

## Preparação do ambiente

Requer Node 22, Docker e ferramentas instaladas **fora das dependências da aplicação**: Supabase CLI 3.2.0, pg 8.23.1, embedded-postgres 17.11.0-beta.19 e PostgREST 16.6. O workflow contém os comandos exatos. As ferramentas são temporárias; não são dependências novas do app.

`supabase/config.toml` desativa migrations/seeds históricos. `schema.sql` contém somente metadados de schema; `storage.sql` reproduz políticas de arquivos. O bootstrap restaura esse baseline, aplica a migration da #111 **localmente**, cria credenciais/usuários sintéticos e usa INSERTs de catálogos já versionados. Não copia registros nem arquivos do produtor. A leitura de catálogos de produção usada para preparar o baseline não valida execução em produção.

O bootstrap recusa banco Hive já preenchido e arquivos `.env.local`, `.env.e2e.local` ou `supabase/.env` preexistentes. Os helpers exigem destinos loopback explícitos e recusam token administrativo hospedado. O preload de teste e o navegador bloqueiam destinos Supabase hospedados. Chaves de IA e redes usadas pelos testes são falsas; testes de IA real permanecem fora desta suíte.

Ao terminar, os processos filhos são encerrados com prazo limitado e o workflow descarta apenas `hive-local`, sem backup. Não usar `supabase db push`, vincular o diretório a projeto hospedado ou trocar o destino por produção para resolver falhas locais.

## Limites da prova

Os serviços e contratos de banco são reais no ambiente descartável. Chamadas de IA simuladas continuam simuladas conforme os specs existentes. Esse resultado não testa disponibilidade ou credenciais de serviços pagos e não aplica a correção em produção. Merge/deploy exigem os portões do M01 e confirmação do destino correto.
