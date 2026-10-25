/*
 * The one remark plugin of the evidence pages (design-ADR 0016, Citations rule 6): each `[n]` citation marker in a
 * research file's Markdown becomes a link to the nth entry of the page's Sources list, `#source-<n>`. It works on the
 * Markdown tree, so the link survives remark-rehype. A marker that names no Source throws, which stops the build.
 *
 * A research file closes with `[n]: <url> "title"` definitions, so remark reads a marker as a link reference to the
 * Source's URL, and `[1][2]` as one full reference whose text is 1 and whose label is 2. Both are split back into
 * markers here; a marker without a definition stays text and is matched there.
 */

/** The anchor id of the nth entry of an evidence page's Sources list. */
export function sourceAnchor(n: number): string {
  return `source-${n}`;
}

interface MdNode {
  type: string;
  value?: string;
  identifier?: string;
  referenceType?: string;
  url?: string;
  children?: MdNode[];
  data?: { hProperties?: Record<string, unknown> };
}

const NUMBER = /^\d+$/;
const MARKER = /\[(\d+)\]/g;

function marker(n: number, sources: ReadonlySet<number>): MdNode {
  if (!sources.has(n)) {
    const known = [...sources].sort((a, b) => a - b).join(', ') || 'none';
    throw new Error(`The citation marker [${n}] names no Source: the page's Sources are ${known}.`);
  }
  return {
    type: 'link',
    url: `#${sourceAnchor(n)}`,
    children: [{ type: 'text', value: `[${n}]` }],
    data: { hProperties: { dataCitation: n } },
  };
}

function textOf(node: MdNode): string | undefined {
  const [only] = node.children ?? [];
  return node.children?.length === 1 && only.type === 'text' ? only.value : undefined;
}

/** The markers a numeric link reference stands for, or undefined when it is an ordinary link. */
function referenceMarkers(node: MdNode, sources: ReadonlySet<number>): MdNode[] | undefined {
  if (node.type !== 'linkReference' || !NUMBER.test(node.identifier ?? '')) return undefined;
  const label = Number(node.identifier);
  if (node.referenceType !== 'full') return [marker(label, sources)];
  const text = textOf(node) ?? '';
  return NUMBER.test(text) ? [marker(Number(text), sources), marker(label, sources)] : undefined;
}

function textMarkers(value: string, sources: ReadonlySet<number>): MdNode[] {
  const parts: MdNode[] = [];
  let from = 0;
  for (const match of value.matchAll(MARKER)) {
    if (match.index > from) parts.push({ type: 'text', value: value.slice(from, match.index) });
    parts.push(marker(Number(match[1]), sources));
    from = match.index + match[0].length;
  }
  if (from < value.length) parts.push({ type: 'text', value: value.slice(from) });
  return parts;
}

function rewrite(parent: MdNode, sources: ReadonlySet<number>): void {
  if (parent.children === undefined) return;
  parent.children = parent.children.flatMap((child) => {
    const references = referenceMarkers(child, sources);
    if (references) return references;
    if (child.type === 'text' && child.value !== undefined) return textMarkers(child.value, sources);
    rewrite(child, sources);
    return [child];
  });
}

/** The plugin: pass the ids of the page's Sources, `1..n`. */
export function remarkCitations({ sources }: { readonly sources: readonly number[] }) {
  const known = new Set(sources);
  return (tree: unknown) => {
    rewrite(tree as MdNode, known);
  };
}
