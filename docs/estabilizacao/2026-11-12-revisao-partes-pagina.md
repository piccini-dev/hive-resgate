# Revisão de partes de uma página — 12/11/2026

Pedido do Marcos: selecionar elementos, separar texto principal aprovado dos textos
ligados ao diagrama, oferecer outras representações e poder refazer uma página.

## Comportamento

- Editor com edição na arte, texto principal, revisão do diagrama e ação separada
  “Refazer esta página”. Os controles de escopo aparecem apenas na revisão da parte.
- A seleção do Fabric é capturada por caminhos de objetos, incluindo grupos. Pode
  ser revista pela lista. Seleções contendo texto principal, assinatura ou fotografia
  são recusadas na revisão parcial.
- Revisão do diagrama permite mudar seus rótulos e explicações. Não escreve nos
  campos canônicos de título/corpo. Arte atual com texto principal ainda não salvo
  pede salvamento explícito antes da proposta parcial.
- Representações locais: manter o diagrama, texto, blocos ou etapas. A mudança de
  representação exige escopo “Diagrama completo”; grupos mistos são recusados.
- Alternativas preservam título, assinatura, fotografias e objetos fora do diagrama.
  Textos que não cabem são recusados, sem truncamento nem redução abaixo de 22 px.
- “Refazer esta página” combina opcionalmente título/corpo com o modelo escolhido
  em um único candidato, preservando IDs, outras páginas, legenda e aprovação alheia.
- Comparação, descarte, aplicação, histórico e versão esperada continuam no contrato
  `piece_candidates` / `apply_unit_candidate`. A proposta parcial só autoriza `visual`;
  o banco também exige a preservação do título/corpo e da imagem de referência.

## Limites e validação

- Nenhuma nova Edge Function, migration, dependência ou mudança de workflow.
- IA visual segue adiada. As alternativas desta revisão são composições locais;
  pedidos à Hive para o texto principal e troca de modelo usam os fluxos existentes.
- Reconhecimento automático do diagrama usa os nomes semânticos existentes ou a
  família M03. Em arte de outra família, a seleção explícita permite revisar textos;
  a composição continua disponível pela edição direta ou pela ação de refazer.
- Testes puros em `unit-visual-adjust`: preservação, escopo selecionado, grupos,
  proteção do título/assinatura/fotos, alternativas e excesso de conteúdo.
- F29 cobre seleção real com mouse, edição do rótulo, descarte sem alteração,
  alternativas sem IA visual, aplicação preservando as demais páginas e legenda,
  e substituição conjunta de título e composição de uma única página.
- Build local aprovado. Resultados remotos devem ser registrados no PR após execução.
