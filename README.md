# Hive — plataforma de conteúdo da Bee Consulting

> Agentes de IA: comecem pelo [AGENTS.md](AGENTS.md).

## O que é

A Hive é a plataforma interna de conteúdo da Bee Consulting para LinkedIn e Instagram.
Organiza o fluxo **Campanha → Ciclo → Ideia → Conteúdo → Peças → Agenda → Publicação**.
A IA escreve na voz do Marcos com Genesis, diretrizes, editoriais, arsenal e RAG.
As artes são templates Fabric (dados), não texto livre da IA.

## Situação: operação resgate

Este repositório (`hive-resgate`) enxuga e simplifica a plataforma.
Veja o [plano do resgate](docs/plano/PLANO.md) e o [diagnóstico](.central/RELATORIO-ENXUGAMENTO.md).
O banco e as Edge Functions são os de produção; ações no site de teste têm efeito real.

## Stack

- React 18 + Vite + TypeScript + Tailwind + Zustand.
- Supabase com Postgres, RLS, Edge Functions Deno e pg_cron.
- Netlify.
- Playwright.

## Começar

1. Instale as dependências: `npm ci`.
2. Copie `.env.example` para `.env.local` e preencha as variáveis.
3. Inicie o aplicativo: `npm run dev`.

Variáveis de ambiente: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_FACEBOOK_APP_ID` e `VITE_APP_ENV` (opcional; `teste` mostra a faixa de aviso).

## Comandos

| Para | Comando | Quem roda |
| --- | --- | --- |
| Instalar | `npm ci` | todos |
| Rodar o app | `npm run dev` | todos (precisa de `.env.local`) |
| Typecheck + build (portão) | `npm run build` | todos |
| Lint | `npm run lint` | todos |
| Testes unitários (funções puras, sem banco) | `npx playwright test -c playwright.unit.config.ts` | todos |
| E2E de um spec / regressão completa | `npm run regressao -- e2e/<spec>` / `npm run regressao` | **só o orquestrador** (roda contra produção) |

## Onde fica cada coisa

| Onde | O quê |
| --- | --- |
| `src/pages/` | Telas por rota. |
| `src/lib/`, `src/store/` | Contratos do cliente e estado Zustand. |
| `supabase/functions/`, `supabase/functions/_shared/` | Edge Functions e código compartilhado. |
| `supabase/migrations/`, `supabase/rollback/` | Migrations e rollback. |
| `e2e/`, `docs/` | Testes e documentação. |

## Regras que não se quebram

Consulte o [AGENTS.md §2](AGENTS.md#2-regras-invioláveis-violar--parar-e-perguntar) para as regras completas.

- Nunca publique de verdade nas redes sociais sem autorização explícita.
- Os testes E2E rodam contra o banco de produção com usuário de teste isolado.
- Mude o banco apenas por migration versionada (`npm run sql -- -f`); nunca use `supabase db push`.
- Nunca coloque segredos no repositório.
