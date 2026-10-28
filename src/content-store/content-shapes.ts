import type { LoadedEpisode } from './episode-refusals';
import type { Event } from './schemas/event.schema';
import type { ExplorablePage } from './schemas/explorable-page.schema';
import type { Playlist } from './schemas/playlist.schema';
import type { Resource } from './schemas/resource.schema';
import type { ServedEvent } from './served-event';

/*
 * The shapes the store's load passes between its stages (FE-013): records as their files write them, parsed by their
 * schemas, and parsed and checked with each Event served.
 */

/** One Episode as the generated registry hands it in: the id its folder gives it, and its record as its file writes it. */
export interface EpisodeEntry {
  readonly id: string;
  readonly record: unknown;
}

/** Every record kind as its file writes it, before parsing: what the store loads. */
export interface ContentInput {
  readonly episodes: readonly EpisodeEntry[];
  readonly events: readonly unknown[];
  readonly playlists: readonly unknown[];
  /** The Resource records, and the slugs of the composition folders they are checked against: both are always given. */
  readonly resources: readonly unknown[];
  readonly resourceCompositions: readonly string[];
  /**
   * The Explorable page records, the slugs of their composition folders and the slugs of the Explorables
   * (`src/explorables/<slug>/`) they are checked against; each defaults to none.
   */
  readonly explorablePages?: readonly unknown[];
  readonly explorablePageCompositions?: readonly string[];
  readonly explorables?: readonly string[];
  /** The Featured slots by Episode id, checked against the Episodes when given (`./featured.ts`). */
  readonly featured?: readonly string[];
}

/** Every record kind, parsed by its schema, before the cross-record rules: an Event names its Playlist by id. */
export interface ParsedContent {
  readonly episodes: readonly LoadedEpisode[];
  readonly events: readonly Event[];
  readonly playlists: readonly Playlist[];
  readonly resources: readonly Resource[];
  readonly resourceCompositions: readonly string[];
  readonly explorablePages: readonly ExplorablePage[];
  readonly explorablePageCompositions: readonly string[];
  readonly explorables: readonly string[];
  readonly featured?: readonly string[];
}

/** Every record kind, parsed and checked, each Event served with the Playlist it presents. */
export interface Content {
  readonly episodes: readonly LoadedEpisode[];
  readonly events: readonly ServedEvent[];
  readonly playlists: readonly Playlist[];
  readonly resources: readonly Resource[];
  readonly explorablePages: readonly ExplorablePage[];
}

export type Kind = 'Episode' | 'Event' | 'Playlist' | 'Resource' | 'Explorable page';
