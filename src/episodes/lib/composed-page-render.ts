import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import { headerModeOf, type EpisodeComposition, type Slide } from '@/episodes/components/slide-master/slide';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ComposedPage } from './composed-page';
import { placeSections } from './episode.pure';

/*
 * A copied Slide must never break `aria-labelledby` (#51): the same layout may sit twice on one page, so every DOM id
 * a Slide renders comes from `useId`, not from a string written in its Scene. These render one page's Slides twice
 * into one page, each copy with its own kit, for its Episode-level checks (`composed-page-checks.ts`).
 */

/** The Slides a page renders, in order: a Section without a section slide has none to render. */
export function renderedSlides(composition: EpisodeComposition): Slide[] {
  const rendered = placeSections<Slide>(composition.sections).flat();
  return composition.sections.flat().filter((slide) => rendered.some((entry) => entry.slide === slide));
}

/** A Slide's Scene as its page renders it in English, rendered twice into one page, each copy with its own kit. */
export function twiceRendered(page: ComposedPage, composition: EpisodeComposition, slide: Slide): string {
  const placed = placeSections<Slide>(composition.sections).flat();
  const own = placed.find((entry) => entry.slide === slide);
  if (own === undefined) throw new Error(`No Slide "${slide.slug}" in "${page.id}".`);
  const scene = () =>
    localizeSlide(own, {
      episode: page.id,
      locale: 'en',
      placed,
      referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
      header: headerModeOf(composition),
    }).content;
  return renderToStaticMarkup(createElement(Fragment, null, scene(), scene()));
}

/** Every `id="..."` in rendered markup, in document order; `data-id` and the like are not DOM ids. */
export function idsOf(html: string): string[] {
  return [...html.matchAll(/(?<![\w-])id="([^"]+)"/g)].map(([, id]) => id);
}

/** The ids that appear more than once. */
function repeated(ids: readonly string[]): string[] {
  return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
}

/** Every DOM id a rendered Slide repeats when it sits twice on one page. */
export function repeatedIds(page: ComposedPage, composition: EpisodeComposition): string[] {
  return renderedSlides(composition).flatMap((slide) =>
    repeated(idsOf(twiceRendered(page, composition, slide))).map((id) => `${slide.slug}: id "${id}" repeats`),
  );
}
