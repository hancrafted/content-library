import type * as cheerio from 'cheerio';
import { select, type Cascade, type Element, type OwnerOf } from './art-dom.pure.ts';
import type { CssRule } from './css-rules.pure.ts';

const STROKE_GEOMETRY = /^stroke-(width|linejoin|linecap|miterlimit|dasharray|dashoffset|opacity)$/;
const OPTIONAL_STROKE = /^var\((--[\w-]+),\s*none\)$/;

interface StrokeContext {
  readonly stroked: ReadonlySet<Element>;
  readonly defines: ReadonlyMap<Element, ReadonlySet<string>>;
}

export function strokeContext($: cheerio.CheerioAPI, rules: readonly CssRule[]): StrokeContext {
  const stroked = new Set<Element>();
  const defines = new Map<Element, Set<string>>();
  for (const rule of rules.filter(({ conditional }) => !conditional)) {
    const stroke = rule.decls.some(([property, value]) => property === 'stroke' && value !== 'none');
    const custom = rule.decls.filter(([property]) => property.startsWith('--')).map(([property]) => property);
    const matched = stroke || custom.length > 0 ? select($, rule.selector) : [];
    for (const element of matched) {
      if (stroke) stroked.add(element);
      defines.set(element, new Set([...(defines.get(element) ?? []), ...custom]));
    }
  }
  return { stroked, defines };
}

function* selfAndAncestors(element: Element) {
  for (let node: Element | null = element; node !== null && node.type === 'tag'; node = node.parent) yield node;
}

function paintsStroke(value: string, element: Element, context: StrokeContext) {
  const optional = OPTIONAL_STROKE.exec(value)?.[1];
  if (optional === undefined) return value !== 'none';
  return [...selfAndAncestors(element)].some((node) => context.defines.get(node)?.has(optional));
}

const ownStroke = (node: Element, cascade: Cascade): string | undefined =>
  cascade.get(node)?.get('stroke')?.value ?? node.attribs.stroke;

function reachedByStroke(element: Element, cascade: Cascade, context: StrokeContext) {
  for (const node of selfAndAncestors(element)) {
    const own = ownStroke(node, cascade);
    if (own !== undefined) return paintsStroke(own, node, context);
    if (context.stroked.has(node)) return true;
  }
  return false;
}

export function dropUnstrokedGeometry(cascade: Cascade, owner: OwnerOf, context: StrokeContext) {
  for (const element of owner.keys()) {
    const bids = cascade.get(element);
    if (bids === undefined || reachedByStroke(element, cascade, context)) continue;
    for (const property of [...bids.keys()]) if (STROKE_GEOMETRY.test(property)) bids.delete(property);
  }
}
