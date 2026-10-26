import { FEATURED } from '@/lib/episode-overview';
import type { Locale } from '@/lib/locale.pure';
import { matchPage, type EpisodeSlug, type PageRef } from '@/lib/routes';
import { pageTreatment, type PageFacts } from '@/lib/visibility.pure';
import { EPISODE_METADATA, UPCOMING_METADATA } from './episode-registry.generated';
import { event as axelAgenticWorkflowEvent } from './events/2026-10-23-axel-agentic-workflow';
import { event as cyberforumAkademieIntroAgenticWorkflowEvent } from './events/2026-10-28-cyberforum-akademie-intro-agentic-workflow';
import { playlist as axelAgenticWorkflowPlaylist } from './playlists/axel-agentic-workflow';
import { playlist as cyberforumAkademieIntroAgenticWorkflowPlaylist } from './playlists/cyberforum-akademie-intro-agentic-workflow';
import { checkRecords, parseRecords, type Content, type ContentInput } from './refusals';
import type { Episode, EpisodeStatus } from './schemas/episode.schema';
import type { EventInput } from './schemas/event.schema';
import type { IsoDate } from './schemas/fields';
import type { PlaylistInput } from './schemas/playlist.schema';
import type { ServedEvent } from './served-event';

/*
 * The content store's one entry (FE-013): every record — Episode metadata, Event, Playlist — is collected here, parsed
 * by its schema and checked against the others when this module loads. Episode metadata arrives through the generated
 * Episode registry (`./episode-registry.generated.ts`, one entry per Episode folder), Events and Playlists by explicit
 * import. A bad record throws, so the build and the fast suite stop. Pages, routes, the sitemap and metadata read
 * records only through the functions below. The one seam a database would replace.
 */

const EVENTS: readonly EventInput[] = [axelAgenticWorkflowEvent, cyberforumAkademieIntroAgenticWorkflowEvent];
const PLAYLISTS: readonly PlaylistInput[] = [
  axelAgenticWorkflowPlaylist,
  cyberforumAkademieIntroAgenticWorkflowPlaylist,
];

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
  const parsed = parseRecords(input);
  if (parsed.refused.length > 0) throw refusal(parsed.refused);
  const { content, refused } = checkRecords(parsed.content);
  if (refused.length > 0) throw refusal(refused);
  return content;
}

function refusal(sentences: readonly string[]): Error {
  return new Error(`The content store refused a record:\n${sentences.map((sentence) => `- ${sentence}`).join('\n')}`);
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

/** Every Episode's metadata: those with a page, then the upcoming ones without, each in folder-name order. */
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

export type { PlaylistPlace, ServedEvent } from './served-event';

/**
 * Every Event, in record order, each served whole: its slug names a page, and its Playlist's Episodes come resolved
 * in order, each with its place. An Event page and its Event-scoped Episode pages read this one value.
 */
export function listEvents(): readonly ServedEvent[] {
  return CONTENT.events;
}

/** One Event by slug; undefined when no Event carries it. */
export function findEvent(slug: string): ServedEvent | undefined {
  return CONTENT.events.find((event) => event.slug === slug);
}

/**
 * What a page presents, for the visibility predicate (`pageTreatment`), read from the given records: an Episode's
 * visibility and status, on its own page or under an Event; an Event page's Playlist visibility; nothing for a page
 * that presents no record. An Episode or Event the records do not hold hands in nothing, so the page fails closed.
 */
export function pageFactsIn(content: Content, page: PageRef): PageFacts {
  const none = (): PageFacts => ({});
  const episodeFacts = ({ episode: slug }: { readonly episode: EpisodeSlug }): PageFacts => {
    const episode = content.episodes.find((entry) => entry.slug === slug);
    return episode === undefined ? {} : { visibility: episode.visibility, status: episode.status };
  };
  return matchPage(page, {
    home: none,
    dashboard: none,
    episodes: none,
    events: none,
    episode: episodeFacts,
    tooling: none,
    event: ({ event: slug }) => {
      const event = content.events.find((entry) => entry.slug === slug);
      return event === undefined ? {} : { visibility: event.playlist.visibility };
    },
    'event-episode': episodeFacts,
  });
}

/** What a page presents, for the visibility predicate: the sitemap, page metadata and static params all ask this. */
export function pageFacts(page: PageRef): PageFacts {
  return pageFactsIn(CONTENT, page);
}

/**
 * The Events `/events/` lists, in record order, read from the given records: those whose page the visibility
 * predicate puts on the site's lists (a public Playlist).
 */
export function listedEventsIn(content: Content): readonly ServedEvent[] {
  return content.events.filter((event) => {
    const page = { kind: 'event', event: event.slug } as const;
    return pageTreatment(page, pageFactsIn(content, page)).listed;
  });
}

/** The Events `/events/` lists. */
export function listedEvents(): readonly ServedEvent[] {
  return listedEventsIn(CONTENT);
}
