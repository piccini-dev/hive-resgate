# Olhar Bee: decisões do Marcos (30/10/2026)

Respondidas pelo formulário da proposta (`proposta.html`). Todas as recomendações foram aceitas.

| # | Decisão | Resposta |
|---|---|---|
| 1 | LP | WordPress em `https://beeconsulting.com/`. O Raul tem acesso ao site |
| 2 | Perguntas antes da leitura | Até 2, só se o relato for vago, com "pular e ver a leitura" |
| 3 | Relatório aprofundado | E-mail com resumo e link para a página do relatório |
| 4 | E-mail | Resend com remetente `contato@beeconsulting.com`. O Raul mexe no DNS. O aviso de pedido de conversa vai para o e-mail do Marcos (**endereço ainda a confirmar**) |
| 5 | Abuso e custo | Anti-robô invisível (Turnstile), 3 leituras por pessoa por dia e teto de gasto diário. **Teto mensal: R$ 300** |
| 6 | Base pública | O Raul rascunha a partir do Genesis e das 6 áreas da LP, e o Marcos revisa texto por texto. Cards de "desafios semelhantes": nenhum sugerido ainda |
| 7 | Retenção | 12 meses para conversas sem contato; contatos até pedirem para sair. Sem jurídico: o Raul sugere o aviso de privacidade e decidem depois |
| — | Calibração | Marcos. Nenhum caso extra além dos 14 |

## Pendências antes da E2

- E-mail do Marcos para o aviso de pedido de conversa.
- ~~Lista de nomes proibidos~~ feita em 03/11: tabela `olhar_nomes_proibidos` (325 termos, 208 pessoas e 117 empresas, extraídos da biblioteca e revisados à mão). Os termos ficam só no banco, nunca no repositório.
- Recarga dos créditos do Gemini (zerados desde 27/10).
- Tornar o repositório privado (recomendado antes de a função pública existir).

## E1 · Base pública (03/11/2026)

- **Revisão 1 do Marcos (30/10):** 44 aprovados, 8 ajustados (A1, C1, C3, C4, C5, C6, E6, G1), 0 retirados.
- **CVV (decisão do Raul, 03/11):** sai da resposta padrão de acolhimento (G1, texto do Marcos). Aparece só com sinal de risco à vida (novo G6).
- **Bee Academy (A1):** o agente pode citar a jornada FLS como convite quando o relato tocar o desenvolvimento de quem escreve. O link fica para o final, junto com o domínio.
- **No banco:**
  - tabela `olhar_base` (migration `20261103000001_olhar_base.sql`, com rollback);
  - 53 textos: 44 `aprovado` e 9 `aguardando`, que esperam a conferência v2 (https://claude.ai/artifact/8ycfgarTnBpKAfKWLnuZMa);
  - só membros da marca leem; o público não tem acesso.
- **Fonte dos textos:** `base-publica-rascunho.json`. Depois da conferência v2, atualizar o `status` no banco por migration nova; nunca reeditar a já aplicada.
- **Conferência v2 (03/11, 13:37):** os 9 aprovados (migration `20261103000002_olhar_base_aprovacao_v2.sql`). **E1 concluída: 53 de 53 textos aprovados.**

## E2 · Bancada de calibração (03/11/2026)

**No ar:**
- **Tela:** Hive → Inteligência → "Olhar Bee · calibração" (`/olhar/calibracao`), com os 14 casos fictícios e um caso livre.
- **Função `olhar-bee`:**
  - segue o contrato da LP, com as ações `start` e `answer`, mais `calibrate` só para a bancada;
  - `report` e `contact` respondem `disabled` até a E3/E4;
  - o público sem login recebe `disabled` (403);
  - entram apenas membros da marca ou chamada de serviço (origem `teste`).

**Como pensa:**
- usa só a `olhar_base` aprovada e os ajustes de calibração ativos (`olhar_calibracao`, "ajustar" com comentário);
- acolhimento e recusas saem com os textos aprovados (G1–G6), sem a IA reescrever;
- o CVV só aparece com sinal de risco à vida.

**Revisão de nomes:**
- toda resposta escrita pela IA passa por `olhar_nomes_proibidos`;
- se algum nome aparecer, a IA refaz a resposta uma vez;
- se aparecer de novo, devolve `unavailable` e marca `barrado`.

**Teste real (03/11, gemini-3.5-flash):**

| Caso | Resultado |
|---|---|
| C01 | Leitura de Cultura, com 2 cards |
| C07 | 2 perguntas; depois da resposta, leitura de Estrutura |
| C08 | Acolhimento sem CVV |
| C09 | Recusa G2 |
| C10 | Recusa G3 |

**Próximo passo:** o Marcos calibra os 14 casos na bancada. O critério para ir ao site são os 14 aprovados, sem nome real nos casos 9, 10 e 12.
