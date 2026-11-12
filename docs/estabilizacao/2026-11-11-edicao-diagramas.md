# Diagramas e edição direta da arte

## Escopo desta publicação

O Marcos pediu para suspender o novo recurso “Ajustar com a Hive”. O trabalho de IA está preservado em `backlog/ajuste-visual-ia` (commit `f1b1b35460bb942eddbf51ebab89b2b69f1b6e54`). Não integra esta publicação: não há endpoint novo, pedido visual à IA, nova chave ou novo envio ao Gemini.

## Ajustes para o produtor

1. O diagrama padrão de camadas M03-B liga cada rótulo ao círculo correto, com os pontos iniciais calculados na circunferência.
2. A ligação de Essência parte do núcleo.
3. Trajetos ortogonais substituem as ligações diagonais aproximadas. A organização geométrica evita que os rótulos fiquem sobre os círculos.
4. As quatro camadas, rótulos, descrições e ligações recebem identidades persistidas, permitindo acompanhar os elementos quando movidos.
5. Na revisão da página, “Organizar diagrama” oferece uma correção local para o M03-B. Não chama IA e não consome tokens.
6. A organização reconhece também a composição antiga, com cinco círculos, quatro ligações e quatro pares de textos. Não altera automaticamente artes existentes.
7. Desenhos ambíguos ou sem espaço suficiente são recusados com orientação. Não se adivinham relações.
8. O usuário compara a imagem atual e a proposta antes de aplicar. “Descartar proposta” mantém a página original e o rascunho manual do editor.
9. A imagem atual da comparação considera também as alterações manuais ainda não salvas.
10. Textos, fotografias, assinatura, legenda e demais páginas são preservados pela organização.
11. A aplicação usa o contrato existente `piece_candidates`/`apply_unit_candidate`, com versão esperada e nova revisão obrigatória. Não escreve em paralelo nas projeções do post.
12. A imagem salva recebe URL imutável; o endereço da imagem anterior não é reutilizado.
13. Linhas abertas têm controles nas pontas, em vez de depender somente da caixa retangular genérica.
14. Caminhos curvos mantêm também os controles da curva.
15. Linhas Fabric legadas são convertidas em caminhos equivalentes no editor de sequências. Novas linhas e separadores seguem o mesmo modelo.
16. Tamanho das alças e tolerância do mouse acompanham o zoom. O bitmap de detecção por pixel é recalibrado junto para permitir clicar nas formas e linhas.
17. Pontas próximas dos círculos/rótulos podem encaixar. Ligações semânticas acompanham os elementos correspondentes quando movidos individualmente.
18. Mover uma ligação manualmente preserva esse ajuste. “Organizar diagrama”, acionado explicitamente, restaura o trajeto geométrico padrão.
19. A seleção ganha uma barra com alinhamento, distribuição horizontal/vertical, agrupamento, desagrupamento e exclusão.
20. Um elemento é alinhado à página; vários são alinhados aos limites da seleção. Distribuição aparece a partir de três elementos.
21. A barra reserva altura fixa para não deslocar a arte no momento do clique. Em telas menores, os controles podem ser percorridos horizontalmente.
22. Agrupar, desagrupar e alinhar entram no histórico como uma operação. Textos com destaques mantêm seus estilos dentro dos grupos ao salvar/desfazer.
23. Camadas passam a mostrar nomes como “Ligação 1”, “Rótulo 1”, “Camada 1” e “Núcleo”.
24. A edição continua com duplo clique no texto e Alt + clique para alcançar camadas sobrepostas. As dimensões da página permanecem fixas.
25. A arte não recebe cliques durante a preparação ou o salvamento da proposta.
26. Páginas agendadas, publicadas ou arquivadas exigem o fluxo específico de revisão. Não há mudança no agendamento, nas contas ou na publicação social.
27. Variações de receita com outra quantidade de camadas mantêm o compositor anterior. O reparo automático cobre a estrutura padrão de quatro camadas.

28. O editor ocupa o espaço restante da janela, mantendo a arte inteira acessível em vez de exceder a altura do modal.
29. O campo invisível de digitação usa coordenadas locais com o zoom aplicado, evitando rolagem indevida durante a edição do texto.

## Limites

Não é uma reprodução completa do Canva. A organização automática reconhece M03-B; outros desenhos mantêm a edição direta dos elementos. Setas com ponta desenhada como objeto independente continuam com componentes selecionáveis separadamente. Grupos/desenhos transformados podem exigir ajuste manual; o acompanhamento semântico contempla os elementos individuais do diagrama.

## Validação e publicação

- Testes puros: geometria das ligações, núcleo, preservação/imutabilidade, desenhos ambíguos, atualização seletiva e restauração explícita de ligação manual.
- F29 no GitHub: agrupar/desagrupar/desfazer/refazer, prévia sem aplicação, descarte, aplicação em uma página, arraste de ponta com mouse real e preservação de outra página/legenda. Confere a ausência de botão/chamada do novo recurso de IA.
- O teste existente de seleção e edição direta de texto/formas continua obrigatório. Seu arraste fica distante das guias de snap no novo zoom, mantendo a mesma precisão esperada.
- Só usuário E2E isolado e arte sintética. Não publicar em rede social nem alterar conteúdos reais para testar.
- Resultado final, execução completa, commit testado e deploy serão registrados no PR. Até esse registro, publicação pendente.

## Operação

Somente frontend, testes e documentação. Não há migration, Edge Function, alteração de segredo ou dependência do Raul. Após regressão completa verde no GitHub, integrar o PR e conferir o deploy automático do Netlify.
