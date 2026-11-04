# Relatório de enxugamento e reorganização — bee-platform (Hive)

Data: 2026-11-04 · Base: `main` (407a6e5) · **Só leitura: nada foi alterado.**
Versão 2: substitui a versão 1 do mesmo dia e corrige um erro dela (§10).

---

## 0. Resumo em 1 minuto

A Hive cresceu em camadas: Alma → Genesis → Identidade, linhas editoriais → campanhas, wizard → produção. **A camada nova entrou, mas a velha não saiu.** Por isso a mesma coisa aparece em dois, três ou cinco lugares.

| | Hoje | Proposta |
|---|---|---|
| Itens no menu do Marcos | 26 + Criar | 15 + Criar (e uma área Admin para o Raul) |
| Jeitos de criar conteúdo | 3 | 2 (campanha e conteúdo avulso; o vídeo entra no avulso) |
| Lugares para ver "o que está andando" | 4 | 2 (Início e Agenda) |
| Jeitos de ensinar a voz | 4 telas | 1 tela ("Ensinar a Hive") + a correção automática |
| Lugares onde a "voz" é definida | 4 | 2 (Identidade e Como escrevo) |
| Representações de "público" | 5 | 1 (meta; é a etapa mais arriscada) |
| Edge Functions | 46 | cerca de 33 |
| Tabelas | ~100 | cerca de 83 |
| Linhas em telas e componentes | — | cerca de -5.300 |

**Limite:** o uso real não foi medido no banco (sem token; ver §11). O "morto" abaixo é morto **no código**. Antes de apagar tabela, é preciso conferir no banco.

---

## 1. Por que está confuso: as 6 causas

1. **Migrações de conceito pela metade.** A Alma virou Genesis, mas 7 tabelas `alma_*` continuam e o app ainda grava em `alma_eventos`, que ninguém lê. As linhas editoriais viraram campanhas, mas a tela, a função, as tabelas e o "portão da IA" delas continuam.
2. **Um wizard antigo em paralelo à esteira nova.** `/posts/novo` (2.269 linhas) faz o mesmo que Campanha → Produção e Um conteúdo, com outras funções de IA.
3. **Configurações que não configuram nada.** As abas "Voz Bee" e "Branding" de Configurações, e o tom de voz do Onboarding, gravam campos que **nenhum código lê** (§3.6).
4. **Ferramentas de construção no menu do usuário.** Teste de imagem, prévia do compositor, calibração do Olhar e custos de API aparecem para o Marcos.
5. **O mesmo conceito com nomes diferentes.** "Público" existe como `bee_avatars`, `genesis_avatares`, `audiences`, `bee_personas` e o público do editorial (`suggest-audience`). "Voz" existe no Genesis, nas Diretrizes, nos perfis da Identidade e em Configurações.
6. **Menu organizado por "quando foi construído", não por "o que o Marcos faz".** "Base Hive" tem 11 itens e "Inteligência" tem 9, misturando o diário com o raro.

---

## 2. Mapa completo das telas (com veredito)

Legenda: **M** manter · **J** juntar com outra · **A** levar para Admin · **S** sair · **T** tem teste E2E.

### Menu principal
| Tela | Rota | O que faz | Veredito |
|---|---|---|---|
| Início | `/` | O que precisa de você, o que vai ao ar e as recomendações | **M**, absorve o que o Pipeline tem de único · T |
| Criar (botão) | `/criar` | Escolhe entre Campanha, Um conteúdo e Vídeo | **M** |
| Campanhas | `/campanhas`, `/nova`, `/:id` | Estratégia, ciclos e mix | **M** · T |
| Produção | `/producao` | Passo a passo do ciclo: pauta → ideias → desenvolvimento → revisão | **M** · T |
| Pipeline | `/pipeline` | Kanban de ideias, conteúdos e peças | **J** com o Início (status) e a Agenda (fila) · T |
| Agenda | `/agenda` | Calendário + fila para agendar | **M**, com um só jeito de sugerir data (§3.2) · T |
| Desempenho | `/desempenho`, `/contas` | Métricas, comparativo de contas, tráfego pago | **M**, vira "Resultados" · T |

