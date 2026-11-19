# #111 — Portão de segurança para permissões de Marcas (M01)

**Estado:** plano de testes, **não executado**. O Supabase Bee Consulting é compartilhado com produção. Não executar este roteiro nele; usar instância isolada com esquema compatível e contas de teste.

## Revisão de privilégios (19/11, SELECT de catálogo)
- `brands`: política atual `brands_member FOR ALL` autoriza qualquer membro; grants amplos para `authenticated` e `anon`.
- `set_brand_archived(uuid,boolean)`: atualmente `SECURITY INVOKER`, dono `postgres`, EXECUTE `authenticated`/`service_role`.
- `is_workspace_member(uuid)` e `is_brand_member(uuid)`: `SECURITY DEFINER`, dono `postgres`, ACL inclui `PUBLIC` e `anon` (existentes antes da #111). Não modificar essas funções nesta issue sem revisão própria.
- Migration proposta usa `SECURITY DEFINER` para `can_manage_workspace_brand` e `set_brand_archived`. Isso **bypassa RLS** nas consultas internas; as condições de autorização por `auth.uid()`, papel e workspace são, portanto, controles críticos. A documentação Supabase sinaliza como risco funções SECURITY DEFINER expostas a authenticated: https://supabase.com/docs/guides/observability/advisors?queryGroups=lint&lint=0029_authenticated_security_definer_function_executable

## Preparação
1. Criar ambiente **isolado**, com esquema/constraints/RLS/grants equivalentes, e usuários de teste A-owner, A-editor, A-viewer, B-owner (workspaces A e B). Não copiar registros reais.
2. Registrar snapshot de políticas, grants e definições de funções antes da migration; confirmar que rollback restaura esse snapshot.
3. Aplicar migration uma vez e novamente (idempotência). Validar catálogo de políticas, privilégios de tabela/coluna e EXECUTE. Revisar se `anon` tem privilégios residuais que permitam UPDATE/DELETE.
4. Rodar operações **pela mesma via REST/RPC e JWT de cada perfil** (não como `postgres`/service_role); testar SELECT, INSERT, PATCH e RPC. Conferir linha persistida, não apenas HTTP.
5. Reverter a migration no ambiente isolado e comparar o snapshot de políticas, grants e funções. Confirmar que a reversão **não** roda em produção automaticamente.

## Matriz de casos (todos pendentes)

| Identidade | Ação | Resultado esperado |
| --- | --- | --- |
| A-owner | SELECT marcas A | permitido |
| A-editor | SELECT marcas A | permitido |
| A-viewer | SELECT marcas A | permitido |
| B-owner | SELECT marcas A | negado/sem linhas |
| anon | SELECT marcas A | negado/sem linhas |
| A-owner / A-editor | INSERT marca A com slug válido | permitido |
| A-viewer / B-owner / anon | INSERT marca A | negado |
| A-owner / A-editor | PATCH `name` e `essence` de A | permitido |
| A-viewer / B-owner / anon | PATCH `name` ou `essence` de A | negado/0 linhas |
| A-owner / A-editor | PATCH `status`, `slug`, `workspace_id`, `is_default`, `metadata` | negado |
| Todos os perfis REST | DELETE marca A | negado |
| A-owner / A-editor | RPC arquivar/restaurar marca A sem vínculos impeditivos | permitido |
| A-viewer / B-owner / anon | RPC arquivar/restaurar marca A | negado (PT404 ou falta de EXECUTE) |
| A-owner | RPC arquivar marca A com campanha/peça impeditiva | PT409, status preservado |
| A-owner | RPC com marca inexistente | PT404 |
| A-owner / A-editor | RPC para marca B | PT404 |
| A-owner | RPC com `p_archived=false` | retorna status `active` |
| A-owner / A-editor | Fluxo `create_my_workspace` com conta nova | cria workspace + primeira marca sem regressão |

**Atenção:** INSERT tem `slug` e `workspace_id` obrigatórios; a migration não deve restringir INSERT ao ponto de quebrar criação da segunda marca. Para testar `PT409`, criar vínculos artificiais com perfis de teste, não usar campanhas reais.

## Portões para liberar
- [ ] Revisão do `SECURITY DEFINER` e privilégios por especialista ou evidência de testes isolados acima.
- [ ] Matriz completa de perfis/tenants verde, com evidências.
- [ ] Idempotência e rollback conferidos em instância isolada.
- [ ] Regressão completa no SHA final (não reutilizar 437/0 do SHA anterior).
- [ ] Autorização operacional para aplicar DDL no banco compartilhado, resolvendo a restrição de `AGENTS.md` §0 e contrato M01.
- [ ] Verificação do destino de publicação Netlify antes do merge.

**Nenhum desses itens está marcado como validado.**
