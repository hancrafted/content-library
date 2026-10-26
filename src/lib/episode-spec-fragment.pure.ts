/*
 * The Spec contract on a designer's fragment (design-ADR 0011), so `npm run episode:spec-preview` and the staging
 * test hold one rulebook. A fragment is a file of `<!-- slide: <slug> -->` markers, each followed by the Slide's
 * Option figures; the orchestrator adds the pick checkboxes and note fields later, so the rules that read them
 * run on a fragment with the checkbox added the way assembly adds it. The Slide's number is its Options' leading digit.
 */
import { load } from 'cheerio';
import { OPTION } from './episode-spec-page.pure.ts';
import { checkOption, checkOptionMarks, FORM, type OptionCount } from './episode-spec-slide.pure.ts';
import { TITLE_ANCHOR } from './title-anchor.pure.ts';

const SLIDE_MARKER = /<!-- slide: ([a-z0-9-]+) -->/g;
const OPTIONS: OptionCount = { min: 2, max: 3, words: 'two or three' };
const TITLE_OPTIONS: OptionCount = { min: 3, max: 3, words: 'three' };

/** One Slide of a fragment: its slug and the markup of its Options. */
export interface FragmentSlide {
  slug: string;
  html: string;
}

/** The fragment cut at its slide markers; markup before the first marker belongs to no Slide and is dropped. */
export function fragmentSlides(fragment: string): FragmentSlide[] {
  const parts = fragment.split(SLIDE_MARKER);
  return Array.from({ length: Math.floor((parts.length - 1) / 2) }, (_, at) => ({
    slug: parts[1 + at * 2] ?? '',
    html: parts[2 + at * 2] ?? '',
  }));
}

/** The pick checkbox assembly adds to an Option. */
export const pickBox = (slug: string, id: string, checked = false): string =>
  `<label class="spec-pick"><input type="checkbox" form="${FORM}" name="pick:${slug}" value="${id}"${checked ? ' checked' : ''} /> Pick ${id}</label>`;

/** The leading digits of an Option id: its Slide's number. */
const slideNumber = (id: string): number => Number(/^\d+/.exec(id)?.[0] ?? '0');

/** The contract's findings on one Slide of a fragment. */
function checkFragmentSlide({ slug, html }: FragmentSlide): string[] {
  const withBoxes = html.replace(
    /(<figure\b[^>]*data-option="([^"]+)"[^>]*>)/g,
    (tag, _all, id: string) => `${tag}${pickBox(slug, id)}`,
  );
  const $ = load(withBoxes, null, false);
  const figures = $(OPTION)
    .toArray()
    .map((figure) => $(figure));
  const isTitle = slug === TITLE_ANCHOR;
  const number = isTitle ? 0 : slideNumber(figures[0]?.attr('data-option') ?? '');
  const where = `The ${isTitle ? 'Title slide' : 'Slide'} {#${slug}}`;
  return [
    ...checkOptionMarks(figures, where, { number, approved: false, count: isTitle ? TITLE_OPTIONS : OPTIONS }),
    ...figures.flatMap((figure) => checkOption($, figure, slug)),
  ];
}

/** The contract's findings on a fragment, one message each, in Slide then Option order. */
export function checkFragment(fragment: string): string[] {
  const slides = fragmentSlides(fragment);
  if (slides.length === 0) return ['The fragment has no <!-- slide: <slug> --> marker: start each Slide with one.'];
  return slides.flatMap(checkFragmentSlide);
}
