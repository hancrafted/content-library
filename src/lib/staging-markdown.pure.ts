/*
 * Line-level reading of a staging markdown file's body for the cross-file
 * checks: headings with their `{#slug}`, the block under each heading, and
 * ordered lists. Not a CommonMark parser: it reads the shapes the staging
 * files' markdown-harness rules already guarantee. The frontmatter is
 * staging-file.pure.ts's to read.
 */

import { bodyOf } from './staging-file.pure.ts';

export interface Heading {
  level: number;
  text: string;
  /** The `{#slug}` the heading carries, or null for an unslugged heading. */
  slug: string | null;
  /** Index of the heading's line in the body. */
  line: number;
}

const HEADING = /^(#{1,6}) (.*)$/;
const SLUG = /\{#([a-z0-9-]+)\}$/;

/** The body's lines, with the frontmatter cut off. */
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
  /** The slug of the nearest slugged heading at or above this one: the spine entry it belongs to. */
  owner: string | null;
  /** The lines between this heading and the next heading of any level. */
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

/** The blocks under an h4 of this name, one per spine Slide that has one. */
export function h4s(blocks: readonly Block[], name: string): Block[] {
  return blocks.filter(({ heading }) => heading.level === 4 && heading.text === name);
}

export interface ListItem {
  text: string;
  /** The item's nested `- ` lines, without the marker. */
  nested: string[];
}

const ORDERED_ITEM = /^\d+\. (.*)$/;
const NESTED_ITEM = /^\s+- (.*)$/;

/** A block's ordered list, and every non-blank line that is neither an item nor nested under one. */
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

/** Every page slide's anchor, `<section slug>--<slide slug>`, from the Dossier's h2 and h3 headings. */
export function slideAnchors(dossier: readonly Block[]): string[] {
  let section: string | null = null;
  return dossier.flatMap(({ heading }) => {
    if (heading.level === 2) section = heading.slug;
    return heading.level === 3 && section !== null && heading.slug !== null ? [`${section}--${heading.slug}`] : [];
  });
}

/** Every Section's slug, the anchor of its section slide, from the Dossier's h2 headings. */
export function sectionSlugs(dossier: readonly Block[]): string[] {
  return dossier.flatMap(({ heading }) => (heading.level === 2 && heading.slug !== null ? [heading.slug] : []));
}
