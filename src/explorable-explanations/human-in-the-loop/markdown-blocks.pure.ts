/*
 * The one generic markdown reader of the visual: the blocks a handoff is made of (headings, paragraphs, lists, a code
 * fence), with the front matter left out. Every example is a markdown handoff, so no per-kind reader is needed.
 */

export type MarkdownBlock =
  | { readonly kind: 'h1' | 'h2' | 'h3' | 'p' | 'code'; readonly text: string }
  | { readonly kind: 'ul' | 'ol'; readonly items: readonly string[] };

const FRONT = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const HEADING = /^(#{1,3}) (.*)$/;
const ITEM = /^(?:([-*])|\d+\.) (.*)$/;

function listKind(line: string): 'ul' | 'ol' | undefined {
  const found = ITEM.exec(line);
  if (!found) return undefined;
  return found[1] ? 'ul' : 'ol';
}

/** The blocks of a markdown text, in order. */
export function markdownBlocks(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let fence: string[] | undefined;
  for (const line of source.replace(FRONT, '').split(/\r?\n/)) {
    if (line.startsWith('```')) {
      if (fence) blocks.push({ kind: 'code', text: fence.join('\n') });
      fence = fence ? undefined : [];
    } else if (fence) fence.push(line);
    else addLine(blocks, line);
  }
  return blocks;
}

/** Adds `text` to the last block when it is a block of `kind`, else starts a block. */
function extend(blocks: MarkdownBlock[], kind: 'ul' | 'ol' | 'p', text: string): void {
  const last = blocks.at(-1);
  if (last?.kind !== kind) {
    blocks.push(kind === 'p' ? { kind, text } : { kind, items: [text] });
  } else if ('items' in last) {
    blocks[blocks.length - 1] = { kind: last.kind, items: [...last.items, text] };
  } else {
    blocks[blocks.length - 1] = { kind: 'p', text: `${last.text} ${text}` };
  }
}

const headingOf = (found: RegExpExecArray): MarkdownBlock => ({
  kind: `h${found[1]?.length}` as 'h1',
  text: found[2] ?? '',
});

const itemOf = (line: string): string => (ITEM.exec(line)?.[2] ?? '').trim();

function addLine(blocks: MarkdownBlock[], line: string): void {
  const heading = HEADING.exec(line);
  const list = listKind(line);
  if (heading) blocks.push(headingOf(heading));
  else if (list) extend(blocks, list, itemOf(line));
  else if (line.trim() !== '') extend(blocks, 'p', line.trim());
}
