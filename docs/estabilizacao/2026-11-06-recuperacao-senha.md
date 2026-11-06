# Alterar e recuperar a senha da Hive

Pedido de Marcos em 06/11/2026: escolher uma nova senha privadamente, mantendo sua conta atual. O trabalho do perfil do Raul fica separado.

## O que muda para quem usa

1. O login passa a mostrar **Esqueci minha senha**.
2. `/recuperar-senha` permite solicitar um email para o endereço cadastrado. A mensagem de confirmação é igual para endereços cadastrados e não cadastrados.
3. O email direciona a `/alterar-senha`, onde o usuário escolhe e confirma a senha. A solicitação e a abertura do email precisam ocorrer no mesmo navegador (PKCE).
4. Quem já está conectado pode abrir **Configurações → Perfil → Alterar minha senha**, sem depender de email.
5. A tela mostra o email da conta autenticada antes de salvar. Não cria outro usuário nem altera nome, perfil, permissões ou conteúdos.
6. Senhas diferentes, acesso expirado, conta alterada em outra aba e erro do servidor impedem a confirmação de sucesso.
7. A confirmação de alteração só aparece depois de o Supabase aceitar a gravação. Os campos de senha são então limpos.
8. O link funciona antes do onboarding e do carregamento de perfil/configurações. Não depende da chave de IA estar configurada.
9. Códigos e tokens são retirados da URL. Links de recuperação PKCE e links administrativos do tipo `recovery` são tratados somente nesta rota.
10. A aplicação usa somente a chave pública de Auth. Senhas novas são digitadas pelo usuário e enviadas diretamente ao Supabase, sem passar pelo chat, pelo repositório ou por uma Edge Function.

## Implantação e dependências

- Base do trabalho: `main` em `3f2f274db65b0d05e6bd3a35cea75c89d3cb97ca`.
- Sem migration, nova dependência, alteração de RLS ou deploy de Edge Function.
- O app será publicado somente após a regressão completa no GitHub. Build/unitários do PR não substituem essa execução.
- A configuração Auth foi lida em 06/11: `site_url=http://localhost:5173`, `uri_allow_list=http://localhost:5173/**`. **Ainda não foi alterada por este pacote.**
- Depois da publicação, adicionar exatamente `https://hive-bee-81td.netlify.app/alterar-senha` à lista de redirecionamentos, preservando os destinos existentes. Não é necessário mudar o endereço padrão de outros fluxos.
- Não há SMTP próprio configurado. O provedor padrão do Supabase limita destinatários; a entrega de email para a conta real ainda precisa ser validada. Não declarar email entregue apenas pela resposta da API. A troca com sessão já autenticada funciona sem envio de email.

## Evidências e pendências

- Build local (TypeScript + Vite): aprovado; repetir se o código mudar após este registro.
- Unitários puros: 16/16 aprovados localmente (2,8 s).
- F28: dez cenários de navegador escritos, ainda não executados. Todas as chamadas de Auth são simuladas; não enviam email nem alteram senhas reais. Não fazem escrita no banco.
- Descoberta do spec F28 aprovada (`--list`): dez cenários mais o setup existente; listar não executa os testes.
- Regressão completa no GitHub: pendente. A execução manual precisa selecionar a branch `feat/recuperacao-senha` e deixar o campo de specs vazio para a suíte completa.
- A conexão nativa disponível permite abrir o PR e consultar execuções, mas não expõe o disparo de `workflow_dispatch`. O início manual no GitHub ainda é necessário.
- Não foi gerado nem consumido um link de autenticação da conta real; nenhuma senha foi alterada por este trabalho.

## Reversão

Reverter o commit deste pacote desativa os novos caminhos. A adição do destino à lista de Auth pode ser removida separadamente, preservando todos os demais. Não há dados para desfazer.