### "Base Hive" (11 itens)
| Tela | Rota | Veredito |
|---|---|---|
| Minha identidade | `/identidade` (+ sessões e perfis) | **M**: marca, quem fala, frentes, público, perfis · T |
| Genesis | `/genesis` | **J** com Diretrizes numa tela "Como escrevo" (abas Princípios / Ofício) · T |
| Diretrizes de Criação | `/diretrizes` | **J** (ver acima) |
| Editoriais | `/editoriais` | **M**, absorve o Arsenal e os exemplos (já são por editorial) |
| Arsenal | `/arsenal` | **J** com Editoriais |
| Produtos | `/produtos` | **J** com Identidade (há sobreposição com "frentes de negócio", `business_fronts`; ver §3.5) |
| Conhecimento | `/conhecimento` | **M** (RAG) |
| Fotografia do Marcos | `/hive/fotografia` | **J** com `/hive/marcos`: uma tela de fotos do Marcos · T |
| Templates | `/templates` | **M** |
| Biblioteca | `/biblioteca` | **M**, absorve a lista de Vídeos |
| Vídeos | `/podcasts`, `/podcasts/novo` | **J**: a lista vai para a Biblioteca e "novo corte" entra pelo Criar |

### "Inteligência" (9 itens)
| Tela | Rota | Veredito |
|---|---|---|
| Aprendizado | `/aprendizado` | **J**: a lista de lições vai para "Ensinar a Hive"; o painel do portão sai (§3.4) |
| Jornada relacional (ACJ) | `/jornada` | **J**: vira uma aba de "Resultados" · T |
| Curadoria | `/curadoria` | **M** (regra 9: nada entra na voz sem humano) |
| Feedback contínuo | `/feedback` | **J** com o Coach |
| Coach de voz | `/coach` | **M**, vira "Ensinar a Hive" |
| Olhar Bee · calibração | `/olhar/calibracao` | **A** · T |
| Simular público | `/personas` | **S** (isolada do fluxo; confirmar com o Marcos) |
| Custos de API | `/custos` | **A** |
| Teste de imagem | `/labs/imagens` | **S** depois de registrar qual modelo de imagem venceu |

### Fora do menu
| Tela | Rota | Veredito |
|---|---|---|
| Wizard antigo | `/posts/novo` | **S** (§3.1) |
| Editor da peça | `/posts/:id` | **M** |
| Editor de template | `/templates/:id` | **M** |
| Um conteúdo | `/criar/conteudo` | **M**, recebe o vídeo |
| Onboarding | `/onboarding` | **J**: o cliente novo vai direto para o setup da Identidade (o wizard atual grava campos que ninguém lê) |
| Prévia, assets e convite do Hive | `/hive/preview`, `/hive/assets`, `/hive/convite` | **A** para a prévia e os assets; o convite M04 vira opção no Criar |
| Fotos reais do Marcos | `/hive/marcos` | **J** com Fotografia do Marcos |
| Testes M01 e M02 | `/hive/teste-m01`, `/hive/teste-m02` | **S** (o código já diz "TEMP: apagar") |
| Linhas editoriais | arquivo `LinhasEditoriais.tsx` | **S** (sem rota; `/linhas` já redireciona) |

---

## 3. Redundâncias por tema

### 3.1 Criar conteúdo: 3 caminhos → 2
- **Campanha → Produção** é o fluxo principal.
- **Um conteúdo** (`/criar/conteudo`) já usa a mesma esteira para conteúdo avulso.
- **Wizard antigo** (`/posts/novo`, 2.269 linhas) ainda é usado para:
  - retomar posts antigos com texto pendente (links do Início e de `postReview.ts`);
  - o vídeo (roteiro, transcrição, legenda);
  - o link "Gerar um post individual" do `GateLock` (que só aparece na tela morta de Linhas).
- **Só o wizard usa:** 6 componentes de `components/posts/wizard/` (~720 linhas), `lib/hive/batchCompose.ts`, `lib/templates/resolve.ts`, e as funções `generate-script`, `regenerate-snippet` e `nano-scene` (esta marcada como "TEMPORÁRIA, apagar").
- **Proposta:**
  1. Resolver de uma vez os pendentes antigos (aprovar ou arquivar), com uma lista para o Marcos.
  2. Passar o vídeo para "Um conteúdo" (formato vídeo), reaproveitando `process-video` e `generate-caption-from-video`.
  3. Remover o wizard.
- **Pergunta para o Marcos:** ele usa "regenerar trecho" ou "roteiro de vídeo"? Se usa, essas ações vão para o editor da peça, sem tela própria.

### 3.2 Ver o andamento: 4 lugares → 2
- **Início** mostra o que precisa de você. **Produção** é o passo a passo de um ciclo (fica, é outra coisa). **Pipeline** é um kanban. **Agenda** mostra calendário e fila.
- **Proposta:** o Pipeline sai. As contagens por estágio vão para o Início; a fila "para agendar" já está na Agenda.
- **Dentro da Agenda há dois sugeridores de data:**
  - "janela sugerida pela Hive" (regra fixa, `lib/campaign`);
  - "IA distribui" (LLM, `distribute-schedule`).
- Proposta: ficar com um. Recomendo a janela da Hive, que é previsível e não custa IA.

