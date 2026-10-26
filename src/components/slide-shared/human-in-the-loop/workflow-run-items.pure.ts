import { slugOf } from './workflow-foreach.pure';

/*
 * The items of a repeated stage: the H3 sections under one H2 of a markdown result, in document order. An item is its
 * H3 line and the text under it, up to the next heading of its level or above. Headings inside code fences do not count.
 */

export interface Item {
  /** The H3 heading's text. */
  readonly title: string;
  /** The H3 line and the text under it, trimmed. */
  readonly text: string;
}

const headingLevel = (line: string): number => /^(#{1,6})\s/.exec(line)?.[1]?.length ?? 0;
const textOf = (line: string): string => line.replace(/^#+\s+/, '').trim();

/** The headings of a markdown body outside code fences, and every line with its level (0: not a heading). */
function linesOf(markdown: string): { line: string; level: number }[] {
  let fenced = false;
  return markdown.split(/\r?\n/).map((line) => {
    if (line.startsWith('```')) fenced = !fenced;
    return { line, level: fenced ? 0 : headingLevel(line) };
  });
}

/** Whether the lines after a heading of `level` are under the H2 `slug`: an H1 or another H2 ends it. */
const under = (was: boolean, heading: { line: string; level: number }, slug: string): boolean => {
  if (heading.level !== 1 && heading.level !== 2) return was;
  return heading.level === 2 && slugOf(textOf(heading.line)) === slug;
};

/** The H3 sections under the H2 whose slug is `slug`. */
export function itemsUnder(markdown: string, slug: string): Item[] {
  const items: { title: string; lines: string[] }[] = [];
  let inside = false;
  for (const heading of linesOf(markdown)) {
    inside = under(inside, heading, slug);
    if (inside && heading.level === 3) items.push({ title: textOf(heading.line), lines: [] });
    if (inside) items.at(-1)?.lines.push(heading.line);
  }
  return items.map(({ title, lines }) => ({ title, text: lines.join('\n').trim() }));
}
