import { EpisodePageContainer } from '@/components/episode-page/episode-page-container';
import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import {
  eventEpisodeChrome,
  EventEpisodeHeader,
  PlaylistNav,
  type PresentedEpisode,
} from '@/components/events/event-episode-chrome';
import { episodePublishedOn, episodeVideo, findEvent, treatmentOf } from '@/content-store/store';
import { BUILD_DAY } from '@/lib/build-day';
import { episodeRefOf } from '@/lib/episode-id.pure';
import type { Locale } from '@/lib/locale.pure';
import type { PageCopy } from '@/lib/page-metadata.pure';
import { eventEpisodeRoute, isEventSlug, type PageOf } from '@/lib/routes';
import { notFound } from 'next/navigation';

/** The insets every Slide wrapper takes, so the Event's chrome lines up with the Slides (FE-009 §2). */
const INSET = 'pl-(--inset-l) pr-(--inset-r)';

/**
 * The Event and the Episode a page under it shows at that slug, with its place: an Event's copy, or a public Episode
 * its Playlist lists. A pair its Playlist does not hold is no page.
 */
function presented(eventSlug: string, slug: string): PresentedEpisode {
  const event = findEvent(eventSlug);
  const entry = event?.playlist.episodes.find(({ page }) => page !== undefined && episodeRefOf(page).slug === slug);
  if (event === undefined || entry?.page === undefined) notFound();
  return { event, episode: entry.page, place: entry.place };
}

/** The page at `/events/<event>/episodes/<slug>/`, naming its Episode by id; a pair no Playlist holds is no page. */
export function eventEpisodePage(event: string, slug: string): PageOf<'event-episode'> {
  if (!isEventSlug(event)) notFound();
  return { kind: 'event-episode', event, episode: presented(event, slug).episode };
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
      id={shown.episode}
      episode={composition}
      video={episodeVideo(shown.episode, locale)}
      frame={frame}
    />
  );
}

/**
 * An Event-scoped Episode page's title, description and treatment, for `pageMetadata` (FE-008): the Episode's own
 * copy, and the page catalogue's treatment, which decides whether it is `noindex` or its own page takes the credit.
 */
export function eventEpisodePageCopy(page: PageOf<'event-episode'>, locale: Locale): PageCopy {
  const { title, description } = episodeCopy(page.episode, locale);
  const publishedOn = episodePublishedOn(page.episode);
  return {
    title,
    description,
    treatment: treatmentOf(page),
    ...(publishedOn ? { publishedOn } : {}),
  };
}
