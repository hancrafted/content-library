/*
 * The Spec contract's rules for one Slide and its Options (design-ADR 0011):
 * numbering, the Option ids and marks, each Option's figcaption, build notes,
 * pick checkbox, tokens and Context markers, and the Slide's note. episode-spec.pure.ts runs them;
 * the Title slide's rules reuse the Option rules.
 */

import { type Cheerio, type CheerioAPI } from 'cheerio';
import { OPTION } from './episode-spec-page.pure.ts';
import { unless } from './finding.pure.ts';

/** One element of a parsed page, read off cheerio's own types, and a selection of them. */
type PageDocument = ReturnType<CheerioAPI['root']>[number];
export type Element = Extract<PageDocument['children'][number], { attribs: Record<string, string> }>;
export type Selection = Cheerio<Element>;

/** The review form's id, which every field names in its `form` attribute. */
export const FORM = 'spec-review';
const LETTERS = 'abc';

/** What a Slide's rules read beside the Slide: the page and whether Han approved it. */
export interface SpecPage {
  $: CheerioAPI;
  approved: boolean;
}

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const ARBITRARY = /\[[^\]]*\]/;
/** Tailwind's own text sizes, which FE-011 replaces with the type roles. */
const RAW_SIZE = /(^|:)text-(xs|sm|base|lg|xl|[2-9]xl)$/;
/** A type role behind a variant prefix (`md:text-heading`), which FE-011 §3 forbids. */
const PREFIXED_ROLE = /:text-(body|caption|subheading|heading|hero)$/;

/** Hex colours, arbitrary Tailwind values and raw type sizes in an Option's attributes and style elements. */
function checkTokens($: CheerioAPI, figure: Selection, where: string): string[] {
  const elements = figure
    .find('*')
    .addBack()
    .toArray()
    .filter((node): node is Element => 'attribs' in node);
  const values = elements.flatMap((element) =>
    Object.entries(element.attribs).flatMap(([name, value]) => (name === 'href' ? [] : [value])),
  );
  const styles = figure
    .find('style')
    .toArray()
    .map((element) => $(element).text());
  const classes = elements.flatMap((element) => (element.attribs.class ?? '').split(/\s+/));
  const hexes = [...values, ...styles].flatMap((value) => value.match(HEX) ?? []);
  const only = (pattern: RegExp): string[] => classes.filter((name) => pattern.test(name));
  return [
    ...hexes.map((hex) => `${where} uses the hex colour "${hex}": use a token class.`),
    ...only(ARBITRARY).map((name) => `${where} uses the arbitrary Tailwind value "${name}": use a token class.`),
    ...only(RAW_SIZE).map(
      (name) =>
        `${where} uses the type size "${name}" outside the FE-011 type roles: use a type role (text-body, text-caption, text-subheading, text-heading).`,
    ),
    ...only(PREFIXED_ROLE).map(
      (name) =>
        `${where} puts the type role "${name}" behind a prefix, which FE-011 forbids: use "${name.split(':').at(-1)}" alone.`,
    ),
  ];
}

export function checkOption($: CheerioAPI, figure: Selection, slug: string): string[] {
  const id = figure.attr('data-option') ?? '';
  const where = `Option ${id} of {#${slug}}`;
  const checkboxes = figure
    .find(`input[type="checkbox"][form="${FORM}"][name="pick:${slug}"]`)
    .toArray()
    .filter((element) => $(element).attr('value') === id);
  return [
    ...unless(
      figure.find('figcaption').text().includes(id),
      `${where} has no figcaption naming its id, reason and build cost.`,
    ),
    ...unless(
      figure.find('[data-spec="build-notes"]').text().trim() !== '',
      `${where} has no build notes: a <div data-spec="build-notes"> with the parts, tokens, props and i18n keys.`,
    ),
    ...unless(
      checkboxes.length === 1,
      `${where} has no <input type="checkbox" form="${FORM}" name="pick:${slug}" value="${id}">.`,
    ),
    ...checkTicked(
      figure.is('[data-picked]'),
      checkboxes.some((element) => $(element).is('[checked]')),
      where,
    ),
    ...checkTokens($, figure, where),
  ];
}

/** A picked Option's checkbox comes ticked and no other does, so a review round needs nothing on a locked Slide. */
function checkTicked(isPicked: boolean, isTicked: boolean, where: string): string[] {
  if (isPicked === isTicked) return [];
  return isPicked
    ? [
        `${where} is picked, but its checkbox lacks checked: a locked Slide comes ticked, so the next round needs nothing on it.`,
      ]
    : [`${where} is not picked, but its checkbox is checked: tick only the data-picked Option.`];
}

/** How many Options a Slide carries, and how a finding says it. */
export interface OptionCount {
  min: number;
  max: number;
  words: string;
}

const PAGE_SLIDE_OPTIONS: OptionCount = { min: 2, max: 3, words: 'two or three' };

