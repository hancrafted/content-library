// decision: docs/decision-records/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { load } from 'cheerio';
import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { OPTION } from './episode-spec-page.pure.ts';
import { checkOption, checkOptionMarks, FORM, type OptionCount } from './episode-spec-slide.pure.ts';

const SLIDE_MARKER = /<!-- slide: ([a-z0-9-]+) -->/g;
const OPTIONS: OptionCount = { min: 2, max: 3, words: 'two or three' };
const TITLE_OPTIONS: OptionCount = { min: 3, max: 3, words: 'three' };

export interface FragmentSlide {
  slug: string;
  html: string;
}

export function fragmentSlides(fragment: string): FragmentSlide[] {
  const parts = fragment.split(SLIDE_MARKER);
  return Array.from({ length: Math.floor((parts.length - 1) / 2) }, (_, at) => ({
    slug: parts[1 + at * 2] ?? '',
    html: parts[2 + at * 2] ?? '',
  }));
}

export const pickBox = (slug: string, id: string, checked = false): string =>
  `<label class="spec-pick"><input type="checkbox" form="${FORM}" name="pick:${slug}" value="${id}"${checked ? ' checked' : ''} /> Pick ${id}</label>`;

const slideNumber = (id: string): number => Number(/^\d+/.exec(id)?.[0] ?? '0');

const RECOMMENDED = /\sdata-recommended(?!\s*=\s*"false")/;

function checkFragmentSlide({ slug, html }: FragmentSlide): string[] {
  const withBoxes = html.replace(
    /(<figure\b[^>]*data-option="([^"]+)"[^>]*>)/g,
    (tag, _all, id: string) => `${tag}${pickBox(slug, id, RECOMMENDED.test(tag))}`,
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
    ...figures.flatMap((figure) => checkOption($, figure, { slug, slidePicked: false })),
  ];
}

export function checkFragment(fragment: string): string[] {
  const slides = fragmentSlides(fragment);
  if (slides.length === 0) return ['The fragment has no <!-- slide: <slug> --> marker: start each Slide with one.'];
  return slides.flatMap(checkFragmentSlide);
}
