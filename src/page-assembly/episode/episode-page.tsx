import { EpisodePageContainer } from '@/components/episode-page/episode-page-container';
import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import { findEpisodesPathPage, findToolingPage } from '@/components/episodes/tooling-pages';
import {
  eventEpisodeChrome,
  EventEpisodeHeader,
  PlaylistNav,
  type PresentedEpisode,
} from '@/components/events/event-episode-chrome';
import { JsonLdScript } from '@/components/json-ld';
import { episodePublishedOn, episodeStatus, episodeVideo, findEvent, treatmentOf } from '@/content-store/store';
import { BUILD_DAY } from '@/lib/build-day';
import { episodeRefOf } from '@/lib/episode-id.pure';
import type { Locale } from '@/lib/locale.pure';
import {
  eventEpisodeRoute,
  isEventSlug,
  matchPage,
  type EpisodeId,
  type EpisodesPathPage,
  type PageOf,
} from '@/lib/routes';
import { SITE_URL } from '@/lib/site-url';
import type { PageCopy } from '@/page-assembly/lib/page-metadata.pure';
import { episodeJsonLd } from '@/page-assembly/lib/structured-data.pure';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Every page the one Episode page template renders, told apart by kind: an Episode's own page under `/episodes/`, a
 * tooling page beside them, and an Episode as an Event presents it under `/events/<event>/episodes/`.
 */
export type EpisodePageRef = PageOf<'episode' | 'tooling' | 'event-episode'>;

/** The page a slug under `/episodes/` names, when the page catalogue builds one there; else no page. */
export function episodesPathPageOf(slug: string): EpisodesPathPage {
  const page = findEpisodesPathPage(slug);
  if (!treatmentOf(page).exported) notFound();
  return page;
}

/**
 * The Event and the Episode a page under it shows, with its place: an Event's copy, or a public Episode its Playlist
 * lists. A pair its Playlist does not hold is no page.
 */
function presented(eventSlug: string, matches: (episode: string) => boolean): PresentedEpisode {
  const event = findEvent(eventSlug);
  const entry = event?.playlist.episodes.find(({ page }) => page !== undefined && matches(page));
  if (event === undefined || entry?.page === undefined) notFound();
  return { event, episode: entry.page, place: entry.place };
}

/** The page at `/events/<event>/episodes/<slug>/`, naming its Episode by id; a pair no Playlist holds is no page. */
export function eventEpisodePageOf(event: string, slug: string): PageOf<'event-episode'> {
  if (!isEventSlug(event)) notFound();
  const { episode } = presented(event, (page) => episodeRefOf(page).slug === slug);
  return { kind: 'event-episode', event, episode };
}

/** The insets every Slide wrapper takes, so the Event's chrome lines up with the Slides (FE-009 §2). */
const INSET = 'pl-(--inset-l) pr-(--inset-r)';

/**
 * Every Episode-shaped page (FE-007 §1), rendered through the one container (FE-002): an Episode's own page with its
 * structured data once published, a tooling page with none, and an Episode under its Event framed by the Event.
 */
export function EpisodePage({ page, locale }: { page: EpisodePageRef; locale: Locale }) {
  return matchPage<EpisodePageRef, ReactNode>(page, {
    tooling: ({ tooling }) => <EpisodePageContainer locale={locale} id={tooling} episode={findToolingPage(tooling)} />,
    episode: ({ episode }) => <OwnEpisodePage id={episode} locale={locale} />,
    'event-episode': (eventEpisode) => <EpisodeUnderEvent page={eventEpisode} locale={locale} />,
  });
}

/** An Episode's own page: the container, with its recording, and its structured data once published. */
function OwnEpisodePage({ id, locale }: { id: EpisodeId; locale: Locale }) {
  const { title, description } = episodeCopy(id, locale);
  const video = episodeVideo(id, locale);
  const data =
    episodeStatus(id) === 'published'
      ? episodeJsonLd(SITE_URL, locale, {
          slug: id,
          title,
          description,
          publishedOn: episodePublishedOn(id),
          youtube: video?.id,
        })
      : undefined;
  return (
    <>
      {data && <JsonLdScript data={data} />}
      <EpisodePageContainer locale={locale} id={id} episode={findEpisode(id)} video={video} />
    </>
  );
}

/**
 * An Episode as an Event presents it (design-ADR 0016, Routes and visibility): the Episode's own page through the
 * container, framed by the Event's breadcrumb and past notice above the Title slide, "Episode n of m" under the title,
 * and the Playlist walk after the last Slide. Its structured data stays on the Episode's own page.
 */
async function EpisodeUnderEvent({ page, locale }: { page: PageOf<'event-episode'>; locale: Locale }) {
  const shown = presented(page.event, (episode) => episode === page.episode);
  const chrome = await eventEpisodeChrome(shown, locale);
  const frame = {
    route: eventEpisodeRoute(shown.event.slug, shown.episode),
    header: <EventEpisodeHeader chrome={chrome} buildDay={BUILD_DAY} className={INSET} />,
    footer: <PlaylistNav chrome={chrome} className={INSET} />,
    position: chrome.position,
  };
  return (
    <EpisodePageContainer
      locale={locale}
      id={shown.episode}
      episode={findEpisode(shown.episode)}
      video={episodeVideo(shown.episode, locale)}
      frame={frame}
    />
  );
}

/**
 * An Episode-shaped page's title, description, treatment and release date, for `pageMetadata` (FE-008): an Episode's,
 * under `/episodes/` or its Event, read through the registry and the content store; a tooling page's from its own
 * record. The treatment, which decides robots and canonical, is the page catalogue's.
 */
export function episodePageCopy(page: EpisodePageRef, locale: Locale): PageCopy {
  const treatment = treatmentOf(page);
  const episodeOf = ({ episode }: { episode: EpisodeId }): PageCopy => {
    const { title, description } = episodeCopy(episode, locale);
    const publishedOn = episodePublishedOn(episode);
    return { title, description, treatment, ...(publishedOn ? { publishedOn } : {}) };
  };
  return matchPage<EpisodePageRef, PageCopy>(page, {
    tooling: ({ tooling }) => {
      const { title, description } = findToolingPage(tooling).messages[locale];
      return { title, description, treatment };
    },
    episode: episodeOf,
    'event-episode': episodeOf,
  });
}
