---
name: Micro-tarefa
about: Tarefa de 15 a 30 minutos para agente
---
<!-- orquestra:v1 — modelo do corpo de uma micro-tarefa. O orquestrador preenche cada seção; nada fica genérico. -->
## Objetivo
<Uma frase com o resultado verificável. Ex.: "Criar a função `normalizarTelefone` que converte qualquer formato brasileiro para E.164.">

## Contexto
- Bloco: <NN — nome> · branch `bloco/NN-nome`
- Por que existe: <uma ou duas linhas ligando ao plano>
- Leia antes: `<caminho>` (<o que procurar ali>), `docs/plano/PLANO.md#<seção>`

## Depende de
- <#N — título curto> (ou "Nenhuma")

## Escopo de arquivos
- Criar: `<caminho>`
- Alterar: `<caminho>` (<o que muda>)
- Não tocar: qualquer outro arquivo

## Especificação
<Contrato exato: assinaturas com tipos, nomes, formatos, comportamento, erros esperados.>

| Entrada | Saída esperada |
| --- | --- |
| `<exemplo>` | `<resultado>` |

## Passos (marque cada um ao concluir, com um commit por passo)
- [ ] P1 <ação concreta>
- [ ] P2 <ação concreta>
- [ ] P3 Escrever os testes de "Testes obrigatórios"

## Testes obrigatórios
- Arquivo: `<caminho do teste>`
- Casos: <lista de casos, incluindo erro e borda>

## Validação
- Comando: `<comando de teste/lint>` (o agente não roda nem espera CI)
- O orquestrador roda os testes na máquina no fim do bloco e corrige o que falhar.

## Critérios de aceite
- [ ] <critério verificável>
- [ ] <critério verificável>

## Checklist do agente (preencher ao final; só marque o que for verdade)
- [ ] Li o AGENTS.md, a issue, os comentários e os arquivos de "Leia antes"
- [ ] Conferi que as dependências estavam fechadas
- [ ] Alterei só os arquivos do escopo
- [ ] Não inventei funções, bibliotecas ou variáveis; nenhuma dependência nova não prevista
- [ ] Um commit por passo, na branch do bloco, e cada passo marcado aqui
- [ ] Testes escritos para todos os casos listados
- [ ] Relatório final comentado nesta issue

## Fora do escopo
- <o que parece relacionado mas não é para fazer agora>

## Se travar
Comente a dúvida nesta issue no formato `⏸ Parou em`, explicando o que falta, e pare. Não chute.
