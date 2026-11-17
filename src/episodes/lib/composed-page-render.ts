import type { ComposedId } from '@/content-store/catalogue/record-routes';
import { tocSectionsOf } from '@/episodes/components/episode-page/episode-page-container.pure';
import { recordContent } from '@/episodes/components/episode-page/record-content';
import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import { headerModeOf, type EpisodeComposition, type Slide } from '@/episodes/components/slide-master/slide';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ComposedPage } from './composed-page';
import { placeSections } from './episode.pure';

/*
 * A copied Slide must never break `aria-labelledby` (#51): the same layout may sit twice on one page, so every DOM id
 * a Slide renders comes from `useId`, not from a string written in its Scene. These render one page's Slides twice
 * into one page, each copy with its own kit, and pass an Explorable page through the container, for its
 * Episode-level checks (`composed-page-checks.ts`).
 */

/** The Slides a page renders, in order: a Section without a section slide has none to render. */
export function renderedSlides(composition: EpisodeComposition): Slide[] {
  const rendered = placeSections<Slide>(composition.sections).flat();
  return composition.sections.flat().filter((slide) => rendered.some((entry) => entry.slide === slide));
}

/** A Slide's Scene as its page renders it in English, rendered twice into one page, each copy with its own kit. */
export function twiceRendered(id: ComposedId, composition: EpisodeComposition, slide: Slide): string {
  const placed = placeSections<Slide>(composition.sections).flat();
  const own = placed.find((entry) => entry.slide === slide);
  if (own === undefined) throw new Error(`No Slide "${slide.slug}" in "${id}".`);
  const scene = () =>
    localizeSlide(own, {
      episode: id,
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
    repeated(idsOf(twiceRendered(page.id, composition, slide))).map((id) => `${slide.slug}: id "${id}" repeats`),
  );
}

/** The translator stand-in: the only string `recordContent` reads from it is the Context reference label. */
async function labelOnly() {
  const read = () => 'opens speaker note';
  return Object.assign(read, { rich: read, markup: read, raw: read, has: () => true });
}

/** A Section an Explorable page loses through the container: its table-of-contents entry, or its no-section-slide flag. */
export async function containerLosses(page: ComposedPage, composition: EpisodeComposition): Promise<string[]> {
  const declared = composition.sections.filter((section) => section.sectionSlide === false).length;
  const content = await recordContent(composition, 'en', {
    translatorOf: labelOnly,
    id: page.id,
    route: `/explorables/${page.slug}`,
  });
  const flagged = content.slides.filter((entry) => entry.withoutSectionSlide === true).length;
  const entries = tocSectionsOf(content.slides).length;
  return [
    ...(flagged === declared ? [] : [`${flagged} Slides flagged without a section slide, ${declared} declared`]),
    ...(entries === composition.sections.length
      ? []
      : [`${entries} contents entries for ${composition.sections.length} Sections`]),
  ];
}