### 3.3 Ensinar a voz: 4 telas → 1
| Caminho | Funções | Proposta |
|---|---|---|
| Feedback contínuo (`/feedback`) | `learn-from-feedback` | Vira o modo "observação geral" do Coach |
| Coach de voz (`/coach`) | `voice-coach` + `commit-learning` | Vira **"Ensinar a Hive"** |
| PostCoach (no editor) | `post-chat` + `voice-coach` | Fica (é o Coach dentro da peça) |
| Correção automática ao editar | `learn-from-correction` | Fica (invisível) |
| Lista de lições (dentro de Aprendizado) | `ai_learnings` | Vai para uma aba de "Ensinar a Hive" |
| Curadoria | `mine-content` | Fica separada (regra 9) |

### 3.4 O "portão da IA": resto do piloto automático antigo
- `ai_segment_gate`, as RPCs `ai_gate_status`, `ai_gate_recompute` e `ai_segment_status`, o painel de Aprendizado e o `GateLock` serviam para **liberar o piloto automático das linhas editoriais** por segmento. O piloto automático saiu no cutover de campanhas (o cron `editorial-line-tick` foi desligado).
- Ainda lê o portão: o `voice-coach` (usa `ai_segment_status` para escolher em que focar).
- **Proposta:** remover o painel e o `GateLock`. O foco do Coach passa a vir das lições e correções recentes. A tabela e as RPCs saem na fase 2 (apagar).

### 3.5 Voz e identidade: 4 lugares → 2
| Onde | O que guarda | Lido pela geração? |
|---|---|---|
| Genesis (`genesis_*`) | Princípios, fluxo, tensões, avatares | Sim |
| Diretrizes (`bee_directives`) | Regras do ofício | Sim |
| Identidade (`brands`, `emitters`, `business_fronts`, `audiences`, `communication_profiles*`) | Quem fala, frentes, público, perfis versionados | Sim (`_shared/context.ts`) |
| Configurações → "Voz Bee" (`user_settings.persona`, `tone_of_voice`, `content_structure`) | Texto livre | **Não: nenhum código lê** |

- **Proposta:**
  - "Minha identidade" fica com quem fala, frentes, público e marca.
  - "Como escrevo" junta Genesis e Diretrizes.
  - A aba "Voz Bee" sai.
- **Produtos × frentes de negócio:** `bee_products` (campanha e pauta) e `business_fronts` (Identidade) podem ser o mesmo conceito. Conferir antes de juntar.

### 3.6 Configurações que não configuram nada
- Aba **Voz Bee**: persona, tom e estrutura. Grava, mas nada lê. Ela também mostra contagens de `bee_themes` e `bee_logics`, tabelas que nenhuma geração lê.
- Aba **Branding**: `brand_colors`, `brand_logo_url`. Grava, mas nada lê (a arte usa `design_tokens` e `brands`).
- **Onboarding:** grava `persona` e `tone_of_voice`, que ninguém lê.
- **Proposta:** remover as duas abas. O onboarding leva ao setup da Identidade.

### 3.7 Público: 5 representações → 1 (etapa mais arriscada)
| Tabela ou função | Quem usa |
|---|---|
| `genesis_avatares` | `generate-content`, `acj-orchestrator` |
| `bee_avatars` | Roteiro e legenda de vídeo, Simular público, wizard |
| `audiences` | Identidade, `_shared/context.ts` |
| `bee_personas` | Só a tela Simular público |
| Público do editorial | `suggest-audience` (Editoriais) |

- **Proposta:** `audiences` (Identidade) como fonte única, com as outras lidas por ela ou migradas. **Mexe no prompt da geração:** fazer por último, com testes de voz e aprovação do Marcos.

### 3.8 Fotos e imagens
- Há duas telas de foto do Marcos: `/hive/fotografia` (motor fotográfico, `photo_*`) e `/hive/marcos` (fotos reais em `design_assets`, M02).
- `/hive/assets` gera fotos atmosféricas e texturas; `/labs/imagens` compara modelos.
- **Proposta:** uma tela "Fotos do Marcos" (as duas juntas). Assets e prévia do compositor vão para Admin; o Lab sai.
- **Dois sistemas visuais convivem:** Templates (`post_templates`, editáveis no Fabric) e as matrizes Hive M01–M04 (`design_*`, compostas em código). Não proponho juntar agora: é refazer a arte. Fica registrado como dívida.

### 3.9 Biblioteca e Vídeos
- A Biblioteca mostra publicados e cortes de podcast; "Vídeos" lista podcasts e cortes de novo.
- **Proposta:** a lista de Vídeos vai para a Biblioteca; criar corte entra pelo Criar.

---

## 4. Morto no código (lista verificada)

