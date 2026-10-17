/*
 * The Spec contract's rules for one Slide and its Options (design-ADR 0011):
 * numbering, the Option ids and marks, each Option's figcaption, build notes,
 * pick checkbox and tokens, and the Slide's note. episode-spec.pure.ts runs them;
 * the Title slide's rules reuse the Option rules.
 */

import { type Cheerio, type CheerioAPI } from 'cheerio';
import { OPTION } from './episode-spec-page.pure';
import { unless } from './finding.pure';

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

/** Hex colours and arbitrary Tailwind values in an Option's attributes and style elements. */
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
  const hexes = [...values, ...styles].flatMap((value) => value.match(HEX) ?? []);
  const arbitrary = elements
    .flatMap((element) => (element.attribs.class ?? '').split(/\s+/))
    .filter((name) => ARBITRARY.test(name));
  return [
    ...hexes.map((hex) => `${where} uses the hex colour "${hex}": use a token class.`),
    ...arbitrary.map((name) => `${where} uses the arbitrary Tailwind value "${name}": use a token class.`),
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

/** The rules of one Slide, the `at`-th in page order. */
export function checkSlide({ $, approved }: SpecPage, element: Element, at: number): string[] {
  const slide = $(element);
  const slug = slide.attr('id') ?? '';
  const where = `The Slide {#${slug}}`;
  const figures = slide
    .find(OPTION)
    .toArray()
    .map((figure) => $(figure));
  return [
    ...unless(
      slide.attr('data-number') === String(at + 1),
      `${where} is numbered ${slide.attr('data-number')}, but it is Slide ${at + 1} in page order.`,
    ),
    ...checkOptionMarks(figures, where, {
      number: Number(slide.attr('data-number')),
      approved,
      count: PAGE_SLIDE_OPTIONS,
    }),
    ...figures.flatMap((figure) => checkOption($, figure, slug)),
    ...unless(
      slide.find(`textarea[form="${FORM}"][name="note:${slug}"]`).length === 1,
      `${where} has no <textarea form="${FORM}" name="note:${slug}">.`,
    ),
  ];
}
