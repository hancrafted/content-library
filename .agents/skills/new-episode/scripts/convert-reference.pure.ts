// The pure half of `npm run convert-reference`: turns marker's paginated Markdown into a reference.md,
// one `## Page <n>` per page under its whole-page image, and decides which of marker's cut-out images
// stay. The script runs marker, pdftoppm and ImageMagick; nothing here touches the disk.
import { stringify } from 'yaml';

/** A cut-out whose longer edge is shorter than this is an icon or a UI control, not a picture worth reading. */
const MIN_CROP_EDGE = 1000;

/** marker's page separator under `--paginate_output`: `{<0-based page>}` and a run of dashes. */
const PAGE_MARK = /^\{(\d+)\}-+$/;

/** marker's name for a cut-out: `_page_<0-based page>_<Kind>_<n>.<ext>`. */
const MARKER_CROP = /^_page_(\d+)_([A-Za-z]+)_(\d+)\.(?:jpe?g|png)$/;

const IMAGE = /!\[[^\]]*\]\(([^)]*)\)/g;

export interface ReferenceInput {
  /** marker's Markdown, written with `--paginate_output`. */
  markdown: string;
  /** The reference's title, which is also its h1. */
  title: string;
  /** The OKF actor that wrote it, `marker/<version>`. */
  generatedBy: string;
  generatedAt: string;
  /** The PDF the reference was converted from: a repo path and the name Han gave the file. */
  source: { resource: string; title: string };
  pageCount: number;
  /** marker's cut-out name → the name it is kept under in `crops/`, or null when it is dropped. */
  crops: Readonly<Record<string, string | null>>;
}

function pad(page: number, pageCount: number): string {
  return String(page).padStart(Math.max(2, String(pageCount).length), '0');
}

/** The whole-page image of a 1-based page, relative to reference.md. */
export function pageImage(page: number, pageCount: number): string {
  return `pages/page-${pad(page, pageCount)}.jpg`;
}

/** The name a marker cut-out is kept under, by its 1-based page, kind and number; null for any other file. */
export function cropName(marker: string, pageCount: number): string | null {
  const match = MARKER_CROP.exec(marker);
  if (match === null) return null;
  return `page-${pad(Number(match[1]) + 1, pageCount)}-${match[2].toLowerCase()}-${match[3]}.jpg`;
}

/** Whether a cut-out is large enough to keep. */
export function keepsCrop(size: { width: number; height: number }): boolean {
  return Math.max(size.width, size.height) >= MIN_CROP_EDGE;
}

/** The alt text of a kept cut-out, from its kept name: `page-02-picture-4.jpg` → `Page 2, picture 4`. */
function cropAlt(kept: string): string {
  const [, page, kind, n] = /^page-(\d+)-([a-z]+)-(\d+)\.jpg$/.exec(kept) ?? [];
  return `Page ${Number(page)}, ${kind} ${n}`;
}

/** One line of a page, cleaned: headings two levels down, the deck's own list markers dropped, images relinked. */
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

/** The cleaned text of one page, with runs of blank lines collapsed to one. */
function cleanPage(lines: readonly string[], crops: ReferenceInput['crops']): string {
  const cleaned = lines.map((line) => cleanLine(line, crops));
  return cleaned
    .join('\n')
    .replace(/\n[ \t]*(?:\n[ \t]*)+\n/g, '\n\n')
    .trim();
}

/** marker's lines per 0-based page, by its page separators; text before the first one is dropped. */
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

/** The reference.md for one converted PDF. */
export function renderReference(input: ReferenceInput): string {
  const frontmatter = stringify({
    type: 'reference',
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