### 4.1 Telas e componentes
- `pages/linhas/LinhasEditoriais.tsx` (423 linhas): sem import.
- `pages/hive/HiveTesteM01.tsx` e `HiveTesteM02.tsx` (525 linhas): marcadas como TEMP.
- `components/ai/GateLock.tsx`: só a tela de Linhas usa.
- Lógica de item "travado" no `Sidebar.tsx` (`unlocked = true` fixo).

### 4.2 Edge Functions sem chamador
- `editorial-line-tick` (444 linhas; o cron foi desligado no cutover).
- `hybrid-image-search` (`edge.searchImages` sem uso).
- `search-knowledge` (`edge.searchKnowledge` sem uso; o RAG da geração usa a RPC `match_knowledge` direto).
- `download-proxy` (nenhuma referência).

### 4.3 Tabelas sem leitor
| Tabela | Situação |
|---|---|
| `alma_crencas`, `alma_dimensoes`, `alma_estado`, `alma_objetivo`, `alma_pulsoes`, `alma_sombra` | Trocadas pelo Genesis; nada lê |
| `alma_eventos` | **Só escrita**: `generate-content` e `almaApi.emitEvento` gravam, ninguém lê |
| `genesis_dimensoes`, `genesis_paradigmas` | Trocadas por `genesis_tensoes`; nada lê |
| `acj_definitions` | Semeada, mas a biblioteca ACJ vem de `lib/acj/library.generated.ts` e `_shared/acj-library.ts` |
| `editorial_lines`, `editorial_line_runs` | Só a tela e a função mortas usam |
| `kanban_columns` | `kanbanApi` não é usada, mas o login roda `kanbanApi.ensureDefaults()` **a cada entrada** (escrita inútil) |
| `bee_themes`, `bee_logics` | Só contadas na aba Voz Bee; nenhuma geração lê |

Colunas sem leitor em `user_settings`: `persona`, `tone_of_voice`, `content_structure`, `brand_colors`, `brand_logo_url`.

### 4.4 Código de cliente
- `src/lib/api.ts` (1.214 linhas) tem 27 funções sem uso. Entre elas: `kanbanApi.*` (exceto `ensureDefaults`), `draftApi.*`, `editorialLinesApi.get/runs`, `podcastApi.get/create/update/findByVideoId`, `podcastClipApi.get/delete/listByPodcast`, `beeApi.updateExample/arsenalForEditorial/styleRules`, `exampleApi.create`, `suggestionApi.create/countPending`, `genesisApi.removePrincipio`, `aiApi.segments`, `templateApi.upsertSystem` e `productApi.get`.
- O mapa de preços de IA está duplicado: `src/lib/pricing.ts` e `_shared/security.ts`.

### 4.5 Repositório e documentação
- `README.md` (52 KB) está desatualizado: descreve a "Alma" como eixo central. Proposta: reduzir a uma página que aponta para o `AGENTS.md`.
- `GEMINI.md` e `playwright.r1.config.ts`: conferir se ainda servem.
- `docs/` (2,5 MB, 48 arquivos): manter como histórico, mas marcar no índice o que é legado (Alma, linhas editoriais).

---

## 5. Edge Functions: 46 → cerca de 33

| Situação | Funções |
|---|---|
| **Saem (mortas)** | `editorial-line-tick`, `hybrid-image-search`, `search-knowledge`, `download-proxy` |
| **Saem com o wizard** | `generate-script`, `regenerate-snippet`, `nano-scene` |
| **Saem com Feedback → Coach** | `learn-from-feedback` |
| **Saem com Simular público** | `generate-persona`, `persona-chat` |
| **Sai com um só sugeridor na Agenda** | `distribute-schedule` |
| **Sai com o público unificado** | `suggest-audience` |
| **Ficam: produção** | `campaign-moment`, `campaign-strategy`, `campaign-tick`, `cycle-pauta`, `content-develop`, `generate-content`, `qa-check`, `edit-text`, `content-memory`, `sequence-script`, `acj-orchestrator` |
| **Ficam: visual** | `hive-decide`, `generate-image-ai`, `marcos-photo` |
| **Ficam: agenda e publicação** | `schedule-piece`, `publish-post`, `publish-scheduler` |
| **Ficam: contas e métricas** | `instagram-connect`, `instagram-import`, `instagram-refresh`, `linkedin-import`, `test-linkedin`, `metrics-ingest`, `meta-ads-sync`, `meta-ads-attribution` |
| **Ficam: voz** | `voice-coach`, `commit-learning`, `learn-from-correction`, `post-chat`, `mine-content`, `ingest-document`, `identity-setup` |
| **Ficam: vídeo** | `process-video`, `generate-caption-from-video`, `youtube-meta` |
| **Fica: agente público da LP** | `olhar-bee` |

