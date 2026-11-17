import type * as cheerio from 'cheerio';
import type { Specificity } from './css-rules.pure.ts';

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
