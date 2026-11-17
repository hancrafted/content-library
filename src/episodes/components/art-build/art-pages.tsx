import type { ComposedId } from '@/content-store/catalogue/record-routes';
import {
  localizeSlide,
  localizeTitleScene,
  type EpisodeContext,
} from '@/episodes/components/slide-master/localized-slide';
import { headerModeOf, type EpisodeComposition, type Slide } from '@/episodes/components/slide-master/slide';
import { EPISODES, EXPLORABLE_PAGES, GUIDES, TEMPLATE_PAGES } from '@/episodes/lib/episode-registry.generated';
import { placeSections } from '@/episodes/lib/episode.pure';
import { LOCALES, type Locale } from '@/shared/lib/locale.pure';
import { createElement, Fragment, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// decision: FE-005 §5
// decision: docs/adr/0025-scene-figures-are-deep-modules.md
export interface ArtPage {
  readonly page: string;
  readonly markup: () => string;
}

const LABELS = { ref: 'reference', marker: (title: string) => title };
const COMPOSITIONS: Readonly<Record<ComposedId, EpisodeComposition>> = {
  ...EPISODES,
  ...TEMPLATE_PAGES,
  ...EXPLORABLE_PAGES,
  ...GUIDES,
};

const html = (node: ReactNode) => renderToStaticMarkup(createElement(Fragment, null, node));

function* pageSlides(id: ComposedId, composition: EpisodeComposition, locale: Locale): Generator<ArtPage> {
  const placed = placeSections<Slide>(composition.sections).flat();
  const standInRoute = `/${id}`;
  const episode: EpisodeContext = {
    episode: id,
    route: standInRoute,
    locale,
    placed,
    referenceLabels: LABELS,
    header: headerModeOf(composition),
  };
  if (composition.title !== undefined) {
    const title = composition.title;
    yield { page: `${id} ${locale} title`, markup: () => html(localizeTitleScene(title, episode)) };
  }
  for (const entry of placed) {
    const { rear, front } = entry.slide.presentation ?? {};
    const markup = () => html(localizeSlide(entry, episode).content) + html(rear) + html(front);
    yield { page: `${id} ${locale} ${entry.slide.slug}`, markup };
  }
}

export function* artPages(): Generator<ArtPage> {
  for (const [id, composition] of Object.entries(COMPOSITIONS) as [ComposedId, EpisodeComposition][]) {
    for (const locale of LOCALES) yield* pageSlides(id, composition, locale);
  }
}
