import { FEATURED } from '@/lib/episode-overview';
import type { Locale } from '@/lib/locale.pure';
import {
  isEpisodePage,
  isEventEpisodePage,
  isEventPage,
  isEventSlug,
  type EpisodeSlug,
  type EventSlug,
  type PageRef,
} from '@/lib/routes';
import { pageTreatment, type PageFacts } from '@/lib/visibility.pure';
import { EPISODE_METADATA, UPCOMING_METADATA } from './episode-registry.generated';
import { event as axelAgenticWorkflowEvent } from './events/2026-10-23-axel-agentic-workflow';
import { event as cyberforumAkademieIntroAgenticWorkflowEvent } from './events/2026-10-28-cyberforum-akademie-intro-agentic-workflow';
import { playlist as axelAgenticWorkflowPlaylist } from './playlists/axel-agentic-workflow';
import { playlist as cyberforumAkademieIntroAgenticWorkflowPlaylist } from './playlists/cyberforum-akademie-intro-agentic-workflow';
import { crossRecordRefusals, parseRecords, type Content, type ContentInput } from './refusals';
import type { Episode, EpisodeStatus } from './schemas/episode.schema';
import type { Event } from './schemas/event.schema';
import type { IsoDate } from './schemas/fields';
import type { Playlist } from './schemas/playlist.schema';

/*
 * The content store's one entry (FE-013): every record — Episode metadata, Event, Playlist — is collected here, parsed
 * by its schema and checked against the others when this module loads. An Episode's metadata arrives through the
 * generated Episode registry (`./episode-registry.generated.ts`, one entry per Episode folder); Events and Playlists by explicit
 * import. A bad record throws, so the build and the fast suite stop. Pages, routes, the sitemap and metadata read
 * records only through the functions below. The one seam a database would replace.
 */

const EVENTS = [axelAgenticWorkflowEvent, cyberforumAkademieIntroAgenticWorkflowEvent];
const PLAYLISTS = [axelAgenticWorkflowPlaylist, cyberforumAkademieIntroAgenticWorkflowPlaylist];

/** The slugs whose metadata says `published`. */
type PublishedSlug = {
  [S in keyof typeof EPISODE_METADATA]: (typeof EPISODE_METADATA)[S]['status'] extends 'published' ? S : never;
}[keyof typeof EPISODE_METADATA];

/**
 * Every record parsed and checked, or a thrown error listing every refusal, one sentence each naming its kind, its
 * record and its field. Cross-record rules run only once every record parses, so a refusal never rests on a record
 * that is itself refused.
 */
export function loadContent(input: ContentInput): Content {
  const { content, refused } = parseRecords(input);
  const refusals = refused.length > 0 ? refused : crossRecordRefusals(content);
  if (refusals.length > 0)
    throw new Error(`The content store refused a record:\n${refusals.map((sentence) => `- ${sentence}`).join('\n')}`);
  return content;
}

const CONTENT = loadContent({
  episodes: [...Object.values(EPISODE_METADATA), ...UPCOMING_METADATA],
  events: EVENTS,
  playlists: PLAYLISTS,
});

/** The Featured slugs, typed so `tsc` refuses one that names an upcoming Episode. */
export function featuredSlugs(): readonly PublishedSlug[] {
  return FEATURED;
}

/** Every Episode's metadata: the registered ones, then the upcoming ones in overview order. */
export function listEpisodes(options?: { includeDrafts?: boolean }): readonly Episode[] {
  if (options?.includeDrafts ?? true) return CONTENT.episodes;
  return CONTENT.episodes.filter((entry) => entry.status === 'published');
}

/** One registered Episode's metadata. A registered slug the store does not hold is a bug, so it throws. */
function episodeOf(slug: string): Episode {
  const episode = CONTENT.episodes.find((entry) => entry.slug === slug);
  if (!episode) throw new Error(`No Episode metadata lists the registered slug "${slug}"`);
  return episode;
}

/** The Episode's status. */
export function episodeStatus(slug: EpisodeSlug): EpisodeStatus {
  return episodeOf(slug).status;
}

/** The Episode's visibility: a public one has its own page; an unlisted one lives only under its Event. */
export function episodeVisibility(slug: EpisodeSlug): Episode['visibility'] {
  return episodeOf(slug).visibility;
}

