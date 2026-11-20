# M01 — Validação integrada de marcas (#108)

**Registro inicial:** 18/11/2026. **Estado: PARCIAL, não validado.** Este documento não é atestado de regressão verde nem autorização de merge.

## 1. Escopo e base

- Repo: `piccini-dev/hive-resgate`; branch do bloco `marcos/01-marcas-contexto`.
- Base `main` observada: `1ba8cfbc207b27bb1281db0953fc4244e8a67e4e` (permanece a base prevista ao iniciar a #108).
- Primeiro commit de testes integrados da #108: `7ad4a17e20924a019edd1367e27d171cd99758ea`. **SHAs e links da validação precisam ser atualizados no PR após concluir os commits**; nenhuma evidência de um SHA anterior valida um SHA posterior.
- Issues #102–#107 fechadas como entregas; auditoria #102: **APTO_PARA_M01 com ressalvas**. Entrega de código não significa aceite de testes.
- `src/` não pode ser modificado pela #108; falhas de implementação exigem devolver a issue responsável, não ampliar o escopo.
- Novos cenários adicionados aos specs permitidos: cadastro/edição persistidos via REST real em workspace `e2e-*`, recusa real de arquivamento PT409 com campanha vinculada, arquivamento/restauração real preservando ID em 375px; outro tenant com JWT próprio não lê, edita ou arquiva marca do usuário E2E.
- `e2e/f34-marcas-contexto.spec.ts`: **26 testes escritos** (inclui mocks de falhas, atraso, navegação e os casos reais). `e2e/f19-isolamento.spec.ts`: **4 testes escritos**; `e2e/f17-minha-identidade.spec.ts`: preservado. `e2e/unit-identity-context.spec.ts`: **19 testes escritos**, sem alteração nesta issue.

## 2. Proteção de dados e riscos

- Fixture de marca: `seedIdentityBrand`, criando workspace `e2e-*` do usuário `e2eUser`. Outro tenant usa `createTenant` e JWT autenticado nas tentativas; SQL administrativo apenas prepara/lê e limpa registros **identificados e criados pelos testes**.
- Os testes integrados novos não são executados nesta conversa nem usam conta Bee real. Toda limpeza nova aponta para workspace IDs capturados no teste, com cláusulas de confirmação de escopo.
- **Ressalva de segurança de #102:** RLS de `brands` permite DML a todo membro do workspace, inclusive `viewer`, sem impor papel/coluna. A UI M01 esconde mutações para quem não é owner/editor, porém isso **não é segurança de backend**. A validação de outro tenant confirma só a barreira entre workspaces distintos; não comprova bloqueio de viewer do mesmo workspace. Uma exigência de segurança por papel/coluna exigirá issue própria de backend. Sem autorização para migrar políticas nesta #108.
- A guarda PT409 só vale para campanhas/peças vinculadas por `profile_id`, conforme a migration existente; não alegar cobertura universal.
- Nenhum teste pode usar rede social ou conta de produtor real, publicar, rodar fora do workflow dedicado, alterar migration/Edge Function/workflow, nem registrar tokens, vídeos ou IDs privados no PR.

## 3. Estado real dos portões

| Portão | Estado em 18/11/2026 | Evidência exigida |
| --- | --- | --- |
| Auditoria de contrato de banco | APTO_PARA_M01 **com ressalvas** | `M01-AUDITORIA-BANCO.md` (#102) |
| Revisão estática do diff/arquivos | Concluída durante preparação | Comparação branch contra main; três arquivos apenas na #108 |
| Build `npm run build` | **NÃO VERIFICADO** | CI do PR, mesmo HEAD final |
| Unitários `npx playwright test -c playwright.unit.config.ts` | **NÃO VERIFICADO** | CI do PR, mesmo HEAD final |
| Specs afetados f34, f17, f19 | **NÃO EXECUTADOS** | URL GitHub Actions, SHA, contagem, aprovação |
| 3 repetições de cenários assíncronos/recuperação | **NÃO EXECUTADAS** | Link de cada execução e todas as 3 passagens |
| Regressão completa, Specs vazio | **NÃO EXECUTADA** | Link da execução e N/N passed no SHA final |
| Compatibilidade com a main | HEAD da main revalidado na abertura | Comparar de novo antes do aceite; se mudou, repetir validação no commit integrado |
| Inspeção visual em desktop e 375px | **NÃO EXECUTADA** | Check do E2E real + inspeção segura com usuário de teste |
| Merge, deploy ou publicação | **NÃO REALIZADOS** | Proibidos nesta issue |

## 4. Execução sequencial autorizada no GitHub

Abrir **Actions → Regressão completa → Run workflow**. Selecionar a branch **`marcos/01-marcas-contexto`** e preencher **Specs** com os valores abaixo, **um disparo de cada vez**, aguardando o resultado anterior antes do próximo. Antes de cada disparo verificar se não existe regressão `queued`/`in_progress`, congelar o HEAD e anotar SHA + link + resultado.

**4.1 Specs afetados (primeira execução):**

```text
e2e/f34-marcas-contexto.spec.ts e2e/f17-minha-identidade.spec.ts e2e/f19-isolamento.spec.ts
```

**4.2 Estabilidade (somente depois de tudo acima verde):** para cada comando abaixo, um disparo separado. O `--repeat-each=3` é encaminhado pelo `scripts/regressao.mjs` ao Playwright; workers=1 e retries=0 já estão no projeto.

```text
e2e/f34-marcas-contexto.spec.ts --grep=atrasada --repeat-each=3
e2e/f34-marcas-contexto.spec.ts --grep=erro.de.cadastro --repeat-each=3
e2e/f34-marcas-contexto.spec.ts --grep=dois.envios --repeat-each=3
e2e/f34-marcas-contexto.spec.ts --grep=falha.de.leitura --repeat-each=3
e2e/f34-marcas-contexto.spec.ts --grep=troca.cancelada --repeat-each=3
```

**4.3 Suíte completa:** por último, disparar com campo **Specs vazio** no mesmo SHA. Não trocar arquivos enquanto uma suíte estiver ativa. Sem skip/only, retries ou reinterpretação de falha como sucesso.

**4.4 Se algo falhar:** guardar no comentário da #108 o link, teste, SHA e erro sem segredos. Falha de `src/` volta à issue de implementação responsável; mudança invalida evidências do SHA anterior. Se não houver acesso para disparar Actions, registrar o bloqueio e deixar a #108 aberta. O PR fica aberto **sem merge**, mesmo com CI verde, até a regressão completa.

## 5. Registro de retomada

- GitHub Actions `regressao.yml` é **workflow_dispatch**; abrir PR **não** inicia essa regressão, apenas o CI de build/unitários.
- Na consulta da abertura da #108, não havia regressão `in_progress`; havia duas execuções `ci` `queued` em outra branch. Isso não constitui validação do M01.
- Não há acesso por esta integração ao acionamento de `workflow_dispatch`. Resultado de regressão, observação visual e build não podem ser presumidos.
- **Próximo passo:** conferir CI do PR no HEAD final; executar manualmente as entradas de 4.1, 4.2 e 4.3; preencher links/SHA/resultados e reavaliar aceite, sem fechar a #108 antecipadamente.
