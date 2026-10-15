/*
 * Where the Spec page sits in a staging folder and how its Slides are read
 * (design-ADR 0011): the role selectors every Spec reader shares and the one
 * Slide reader the Spec check, the feedback check and the review server use.
 * It imports nothing but `cheerio`, so the new-episode scripts run it under
 * bare node.
 */

import { load } from 'cheerio';

/** The Spec page, relative to the Episode's staging folder. */
export const SPEC_FILE = 'spec/spec.html';
export const SECTION = 'section[data-spec="section"]';
export const SLIDE = 'article[data-spec="slide"]';
export const OPTION = 'figure[data-spec="option"]';

/** One Slide of the Spec: the Section it sits in, its slug and its Option ids in page order. */
export interface SpecSlide {
  section: string;
  slug: string;
  options: readonly string[];
}

/** The Spec's Slides inside a Section, in page order; a Slide in no Section has no anchor, so it is no Slide here. */
export function specSlides(html: string): SpecSlide[] {
  const $ = load(html);
  return $(`${SECTION} ${SLIDE}`)
    .toArray()
    .map((slide) => ({
      section: $(slide).closest(SECTION).attr('id') ?? '',
      slug: $(slide).attr('id') ?? '',
      options: $(slide)
        .find(OPTION)
        .toArray()
        .map((option) => $(option).attr('data-option') ?? ''),
    }));
}

/** The page Slide anchors of a Spec, `<section id>--<slide id>` in page order, as feedback items key them. */
export function specSlideAnchors(html: string): string[] {
  return specSlides(html).map(({ section, slug }) => `${section}--${slug}`);
}
