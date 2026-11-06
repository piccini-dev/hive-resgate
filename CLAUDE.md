# bee-platform

- Cliente: marcos-piccini
- Etiqueta: plataforma de conteúdo Bee (RAG)
- Criado em: 2026-11-04
- Objetivo: retomar e enxugar a plataforma de criação e publicação de posts (LinkedIn/Instagram) da Bee Consulting, começando por mapear e cortar funções redundantes.

As regras técnicas do repositório estão em `AGENTS.md` (fonte única para qualquer agente):

@AGENTS.md

## Estado do projeto
O estado vivo fica em `.central/`. Ele é injetado no início de cada sessão; não precisa reler.
- `ESTADO.md`: onde o projeto está (curto, no máximo ~40 linhas, reescrito a cada sessão).
- `TAREFAS.md`: checklist do que falta.
- `DECISOES.md`: decisões com data e motivo (só acrescentar, nunca reescrever).
- Ao terminar um bloco de trabalho, rode `/fechar` para atualizar esses arquivos. A matriz (`C:\central`) lê daqui.

## Como trabalhar aqui
- Stack: React + Vite + Tailwind, Supabase (Postgres, RLS, Edge Functions, pg_cron), deploy Netlify. Comandos em `AGENTS.md` §4 (`npm run dev`, `npm run build`, `npm run regressao`).
- Antes de commit: `/ponytail-review`. Antes de entregar: `/entrega`.
- Dados de cliente não saem da máquina: nada em consultas ao Context7, Hugging Face Hub ou serviços públicos.

## Regras deste projeto
Escritas para este projeto a partir dos módulos de `C:\central\modelos\modulos` que se aplicam, adaptadas e com o que for específico. Mudam quando o projeto pedir (`/modulos`).

### Interface (módulo interface)
- `/impeccable init` antes da primeira mudança de tela; `/impeccable critique` e `polish` antes de entregar telas.
- Conferir no celular (375px) e no desktop. Contraste legível, foco visível, texto alternativo em imagens.

### Entrega para cliente (módulo producao-cliente)
- O Marcos usa em produção: os fluxos principais são cobertos pela regressão Playwright (`AGENTS.md` §2 e §4).
- Segredos nos Secrets do Supabase, no Vault ou em `.env*.local`; `.env.example` sempre atualizado.
- Auditoria de segurança a cada mudança de autenticação, RLS ou dados pessoais.
- Toda entrega passa pelo `/entrega`; o resumo final vai para o Marcos.

### Específicas deste projeto
- **Repositórios:** `origin` = `piccini-dev/hive-resgate` (público desde 06/11, transferido pelo Raul; operação resgate; a `main` publica o site de teste). `producao` = `raulmf12/bee-platform` (público, site do Marcos), com o push desligado nesta pasta. O plano está em `docs/plano/PLANO.md`; a execução segue o módulo orquestra (`AGENTS.md` §0).
- **Push em `main` publica no Netlify.** Push, PR, merge e deploy de banco ou Edge Function só com ordem explícita do Raul, mesmo onde o ciclo do `AGENTS.md` manda "commit + push".
- Os testes E2E e o `npm run sql` rodam contra o **banco de produção**: só leitura sem pedido explícito; nunca rodar a regressão sem o Raul saber.
- Enxugar antes de crescer: ao mexer numa área, preferir juntar ou remover função redundante a criar nova. O que sair precisa da confirmação do Raul (o Marcos pode depender dela).
