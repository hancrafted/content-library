/*
 * Line-level reading of a staging markdown file for the cross-file checks:
 * frontmatter fields, headings with their `{#slug}`, the block under each
 * heading, and ordered lists. Not a CommonMark parser: it reads the shapes the
 * staging files' markdown-harness rules already guarantee.
 */

import { parse } from 'yaml';

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
const FRONTMATTER = /^---\n[\s\S]*?\n---\n/;

/** The body's lines, with the frontmatter cut off. */
export function bodyLines(markdown: string): string[] {
  return markdown.replace(FRONTMATTER, '').split('\n');
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

/**
 * A frontmatter field's value as YAML reads it, as text, or null when the frontmatter has no such field, the
 * field is not a scalar, or the frontmatter is not valid YAML. A dotted key (`generated.at`) reads through nested
 * mappings, written in block or flow form, to any depth; a key that itself contains a dot cannot be addressed.
 */
export function frontmatterField(markdown: string, key: string): string | null {
  const found = frontmatterValue(markdown, key);
  return typeof found === 'string' || typeof found === 'number' || typeof found === 'boolean' ? String(found) : null;
}

/** A frontmatter field's parsed YAML value at a dotted key, of any shape, or undefined when absent or unreadable. */
export function frontmatterValue(markdown: string, key: string): unknown {
  const block = FRONTMATTER.exec(markdown)?.[0];
  if (block === undefined) return undefined;
  let value: unknown;
  try {
    value = parse(block.replace(/^---\n/, '').replace(/\n---\n$/, ''));
  } catch {
    return undefined;
  }
  return key.split('.').reduce<unknown>((node, part) => (isMapping(node) ? node[part] : undefined), value);
}

function isMapping(node: unknown): node is Record<string, unknown> {
  return typeof node === 'object' && node !== null && !Array.isArray(node);
}

/** Every page slide's anchor, `<section slug>--<slide slug>`, from the Dossier's h2 and h3 headings. */
export function slideAnchors(dossier: readonly Block[]): string[] {
  let section: string | null = null;
  return dossier.flatMap(({ heading }) => {
    if (heading.level === 2) section = heading.slug;
    return heading.level === 3 && section !== null && heading.slug !== null ? [`${section}--${heading.slug}`] : [];
  });
}
