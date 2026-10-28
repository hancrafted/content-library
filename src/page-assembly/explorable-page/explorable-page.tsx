import { routeOf, type PageOf } from '@/content-store/catalogue/record-routes';
import {
  explorablePageAt,
  explorablePageVideo,
  treatmentOf,
  type ExplorablePageParams,
  type RouteParams,
} from '@/content-store/store';
import { EpisodePageContainer } from '@/episodes/components/episode-page/episode-page-container';
import { compositionOf } from '@/episodes/lib/registry';
import type { PageCopy } from '@/page-assembly/lib/page-metadata.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { notFound } from 'next/navigation';

/** An Explorable page: the page reference carrying its composition's ref. */
export type ExplorablePageRef = PageOf<'explorable-page'>;

/** The page the page catalogue builds at `/explorables/<slug>/`, else the 404. */
export function explorablePageOf(params: RouteParams<ExplorablePageParams>): ExplorablePageRef {
  return explorablePageAt(params) ?? notFound();
}

/**
 * An Explorable page (FE-007 §1): an `episode()` composition rendered through the one Episode container, so it has the
 * table of contents, the Context drawer and, from its record's `youtube`, the Video its Title slide plays.
 */
export function ExplorablePage({ page, locale }: { page: ExplorablePageRef; locale: Locale }) {
  const { explorablePage } = page;
  return (
    <EpisodePageContainer
      locale={locale}
      page={explorablePage}
      episode={compositionOf(explorablePage)}
      video={explorablePageVideo(explorablePage.slug, locale)}
      frame={{ route: routeOf(page) }}
    />
  );
}

/** An Explorable page's title, description and treatment for `pageMetadata` (FE-008): its words are its composition's. */
export function explorablePageCopy(page: ExplorablePageRef, locale: Locale): PageCopy {
  const { title, description } = compositionOf(page.explorablePage).messages[locale];
  return { title, description, treatment: treatmentOf(page) };
}
