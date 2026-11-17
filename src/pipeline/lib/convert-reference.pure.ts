import { stringify } from 'yaml';

const MIN_CROP_EDGE = 1000;

const PAGE_MARK = /^\{(\d+)\}-+$/;

const MARKER_CROP = /^_page_(\d+)_([A-Za-z]+)_(\d+)\.(?:jpe?g|png)$/;

const IMAGE = /!\[[^\]]*\]\(([^)]*)\)/g;

export interface ReferenceInput {
  markdown: string;
  title: string;
  generatedBy: string;
  generatedAt: string;
  source: { resource: string; title: string };
  pageCount: number;
  crops: Readonly<Record<string, string | null>>;
}

function pad(page: number, pageCount: number): string {
  return String(page).padStart(Math.max(2, String(pageCount).length), '0');
}

export function pageImage(page: number, pageCount: number): string {
  return `pages/page-${pad(page, pageCount)}.jpg`;
}

export function cropName(marker: string, pageCount: number): string | null {
  const match = MARKER_CROP.exec(marker);
  if (match === null) return null;
  return `page-${pad(Number(match[1]) + 1, pageCount)}-${match[2].toLowerCase()}-${match[3]}.jpg`;
}

export function keepsCrop(size: { width: number; height: number }): boolean {
  return Math.max(size.width, size.height) >= MIN_CROP_EDGE;
}

function cropAlt(kept: string): string {
  const [, page, kind, n] = /^page-(\d+)-([a-z]+)-(\d+)\.jpg$/.exec(kept) ?? [];
  return `Page ${Number(page)}, ${kind} ${n}`;
}

function cleanLine(line: string, crops: ReferenceInput['crops']): string {
  const heading = /^(#{1,6})\s+(.*)$/.exec(line);
  if (heading !== null) {
    const level = Math.min(heading[1].length + 2, 6);
    return `${'#'.repeat(level)} ${heading[2].replace(/^\*\*(.*)\*\*$/, '$1')}`;
  }
  return line
    .replace(/^(\s*)(\d+)\. \2 /, '$1$2. ')
    .replace(/^(\s*)- • /, '$1- ')
    .replace(IMAGE, (_, target: string) => {
      const kept = crops[target];
      return kept === undefined || kept === null ? '' : `![${cropAlt(kept)}](crops/${kept})`;
    });
}

function cleanPage(lines: readonly string[], crops: ReferenceInput['crops']): string {
  const cleaned = lines.map((line) => cleanLine(line, crops));
  return cleaned
    .join('\n')
    .replace(/\n[ \t]*(?:\n[ \t]*)+\n/g, '\n\n')
    .trim();
}

function pagesOf(markdown: string): Map<number, string[]> {
  const pages = new Map<number, string[]>();
  let current: string[] | null = null;
  for (const line of markdown.split('\n')) {
    const mark = PAGE_MARK.exec(line.trim());
    if (mark !== null) {
      current = [];
      pages.set(Number(mark[1]), current);
    } else {
      current?.push(line);
    }
  }
  return pages;
}

export function renderReference(input: ReferenceInput): string {
  const frontmatter = stringify({
    type: 'episode-design-reference',
    title: input.title,
    generated: { by: input.generatedBy, at: input.generatedAt },
    sources: [{ id: 1, resource: input.source.resource, title: input.source.title }],
  });
  const pages = pagesOf(input.markdown);
  const blocks = Array.from({ length: input.pageCount }, (_, index) => {
    const page = index + 1;
    const head = `## Page ${page}\n\n![Page ${page}](${pageImage(page, input.pageCount)})`;
    const text = cleanPage(pages.get(index) ?? [], input.crops);
    return text === '' ? head : `${head}\n\n${text}`;
  });
  return `---\n${frontmatter}---\n\n# ${input.title}\n\n${blocks.join('\n\n')}\n`;
}
