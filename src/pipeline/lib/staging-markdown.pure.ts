import { bodyOf } from './staging-file.pure.ts';

export interface Heading {
  level: number;
  text: string;
  slug: string | null;
  line: number;
}

const HEADING = /^(#{1,6}) (.*)$/;
const SLUG = /\{#([a-z0-9-]+)\}$/;

export function bodyLines(markdown: string): string[] {
  return bodyOf(markdown).split('\n');
}

const FENCE = /^(```|~~~)/;

export function headingsOf(lines: readonly string[]): Heading[] {
  let fenced = false;
  return lines.flatMap((line, index) => {
    if (FENCE.test(line)) fenced = !fenced;
    const match = fenced ? null : HEADING.exec(line);
    if (match === null) return [];
    const slug = SLUG.exec(match[2]);
    return [{ level: match[1].length, text: match[2], slug: slug === null ? null : slug[1], line: index }];
  });
}

export interface Block {
  heading: Heading;
  owner: string | null;
  body: string[];
}

export function blocksOf(lines: readonly string[]): Block[] {
  const headings = headingsOf(lines);
  let owner: string | null = null;
  return headings.map((heading, index) => {
    if (heading.slug !== null) owner = heading.slug;
    const end = headings[index + 1]?.line ?? lines.length;
    return { heading, owner, body: lines.slice(heading.line + 1, end) };
  });
}

export function h4s(blocks: readonly Block[], name: string): Block[] {
  return blocks.filter(({ heading }) => heading.level === 4 && heading.text === name);
}

export interface ListItem {
  text: string;
  nested: string[];
}

const ORDERED_ITEM = /^\d+\. (.*)$/;
const NESTED_ITEM = /^\s+- (.*)$/;

export function orderedList(body: readonly string[]): { items: ListItem[]; strays: string[] } {
  const items: ListItem[] = [];
  const strays: string[] = [];
  for (const line of body) {
    const item = ORDERED_ITEM.exec(line);
    const nested = NESTED_ITEM.exec(line);
    if (item !== null) items.push({ text: item[1], nested: [] });
    else if (nested !== null && items.length > 0) items[items.length - 1].nested.push(nested[1]);
    else if (line.trim() !== '') strays.push(line);
  }
  return { items, strays };
}

export function slideAnchors(dossier: readonly Block[]): string[] {
  let section: string | null = null;
  return dossier.flatMap(({ heading }) => {
    if (heading.level === 2) section = heading.slug;
    return heading.level === 3 && section !== null && heading.slug !== null ? [`${section}--${heading.slug}`] : [];
  });
}

export function sectionSlugs(dossier: readonly Block[]): string[] {
  return dossier.flatMap(({ heading }) => (heading.level === 2 && heading.slug !== null ? [heading.slug] : []));
}
