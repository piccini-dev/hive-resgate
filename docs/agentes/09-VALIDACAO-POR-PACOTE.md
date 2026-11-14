# 09 · Validação por pacote

Objetivo: encontrar falhas dos fluxos alterados antes da regressão completa, reduzindo rodadas longas repetidas. Este protocolo complementa as regras de testes; não substitui a regressão completa e não garante ausência de falhas.

## Sequência de liberação

1. Fechar o escopo e os critérios de aceite em um documento do pacote. Conferir as telas, contratos e seletores afetados. Juntar correções relacionadas no mesmo commit.
2. Executar build e testes puros. Preparação administrativa e E2E continuam exclusivos do GitHub; usar o preflight existente, sem procurar outra chave quando houver bloqueio de acesso.
3. Executar os specs afetados no GitHub. Se houver uma falha, classificar pelo erro real: aplicação, sincronização do teste ou infraestrutura. Um timeout sozinho não prova que a causa seja a rede.
4. Para cenários novos/alterados com canvas, carregamento, operações assíncronas, recuperação de erro ou falha recorrente, executar três repetições consecutivas do cenário específico no mesmo commit. Usar `--repeat-each=3`, um worker e retries zero. As três precisam passar: não são três chances para aceitar um único sucesso.
5. Congelar o commit quando os specs afetados e a verificação de estabilidade estiverem verdes. Iniciar a regressão completa, com Specs vazio, apenas uma vez. Registrar no PR o commit, os resultados e os links; aguardar fora da conversa.
6. Retomar conferindo o resultado do mesmo commit e a base atual. Só integrar com a regressão completa verde e confirmar o deploy exato. Nova mudança em código/testes exige nova validação; não reaproveitar resultado de outra cabeça.

## Exemplo de verificação curta

No workflow existente “Regressão completa”, selecionar a branch do pacote e preencher Specs com:

```text
e2e/f32-aprovacao-contas-agenda.spec.ts --grep=Aprovar.e.seguir --repeat-each=3
```

Os pontos no filtro representam espaços. O argumento não precisa de aspas nem contém espaços internos; isso funciona com a expansão do campo Specs no workflow existente. Os testes de preparação também podem aparecer na contagem; registrar a contagem real e as três execuções do cenário selecionado. Não repetir toda a suíte três vezes. Não rodar esse comando localmente.

Depois da verificação curta e dos specs afetados, Specs vazio continua sendo a única execução completa de liberação. Não modificar workflows, segredos, dependências ou `scripts/regressao.mjs` para aplicar este protocolo.

## Tratamento das falhas

| Evidência | Ação |
| --- | --- |
| Comportamento incorreto da aplicação | Corrigir o produto e conservar as verificações. |
| Elemento coberto, carregamento ou estado assíncrono | Esperar um estado observável e verificar a recuperação real. Evitar sleep fixo, clique forçado ou aumento arbitrário de prazo. Guardar diagnóstico pequeno: ação, estado do botão, canvas pronto e elemento que recebe o clique. |
| HTTP 401, 502 ou falha de transporte isolada | Registrar separadamente e revalidar o spec afetado, sem alterar credenciais. Se persistir, tratar o acesso/serviço antes de iniciar a suíte completa. |
| Supabase HTTP 403 | Parar e informar o responsável. Não trocar chave, permissão, rota ou identidade. |
| Falha que reaparece após passar isoladamente | Investigar a causa e repetir o cenário três vezes antes de liberar outra regressão completa. Uma passagem isolada não encerra o diagnóstico. |

Em hipótese alguma introduzir skip/only/retries, remover expectativas, ignorar falhas na contagem ou publicar com a suíte completa vermelha. Manter o usuário de teste isolado e uma única execução por vez; nunca editar `src/` enquanto houver regressão ativa.

## Registro no PR

- Commit e base exatos.
- Build e testes puros.
- Specs afetados e resultado.
- Cenários repetidos, quantidade e resultado de todas as repetições.
- Falha identificada, correção e limite do diagnóstico, quando houver.
- Execução completa e estado real: pendente, em execução, falhou ou aprovada.
- Próximo passo concreto para retomar sem precisar manter o chat aberto.
