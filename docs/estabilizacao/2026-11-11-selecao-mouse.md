# Seleção direta das camadas na revisão de sequências

## Problema e resultado esperado

A revisão permitia alterar textos pelo painel lateral, mas os compositores deixavam formas, diagramas e algumas imagens com `selectable: false`. A cópia editável liberava somente textos e excluía assinatura, numeração e indicação de continuidade. O produtor deve selecionar e mover os elementos diretamente na arte, inclusive nas capas de diagrama, e editar textos com dois cliques.

## Ajustes deste pacote

1. A cópia editável libera seleção e eventos em todas as camadas: texto, foto, espiral, círculo, forma, linha, assinatura, numeração e continuidade.
2. Textos continuam sendo objetos editáveis; a arte não é achatada em imagem.
3. Formas vazadas e imagens usam a área pintada para seleção; suas caixas transparentes não encobrem outros elementos.
4. Grupos permitem alcançar seus elementos internos.
5. Alt + clique percorre as camadas sob o ponteiro, sem alterar a ordem visual dos objetos. Clique normal mantém a seleção da camada superior visível.
6. A seleção por mouse e a lista lateral mostram o mesmo painel de propriedades. A lista continua disponível como alternativa.
7. O campo de teclado do Fabric permanece dentro do editor, permitindo dois cliques e digitação dentro de um modal com controle de foco.
8. Escape durante a digitação sai da edição do texto sem fechar a janela de ajuste da página.
9. A orientação na tela explica clique, arraste, dois cliques e Alt + clique.
10. Posição X e Y têm nomes acessíveis; o teste pode verificar o deslocamento feito pelo mouse.
11. A seleção por camadas sobrepostas é habilitada no modo de revisão de sequências; os bloqueios do catálogo de templates não são alterados globalmente.
12. A abertura trabalha sobre uma cópia do JSON. Nenhum conteúdo real, compositor ou template cadastrado é regravado pela implantação.
13. O salvamento mantém o contrato existente: somente a página alterada, texto principal coerente com a arte, nova imagem e revisão invalidada quando necessário; outras páginas e legenda preservadas.

## Verificação

- Teste puro: formas, imagens e objetos dentro de grupos liberados sem mutar a origem; assinatura editável sem entrar no texto canônico.
- F29: clique real no título do canvas em escala, dois cliques e digitação, Escape, arraste de uma linha de template antes travada, seleção de formas sobrepostas com Alt, salvamento e posição persistida. As verificações anteriores de legenda, aprovação e preservação das outras páginas permanecem.
- Build local e testes puros; E2E e regressão completa somente no GitHub. Evidências finais registradas no PR.

Sem migration, Edge Function, dependência ou alteração em publicação/agendamento. Nenhuma ação real em redes sociais é usada para validar.
