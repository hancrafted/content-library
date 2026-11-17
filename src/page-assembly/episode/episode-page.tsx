import type { EpisodeRef, StandaloneRef } from '@/content-store/catalogue/episode-id.pure';
import { matchPage, type EpisodeId, type EpisodesPathPage } from '@/content-store/catalogue/record-routes';
import {
  episodePublishedOn,
  episodesPathPageAt,
  episodeStatus,
  episodeVideo,
  eventEpisodePageAt,
  treatmentOf,
  type EpisodesPathParams,
  type EventEpisodePage,
  type EventEpisodeParams,
  type RouteParams,
} from '@/content-store/store';
import { EpisodePageContainer } from '@/episodes/components/episode-page/episode-page-container';
import type { EpisodeComposition } from '@/episodes/components/slide-master/slide';
import { summaryOf } from '@/episodes/lib/page-summary';
import { eventEpisodeFrame } from '@/events/components/event-episode-frame';
import { BUILD_DAY } from '@/page-assembly/lib/build-day';
import type { PageCopy } from '@/page-assembly/lib/page-metadata.pure';
import { episodeJsonLd } from '@/page-assembly/lib/structured-data.pure';
import { JsonLdScript } from '@/shared/components/json-ld';
import type { Locale } from '@/shared/lib/locale.pure';
import { SITE_URL } from '@/shared/lib/site-url';
import type { TocPageContext } from '@/shared/lib/table-of-contents.pure';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { episodeContextOf, eventNavigationOf } from './event-navigation.pure';

export type EpisodePageRef = EpisodesPathPage | EventEpisodePage;

export function episodesPathPageOf(params: RouteParams<EpisodesPathParams>): EpisodesPathPage {
  return episodesPathPageAt(params) ?? notFound();
}

export function eventEpisodePageOf(params: RouteParams<EventEpisodeParams>): EventEpisodePage {
  return eventEpisodePageAt(params) ?? notFound();
}

// decision: FE-007 §1
// decision: FE-007 §1.3
// decision: FE-002 §1
export async function EpisodePage({
  page,
  composition,
  locale,
}: {
  page: EpisodePageRef;
  composition: EpisodeComposition;
  locale: Locale;
}) {
  if (composition.slug !== page.episode.slug)
    throw new Error(`The route for "${page.episode.id}" hands in the composition of "${composition.slug}"`);
  const t = await getTranslations({ locale, namespace: 'nav' });
  const context = episodeContextOf(page, locale, t('episodes'));
  return matchPage<EpisodePageRef, ReactNode>(page, {
    episode: ({ episode }) => (
      <OwnEpisodePage episode={episode} composition={composition} locale={locale} context={context} />
    ),
    'event-episode': (eventEpisode) => (
      <EpisodeUnderEvent page={eventEpisode} composition={composition} locale={locale} context={context} />
    ),
  });
}

function OwnEpisodePage({
  episode,
  composition,
  locale,
  context,
}: {
  episode: StandaloneRef<EpisodeId>;
  composition: EpisodeComposition;
  locale: Locale;
  context: TocPageContext;
}) {
  const { title, description } = composition.messages[locale];
  const video = episodeVideo(episode, locale);
  const data =
    episodeStatus(episode) === 'published'
      ? episodeJsonLd(SITE_URL, locale, {
          slug: episode.slug,
          title,
          description,
          publishedOn: episodePublishedOn(episode),
          youtube: video?.id,
        })
      : undefined;
  return (
    <>
      {data && <JsonLdScript data={data} />}
      <EpisodePageContainer locale={locale} page={episode} episode={composition} video={video} tocPage={context} />
    </>
  );
}

// decision: docs/decision-records/0016-content-data-model.md
function EpisodeUnderEvent({
  page,
  composition,
  locale,
  context,
}: {
  page: EventEpisodePage;
  composition: EpisodeComposition;
  locale: Locale;
  context: TocPageContext;
}) {
  const shown = page.presented;
  const titleOf = (episode: EpisodeRef<EpisodeId>) => summaryOf(episode)[locale].title;
  return (
    <EpisodePageContainer
      locale={locale}
      page={shown.episode}
      episode={composition}
      video={episodeVideo(shown.episode, locale)}
      tocPage={context}
      frame={{
        ...eventEpisodeFrame(shown, { locale, titleOf, buildDay: BUILD_DAY }),
        navigation: eventNavigationOf(shown.event, locale),
      }}
    />
  );
}

// decision: FE-008 §1
export function episodePageCopy(page: EpisodePageRef, locale: Locale): PageCopy {
  const treatment = treatmentOf(page);
  const episodeOf = ({ episode }: { episode: EpisodeRef<EpisodeId> }): PageCopy => {
    const { title, description } = summaryOf(episode)[locale];
    const publishedOn = episodePublishedOn(episode);
    return { title, description, treatment, ...(publishedOn ? { publishedOn } : {}) };
  };
  return matchPage<EpisodePageRef, PageCopy>(page, { episode: episodeOf, 'event-episode': episodeOf });
}
