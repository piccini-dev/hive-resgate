# Estado — bee-platform

- Status: ativo · **operação resgate**
- Prioridade: alta
- Atualizado: 2026-11-04

## Objetivo
Devolver ao Marcos uma Hive que ele entende e usa: menos telas, um caminho por tarefa e fluxos curtos. A queixa dele é de fluxo confuso, longo e sem nexo, não de erro técnico.

## Agora
- O trabalho é no repo privado `raulmf12/hive-resgate` (`origin`). O `bee-platform` (produção) virou o remoto `producao`, com o push desligado.
- Plano: `docs/plano/PLANO.md` (10 blocos, todas as issues planejadas). Diagnóstico: `.central/RELATORIO-ENXUGAMENTO.md`.
- **Bloco 01 · Base do resgate** aberto: branch `bloco/01-base-resgate`, issues #1–#5.
  - #1 (faixa de versão de teste) e #2 (README) estão com o ChatGPT (`exec:gpt`).
  - #3 feita: site de teste em https://hive-resgate.netlify.app (só a `main`). #4 feita (medição no relatório §11). #5 (medir fluxos) falta.
- Painel: https://claude.ai/artifact/83PGHGYEKxe8wbgLn5Rr9k

## Próximos passos
1. Colar os prompts de #1 e #2 no ChatGPT (dar acesso ao repo privado na integração GitHub dele).
2. O Raul cria o `.env.e2e.local` (`SUPABASE_ACCESS_TOKEN`) e o `.env.local`, e autoriza o `npm ci`, para destravar #4 e #5.
3. #3: o Raul loga no Netlify.
4. Quando o painel mostrar "Pronto para /integrar": `/integrar`.

## Bloqueios / aguardando
- Token do Supabase e `.env.local` (máquina sem eles).
- O Marcos responder às 5 perguntas do relatório §9 antes dos blocos 04–08.

## Última sessão
2026-11-04: relatório de enxugamento (v2), repo `hive-resgate` criado, plano em 10 blocos, bloco 01 quebrado em issues, painel publicado.
