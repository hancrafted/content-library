// decision: FE-005 §5
// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
import * as cheerio from 'cheerio';
import { select, type ArtNode, type Bid, type Cascade, type Element, type OwnerOf } from './art-dom.pure.ts';
import type { ArtPiece } from './art-store.pure.ts';
import { dropUnstrokedGeometry, strokeContext } from './art-stroke.pure.ts';
import { compareSpecificity, specificity, subjectTokens, type CssRule } from './css-rules.pure.ts';

type PaintOf = (element: Element) => ReadonlyMap<string, string>;

const SOURCE = 'data-art-source';
const PAINT = new Set(
  'fill fill-opacity fill-rule stroke stroke-width stroke-linejoin stroke-linecap stroke-opacity stroke-dasharray stroke-dashoffset stroke-miterlimit opacity paint-order vector-effect shape-rendering clip-rule color display visibility transform-origin'.split(
    ' ',
  ),
);
const INERT = new Set(['pointer-events', 'cursor', 'will-change', 'transform-box', 'animation-play-state']);
const isInert = ([property, value]: readonly [string, string]) =>
  INERT.has(property) || (/^(animation|animation-name|transition)$/.test(property) && /^none\b/.test(value));
const MOTION = /^(animation|transition|transform$|translate$|rotate$|scale$|offset)/;
const INTERACTION = /:(hover|focus|active|checked|target)/;
const TAGS_THAT_STAY_ON_THE_PAGE_OUTSIDE_ART = new Set(
  'text tspan foreignobject clippath mask lineargradient radialgradient pattern filter use image a style script'.split(
    ' ',
  ),
);

function refuse(name: string, message: string): never {
  throw new Error(`art "${name}": ${message}`);
}

function refuseUnbakeable(rule: CssRule, property: string, name: string) {
  if (MOTION.test(property)) refuse(name, `\`${rule.selector}\` sets ${property}; nothing animates inside an asset`);
  if (rule.conditional) refuse(name, `\`${rule.selector}\` paints the drawing only under a media query`);
  if (!PAINT.has(property)) refuse(name, `\`${rule.selector}\` sets ${property}, which has no attribute to bake`);
}

function bid(rule: CssRule, at: { readonly element: Element; readonly name: string }, cascade: Cascade) {
  const bids = cascade.get(at.element) ?? new Map<string, Bid>();
  for (const [property, value] of rule.decls.filter((decl) => !isInert(decl))) {
    refuseUnbakeable(rule, property, at.name);
    const offer: Bid = { value, specificity: specificity(rule.selector), order: rule.order };
    const current = bids.get(property);
    if (current === undefined || compareSpecificity(offer.specificity, current.specificity) >= 0)
      bids.set(property, offer);
  }
  cascade.set(at.element, bids);
}

function cascadeOf($: cheerio.CheerioAPI, rules: readonly CssRule[], owner: OwnerOf): Cascade {
  const drawn = [...new Set(owner.values())].map((name) => $.html($(`[${SOURCE}="${name}"]`))).join('');
  const cascade: Cascade = new Map();
  for (const rule of rules) {
    if (!subjectTokens(rule.selector).every((token) => drawn.includes(token))) continue;
    for (const element of select($, rule.selector)) {
      const name = owner.get(element);
      if (name === undefined) continue;
      if (INTERACTION.test(rule.selector)) refuse(name, `\`${rule.selector}\` paints the drawing on interaction`);
      bid(rule, { element, name }, cascade);
    }
  }
  return cascade;
}

const paintIn = (cascade: Cascade, element: Element) =>
  new Map([...(cascade.get(element) ?? [])].map(([property, { value }]) => [property, value]));

function enterStatesACloneCannotSeeSoPaintReadsTheSameInEach($: cheerio.CheerioAPI) {
  $('html').addClass('dark');
  $('[data-zone]').attr('data-zone', 'active');
}

const referencesId = ([attribute, value]: readonly [string, string]) =>
  attribute === 'id' || /url\(/.test(value) || /^(clip-path|mask|filter)$/.test(attribute);

function checkElement(name: string, element: Element) {
  if (TAGS_THAT_STAY_ON_THE_PAGE_OUTSIDE_ART.has(element.name.toLowerCase()))
    refuse(name, `<${element.name}> stays on the page, outside <Art>`);
  const reference = Object.entries(element.attribs).find(referencesId);
  if (reference) refuse(name, `${reference[0]}="${reference[1]}" references by id; keep it on the page, outside <Art>`);
  const pageWide = (element.attribs.class ?? '').split(/\s+/).find((name) => name !== '' && !name.includes('__'));
  if (pageWide) refuse(name, `class "${pageWide}" is page-wide CSS the bake cannot read; paint it from a CSS module`);
  const style = element.attribs.style ?? '';
  if (/animation|transition|transform/.test(style)) {
    refuse(name, `style="${style}" moves inside a drawing; nothing animates inside an asset`);
  }
}

const escapeAttribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function attributesOf(element: Element, paint: ReadonlyMap<string, string>) {
  const kept = Object.entries(element.attribs).filter(
    ([attribute]) => attribute !== 'class' && !/^(data|aria)-/.test(attribute) && !paint.has(attribute),
  );
  return [...kept, ...paint].map(([attribute, value]) => ` ${attribute}="${escapeAttribute(value)}"`).join('');
}

function serialize(name: string, node: ArtNode, paintOf: PaintOf): string {
  if (node.type === 'comment') return '';
  if (node.type === 'text') {
    const text = 'data' in node ? node.data.trim() : '';
    return text === '' ? '' : refuse(name, `text "${text}" stays on the page, outside <Art>`);
  }
  const element = node as Element;
  if (element.attribs[SOURCE] !== undefined)
    refuse(name, `holds <Art name="${element.attribs[SOURCE]}">; art never nests`);
  checkElement(name, element);
  const children = element.children.map((child) => serialize(name, child, paintOf)).join('');
  const open = `${element.name}${attributesOf(element, paintOf(element))}`;
  return children ? `<${open}>${children}</${element.name}>` : `<${open}/>`;
}

function refuseStatePaint(rest: Cascade, stated: Cascade, owner: OwnerOf) {
  for (const [element, name] of owner) {
    const before = JSON.stringify([...paintIn(rest, element)]);
    const after = JSON.stringify([...paintIn(stated, element)]);
    if (before !== after) {
      refuse(
        name,
        `<${element.name}> paints ${before} at rest but ${after} in dark mode or on the active Slide; set a custom property on the host instead`,
      );
    }
  }
}

export function bakeArt(markup: string, rules: readonly CssRule[]): ArtPiece[] {
  const $ = cheerio.load(markup);
  const sources = $(`[${SOURCE}]`).toArray() as unknown as Element[];
  const owner = new Map<Element, string>();
  for (const source of sources) {
    for (const inner of $(source as never)
      .find('*')
      .toArray() as unknown as Element[]) {
      owner.set(inner, source.attribs[SOURCE]!);
    }
  }
  const rest = cascadeOf($, rules, owner);
  dropUnstrokedGeometry(rest, owner, strokeContext($, rules));
  enterStatesACloneCannotSeeSoPaintReadsTheSameInEach($);
  const stated = cascadeOf($, rules, owner);
  dropUnstrokedGeometry(stated, owner, strokeContext($, rules));
  refuseStatePaint(rest, stated, owner);
  const paintOf: PaintOf = (element) => paintIn(rest, element);
  return sources.map((source) => {
    const name = source.attribs[SOURCE]!;
    return { name, body: source.children.map((child) => serialize(name, child, paintOf)).join('') };
  });
}