---

## 6. Organização proposta

### 6.1 Menu novo
```
+ Criar            → Campanha · Um conteúdo (texto, imagem, carrossel, vídeo) · Convite
Início             (o que precisa de você + andamento por estágio)
Campanhas
Produção
Agenda
Resultados         (Desempenho · Contas · Tráfego pago · Jornada ACJ)

Voz da Hive
  Minha identidade (quem fala · frentes/produtos · público · marca)
  Como escrevo     (Genesis · Diretrizes)
  Editoriais       (editoriais · arsenal · exemplos)
  Conhecimento     (documentos do RAG)

Ensinar a Hive
  Coach            (conversa · observações gerais · lições ativas)
  Curadoria

Visual
  Templates
  Fotos do Marcos
  Biblioteca       (publicados · vídeos e cortes · imagens)

Configurações      (Perfil · Contas · Integrações)

Admin (só para o Raul): Custos · Olhar Bee · Prévia e assets do Hive
```

### 6.2 De → para das rotas (os links antigos continuam funcionando por redirecionamento)
| Rota antiga | Vai para |
|---|---|
| `/pipeline` | `/` |
| `/posts/novo` | `/criar/conteudo` (pendentes antigos já resolvidos) |
| `/feedback` | `/coach` |
| `/aprendizado` | `/coach` (aba Lições) |
| `/jornada` | `/desempenho` (aba ACJ) |
| `/diretrizes` | `/genesis` (aba Ofício) |
| `/arsenal` | `/editoriais` |
| `/produtos` | `/identidade` |
| `/hive/marcos` | `/hive/fotografia` |
| `/podcasts` | `/biblioteca` |
| `/podcasts/novo` | `/criar/conteudo?formato=video` |
| `/personas`, `/labs/imagens`, `/hive/teste-*` | `/` |

---

## 7. Banco depois do enxugamento
- **Saem (fase 2, com rollback):** as 15 tabelas de §4.3, mais `bee_personas` e `image_model_trials` (se Simular público e o Lab saírem) e `ai_segment_gate` (portão).
- **Colunas que saem:** as 5 de `user_settings` (§4.3).
- **Fase posterior:** juntar público (§3.7) e talvez produtos com frentes (§3.5).

---

## 8. Ordem de execução (base para o PLANO.md)

Cada onda segue a regra decidida: **primeiro esconder** (rota redireciona, sai do menu, o cron para), **depois apagar** (código, função e tabela, com rollback), após um prazo sem reclamação.

| Onda | O quê | Risco |
|---|---|---|
| 0 | Medir o uso real no banco (§11) e ajustar este relatório | Nenhum |
| 1 | Morto: §4, sem efeito para o Marcos | Baixo |
| 2 | Configurações falsas (§3.6) + Admin (§2) + menu novo com redirecionamentos | Baixo |
| 3 | Ensinar a Hive (§3.3) + fim do portão (§3.4) | Médio |
| 4 | Pipeline → Início (§3.2) + um sugeridor de data na Agenda | Médio |
| 5 | Fotos, Biblioteca e Vídeos (§3.8, §3.9) | Médio |
| 6 | Aposentar o wizard (§3.1): resolver pendentes, levar o vídeo para "Um conteúdo", remover | Alto |
| 7 | Voz em 2 lugares (§3.5): "Como escrevo" e Produtos na Identidade | Médio |
| 8 | Fase 2 de apagar: funções e tabelas das ondas 1 a 7 | Médio |
| 9 | Público único (§3.7) | Alto (mexe no prompt) |

Cada onda passa pela regressão completa (cerca de 40 min) antes do push. Com menos telas, a suíte também encolhe (o `f7-home-pipeline` muda na onda 4).

---

## 9. O que perguntar ao Marcos (antes das ondas 3 a 6)
1. Você abre o Pipeline ou só o Início e a Agenda?
2. Usa "IA distribui" na Agenda?
3. Usa Simular público?
4. Usa Feedback contínuo e Coach, ou só o Coach dentro do post?
5. Ainda cria algo por "Gerar post individual" (wizard antigo)? Usa "regenerar trecho" ou "roteiro de vídeo"?

---

## 10. Correção em relação à versão 1
A versão 1 chamou de órfãs 12 tabelas. Três delas **são usadas** por funções SQL e triggers: `piece_versions` (versionamento de peças), `workspaces` (multi-cliente) e `ai_segment_gate` (portão). A lista de §4.3 só tem as que não têm leitor nem no app, nem nas funções, nem no SQL.

## 11. Medição no banco (2026-11-04, só SELECT)

