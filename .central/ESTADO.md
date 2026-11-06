# Estado — bee-platform

- Status: ativo · **operação resgate**
- Prioridade: alta
- Atualizado: 2026-11-05

## Objetivo
Devolver ao Marcos uma Hive que ele entende e usa: menos telas, um caminho por tarefa e fluxos curtos. A queixa dele é de fluxo confuso, longo e sem nexo, não de erro técnico.

## Agora
- O trabalho é no repositório privado `raulmf12/hive-resgate` (`origin`). O `bee-platform` (produção) é o remoto `producao`, com o push desligado.
- **Blocos 01, 01b e 02 integrados.** A `main` (`ecf30b4`, PR #17) já está sem o código morto do bloco 02 (−1372 linhas: Linhas editoriais, M01/M02, cadeado, kanban no login, `almaApi`, 15 métodos sem uso).
  - Regressão completa 202/202 em 05/11. Nada publicado no banco nem nas funções.
- **Bloco atual: 03 · Menu novo** (branch `bloco/03-menu-novo`, milestone 4). São 6 issues `exec:gpt`, #18–#23:
  - prontas: #18 (abas Voz Bee e Branding), #19 (Onboarding só com a chave), #20 (telas Simular público e Teste de imagem), #22 (menu nos grupos novos);
  - em cadeia: #21 (cliente do Simular público) depois da #20; #23 (Convite no Criar) depois da #22.
- Conta principal da Hive: login `piccini@beeconsulting.com`, nome "Marcos Piccini" (DECISOES de 04/11).
- Painel: https://claude.ai/artifact/83PGHGYEKxe8wbgLn5Rr9k (02 integrado, 03 aberto com os prompts).
- Relatório preliminar para o Marcos: https://claude.ai/artifact/EbE9cZXaJyQoEc1UCifNd7

## Próximos passos
1. Colar no ChatGPT os prompts das #18, #19, #20 e #22 (painel); depois #21 e #23.
2. Quando o painel mostrar "Pronto para /integrar": `/integrar` do bloco 03 (build, regressão, PR e merge) e criar as issues do bloco 04 (Ensinar a Hive).
3. Entrar uma vez com o login novo para confirmar e passar a senha ao Marcos.
4. O Raul mostra o relatório ao Marcos e traz as respostas (Pipeline, vídeo, IA distribui, Feedback, wizard).

## Bloqueios / aguardando
- Respostas do Marcos às perguntas do relatório: elas confirmam os cortes dos blocos 06 e 07. O Simular público já sai no 03, por decisão do Raul.
- `npm run lint` quebrado desde antes do bloco 01 (sem `eslint.config.js`).
- A máquina fica sem memória durante a regressão (Bambu Studio, ChatGPT e Chrome abertos): fechar o que der antes do próximo `/integrar`.

## Última sessão
2026-11-05: bloco 02 integrado (PR #17, regressão 202/202, nenhuma correção). Bloco 03 aberto com #18–#23, incluindo a remoção de Simular público e Teste de imagem. Modelo de imagem vencedor: nenhum (0 testes registrados).
