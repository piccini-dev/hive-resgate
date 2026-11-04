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