/** The count, ids, recommended mark and picked mark of a Slide's Options. */
export function checkOptionMarks(
  figures: readonly Selection[],
  where: string,
  { number, approved, count: wanted }: { number: number; approved: boolean; count: OptionCount },
): string[] {
  const ids = figures.map((figure) => figure.attr('data-option') ?? '');
  const expectedIds = ids.map((_, index) => `${number}${LETTERS[index] ?? '?'}`);
  const recommended = figures.filter((figure) => figure.is('[data-recommended]')).length;
  const picked = figures.filter((figure) => figure.is('[data-picked]')).length;
  const count = figures.length;
  const countFits = count >= wanted.min && count <= wanted.max;
  return [
    ...unless(countFits, `${where} has ${count} Option${count === 1 ? '' : 's'}: it needs ${wanted.words}.`),
    ...unless(
      !countFits || ids.join() === expectedIds.join(),
      `${where} has the Options [${ids.join(', ')}]: id them ${expectedIds.join(', ')} in order, the Slide number and a letter.`,
    ),
    ...unless(
      recommended === 1,
      `${where} marks ${recommended} Options recommended: mark exactly one with data-recommended.`,
    ),
    ...unless(picked <= 1, `${where} marks ${picked} Options picked: mark at most one with data-picked.`),
    ...unless(
      !approved || picked !== 0,
      `${where} has no picked Option: an approved Spec picks exactly one per Slide.`,
    ),
  ];
}

/** The Speaker note titles of a Slide, each its first `<strong>`. */
function noteTitles($: CheerioAPI, slide: Selection): string[] {
  return slide
    .find('ol[data-spec="speaker-notes"] > li')
    .toArray()
    .map((item) => $(item).children('strong').first().text().trim());
}

/** Each Context marker in an Option names, in `data-note`, a Speaker note of its Slide by title. */
function checkMarkers(figure: Selection, slug: string, notes: readonly string[]): string[] {
  const where = `Option ${figure.attr('data-option') ?? ''} of {#${slug}}`;
  return figure
    .find('[data-spec="context-marker"]')
    .toArray()
    .map((marker) => marker.attribs['data-note'] ?? '')
    .filter((note) => !notes.includes(note))
    .map(
      (note) =>
        `${where} has a Context marker for "${note}", which is no Speaker note of the Slide: name the note by its title in data-note.`,
    );
}

/** A reused Slide (`data-reused`): its label, no Option and no words of its own, since it keeps the pool Slide's. */
function checkReusedSlide(slide: Selection, where: string): string[] {
  const pool = slide.attr('data-reused') ?? '';
  return [
    ...unless(
      slide.find('[data-spec="reused"]').text().startsWith(`Reused from ${pool}, held by `),
      `${where} is reused but has no <p data-spec="reused"> label "Reused from ${pool}, held by <Episodes>."`,
    ),
    ...unless(
      slide.find(`${OPTION}, input[name^="pick:"]`).length === 0,
      `${where} is reused from ${pool}, so it has no Options: a reused Slide costs one reference and keeps how it looks.`,
    ),
    ...unless(
      slide.find('[data-spec="voice-script"], [data-spec="speaker-notes"]').length === 0,
      `${where} is reused from ${pool}, so it shows no Voice script or Speaker notes of its own: it keeps the pool Slide's words.`,
    ),
  ];
}

/** An adapted Slide (`data-adapted`) shows its origin, the pool Slide as it is, beside the Options that modify it. */
function checkAdaptedSlide(slide: Selection, where: string): string[] {
  const pool = slide.attr('data-adapted') ?? '';
  return [
    ...unless(
      slide.find(`figure[data-spec="origin"][data-pool="${pool}"]`).length === 1,
      `${where} adapts ${pool} but shows no <figure data-spec="origin" data-pool="${pool}">: draw the pool Slide as it is beside the Options.`,
    ),
    ...unless(
      slide.attr('id') !== pool,
      `${where} adapts ${pool} under its origin's slug: an instance takes a slug of its own.`,
    ),
  ];
}

/** The rules of one Slide, the `at`-th in page order. */
export function checkSlide(page: SpecPage, element: Element, at: number): string[] {
  const { $ } = page;
  const slide = $(element);
  const where = `The Slide {#${slide.attr('id') ?? ''}}`;
  const numbered = unless(
    slide.attr('data-number') === String(at + 1),
    `${where} is numbered ${slide.attr('data-number')}, but it is Slide ${at + 1} in page order.`,
  );
  if (slide.is('[data-reused]')) return [...numbered, ...checkReusedSlide(slide, where)];
  const adapted = slide.is('[data-adapted]') ? checkAdaptedSlide(slide, where) : [];
  return [...numbered, ...adapted, ...checkPageSlide(page, slide, where)];
}

/** The Options and the note of a Slide that is not reused. */
function checkPageSlide({ $, approved }: SpecPage, slide: Selection, where: string): string[] {
  const slug = slide.attr('id') ?? '';
  const figures = slide
    .find(OPTION)
    .toArray()
    .map((figure) => $(figure));
  return [
    ...checkOptionMarks(figures, where, {
      number: Number(slide.attr('data-number')),
      approved,
      count: PAGE_SLIDE_OPTIONS,
    }),
    ...figures.flatMap((figure) => [
      ...checkOption($, figure, slug),
      ...checkMarkers(figure, slug, noteTitles($, slide)),
    ]),
    ...unless(
      slide.find(`textarea[form="${FORM}"][name="note:${slug}"]`).length === 1,
      `${where} has no <textarea form="${FORM}" name="note:${slug}">.`,
    ),
  ];
}
