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
import { compositionOf } from '@/episodes/lib/registry';
import { eventEpisodeFrame } from '@/events/components/event-episode-frame';
import { BUILD_DAY } from '@/page-assembly/lib/build-day';
import type { PageCopy } from '@/page-assembly/lib/page-metadata.pure';
import { episodeJsonLd } from '@/page-assembly/lib/structured-data.pure';
import { JsonLdScript } from '@/shared/components/json-ld';
import type { Locale } from '@/shared/lib/locale.pure';
import { SITE_URL } from '@/shared/lib/site-url';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Every page the Episode page template renders, told apart by kind: an Episode's own page under `/episodes/`, and an
 * Episode as an Event presents it under `/events/<event>/episodes/`, carrying the Episode it presents there. A
 * Resource page renders through the same container, from its own template (`../resource/`).
 */
export type EpisodePageRef = EpisodesPathPage | EventEpisodePage;

/** The page the page catalogue builds at `/episodes/<episode>/`: an Episode's own; else the 404. */
export function episodesPathPageOf(params: RouteParams<EpisodesPathParams>): EpisodesPathPage {
  return episodesPathPageAt(params) ?? notFound();
}

/** The page the page catalogue builds at `/events/<event>/episodes/<episode>/`, with its Episode; else the 404. */
export function eventEpisodePageOf(params: RouteParams<EventEpisodeParams>): EventEpisodePage {
  return eventEpisodePageAt(params) ?? notFound();
}

/**
 * Every Episode-shaped page (FE-007 §1), rendered through the one container (FE-002): an Episode's own page with its
 * structured data once published, and an Episode under its Event framed by the Event.
 */
export function EpisodePage({ page, locale }: { page: EpisodePageRef; locale: Locale }) {
  return matchPage<EpisodePageRef, ReactNode>(page, {
    episode: ({ episode }) => <OwnEpisodePage episode={episode} locale={locale} />,
    'event-episode': (eventEpisode) => <EpisodeUnderEvent page={eventEpisode} locale={locale} />,
  });
}

/** An Episode's own page: the container, with its recording, and its structured data once published. */
function OwnEpisodePage({ episode, locale }: { episode: StandaloneRef<EpisodeId>; locale: Locale }) {
  const composition = compositionOf(episode);
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
      <EpisodePageContainer locale={locale} page={episode} episode={composition} video={video} />
    </>
  );
}

/**
 * An Episode as an Event presents it (design-ADR 0016, Routes and visibility): the Episode's own page through the
 * container, framed by the Event's breadcrumb and past notice above the Title slide, "Episode n of m" under the title,
 * and the Playlist walk after the last Slide. Its structured data stays on the Episode's own page.
 */
function EpisodeUnderEvent({ page, locale }: { page: EventEpisodePage; locale: Locale }) {
  const shown = page.presented;
  const titleOf = (episode: EpisodeRef<EpisodeId>) => compositionOf(episode).messages[locale].title;
  return (
    <EpisodePageContainer
      locale={locale}
      page={shown.episode}
      episode={compositionOf(shown.episode)}
      video={episodeVideo(shown.episode, locale)}
      frame={eventEpisodeFrame(shown, { locale, titleOf, buildDay: BUILD_DAY })}
    />
  );
}

/**
 * An Episode-shaped page's title, description, treatment and release date, for `pageMetadata` (FE-008): an Episode's,
 * under `/episodes/` or its Event, read through the registry and the content store. The treatment, which decides robots and canonical, is the page catalogue's.
 */
export function episodePageCopy(page: EpisodePageRef, locale: Locale): PageCopy {
  const treatment = treatmentOf(page);
  const episodeOf = ({ episode }: { episode: EpisodeRef<EpisodeId> }): PageCopy => {
    const { title, description } = compositionOf(episode).messages[locale];
    const publishedOn = episodePublishedOn(episode);
    return { title, description, treatment, ...(publishedOn ? { publishedOn } : {}) };
  };
  return matchPage<EpisodePageRef, PageCopy>(page, {
    episode: episodeOf,
    'event-episode': episodeOf,
  });
}