Feita na issue #4 do hive-resgate. Todas as consultas foram só leitura. As contagens excluem o usuário de teste E2E onde a tabela tem `user_id`.

### 11.1 Tabelas: linhas e último registro
Último registro = maior `updated_at` (ou `created_at`); `-` = a tabela não tem essas colunas.

**Vazias (19):** `acj_learning_decisions`, `acj_learning_entries`, `acj_learning_evidence`, `acj_signal_readings`, `ai_chat_messages`, `content_idea_feedback`, `content_ideas_cache`, `image_model_trials`, `olhar_calibracao`, `photo_generations`, `photo_style_approvals`, `piece_candidates`, `piece_versions`, `podcast_clips`, `post_drafts`, `post_unit_publications`, `post_units`, `setup_sessions`, `user_feedback`.

| Tabela | Linhas | Último |
|---|---:|---|
| `acj_campaign_plans` | 2 | 2026-10-13 |
| `acj_content_contracts` | 16 | 2026-10-16 |
| `acj_cycle_plans` | 1 | 2026-10-13 |
| `acj_definitions` | 5 | 2026-10-06 |
| `ai_generations` | 114 | 2026-10-19 |
| `ai_learnings` | 29 | 2026-10-20 |
| `ai_measurement_events` | 16 | 2026-10-20 |
| `ai_reviews` | 64 | 2026-10-19 |
| `ai_segment_gate` | 27 | 2026-10-20 |
| `ai_variations` | 122 | 2026-10-19 |
| `alma_crencas` | 8 | 2026-07-01 |
| `alma_dimensoes` | 6 | 2026-07-01 |
| `alma_estado` | 1 | - |
| `alma_eventos` | 295 | 2026-10-20 |
| `alma_objetivo` | 2 | 2026-07-01 |
| `alma_pulsoes` | 5 | 2026-07-01 |
| `alma_sombra` | 4 | 2026-07-01 |
| `audiences` | 3 | 2026-10-14 |
| `bee_analogies` | 13 | 2026-05-27 |
| `bee_arsenal` | 83 | 2026-07-10 |
| `bee_avatars` | 2 | - |
| `bee_directives` | 32 | 2026-08-07 |
| `bee_editorials` | 8 | 2026-07-10 |
| `bee_example_posts` | 14 | 2026-07-10 |
| `bee_glossary` | 17 | 2026-07-01 |
| `bee_hashtags` | 15 | - |
| `bee_headline_types` | 4 | 2026-05-27 |
| `bee_logics` | 7 | - |
| `bee_personas` | 2 | 2026-07-20 |
| `bee_products` | 5 | 2026-09-25 |
| `bee_style_rules` | 46 | 2026-07-10 |
| `bee_suggestions` | 2 | 2026-09-11 |
| `bee_themes` | 8 | - |
| `brands` | 1 | 2026-10-14 |
| `business_fronts` | 2 | 2026-10-14 |
| `campaign_cycles` | 10 | 2026-10-31 |
| `campaigns` | 2 | 2026-10-26 |
| `communication_profile_versions` | 3 | 2026-10-14 |
| `communication_profiles` | 3 | 2026-10-14 |
| `content_memory` | 527 | 2026-11-03 |
| `content_piece_plans` | 8 | 2026-10-19 |
| `contents` | 522 | 2026-11-03 |
| `context_snapshots` | 12 | 2026-10-19 |
| `design_assets` | 54 | 2026-09-21 |
| `design_manifestacoes` | 8 | 2026-10-14 |
| `design_selection_config` | 1 | 2026-10-14 |
| `design_tokens` | 9 | 2026-10-14 |
| `design_variacoes` | 16 | 2026-10-14 |
| `editorial_line_runs` | 4 | - |
| `editorial_lines` | 1 | 2026-09-25 |
| `emitters` | 2 | 2026-10-14 |
| `format_capabilities` | 5 | - |
| `genesis_avatares` | 5 | 2026-08-05 |
| `genesis_core` | 1 | 2026-08-05 |
| `genesis_fluxo` | 7 | 2026-08-05 |
| `genesis_lentes` | 6 | 2026-08-05 |
| `genesis_principios` | 46 | 2026-08-05 |
| `genesis_tensoes` | 2 | 2026-08-05 |
| `ideas` | 39 | 2026-10-31 |
| `kanban_columns` | 20 | 2026-05-27 |
| `knowledge_chunks` | 17121 | 2026-05-27 |
| `knowledge_documents` | 90 | 2026-07-10 |
| `meta_ad_accounts` | 4 | - |
| `meta_ad_insights_daily` | 1182 | - |
| `meta_ads` | 262 | - |
| `meta_adsets` | 188 | - |
| `meta_businesses` | 2 | - |
| `meta_campaigns` | 66 | - |
| `meta_connections` | 1 | 2026-11-04 |
| `olhar_base` | 53 | 2026-11-03 |
| `olhar_nomes_proibidos` | 325 | 2026-11-03 |
| `olhar_sessions` | 2 | 2026-11-03 |
| `photo_references` | 39 | 2026-10-06 |
| `podcasts` | 1 | 2026-06-10 |
| `post_comments` | 3 | 2026-11-04 |
| `post_metrics` | 537 | 2026-11-04 |
| `post_publications` | 13 | 2026-10-29 |
| `post_templates` | 4 | 2026-07-16 |
| `profiles` | 3 | 2026-09-24 |
| `publication_packages` | 18 | 2026-10-21 |
| `schedule_commands` | 30 | 2026-10-21 |
| `schedule_plans` | 2 | 2026-10-19 |
| `social_accounts` | 3 | 2026-11-04 |
| `usage_events` | 753 | 2026-11-03 |
| `user_posts` | 565 | 2026-11-03 |
| `user_settings` | 2 | 2026-10-23 |
| `workspace_members` | 2 | 2026-10-14 |
| `workspaces` | 1 | 2026-10-14 |

