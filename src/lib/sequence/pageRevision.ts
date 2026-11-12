import { layoutText, measureText } from '../templates/layout';
import { nodeBox, type DiagramNode } from '../hive/diagramConnections';

export type ElementPath = number[];
export type PageRepresentation = 'diagram' | 'text' | 'blocks' | 'steps';
export interface PageElement { path: ElementPath; text?: string; label: string; protected: boolean; diagram: boolean }
type Art = { objects: DiagramNode[]; [key: string]: unknown };
const mainNames = new Set(['headline', 'unit-title', 'unit-body', 'bee-quote']);
const protectedNames = new Set([...mainNames, 'signature', 'bee-spiral', 'background', 'logo']);
const textTypes = new Set(['text', 'textbox', 'i-text']);
const key = (path: ElementPath) => path.join('.');

/** Caminhos vêm da ordem da arte capturada, inclusive dentro de grupos. */
export function pageElements(value: object, variant?: string): PageElement[] {
  const out: PageElement[] = [];
  function visit(objects: DiagramNode[], parent: number[], inherited: boolean, inDiagram: boolean) {
    objects.forEach((o, i) => {
      const path = [...parent, i], name = o.name ?? '', type = String(o.type).toLowerCase();
      const protectedElement = inherited || protectedNames.has(name) || (type === 'image' && name !== 'bee-spiral-center');
      const diagram = !protectedElement && (inDiagram || name.startsWith('diagram-') || name === 'bee-spiral-center' || !!variant?.startsWith('M03-'));
      out.push({ path, text: textTypes.has(type) ? String(o.text ?? '') : undefined,
        label: String(o.text ?? (name || (type === 'group' ? 'Grupo' : 'Elemento gráfico'))).replace(/\s+/g, ' ').slice(0, 80), protected: protectedElement, diagram });
      if (o.objects) visit(o.objects, path, protectedElement, diagram);
    });
  }
  visit((value as Art).objects ?? [], [], false, false);
  return out;
}

function at(art: Art, path: ElementPath): DiagramNode {
  let objects = art.objects, node: DiagramNode | undefined;
  for (const index of path) { node = objects?.[index]; if (!node) throw new Error('A seleção mudou. Selecione os elementos novamente.'); objects = node.objects ?? []; }
  if (!node) throw new Error('Selecione um elemento da arte.');
  return node;
}

