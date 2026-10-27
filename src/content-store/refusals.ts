import { episodeRefOf, matchEpisode, type EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import type { EventSlug } from '@/content-store/catalogue/record-routes';
import type { z } from 'zod';
import { duplicates } from './duplicates';
import { episodeRefusals, type LoadedEpisode } from './episode-refusals';
import { eventRefusals } from './event-refusals';
import { featuredRefusals } from './featured';
import { resourceRefusals } from './resource-refusals';
import { episodeSchema, type Episode } from './schemas/episode.schema';
import { eventSchema, type Event } from './schemas/event.schema';
import { playlistSchema, type Playlist } from './schemas/playlist.schema';
import { resourceSchema, type Resource } from './schemas/resource.schema';
import { listedEntries, playlistEntries, type ServedEvent } from './served-event';

/*
 * The store's refusals (FE-013 Decision 3, design-ADR 0016 decisions 2, 3, 4, 8 and 9): each record is parsed by its
 * schema, then the cross-record rules run over the sound ones and resolve each Event into the Playlist it presents.
 * Every refusal is one sentence naming the kind, the record and the field; a refused record is never dropped, the
 * whole load throws. An Episode enters by the Episode id its folder gives it and is served with its EpisodeRef
 * (GLOSSARY), which every rule reads. A Resource (design-ADR 0019) is checked against its composition folders.
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
  readonly featured?: readonly string[];
}

/** Every record kind, parsed and checked, each Event served with the Playlist it presents. */
export interface Content {
  readonly episodes: readonly LoadedEpisode[];
  readonly events: readonly ServedEvent[];
  readonly playlists: readonly Playlist[];
  readonly resources: readonly Resource[];
}

type Kind = 'Episode' | 'Event' | 'Playlist' | 'Resource';

/** One record kind as the parser reads it: its name in a sentence, the field naming a record, and its schema. */
interface Reader<T> {
  readonly kind: Kind;
  readonly key: 'slug' | 'id';
  readonly schema: z.ZodType<T>;
}

const EPISODE_READER: Reader<Episode> = { kind: 'Episode', key: 'slug', schema: episodeSchema };

/** A field of the raw record, read before parsing, so even a malformed record is named. */
function rawField(raw: unknown, key: string): unknown {
  return typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>)[key] : undefined;
}

function nameOf(raw: unknown, key: 'slug' | 'id'): string {
  const value = rawField(raw, key);
  return typeof value === 'string' && value !== '' ? value : `(no ${key})`;
}

/** What is wrong with one field: a missing or unknown `status` in its own words, else Zod's message. */
function issueText(issue: z.core.$ZodIssue, raw: unknown): string {
  const field = issue.path.map(String).join('.') || 'record';
  if (issue.code !== 'invalid_union' || field !== 'status') return `${field} ${issue.message}`;
  const status = rawField(raw, 'status');
  const seen = status === undefined ? 'missing' : `"${String(status)}"`;
  return `status is ${seen}, but must be published or upcoming`;
}

/** Each record parsed by its schema, or the sentences that refuse it, each named by `name` or its own key. */
function parseAll<T>(
  { kind, key, schema }: Reader<T>,
  raws: readonly unknown[],
  name: (raw: unknown) => string = (raw) => nameOf(raw, key),
): { parsed: T[]; refused: string[] } {
  const parsed: T[] = [];
  const refused: string[] = [];
  for (const raw of raws) {
    const result = schema.safeParse(raw);
    if (result.success) parsed.push(result.data);
    else refused.push(...result.error.issues.map((issue) => `${kind} ${name(raw)}: ${issueText(issue, raw)}`));
  }
  return { parsed, refused };
}

function uniqueness(kind: Kind, names: readonly string[], field: 'slug' | 'id'): string[] {
  return duplicates(names).map((name) => `${kind} ${name}: ${field} is used by more than one ${kind}`);
}

/** Why a Playlist may not list an Event's copy: an Event other than its owner presents the Playlist, or none does. */
function foreignCopy(episode: EpisodeRef, presenters: readonly string[]): string | undefined {
  return matchEpisode(episode, {
    standalone: () => undefined,
    'event-copy': ({ id, event: owner }) => {
      const others = presenters.filter((event) => event !== owner);
      if (presenters.length > 0 && others.length === 0) return undefined;
      const by = others.length === 0 ? 'no Event presents' : `Event ${others.join(', ')} presents`;
      return `episodes lists "${id}", a copy Event ${owner} owns, but ${by} this Playlist`;
    },
  });
}

/** Whether no Event owns the Episode. */
function isStandalone(episode: EpisodeRef): boolean {
  return matchEpisode(episode, { standalone: () => true, 'event-copy': () => false });
}

function playlistRefusals(
  playlist: Playlist,
  episodes: ReadonlyMap<string, LoadedEpisode>,
  presenters: readonly string[],
): string[] {
  const own = (sentence: string) => `Playlist ${playlist.id}: ${sentence}`;
  // An Episode listed again at an anchor is one Episode: each refusal below names it once.
  const ids = [...new Set(playlist.episodes.map(({ episode }) => episode))];
  const unknown = ids.filter((id) => !episodes.has(id));
  const listed = ids.flatMap((id) => episodes.get(id) ?? []);
  const unlisted = listed.filter(({ visibility }) => visibility === 'unlisted').map(({ ref }) => ref);
  const slugs = listed.map(({ slug }) => slug);
  return [
    ...(playlist.episodes.length === 0 ? [own('episodes lists none, but a Playlist lists at least one Episode')] : []),
    ...unknown.map((id) => own(`episodes names "${id}", which is no registered Episode`)),
    ...duplicates(slugs).map((slug) =>
      own(`episodes lists two Episodes with the slug "${slug}", which would share one URL under its Event`),
    ),
    ...listed.flatMap(({ ref }) => foreignCopy(ref, presenters) ?? []).map(own),
    ...(playlist.visibility === 'public' && presenters.length === 0
      ? unlisted
          .filter(isStandalone)
          .map(({ id }) =>
            own(`episodes lists the unlisted Episode "${id}", but no Event presents this public Playlist`),
          )
      : []),
  ];
}

