Preciso que você construa a seção "Conte o seu desafio / Olhar Bee" da landing page da Bee Consulting.

Por enquanto será **só a página**, funcionando com respostas simuladas. Ela precisa ficar **pronta para ser ligada depois ao agente "Olhar Bee"**, que vai rodar na Hive, a plataforma interna da Bee (Supabase + Edge Functions). Essa integração será feita em outra sessão.

O contrato abaixo é fixo: o lado da Hive será implementado exatamente assim. Não invente outro formato. Se achar que algo precisa mudar, liste no relatório final em vez de mudar por conta própria.

## 0. Antes de começar

1. Descubra em que a LP está construída (WordPress, Webflow, HTML estático, Next, outro) e onde essa seção deve morar. Se não conseguir descobrir, **me pergunte antes de escrever código**.
2. Siga o visual que já existe na LP:
   - painel azul-gelo, título em serifa e texto em sans;
   - azul nos links;
   - laranja só no botão de ação principal ("Converse com a Bee").
3. Os textos da tela estão na seção 2. Use exatamente esses.

## 1. Regras inegociáveis

- **A página não tem inteligência.** Nada de chamar Gemini, OpenAI ou qualquer IA a partir do navegador. Nada de prompt, metodologia, "6 Dimensões" detalhadas ou instruções do agente no código da página. Tudo isso fica no servidor da Hive.
- **Um único arquivo fala com o servidor:** `olhar-bee-client.js`, ou o equivalente na plataforma. A interface só chama as funções dele.
  - Trocar de "simulado" para "real" tem que ser só mudar a configuração (seção 3).
- **Texto que vem do servidor é dado, nunca HTML.** Renderize sempre com `textContent` ou equivalente, nunca `innerHTML`. A resposta é escrita por uma IA a partir do que o visitante digitou.
- **Dois consentimentos separados e opcionais:**
  - "receber o relatório" (pede nome e e-mail);
  - "autorizar a Bee a entrar em contato".
  - Nenhum vem marcado por padrão, e um não implica o outro.
- **Sem dados pessoais no navegador além do necessário:**
  - guarde só o `session_id` em `sessionStorage`, para retomar se a pessoa recarregar a página;
  - não guarde o desafio nem o e-mail em `localStorage`.
- **Acessível:**
  - foco visível, `label` em todos os campos e botões com texto claro;
  - `aria-live="polite"` na área que muda de estado;
  - funciona no celular (largura 360px) e só com teclado.

## 2. A experiência (estados da seção)

| Estado | O que aparece |
|---|---|
| `idle` | Título "Conte o seu desafio. Experimente o olhar Bee." e o subtítulo "Descreva o que está acontecendo na sua organização. Vamos trazer uma primeira leitura para ampliar sua forma de enxergar o desafio."<br>Caixa "O que está acontecendo?" com placeholder "Conte do seu jeito. Não precisa organizar o problema." e botão "OLHAR COM A BEE →".<br>Abaixo, em letra pequena: "Uma primeira leitura. Não um diagnóstico ou uma resposta pronta." e um link curto para o aviso de privacidade. |
| `sending` | Botão desabilitado e a frase "A Hive está olhando para o seu desafio…". Sem barra de progresso falsa. |
| `questions` | O servidor pode devolver de 1 a 2 perguntas curtas. Cada pergunta tem um campo de resposta. Botões "Continuar" e "Pular e ver a leitura". |
| `reading` | Painel "OLHAR BEE" com o título "Uma primeira leitura para ampliar seu olhar sobre o desafio."<br>Três colunas, com ícones como no layout atual: **O que parece estar acontecendo**, **O que talvez não esteja visível** e **Onde pode estar o movimento**.<br>Faixa "Desafios semelhantes que já apoiamos" com 0 a 2 cards (área, título, texto e "VER EXPERIÊNCIA →").<br>À direita, "Quer aprofundar esse olhar?" com dois caminhos: "Receber o relatório completo" e o botão laranja "CONVERSE COM A BEE".<br>Texto pequeno: "Sua conversa pode ser enviada junto com sua narrativa para não precisarmos começar do zero." |
| `report_form` | Campos Nome e E-mail, mais o checkbox desmarcado "Quero receber o relatório completo por e-mail." (o texto do consentimento está na seção 4). Botão "Enviar relatório". |
| `report_sent` | "Pronto. O relatório completo chega no seu e-mail em alguns minutos." |
| `contact_form` | Nome e E-mail (preenchidos se já informados), Telefone/WhatsApp (opcional), Empresa e Cargo (opcionais), "Algo mais que queira contar?" (opcional) e o checkbox desmarcado de autorização de contato (seção 4). Botão "Quero conversar com a Bee". |
| `contact_sent` | "Recebemos. Alguém da Bee vai falar com você em breve, já com a sua narrativa em mãos." |
| `message` | Resposta do servidor que não é leitura: um acolhimento (`type: "care"`) ou uma recusa gentil (`type: "refusal"`). Mostre o texto e um botão "Contar de outro jeito" (volta ao `idle`, mantendo o texto digitado). Para `care`, mostre também "Converse com a Bee". |
| `error` | A mensagem do servidor (`error`), mais "Tentar de novo". Se o código for `disabled` ou `unavailable`, troque tudo por "A Hive está indisponível agora. Fale direto com a Bee:" e o botão de contato normal da LP. |

