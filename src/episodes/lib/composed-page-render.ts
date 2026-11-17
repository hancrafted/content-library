import type { ComposedId } from '@/content-store/catalogue/record-routes';
import { tocSectionsOf } from '@/episodes/components/episode-page/episode-page-container.pure';
import { recordContent } from '@/episodes/components/episode-page/record-content';
import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import { headerModeOf, type EpisodeComposition, type Slide } from '@/episodes/components/slide-master/slide';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ComposedPage } from './composed-page';
import { placeSections } from './episode.pure';

export function renderedSlides(composition: EpisodeComposition): Slide[] {
  const rendered = placeSections<Slide>(composition.sections).flat();
  return composition.sections.flat().filter((slide) => rendered.some((entry) => entry.slide === slide));
}

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

export function idsOf(html: string): string[] {
  return [...html.matchAll(/(?<![\w-])id="([^"]+)"/g)].map(([, id]) => id);
}

function repeated(ids: readonly string[]): string[] {
  return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
}

export function repeatedIds(page: ComposedPage, composition: EpisodeComposition): string[] {
  return renderedSlides(composition).flatMap((slide) =>
    repeated(idsOf(twiceRendered(page.id, composition, slide))).map((id) => `${slide.slug}: id "${id}" repeats`),
  );
}

async function labelOnly() {
  const read = () => 'opens speaker note';
  return Object.assign(read, { rich: read, markup: read, raw: read, has: () => true });
}

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