/** The cross-record refusals over sound records, in the order kinds are listed, with the Events' own from `serve`. */
function crossRecordRefusals(
  { episodes, events, playlists, resources, resourceCompositions, featured }: ParsedContent,
  unserved: readonly string[],
): string[] {
  const presented = new Set(events.map((event) => event.playlist));
  const listedByEvents = new Set(
    playlists
      .filter((playlist) => presented.has(playlist.id))
      .flatMap((playlist) => playlist.episodes.map(({ episode }) => episode)),
  );
  const eventSlugs = events.map((event) => event.slug);
  const byId = new Map(episodes.map((episode) => [episode.ref.id, episode]));
  const presenters = (playlist: Playlist) =>
    events.filter((event) => event.playlist === playlist.id).map((event) => event.slug);
  const episodeIds = episodes.map(({ ref }) => ref.id);
  const playlistIds = playlists.map((playlist) => playlist.id);
  return [
    ...uniqueness('Episode', episodeIds, 'id'),
    ...episodes.flatMap((episode) => episodeRefusals(episode, listedByEvents, new Set(eventSlugs))),
    ...uniqueness('Event', eventSlugs, 'slug'),
    ...events.flatMap(eventRefusals),
    ...unserved,
    ...uniqueness('Playlist', playlistIds, 'id'),
    ...playlists.flatMap((playlist) => playlistRefusals(playlist, byId, presenters(playlist))),
    ...resourceRefusals(resources, resourceCompositions),
    ...(featured === undefined ? [] : featuredRefusals(featured, byId)),
  ];
}

/**
 * The Event served with its Playlist resolved, or the sentence refusing it: a Playlist that does not exist. A slug the
 * Playlist names that no Episode carries is the Playlist's own refusal, so the load throws before the resolved list is
 * read.
 */
function serve(
  event: Event,
  playlists: ReadonlyMap<string, Playlist>,
  episodes: ReadonlyMap<string, LoadedEpisode>,
): { served: ServedEvent[]; refused: string[] } {
  // Every Event the store loads is an entry of the generated Event registry, keyed by its slug (`tsc` holds key =
  // slug), so its slug names a page; the parse keeps the value the record's file wrote.
  const slug = event.slug as EventSlug;
  const playlist = playlists.get(event.playlist);
  if (playlist === undefined)
    return { served: [], refused: [`Event ${slug}: playlist "${event.playlist}" does not exist`] };
  const served = { ...playlist, episodes: playlistEntries(listedEntries(playlist.episodes, episodes)) };
  return { served: [{ ...event, slug, playlist: served }], refused: [] };
}

/**
 * The records checked against each other and every Event served with the Playlist it presents, or the sentences
 * refusing them. Run only over records that all parsed, so a refusal never rests on a record that is itself refused.
 */
export function checkRecords(content: ParsedContent): { content: Content; refused: string[] } {
  const playlists = new Map(content.playlists.map((playlist) => [playlist.id, playlist]));
  const episodes = new Map(content.episodes.map((episode) => [episode.ref.id, episode]));
  const events = content.events.map((event) => serve(event, playlists, episodes));
  const served = events.flatMap((event) => event.served);
  return {
    content: { episodes: content.episodes, events: served, playlists: content.playlists, resources: content.resources },
    refused: crossRecordRefusals(
      content,
      events.flatMap(({ refused }) => refused),
    ),
  };
}

/** Each Episode's record parsed by its schema and given the EpisodeRef its entry's id names, named by that id when refused. */
function parseEpisodes(entries: readonly EpisodeEntry[]): { parsed: LoadedEpisode[]; refused: string[] } {
  const each = entries.map(({ id, record }) => ({ id, ...parseAll(EPISODE_READER, [record], () => id) }));
  return {
    parsed: each.flatMap(({ id, parsed }) => parsed.map((episode) => ({ ...episode, ref: episodeRefOf(id) }))),
    refused: each.flatMap(({ refused }) => refused),
  };
}

/** Every record parsed by its schema, with the sentences refusing the ones that do not parse. */
export function parseRecords(input: ContentInput): { content: ParsedContent; refused: string[] } {
  const episodes = parseEpisodes(input.episodes);
  const events = parseAll({ kind: 'Event', key: 'slug', schema: eventSchema }, input.events);
  const playlists = parseAll({ kind: 'Playlist', key: 'id', schema: playlistSchema }, input.playlists);
  const resources = parseAll({ kind: 'Resource', key: 'slug', schema: resourceSchema }, input.resources);
  return {
    content: {
      episodes: episodes.parsed,
      events: events.parsed,
      playlists: playlists.parsed,
      resources: resources.parsed,
      resourceCompositions: input.resourceCompositions,
      ...(input.featured === undefined ? {} : { featured: input.featured }),
    },
    refused: [...episodes.refused, ...events.refused, ...playlists.refused, ...resources.refused],
  };
}