O botão "FALE COM A BEE" que já existe no topo da LP continua levando ao contato normal.

O "CONVERSE COM A BEE" de dentro da leitura abre o `contact_form` com o `session_id` atual, para a Bee receber a narrativa junto.

## 3. Configuração (o único ponto que muda na integração)

```js
window.OLHAR_BEE_CONFIG = {
  apiBase: null,               // null = modo simulado. Na integração: "https://djlorvdehedcupeykyes.supabase.co/functions/v1/olhar-bee"
  publishableKey: null,        // chave pública do Supabase (vai no header "apikey" se existir)
  turnstileSiteKey: null,      // Cloudflare Turnstile. null = não carrega o widget e envia turnstile_token: null
  privacyUrl: "/privacidade",  // link do aviso de privacidade
  contactFallbackUrl: "#contato", // contato normal da LP (usado quando o agente está indisponível)
  timeoutMs: 45000
};
```

- Com `apiBase: null`, o `olhar-bee-client.js` usa um **adaptador simulado**, com as respostas de exemplo da seção 6 e uma espera de ~1,5s.
- Com `turnstileSiteKey` preenchido:
  - carregue `https://challenges.cloudflare.com/turnstile/v0/api.js` em modo invisível;
  - obtenha o token antes de cada `start`.

## 4. Textos de consentimento (versionados)

Envie a versão junto com o aceite. O servidor grava o texto exato que a pessoa viu.

- `consent_report`, versão `"relatorio-v1"`:
  > "Quero receber o relatório completo por e-mail. A Bee usará meu nome e e-mail apenas para enviar este relatório."
- `consent_contact`, versão `"contato-v1"`:
  > "Autorizo a Bee Consulting a entrar em contato comigo sobre este desafio, usando a narrativa que compartilhei aqui."
- Aviso curto embaixo da caixa de texto:
  > "Não inclua nomes de pessoas ou dados sensíveis. Seu relato é usado só para gerar esta leitura. Ver privacidade."

## 5. O contrato da API

Todas as chamadas são `POST {apiBase}` com corpo JSON, `Content-Type: application/json` e o header `apikey: {publishableKey}`, se houver.

Toda resposta tem `success: true | false`.

### 5.1 `start`: enviar o desafio

```json
{
  "action": "start",
  "desafio": "texto do visitante (20 a 4000 caracteres)",
  "turnstile_token": "… ou null",
  "session_id": null,
  "source": { "page_url": "…", "referrer": "…", "utm_source": "…", "utm_medium": "…", "utm_campaign": "…" }
}
```

Valide no cliente: o desafio precisa de pelo menos 20 caracteres. Se tiver menos, mostre "Conte um pouco mais, com pelo menos uma ou duas frases." sem chamar o servidor.

A resposta é **um destes formatos**:

```json
{ "success": true, "type": "questions", "session_id": "uuid",
  "questions": [ { "id": "q1", "text": "Isso acontece em toda a empresa ou numa área específica?", "placeholder": "Opcional" } ],
  "can_skip": true }
```

```json
{ "success": true, "type": "reading", "session_id": "uuid", "reading": { …ver 5.5… } }
```

```json
{ "success": true, "type": "care", "session_id": "uuid", "message": "texto de acolhimento" }
```

```json
{ "success": true, "type": "refusal", "session_id": "uuid", "message": "texto da recusa gentil" }
```

### 5.2 `answer`: responder às perguntas (ou pular)

```json
{ "action": "answer", "session_id": "uuid", "skipped": false,
  "answers": [ { "id": "q1", "text": "até 1000 caracteres" } ] }
```

Resposta: `type: "reading"`, `"care"` ou `"refusal"`, no mesmo formato da 5.1.

Se `skipped: true`, envie `answers: []`.

### 5.3 `report`: pedir o relatório completo

```json
{ "action": "report", "session_id": "uuid", "name": "2 a 120 caracteres", "email": "e-mail válido",
  "consent_report": { "accepted": true, "text_version": "relatorio-v1" } }
```

Resposta:

```json
{ "success": true, "type": "report_queued", "message": "Pronto. O relatório completo chega no seu e-mail em alguns minutos." }
```

Mostre a `message` do servidor; o texto da seção 2 é só o padrão do modo simulado.

### 5.4 `contact`: autorizar o contato da Bee

