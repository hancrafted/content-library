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

export type BuiltExplorablePage = PageOf<'explorable-page'>;

export function explorablePageOf(params: RouteParams<ExplorablePageParams>): BuiltExplorablePage {
  return explorablePageAt(params) ?? notFound();
}

// decision: FE-007 §1
export function ExplorablePage({ page, locale }: { page: BuiltExplorablePage; locale: Locale }) {
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

// decision: FE-008 §1
export function explorablePageCopy(page: BuiltExplorablePage, locale: Locale): PageCopy {
  const { title, description } = compositionOf(page.explorablePage).messages[locale];
  return { title, description, treatment: treatmentOf(page) };
}
