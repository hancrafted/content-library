// The page as the art bake reads it: the parser's nodes, the cascade it builds over them, and selector matching.
import type * as cheerio from 'cheerio';
import type { Specificity } from './css-rules.pure.ts';

/** The parts of the parser's nodes the bake reads. */
export interface Element {
  readonly type: string;
  readonly name: string;
  readonly attribs: Record<string, string>;
  readonly children: readonly ArtNode[];
  readonly parent: Element | null;
}
export type ArtNode = Element | { readonly type: 'text'; readonly data: string } | { readonly type: 'comment' };

export interface Bid {
  readonly value: string;
  readonly specificity: Specificity;
  readonly order: number;
}
export type Cascade = Map<Element, Map<string, Bid>>;
export type OwnerOf = ReadonlyMap<Element, string>;

/** The elements a selector matches in the page, or none for a selector the matcher cannot read. */
export function select($: cheerio.CheerioAPI, selector: string): Set<Element> {
  for (const attempt of [selector, selector.replace(/::?[\w-]+(\([^)]*\))?/g, '')]) {
    try {
      return new Set($(attempt).toArray() as unknown as Element[]);
    } catch {
      // A pseudo-class the matcher cannot read: try again without it.
    }
  }
  return new Set();
}
