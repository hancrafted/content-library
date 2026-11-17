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

function matchesUnlessSelectorUnreadable($: cheerio.CheerioAPI, selector: string): Set<Element> | undefined {
  try {
    return new Set($(selector).toArray() as unknown as Element[]);
  } catch {
    return undefined;
  }
}

export function select($: cheerio.CheerioAPI, selector: string): Set<Element> {
  const withoutPseudo = selector.replace(/::?[\w-]+(\([^)]*\))?/g, '');
  return matchesUnlessSelectorUnreadable($, selector) ?? matchesUnlessSelectorUnreadable($, withoutPseudo) ?? new Set();
}