### 11.2 Crons (`cron.job`)
| Job | Agenda | Ativo |
|---|---|---|
| `campaign-tick` | `0 9 * * *` | sim |
| `instagram-refresh` | `17 4 * * *` | sim |
| `linkedin-metrics` | `15 * * * *` | sim |
| `meta-ads-sync` | `*/30 * * * *` | sim |
| `metrics-ingest` | `30 9 * * *` | sim |
| `publish-scheduler` | `*/2 * * * *` | sim |

Não há cron de `editorial-line-tick` (confirma §4.2). O `linkedin-metrics` vem do trabalho de 03/11 que ainda não está no repositório (migration `20261103000006`, só no patch de transferência).

### 11.3 Edge Functions publicadas e chamadas em 30 dias
- **48 publicadas, as mesmas 48 do repositório** (o §5 dizia 46). Nenhuma publicada fora do repo nem no repo sem publicar.
- O `linkedin-import` publicado (v9, 03/11) é **mais novo que o código do repo**: a versão nova só existe no patch de transferência.
- Chamadas lidas dos logs de borda (`function_edge_logs`), dia a dia, de 05/10 a 04/11. Colunas: **usuário** = JWT de usuário logado que não é o de teste (Marcos, ou o Raul testando); **E2E** = usuário de teste; **serviço** = cron, service role, chamada entre funções ou preflight sem JWT.

| Função | Usuário | E2E | Serviço | Última chamada de usuário |
|---|---:|---:|---:|---|
| `identity-setup` | 43 | 0 | 3 | 2026-11-03 |
| `publish-post` | 38 | 236 | 67 | 2026-11-03 |
| `hive-decide` | 31 | 0 | 24 | 2026-10-19 |
| `generate-content` | 30 | 2 | 70 | 2026-10-19 |
| `schedule-piece` | 29 | 360 | 100 | 2026-10-21 |
| `content-develop` | 23 | 0 | 19 | 2026-10-16 |
| `content-memory` | 9 | 0 | 18 | 2026-11-03 |
| `learn-from-correction` | 9 | 0 | 9 | 2026-10-20 |
| `linkedin-import` | 8 | 0 | 33 | 2026-11-03 |
| `voice-coach` | 7 | 0 | 9 | 2026-10-20 |
| `post-chat` | 6 | 0 | 8 | 2026-10-20 |
| `cycle-pauta` | 5 | 0 | 9 | 2026-10-15 |
| `campaign-moment` | 3 | 0 | 4 | 2026-10-27 |
| `metrics-ingest` | 2 | 17 | 48 | 2026-10-19 |
| `olhar-bee` | 2 | 0 | 30 | 2026-11-03 |
| `edit-text` | 2 | 0 | 2 | 2026-10-13 |
| `distribute-schedule` | 2 | 0 | 2 | 2026-10-19 |
| `acj-orchestrator` | 1 | 0 | 5 | 2026-10-13 |
| `commit-learning` | 1 | 0 | 2 | 2026-10-20 |
| `campaign-strategy` | 1 | 0 | 1 | 2026-10-13 |
| `publish-scheduler` | 0 | 0 | 20432 | - |
| `meta-ads-sync` | 0 | 0 | 1356 | - |
| `meta-ads-attribution` | 0 | 0 | 1208 | - |
| `campaign-tick` | 0 | 0 | 43 | - |
| `qa-check` | 0 | 0 | 37 | - |
| `instagram-refresh` | 0 | 0 | 28 | - |
| `marcos-photo` | 0 | 28 | 23 | - |
| `sequence-script` | 0 | 0 | 1 | - |

