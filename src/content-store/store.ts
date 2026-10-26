import { episodeMetadata as aiAttentionSpan } from '@/components/episodes/ai-attention-span/episode-metadata';
import { episodeMetadata as aiGivesYouMoreWork } from '@/components/episodes/ai-gives-you-more-work/episode-metadata';
import { episodeMetadata as aiTokenEconomy } from '@/components/episodes/ai-token-economy/episode-metadata';
import { episodeMetadata as axelAiAttentionSpan } from '@/components/episodes/axel-ai-attention-span/episode-metadata';
import { episodeMetadata as axelAiGivesYouMoreWork } from '@/components/episodes/axel-ai-gives-you-more-work/episode-metadata';
import { episodeMetadata as axelOnboardAiEveryTime } from '@/components/episodes/axel-onboard-ai-every-time/episode-metadata';
import { episodeMetadata as cyberforumAiAttentionSpan } from '@/components/episodes/cyberforum-ai-attention-span/episode-metadata';
import { episodeMetadata as cyberforumAiGivesYouMoreWork } from '@/components/episodes/cyberforum-ai-gives-you-more-work/episode-metadata';
import { episodeMetadata as cyberforumIntro } from '@/components/episodes/cyberforum-intro/episode-metadata';
import { episodeMetadata as cyberforumOnboardAiEveryTime } from '@/components/episodes/cyberforum-onboard-ai-every-time/episode-metadata';
import { episodeMetadata as maintainingMarkdownForAi } from '@/components/episodes/maintaining-markdown-for-ai/episode-metadata';
import { episodeMetadata as neverTooEarlySales } from '@/components/episodes/never-too-early-sales/episode-metadata';
import { episodeMetadata as onboardAiEveryTime } from '@/components/episodes/onboard-ai-every-time/episode-metadata';
import { FEATURED } from '@/lib/episode-overview';
import type { Locale } from '@/lib/locale.pure';
import {
  isEpisodePage,
  isEpisodeSlug,
  isEventEpisodePage,
  isEventPage,
  type EpisodeSlug,
  type PageRef,
} from '@/lib/routes';
import type { PageFacts } from '@/lib/visibility.pure';
import { event as axelAgenticWorkflowEvent } from './events/2026-10-23-axel-agentic-workflow';
import { event as cyberforumAkademieIntroAgenticWorkflowEvent } from './events/2026-10-28-cyberforum-akademie-intro-agentic-workflow';
import { playlist as axelAgenticWorkflowPlaylist } from './playlists/axel-agentic-workflow';
import { playlist as cyberforumAkademieIntroAgenticWorkflowPlaylist } from './playlists/cyberforum-akademie-intro-agentic-workflow';
import { crossRecordRefusals, parseRecords, type Content, type ContentInput } from './refusals';
import type { Episode, EpisodeInput, EpisodeStatus } from './schemas/episode.schema';
import type { Event } from './schemas/event.schema';
import type { IsoDate } from './schemas/fields';
import type { Playlist } from './schemas/playlist.schema';

/*
 * The content store's one entry (FE-013): every record — Episode metadata, Event, Playlist — is collected here by
 * explicit import (no glob, no codegen), parsed by its schema and checked against the others when this module loads.
 * A bad record throws, so the build and the fast suite stop. Pages, routes, the sitemap and metadata read records
 * only through the functions below. The one seam a database would replace.
 */

/**
 * Every Episode's metadata, by slug: every registered one, public or unlisted. Typed against the registered slugs, so a registered
 * Episode without metadata, or a key naming another Episode's metadata, fails `tsc`.
 */
const REGISTERED = {
  'maintaining-markdown-for-ai': maintainingMarkdownForAi,
  'ai-token-economy': aiTokenEconomy,
  'never-too-early-sales': neverTooEarlySales,
  'onboard-ai-every-time': onboardAiEveryTime,
  'ai-attention-span': aiAttentionSpan,
  'ai-gives-you-more-work': aiGivesYouMoreWork,
  'axel-onboard-ai-every-time': axelOnboardAiEveryTime,
  'axel-ai-attention-span': axelAiAttentionSpan,
  'axel-ai-gives-you-more-work': axelAiGivesYouMoreWork,
  'cyberforum-intro': cyberforumIntro,
  'cyberforum-onboard-ai-every-time': cyberforumOnboardAiEveryTime,
  'cyberforum-ai-attention-span': cyberforumAiAttentionSpan,
  'cyberforum-ai-gives-you-more-work': cyberforumAiGivesYouMoreWork,
} as const satisfies { readonly [S in EpisodeSlug]: EpisodeInput & { readonly slug: S } };

/** Upcoming Episodes without a page, in the order the overview lists them: a folder holding only its metadata. */
const UPCOMING: readonly EpisodeInput[] = [];

const EVENTS = [axelAgenticWorkflowEvent, cyberforumAkademieIntroAgenticWorkflowEvent];
const PLAYLISTS = [axelAgenticWorkflowPlaylist, cyberforumAkademieIntroAgenticWorkflowPlaylist];

/** The slugs whose metadata says `published`. */
type PublishedSlug = {
  [S in keyof typeof REGISTERED]: (typeof REGISTERED)[S]['status'] extends 'published' ? S : never;
}[keyof typeof REGISTERED];

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
  episodes: [...Object.values(REGISTERED), ...UPCOMING],
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

/** Whether the slug has an Episode page: every registered slug, whatever the status. A tooling page is no Episode. */
export function hasPage(slug: string): slug is EpisodeSlug {
  return isEpisodeSlug(slug);
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

/** Every Event, in record order. */
export function listEvents(): readonly Event[] {
  return CONTENT.events;
}

/** One Event by slug; undefined when no Event carries it. */
export function findEvent(slug: string): Event | undefined {
  return CONTENT.events.find((event) => event.slug === slug);
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
