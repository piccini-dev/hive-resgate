# Ajuste visual assistido e conexões editáveis

## Resultado esperado para o produtor

Na revisão de uma página, “Editar na arte” permite corrigir a diagramação com o mouse ou pedir ajuda à Hive. A proposta é mostrada antes de substituir a página. Não é necessário refazer o carrossel.

## Ajustes deste pacote

1. O diagrama de camadas M03-B passa a posicionar cada ligação na circunferência correta, com trajetos ortogonais e rótulos fora dos círculos.
2. A ligação de Essência parte do núcleo. O ponto inicial deixa de ser uma coordenada aproximada fora do anel.
3. Círculos, rótulos, descrições e conexões têm identidades persistidas no Fabric; não dependem da posição na lista de camadas.
4. “Organizar diagrama” reconhece também a estrutura M03-B anterior: cinco círculos, quatro ligações e quatro pares de textos. Desenhos ambíguos são recusados com orientação.
5. A organização preserva palavras, círculos, fotografias, assinatura, outras páginas e legenda. Não roda automaticamente sobre peças existentes.
6. “Ajustar com a Hive” recebe um pedido de aparência, como alinhar rótulos, ajustar espaçamento ou cores. Usa a IA existente do usuário; não precisa de uma nova chave no navegador.
7. O usuário pode limitar o pedido à seleção atual ou usar a página inteira.
8. A IA recebe somente a estrutura editável da página em revisão: tipos, nomes, textos e geometria. Não recebe URLs das fotografias, acervo, dados de outros clientes ou outras páginas.
9. A resposta é um plano de operações permitidas, nunca código executável, HTML, URLs ou um Fabric arbitrário.
10. O servidor e o navegador validam o plano. Reescrever palavras, apagar/criar objetos e trocar imagens não fazem parte deste recurso visual.
11. Propostas fora da seleção, coordenadas inválidas, operações desconhecidas ou distribuição sem espaço são recusadas.
12. Pedidos que exigem mudar palavras são direcionados à edição de texto. A Hive pode explicar que não consegue realizar um pedido dentro do escopo escolhido.
13. O usuário compara a imagem atual com a proposta e escolhe “Aplicar nesta página” ou “Descartar proposta”.
14. A prévia atual considera edições manuais ainda não salvas. Descartar a proposta mantém esse rascunho no editor.
15. A aplicação usa `piece_candidates` e `apply_unit_candidate`, com versão esperada e invalidação da aprovação. Não há gravação paralela nas projeções do post.
16. Cada imagem resultante tem um endereço imutável. A aplicação não reutiliza o endereço da imagem anterior.
17. Linhas abertas deixam de usar somente a caixa retangular genérica: há alças nas duas pontas. Caminhos curvos mantêm também os controles da curva.
18. Linhas Fabric legadas são convertidas para caminhos equivalentes ao abrir o editor da sequência. Novas linhas e separadores usam o mesmo modelo.
19. As alças e a tolerância do mouse acompanham o zoom da tela.
20. Pontas próximas dos círculos ou rótulos podem encaixar. Conexões semânticas do diagrama acompanham seu círculo ou rótulo quando movidos.
21. Ao deslocar uma ligação manualmente, ela deixa de ser reposicionada automaticamente. A organização explícita do diagrama pode restaurar o trajeto.
22. A seleção mostra uma barra contextual com alinhamento, espaçamento horizontal/vertical, agrupamento, desagrupamento e exclusão.
23. Alinhamento de um único elemento usa a página; vários elementos usam os limites da seleção. Distribuição aparece a partir de três elementos.
24. Agrupamento e alinhamento entram no histórico como uma operação, com desfazer/refazer.
25. A lista de camadas apresenta nomes como “Ligação 1”, “Rótulo 1”, “Camada 1” e “Núcleo”.
26. O modo de revisão continua com dimensões fixas, seleção de camadas com mouse/Alt e edição de texto por duplo clique.
27. A função nova exige JWT, confere dono do post e da página, versão, estado e limite de requisições antes de chamar a IA. Não modifica o post.
28. Post agendado, publicado ou arquivado não aceita esta proposta. A revisão específica continua obrigatória.
29. Não há migration, alteração no agendamento, publicação social, campanha ou conteúdos-base.

## Limites e continuidade

O editor continua sendo o Canvas Studio da Hive. Não é uma reprodução completa do Canva. A organização automática do diagrama reconhece M03-B; outros desenhos podem receber ajustes de posições/cores/escala permitidos, sujeitos à prévia. Setas com ponta desenhada como objeto independente continuam com componentes selecionáveis individualmente. Grupos e desenhos transformados podem exigir ajuste manual; não se adivinham relações entre elementos sem vínculo.

## Validação

- Build e TypeScript da aplicação; verificação estática do spec alterado.
- Testes puros: geometria das circunferências, núcleo, escopo, preservação de texto/foto, operações proibidas, imutabilidade e conexões manuais.
- F29 no GitHub: diagrama legado, prévia sem gravação, descarte, aplicação de uma página e arraste da ponta de uma ligação com mouse real. Mantém o teste existente de seleção de formas/textos na arte.
- Endpoint real: material inexistente, versão divergente e escopo inválido recusados antes da IA.
- Resposta da IA simulada no E2E, como no restante da suíte. Nenhum conteúdo real usado; nenhuma publicação social.
- Regressão completa e publicação: registrar evidências no PR após execução. Até lá, pendentes.

## Operação

Deploy aditivo de `sequence-visual-adjust`, JWT obrigatório, com dependências `security.ts`, `gemini.ts` e `visual-adjust.ts`. Não substitui `sequence-script` nem exige mudança de segredo. Só depois da regressão aprovada, integrar o app e conferir o deploy do Netlify.
