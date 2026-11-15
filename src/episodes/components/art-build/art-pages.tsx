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

/*
 * The art build's view of the site (FE-005 §5, design-ADR 0025): every composed page's Slides in every locale,
 * rendered outside Next as `next dev` renders them, so each `<Art>` draws inline in a `data-art-source` group the bake
 * can find. `npm run art` loads this one module through Vite's SSR loader; nothing in the site imports it.
 */

/** One Slide, by where it comes from for an error to name, and its drawn markup: its Scene, rear and front decoration. */
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

/** Every Slide of one composed page in one locale, Title slide first. */
function* pageSlides(id: ComposedId, composition: EpisodeComposition, locale: Locale): Generator<ArtPage> {
  const placed = placeSections<Slide>(composition.sections).flat();
  // Links never reach a drawing, so every page takes one stand-in route.
  const route = `/${id}`;
  const episode: EpisodeContext = {
    episode: id,
    route,
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

/** Every Slide of every composed page: Episodes and their Event copies, Templates, Explorable pages and Guides. */
export function* artPages(): Generator<ArtPage> {
  for (const [id, composition] of Object.entries(COMPOSITIONS) as [ComposedId, EpisodeComposition][]) {
    for (const locale of LOCALES) yield* pageSlides(id, composition, locale);
  }
}