/** Escopo fechado: texto principal, assinatura e fotografias nunca entram no diagrama. */
export function revisePagePart(value: object, req: {
  variant?: string; scope: 'selected' | 'diagram'; selected: ElementPath[];
  texts: Record<string, string>; representation: PageRepresentation; content: string; height: number;
}): object {
  const source = value as Art, copy = structuredClone(source), elements = pageElements(source, req.variant);
  const selected = new Set(req.selected.map(key));
  const targets = elements.filter(e => req.scope === 'diagram' ? e.diagram : selected.has(key(e.path)) || req.selected.some(p => key(e.path).startsWith(key(p) + '.')));
  if (!targets.length) throw new Error('Selecione os elementos que deseja revisar.');
  if (targets.some(e => e.protected)) throw new Error('O texto principal, a assinatura e as fotografias ficam preservados. Para alterá-los, use a edição na arte ou refaça esta página.');
  if (req.representation !== 'diagram' && req.scope !== 'diagram') throw new Error('Para mudar a representação, escolha o diagrama completo.');
  if (req.representation === 'diagram') {
    for (const e of targets) {
      const next = req.texts[key(e.path)];
      if (e.text === undefined || next === undefined || next === e.text) continue;
      if (!next.trim()) throw new Error('Preencha os textos do diagrama ou escolha outra representação.');
      const node = at(copy, e.path), fs = Number(node.fontSize) || 28;
      // Mantém a caixa atual. Texto que não cabe pede ajuste na arte, sem encolher sem limite.
      const height = Number(node.height) || fs * 1.13 * Math.max(1, e.text.split('\n').length);
      const maxLines = Math.max(1, Math.floor((height / (fs * 1.13) - 1) / (Number(node.lineHeight) || 1.2) + 1.05));
      const fit = layoutText(next, { textWidth: Number(node.width) || 300, maxLines, maxFontSize: fs, minFontSize: fs,
        fontFamily: String(node.fontFamily ?? 'Inter'), fontWeight: String(node.fontWeight ?? '400'), balance: false });
      if (fit.lines.length > maxLines || fit.lines.some(line => measureText(line, fs, String(node.fontFamily ?? 'Inter'), String(node.fontWeight ?? '400')) > (Number(node.width) || 300))) throw new Error('Um texto ficou maior que seu espaço. Encurte-o ou amplie o campo na arte.');
      node.text = fit.lines.join('\n'); node.styles = {};
    }
    return copy;
  }
  const content = req.content.trim();
  if (!content) throw new Error('Escreva o conteúdo que substituirá o diagrama.');
  // Não separa um grupo misto nem remove objetos fora do escopo por aproximação.
  const roots = source.objects.map((_, i) => i).filter(i => targets.some(e => e.path[0] === i));
  if (elements.some(e => roots.includes(e.path[0]) && !e.diagram)) throw new Error('O diagrama está agrupado com conteúdo preservado. Desagrupe na arte antes de mudar a representação.');
  const main = source.objects.filter(o => mainNames.has(o.name ?? ''));
  const footer = source.objects.filter(o => ['signature', 'bee-spiral'].includes(o.name ?? ''));
  const top = Math.max(req.height * .33, ...main.map(o => { const b = nodeBox(o); return b.top + b.height + 48; }));
  const bottom = Math.min(req.height * .84, ...footer.map(o => nodeBox(o).top - 40));
  const ink = String(main[0]?.fill ?? '#1C2E4A'), width = 908, left = 86;
  const parts = req.representation === 'text' ? [content] : content.split('\n').map(s => s.trim()).filter(Boolean);
  if (parts.length > 12 || bottom - top < 180) throw new Error('O conteúdo não cabe nessa área. Reduza os blocos ou ajuste a arte.');
  const cols = req.representation === 'blocks' ? 2 : 1, rows = Math.ceil(parts.length / cols), gap = 20;
  const cellW = (width - (cols - 1) * gap) / cols, cellH = (bottom - top - (rows - 1) * gap) / rows;
  const replacement: DiagramNode[] = [];
  parts.forEach((text, i) => {
    const x = left + (i % cols) * (cellW + gap), y = top + Math.floor(i / cols) * (cellH + gap);
    const inset = req.representation === 'blocks' ? 22 : 0;
    const numbered = req.representation === 'steps' ? `${i + 1}. ${text}` : text;
    let fitted: { lines: string[]; size: number } | undefined;
    for (let size = req.representation === 'text' ? 36 : 30; size >= 22; size--) {
      const maxLines = Math.max(1, Math.floor((cellH - inset * 2) / (size * 1.4)));
      const fit = layoutText(numbered, { textWidth: cellW - inset * 2, maxLines, maxFontSize: size, minFontSize: size, fontFamily: 'Inter', fontWeight: '400', balance: false });
      if (fit.lines.length <= maxLines && fit.lines.every(line => measureText(line, size, 'Inter', '400') <= cellW - inset * 2)) { fitted = { lines: fit.lines, size }; break; }
    }
    if (!fitted) throw new Error('O conteúdo não cabe com leitura confortável. Encurte o texto ou reduza o número de blocos.');
    if (req.representation === 'blocks') replacement.push({ type: 'Rect', name: `diagram-block-${i}`, left: x, top: y, width: cellW, height: cellH, fill: 'transparent', stroke: ink, strokeWidth: 1, rx: 12, ry: 12 });
    replacement.push({ type: 'Textbox', name: `diagram-content-${i}`, text: fitted.lines.join('\n'), left: x + inset, top: y + inset, width: cellW - inset * 2,
      fontSize: fitted.size, fontFamily: 'Inter', fontWeight: '400', lineHeight: 1.2, fill: ink, textAlign: 'left', styles: {} });
  });
  const first = Math.min(...roots), removed = new Set(roots);
  copy.objects = source.objects.flatMap((o, i) => i === first ? replacement : removed.has(i) ? [] : [structuredClone(o)]);
  return copy;
}