```json
{ "action": "contact", "session_id": "uuid", "name": "…", "email": "…",
  "phone": "opcional", "company": "opcional", "role": "opcional", "message": "opcional, até 1000",
  "consent_contact": { "accepted": true, "text_version": "contato-v1" } }
```

Resposta:

```json
{ "success": true, "type": "contact_received", "message": "…" }
```

- O botão só fica habilitado com o checkbox marcado.
- O `session_id` pode ser `null`, se a pessoa chegou ao contato sem ter feito uma leitura.

### 5.5 Formato da leitura

```json
{
  "parece":    { "text": "…" },
  "invisivel": { "text": "…" },
  "movimento": { "text": "…" },
  "semelhantes": [
    { "area": "Cultura", "title": "Novos comportamentos que não apareciam apesar dos investimentos em desenvolvimento.", "text": "", "href": "https://…" }
  ],
  "area_provavel": "cultura",
  "disclaimer": "Uma primeira leitura, feita por IA a partir do que você contou. Não é um diagnóstico."
}
```

- `area_provavel` é uma destas: `estrategia`, `estrutura`, `cultura`, `top_team`, `times`, `lideranca`.
- `semelhantes` pode vir vazio: nesse caso, esconda a faixa.
- `href` pode ser `null`: nesse caso, esconda o "VER EXPERIÊNCIA".

### 5.6 Erros

```json
{ "success": false, "code": "invalid | rate_limited | turnstile | disabled | unavailable | not_found", "error": "mensagem em português para o visitante" }
```

- Sempre mostre o campo `error`. Se ele vier vazio, use "Não foi possível agora. Tente de novo em instantes."
- Timeout, ou falha de rede sem JSON, conta como `unavailable`.
- `disabled` e `unavailable` mostram o contato normal da LP (estado `error` da seção 2).
- `not_found` significa sessão expirada: limpe o `session_id` e volte ao `idle`, mantendo o texto digitado.

## 6. Modo simulado (para eu revisar a página agora)

O adaptador simulado deve permitir ver todos os estados. Um jeito simples é decidir pelo conteúdo do texto:

| O desafio contém | O simulado responde |
|---|---|
| menos de 60 caracteres | `questions` com 2 perguntas |
| "esgotad" ou "não durmo" | `care` |
| "ignore" ou "prompt" | `refusal` |
| "erro" | `success: false`, `code: "unavailable"` |
| qualquer outro texto | `reading` com o exemplo abaixo |

`report` e `contact` simulados sempre dão sucesso.

Leitura de exemplo:

- **parece:** "Há esforço contínuo e real para mudar comportamentos, mas o novo não se sustenta fora da sala de treinamento. O cansaço vem de repetir o investimento sem ver o retorno."
- **invisivel:** "Pode haver uma distância entre o que se ensina e o que o dia a dia recompensa. Se as decisões, as metas e as conversas seguem iguais, o sistema traz as pessoas de volta ao padrão antigo, e a falha parece ser delas."
- **movimento:** "Olhar para o que acontece na semana seguinte ao treinamento: quem decide o quê, o que é cobrado de fato e o que a liderança faz quando o novo comportamento aparece."
- **semelhantes:**
  - Cultura, "Novos comportamentos que não apareciam apesar dos investimentos em desenvolvimento.", `href: null`
  - Liderança, "Um problema aparentemente individual sustentado por uma dinâmica maior.", `href: null`

Deixe na página, só no modo simulado, uma etiqueta discreta: "modo demonstração".

## 7. Eventos para análise (opcional, mas deixe pronto)

Dispare `window.dispatchEvent(new CustomEvent("olhar-bee", { detail: { step } }))` com estes valores de `step`:

- `start`, `questions_shown`, `reading_shown`;
- `report_requested`, `contact_requested`;
- `error` (incluindo o `code`).

**Nunca** coloque o texto do desafio, o nome ou o e-mail no `detail`.

## 8. O que entregar

1. A seção funcionando em modo simulado, com todos os estados da seção 2 navegáveis.
2. O `olhar-bee-client.js` isolado, com as funções `start`, `answer`, `report` e `contact`, que devolvem o JSON do contrato.
3. Um `INTEGRACAO-OLHAR-BEE.md` curto, com:
   - a plataforma e o domínio exato da LP. Esse domínio vai para a lista de origens permitidas do servidor, então preciso dele com e sem `www`;
   - onde fica o `window.OLHAR_BEE_CONFIG` e como trocá-lo;
   - onde fica o link de privacidade;
   - qualquer ponto do contrato que tenha sido difícil de seguir, ou que você sugira mudar.
4. Um teste manual feito:
   - percorra todos os estados no celular (360px) e no desktop;
   - confira que nenhum texto vindo da "API" é inserido como HTML: teste um desafio com `<b>oi</b>` e veja que aparece literal.