/** The release date of a published Episode; undefined for an upcoming one or an unknown slug. */
export function episodePublishedOn(slug: string): IsoDate | undefined {
  const episode = CONTENT.episodes.find((entry) => entry.slug === slug);
  return episode?.status === 'published' ? episode.publishedOn : undefined;
}

/** The Video an Episode's page plays: its YouTube id and, for an Event recording, the language spoken in it. */
export interface Video {
  readonly id: string;
  /** Set only on an unlisted Episode's Event recording, which plays on every locale page labelled with it. */
  readonly recordedIn?: Locale;
}

/**
 * The Video an Episode's page plays in this locale; none until uploaded. An unlisted Episode's one recording plays on
 * every locale page, with the language it was recorded in (a site locale: the store refuses any other).
 */
export function episodeVideo(slug: EpisodeSlug, locale: Locale): Video | undefined {
  const video = episodeOf(slug).youtube;
  if (video === undefined) return undefined;
  if ('language' in video) return { id: video.id, recordedIn: video.language as Locale };
  const id = video[locale];
  return id === undefined ? undefined : { id };
}

/** An Event as the store serves it: its slug names a page of the hand-kept `EVENT_SLUGS`. */
export type ServedEvent = Event & { readonly slug: EventSlug };

/** Whether the Event has a page: its slug is one of `EVENT_SLUGS`. */
function isServed(event: Event): event is ServedEvent {
  return isEventSlug(event.slug);
}

/** Every Event, each with a page; one missing from `EVENT_SLUGS` throws, so the build and the fast suite stop. */
const SERVED_EVENTS: readonly ServedEvent[] = CONTENT.events.map((event) => {
  if (!isServed(event)) throw new Error(`Event ${event.slug} is missing from EVENT_SLUGS (src/lib/routes.ts)`);
  return event;
});

/** Every Event, in record order. */
export function listEvents(): readonly ServedEvent[] {
  return SERVED_EVENTS;
}

/** One Event by slug; undefined when no Event carries it. */
export function findEvent(slug: string): ServedEvent | undefined {
  return SERVED_EVENTS.find((event) => event.slug === slug);
}

/** The one Playlist an Event presents; the load refused any Event naming a missing one. */
export function playlistOf(event: Event): Playlist {
  const playlist = CONTENT.playlists.find((entry) => entry.id === event.playlist);
  if (!playlist) throw new Error(`Event ${event.slug}: playlist "${event.playlist}" does not exist`);
  return playlist;
}

/**
 * What a page presents, for the visibility predicate (`pageTreatment`), read from the given records: an Episode's
 * visibility and status, on its own page or under an Event; an Event page's Playlist visibility; nothing for a page
 * that presents no record. An Episode or Event the records do not hold hands in nothing, so the page fails closed.
 */
export function pageFactsIn(content: Content, page: PageRef): PageFacts {
  if (isEpisodePage(page) || isEventEpisodePage(page)) {
    const episode = content.episodes.find((entry) => entry.slug === page.episode);
    return episode === undefined ? {} : { visibility: episode.visibility, status: episode.status };
  }
  if (isEventPage(page)) {
    const event = content.events.find((entry) => entry.slug === page.event);
    const playlist = content.playlists.find((entry) => entry.id === event?.playlist);
    return playlist === undefined ? {} : { visibility: playlist.visibility };
  }
  return {};
}

/** What a page presents, for the visibility predicate: the sitemap, page metadata and static params all ask this. */
export function pageFacts(page: PageRef): PageFacts {
  return pageFactsIn(CONTENT, page);
}

/**
 * The Events `/events/` lists, in record order, read from the given records: those whose page the visibility
 * predicate puts on the site's lists (a public Playlist). An Event with no page in `EVENT_SLUGS` is listed nowhere.
 */
export function listedEventsIn(content: Content): readonly ServedEvent[] {
  return content.events.filter(isServed).filter((event) => {
    const page = { event: event.slug };
    return pageTreatment(page, pageFactsIn(content, page)).listed;
  });
}

/** The Events `/events/` lists. */
export function listedEvents(): readonly ServedEvent[] {
  return listedEventsIn(CONTENT);
}
