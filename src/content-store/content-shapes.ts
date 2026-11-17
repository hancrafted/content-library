import type { LoadedEpisode } from './episode-refusals';
import type { Event } from './schemas/event.schema';
import type { ExplorablePage } from './schemas/explorable-page.schema';
import type { Guide } from './schemas/guide.schema';
import type { Playlist } from './schemas/playlist.schema';
import type { Template } from './schemas/template.schema';
import type { ServedEvent } from './served-event';

// decision: FE-013 §1
export interface EpisodeEntry {
  readonly id: string;
  readonly record: unknown;
}

export interface ContentInput {
  readonly episodes: readonly EpisodeEntry[];
  readonly events: readonly unknown[];
  readonly playlists: readonly unknown[];
  readonly templates: readonly unknown[];
  readonly templateCompositions: readonly string[];
  readonly explorablePages: readonly unknown[];
  readonly explorablePageCompositions: readonly string[];
  readonly explorables: readonly string[];
  readonly guides: readonly unknown[];
  readonly guideCompositions: readonly string[];
  readonly featured?: readonly string[];
}

export interface ParsedContent {
  readonly episodes: readonly LoadedEpisode[];
  readonly events: readonly Event[];
  readonly playlists: readonly Playlist[];
  readonly templates: readonly Template[];
  readonly templateCompositions: readonly string[];
  readonly explorablePages: readonly ExplorablePage[];
  readonly explorablePageCompositions: readonly string[];
  readonly explorables: readonly string[];
  readonly guides: readonly Guide[];
  readonly guideCompositions: readonly string[];
  readonly featured?: readonly string[];
}

export interface Content {
  readonly episodes: readonly LoadedEpisode[];
  readonly events: readonly ServedEvent[];
  readonly playlists: readonly Playlist[];
  readonly templates: readonly Template[];
  readonly explorablePages: readonly ExplorablePage[];
  readonly guides: readonly Guide[];
}

export type Kind = 'Episode' | 'Event' | 'Playlist' | 'Template' | 'Explorable page' | 'Guide';
