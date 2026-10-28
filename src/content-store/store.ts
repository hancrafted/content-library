import type { Locale } from '@/shared/lib/locale.pure';
import type { EpisodeRef } from './catalogue/episode-id.pure';
import { catalogueOf } from './catalogue/page-catalogue';
import {
  EXPLORABLE_PAGE_SLUGS,
  RESOURCE_SLUGS,
  type EpisodeId,
  type ExplorablePageSlug,
} from './catalogue/record-routes';
import type { LoadedEpisode } from './episode-refusals';
import { EPISODE_METADATA, UPCOMING_METADATA } from './episode-registry.generated';
import { EVENT_RECORDS } from './event-registry.generated';
import { EXPLORABLE_PAGE_RECORDS, EXPLORABLE_SLUGS } from './explorable-page-registry.generated';
import { FEATURED } from './featured';
import { playlist as axelAgenticWorkflowPlaylist } from './playlists/axel-agentic-workflow';
import { playlist as cyberforumAkademieIntroAgenticWorkflowPlaylist } from './playlists/cyberforum-akademie-intro-agentic-workflow';
import { checkRecords, parseRecords, type Content, type ContentInput } from './refusals';
import { RESOURCE_RECORDS } from './resource-registry.generated';
import type { EpisodeStatus } from './schemas/episode.schema';
import type { EventInput } from './schemas/event.schema';
import type { ExplorablePageInput } from './schemas/explorable-page.schema';
import type { IsoDate } from './schemas/fields';
import type { PlaylistInput } from './schemas/playlist.schema';
import type { ResourceInput } from './schemas/resource.schema';
import type { ServedEvent } from './served-event';

/*
 * The content store's one entry (FE-013): every record — Episode metadata, Event, Playlist — is collected here, parsed
 * by its schema and checked against the others when this module loads. Episode metadata arrives through the generated
 * Episode registry (`./episode-registry.generated.ts`, one entry per Episode folder, keyed by the Episode id its
 * folder gives it), Events through the generated
 * Event registry (`./event-registry.generated.ts`, one entry per Event file), Resources through theirs
 * (`./resource-registry.generated.ts`, one per Resource file, checked against the composition folders), Explorable pages through
 * theirs (`./explorable-page-registry.generated.ts`, checked against the composition folders and the Explorables), Playlists by explicit import. A bad
 * record throws, so the build and the fast suite stop. Pages, routes, the sitemap and metadata read records only
 * through the functions below, and every page through the page catalogue served here. The one seam a database would
 * replace.
 */

const EVENTS: readonly EventInput[] = Object.values(EVENT_RECORDS);
const RESOURCES: readonly ResourceInput[] = Object.values(RESOURCE_RECORDS);
const EXPLORABLE_PAGES: readonly ExplorablePageInput[] = Object.values(EXPLORABLE_PAGE_RECORDS);
const PLAYLISTS: readonly PlaylistInput[] = [
  axelAgenticWorkflowPlaylist,
  cyberforumAkademieIntroAgenticWorkflowPlaylist,
];

/** The Episode ids whose metadata says `published`. */
type PublishedId = {
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
  episodes: Object.entries({ ...EPISODE_METADATA, ...UPCOMING_METADATA }).map(([id, record]) => ({ id, record })),
  events: EVENTS,
  playlists: PLAYLISTS,
  resources: RESOURCES,
  resourceCompositions: RESOURCE_SLUGS,
  explorablePages: EXPLORABLE_PAGES,
  explorablePageCompositions: EXPLORABLE_PAGE_SLUGS,
  explorables: EXPLORABLE_SLUGS,
  featured: FEATURED,
});

/** The Featured Episode ids, typed so `tsc` refuses one that names an upcoming Episode. */
export function featuredIds(): readonly PublishedId[] {
  return FEATURED;
}

export type { LoadedEpisode } from './episode-refusals';

/** Every Episode's metadata with its EpisodeRef: those with a page, then the upcoming ones without, each in id order. */
export function listEpisodes(): readonly LoadedEpisode[] {
  return CONTENT.episodes;
}

/** A registered Episode's metadata. A registered Episode the store does not hold is a bug, so it throws. */
function episodeOf({ id }: EpisodeRef<EpisodeId>): LoadedEpisode {
  const episode = CONTENT.episodes.find(({ ref }) => ref.id === id);
  if (!episode) throw new Error(`No Episode metadata lists the registered id "${id}"`);
  return episode;
}

/** The Episode's status. */
export function episodeStatus(episode: EpisodeRef<EpisodeId>): EpisodeStatus {
  return episodeOf(episode).status;
}

/** The Episode's release date once published; none while it is upcoming. */
export function episodePublishedOn(episode: EpisodeRef<EpisodeId>): IsoDate | undefined {
  const loaded = episodeOf(episode);
  return loaded.status === 'published' ? loaded.publishedOn : undefined;
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
export function episodeVideo(episode: EpisodeRef<EpisodeId>, locale: Locale): Video | undefined {
  const video = episodeOf(episode).youtube;
  if (video === undefined) return undefined;
  if ('language' in video) return { id: video.id, recordedIn: video.language as Locale };
  const local = video[locale];
  return local === undefined ? undefined : { id: local };
}

/**
 * The Video an Explorable page plays in this locale; none until uploaded. An Explorable page's `youtube` holds at most
 * one id per locale.
 */
export function explorablePageVideo(slug: ExplorablePageSlug, locale: Locale): Video | undefined {
  const id = CONTENT.explorablePages.find((page) => page.slug === slug)?.youtube?.[locale];
  return id === undefined ? undefined : { id };
}

export type {
  EpisodesPathParams,
  EventEpisodePage,
  EventEpisodeParams,
  ExplorablePageParams,
  ResourceParams,
  RouteParams,
} from './catalogue/page-catalogue';
export type { PresentedEpisode, ServedEvent } from './served-event';

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
 * The page catalogue over the store's records: every page with its treatment, the static params the routes export,
 * the page a route's params name (or none), and the Episodes and Events the site's own lists show
 * (`./catalogue/page-catalogue.ts`).
 */
export const {
  pages: PAGES,
  treatmentOf,
  episodesPathParams,
  episodesPathPageAt,
  eventParams,
  eventEpisodeParams,
  eventEpisodePageAt,
  explorablePageParams,
  explorablePageAt,
  resourceParams,
  resourcePageAt,
  listedEpisodes,
  listedEvents,
  listedExplorablePages,
  listedResources,
} = catalogueOf(CONTENT);
