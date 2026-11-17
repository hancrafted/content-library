import { slugOf } from './workflow-foreach.pure';

export interface Item {
  readonly title: string;
  readonly text: string;
}

const headingLevel = (line: string): number => /^(#{1,6})\s/.exec(line)?.[1]?.length ?? 0;
const textOf = (line: string): string => line.replace(/^#+\s+/, '').trim();

function linesOf(markdown: string): { line: string; level: number }[] {
  let fenced = false;
  return markdown.split(/\r?\n/).map((line) => {
    if (line.startsWith('```')) fenced = !fenced;
    return { line, level: fenced ? 0 : headingLevel(line) };
  });
}

const insideAfter = (was: boolean, heading: { line: string; level: number }, slug: string): boolean => {
  if (heading.level !== 1 && heading.level !== 2) return was;
  return heading.level === 2 && slugOf(textOf(heading.line)) === slug;
};

export function itemsUnder(markdown: string, slug: string): Item[] {
  const items: { title: string; lines: string[] }[] = [];
  let inside = false;
  for (const heading of linesOf(markdown)) {
    inside = insideAfter(inside, heading, slug);
    if (inside && heading.level === 3) items.push({ title: textOf(heading.line), lines: [] });
    if (inside) items.at(-1)?.lines.push(heading.line);
  }
  return items.map(({ title, lines }) => ({ title, text: lines.join('\n').trim() }));
}