**Nenhuma chamada em 30 dias (20):** `download-proxy`, `editorial-line-tick`, `generate-caption-from-video`, `generate-image-ai`, `generate-persona`, `generate-script`, `hybrid-image-search`, `ingest-document`, `instagram-connect`, `instagram-import`, `learn-from-feedback`, `mine-content`, `nano-scene`, `persona-chat`, `process-video`, `regenerate-snippet`, `search-knowledge`, `suggest-audience`, `test-linkedin`, `youtube-meta`.

### 11.4 Dependências SQL das tabelas de §4.3
| Tabela | Dependência | Efeito no corte |
|---|---|---|
| `genesis_dimensoes`, `genesis_paradigmas` | **não existem mais** no banco | já saíram; tirar da lista |
| `alma_eventos` | a função `ai_gate_recompute` (trigger `trg_ai_gate_recompute` em `ai_reviews`) **grava** nela | continua só escrita, mas apagar a tabela quebra a revisão de IA: primeiro tirar o insert da função |
| `alma_dimensoes` | FK de `alma_crencas` e `alma_sombra` | sai junto com elas |
| `editorial_lines` | FK de `editorial_line_runs` e de `user_posts.editorial_line_id` (0 posts preenchidos); trigger `trg_editorial_lines_next_run` | soltar a FK de `user_posts` antes |
| `kanban_columns` | a função `handle_new_user` (cadastro) cria as colunas padrão | tirar de `handle_new_user` antes (além do `ensureDefaults` no login) |
| demais (`alma_crencas`, `alma_estado`, `alma_objetivo`, `alma_pulsoes`, `alma_sombra`, `acj_definitions`, `editorial_line_runs`, `bee_themes`, `bee_logics`) | nenhuma view, função, trigger, FK ou cron | confirmado: sem leitor no banco |

### 11.5 Uso de IA por função em 60 dias (`usage_events`, sem o usuário de teste)
Total: 445 chamadas, US$ 1,47. Os eventos sem `fn` são do `generate-content` (texto, 143) e do `generate-image-ai` (imagem, 18).

| Função · modo | Chamadas | US$ | Última |
|---|---:|---:|---|
| `generate-content` + `generate-image-ai` (sem `fn`) | 161 | 1.33 | 2026-10-19 |
| `qa-check` | 104 | 0.02 | 2026-10-16 |
| `hive-decide · M01` | 67 | 0.00 | 2026-10-19 |
| `content-develop` | 24 | 0.02 | 2026-10-16 |
| `learn-from-correction` | 17 | 0.00 | 2026-10-20 |
| `cycle-pauta` | 14 | 0.01 | 2026-10-31 |
| `cycle-pauta · full` | 11 | 0.04 | 2026-10-31 |
| `edit-text` | 10 | 0.00 | 2026-10-13 |
| `post-chat · rewrite` | 8 | 0.03 | 2026-10-20 |
| `hive-decide · M02` | 8 | 0.00 | 2026-09-25 |
| `campaign-moment` | 5 | 0.00 | 2026-10-13 |
| `regenerate-snippet` | 4 | 0.00 | 2026-09-15 |
| `cycle-pauta · swap` | 4 | 0.01 | 2026-10-15 |
| `campaign-strategy · recommend` | 3 | 0.00 | 2026-10-13 |
| `acj-orchestrator` | 2 | 0.01 | 2026-10-13 |
| `olhar-bee` | 2 | 0.00 | 2026-11-03 |
| `cycle-pauta · refresh` | 1 | 0.00 | 2026-10-07 |

`ai_measurement_events`: 16 eventos `review:<hash>`, todos `done`, de 19 e 20/10. Só registram revisões; não separam área.

### 11.6 Áreas candidatas a sair
| Área | Medição | Leitura |
|---|---|---|
| Simular público (`bee_personas`) | 2 personas, última mudança em 20/07; `generate-persona` e `persona-chat` sem chamada em 30 dias | sem uso desde julho |
| Teste de imagem (`image_model_trials`) | 0 linhas | nunca usado: não há "modelo vencedor" registrado |
| Feedback contínuo (`ai_learnings` de origem feedback) | 0. As 29 lições ativas vêm de `correcao` (24) e `conversa` (5) | o Feedback nunca gerou lição; o Coach e a correção, sim |
| Posts com texto pendente (wizard) | 0 | o bloco 08 não tem pendentes antigos para resolver |
| Vídeo (`podcasts`, `podcast_clips`) | 1 vídeo (10/06), 0 cortes; `process-video`, `generate-caption-from-video` e `youtube-meta` sem chamada em 30 dias | sem uso desde junho |
