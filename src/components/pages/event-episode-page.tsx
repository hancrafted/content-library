import { EpisodePageContainer } from '@/components/episode-page/episode-page-container';
import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import {
  eventEpisodeChrome,
  EventEpisodeHeader,
  PlaylistNav,
  type PresentedEpisode,
} from '@/components/events/event-episode-chrome';
import { episodePublishedOn, episodeVideo, findEvent, listEvents, pageFacts } from '@/content-store/store';
import { BUILD_DAY } from '@/lib/build-day';
import type { Locale } from '@/lib/locale.pure';
import type { PageCopy } from '@/lib/page-metadata.pure';
import { eventEpisodeRoute, type EpisodeSlug, type EventSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';

/** The insets every Slide wrapper takes, so the Event's chrome lines up with the Slides (FE-009 §2). */
const INSET = 'pl-(--inset-l) pr-(--inset-r)';

/**
 * One static param per Episode an Event's Playlist presents that has a page (FE-005): read from the Playlists through
 * the content store, so the route set is exactly what the Event pages link to.
 */
export function eventEpisodeParams(): { event: EventSlug; episode: EpisodeSlug }[] {
  return listEvents().flatMap((event) =>
    event.playlist.episodes.flatMap(({ page }) => (page === undefined ? [] : [{ event: event.slug, episode: page }])),
  );
}

/** The Event and the Episode a page under it shows, with its place; a pair its Playlist does not hold is no page. */
function presented(eventSlug: string, episode: string): PresentedEpisode {
  const event = findEvent(eventSlug);
  const entry = event?.playlist.episodes.find(({ page }) => page === episode);
  if (event === undefined || entry?.page === undefined) notFound();
  return { event, episode: entry.page, place: entry.place };
}

/**
 * An Episode as an Event presents it, at `/events/<event>/episodes/<episode>/` (design-ADR 0016, Routes and
 * visibility): the Episode's own page through the container (FE-002), framed by the Event's breadcrumb and past notice
 * above the Title slide, "Episode n of m" under the title, and the Playlist walk after the last Slide. Its structured
 * data stays on the Episode's own page.
 */
export async function EventEpisodePage({ event, episode, locale }: { event: string; episode: string; locale: Locale }) {
  const shown = presented(event, episode);
  const composition = findEpisode(shown.episode);
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
      episode={composition}
      video={episodeVideo(composition.slug, locale)}
      frame={frame}
    />
  );
}

/**
 * An Event-scoped Episode page's title, description and facts, for `pageMetadata` (FE-008): the Episode's own copy,
 * and its visibility and status, which decide whether it is `noindex` or its own page takes the search credit.
 */
export function eventEpisodePageCopy(event: EventSlug, episode: string, locale: Locale): PageCopy {
  const shown = presented(event, episode);
  const { slug } = findEpisode(shown.episode);
  const { title, description } = episodeCopy(slug, locale);
  const publishedOn = episodePublishedOn(slug);
  return {
    title,
    description,
    facts: pageFacts({ kind: 'event-episode', event, episode: slug }),
    ...(publishedOn ? { publishedOn } : {}),
  };
}
