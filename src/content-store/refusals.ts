import { LOCALES } from '@/lib/locale.pure';
import { isEventSlug } from '@/lib/routes';
import type { z } from 'zod';
import { episodeSchema, type Episode } from './schemas/episode.schema';
import { eventSchema, type Event } from './schemas/event.schema';
import { playlistSchema, type Playlist } from './schemas/playlist.schema';
import { playlistEntries, type ServedEvent } from './served-event';

/*
 * The store's refusals (FE-013 Decision 3, design-ADR 0016 decisions 2, 4, 8 and 9): each record is parsed by its
 * schema, then the cross-record rules run over the sound ones and resolve each Event into the Playlist it presents.
 * Every refusal is one sentence naming the kind, the record and the field; a refused record is never dropped, the
 * whole load throws.
 */

/** Every record kind as its file writes it, before parsing: what the store loads. */
export interface ContentInput {
  readonly episodes: readonly unknown[];
  readonly events: readonly unknown[];
  readonly playlists: readonly unknown[];
}

/** Every record kind, parsed by its schema, before the cross-record rules: an Event names its Playlist by id. */
export interface ParsedContent {
  readonly episodes: readonly Episode[];
  readonly events: readonly Event[];
  readonly playlists: readonly Playlist[];
}

/** Every record kind, parsed and checked, each Event served with the Playlist it presents. */
export interface Content {
  readonly episodes: readonly Episode[];
  readonly events: readonly ServedEvent[];
  readonly playlists: readonly Playlist[];
}

type Kind = 'Episode' | 'Event' | 'Playlist';

const EVENT_SLUG = /^(\d{4}-\d{2}-\d{2})-[a-z0-9]/;

/** One record kind as the parser reads it: its name in a sentence, the field naming a record, and its schema. */
interface Reader<T> {
  readonly kind: Kind;
  readonly key: 'slug' | 'id';
  readonly schema: z.ZodType<T>;
}

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

/** Each record parsed by its schema, or the sentences that refuse it. */
function parseAll<T>({ kind, key, schema }: Reader<T>, raws: readonly unknown[]): { parsed: T[]; refused: string[] } {
  const parsed: T[] = [];
  const refused: string[] = [];
  for (const raw of raws) {
    const result = schema.safeParse(raw);
    if (result.success) parsed.push(result.data);
    else refused.push(...result.error.issues.map((issue) => `${kind} ${nameOf(raw, key)}: ${issueText(issue, raw)}`));
  }
  return { parsed, refused };
}

function duplicates(items: readonly string[]): string[] {
  return [...new Set(items.filter((item, index) => items.indexOf(item) !== index))];
}

function uniqueness(kind: Kind, names: readonly string[], field: 'slug' | 'id'): string[] {
  return duplicates(names).map((name) => `${kind} ${name}: ${field} is used by more than one ${kind}`);
}

const LOCALE_LIST: readonly string[] = LOCALES;
const NOT_A_LOCALE = `is not one of the site's locales (${LOCALE_LIST.join(', ')})`;

/** Why an unlisted Episode's per-locale `youtube` is refused: it holds more than one Video, or the wrong shape. */
function unlistedPerLocale(keys: readonly string[]): string {
  if (keys.length > 1)
    return `youtube holds ${keys.length} videos (${keys.join(', ')}), but an unlisted Episode carries at most one Video, its Event recording with its language`;
  return 'youtube is one video per locale, but an unlisted Episode carries one recording with its language';
}

/** What is wrong with an Episode's Video for its visibility: one recording if unlisted, one per locale if public. */
function videoRefusals({ visibility, youtube }: Episode): string[] {
  if (youtube === undefined) return [];
  if ('language' in youtube)
    return [
      ...(visibility === 'public'
        ? ['youtube is one recording with its language, but a public Episode keeps one video per locale']
        : []),
      ...(LOCALE_LIST.includes(youtube.language) ? [] : [`youtube.language "${youtube.language}" ${NOT_A_LOCALE}`]),
    ];
  const keys = Object.keys(youtube);
  return [
    ...(visibility === 'unlisted' ? [unlistedPerLocale(keys)] : []),
    ...keys.filter((key) => !LOCALE_LIST.includes(key)).map((key) => `youtube names "${key}", which ${NOT_A_LOCALE}`),
  ];
}

function episodeRefusals(episode: Episode, listedByEvents: ReadonlySet<string>): string[] {
  const tags: readonly string[] = episode.tags;
  const orphan = episode.visibility === 'unlisted' && !listedByEvents.has(episode.slug);
  return [
    ...duplicates(tags).map((tag) => `tags lists ${tag} twice`),
    ...(orphan ? ['visibility is unlisted, but no Event presents a Playlist listing it, so it has no address'] : []),
    ...videoRefusals(episode),
  ].map((sentence) => `Episode ${episode.slug}: ${sentence}`);
}

function eventRefusals(event: Event): string[] {
  const date = EVENT_SLUG.exec(event.slug)?.[1];
  return date === event.date
    ? []
    : [`Event ${event.slug}: slug must be <date>-<name>, starting with its date ${event.date}`];
}

function playlistRefusals(playlist: Playlist, episodes: ReadonlyMap<string, Episode>, presented: boolean): string[] {
  const own = (sentence: string) => `Playlist ${playlist.id}: ${sentence}`;
  const unknown = playlist.episodes.filter((slug) => !episodes.has(slug));
  const unlisted = playlist.episodes.filter((slug) => episodes.get(slug)?.visibility === 'unlisted');
  return [
    ...(playlist.episodes.length === 0 ? [own('episodes lists none, but a Playlist lists at least one Episode')] : []),
    ...unknown.map((slug) => own(`episodes names "${slug}", which is no registered Episode`)),
    ...duplicates(playlist.episodes).map((slug) => own(`episodes lists "${slug}" twice`)),
    ...(playlist.visibility === 'public' && !presented
      ? unlisted.map((slug) =>
          own(`episodes lists the unlisted Episode "${slug}", but no Event presents this public Playlist`),
        )
      : []),
  ];
}

/** The cross-record refusals over sound records, in the order kinds are listed, with the Events' own from `serve`. */
function crossRecordRefusals({ episodes, events, playlists }: ParsedContent, unserved: readonly string[]): string[] {
  const presented = new Set(events.map((event) => event.playlist));
  const listedByEvents = new Set(
    playlists.filter((playlist) => presented.has(playlist.id)).flatMap((playlist) => playlist.episodes),
  );
  const bySlug = new Map(episodes.map((episode) => [episode.slug, episode]));
  return [
    ...uniqueness('Episode', [...episodes.map((episode) => episode.slug)], 'slug'),
    ...episodes.flatMap((episode) => episodeRefusals(episode, listedByEvents)),
    ...uniqueness(
      'Event',
      events.map((event) => event.slug),
      'slug',
    ),
    ...events.flatMap(eventRefusals),
    ...unserved,
    ...uniqueness(
      'Playlist',
      playlists.map((playlist) => playlist.id),
      'id',
    ),
    ...playlists.flatMap((playlist) => playlistRefusals(playlist, bySlug, presented.has(playlist.id))),
  ];
}

/**
 * The Event served with its Playlist resolved, or the sentences refusing it: a Playlist that does not exist, or a slug
 * missing from `EVENT_SLUGS`, so it has no page. A slug the Playlist names that no Episode carries is the Playlist's
 * own refusal, so the load throws before the resolved list is read.
 */
function serve(
  event: Event,
  playlists: ReadonlyMap<string, Playlist>,
  episodes: ReadonlyMap<string, Episode>,
): { served: ServedEvent[]; refused: string[] } {
  const { slug } = event;
  const playlist = playlists.get(event.playlist);
  if (playlist !== undefined && isEventSlug(slug)) {
    const listed = playlist.episodes.flatMap((each) => episodes.get(each) ?? []);
    return { served: [{ ...event, slug, playlist: { ...playlist, episodes: playlistEntries(listed) } }], refused: [] };
  }
  const missing = playlist === undefined ? [`playlist "${event.playlist}" does not exist`] : [];
  const pageless = isEventSlug(slug) ? [] : ['slug is missing from EVENT_SLUGS (src/lib/routes.ts), so it has no page'];
  return { served: [], refused: [...missing, ...pageless].map((sentence) => `Event ${slug}: ${sentence}`) };
}

/**
 * The records checked against each other and every Event served with the Playlist it presents, or the sentences
 * refusing them. Run only over records that all parsed, so a refusal never rests on a record that is itself refused.
 */
export function checkRecords(content: ParsedContent): { content: Content; refused: string[] } {
  const playlists = new Map(content.playlists.map((playlist) => [playlist.id, playlist]));
  const episodes = new Map(content.episodes.map((episode) => [episode.slug, episode]));
  const events = content.events.map((event) => serve(event, playlists, episodes));
  return {
    content: { ...content, events: events.flatMap(({ served }) => served) },
    refused: crossRecordRefusals(
      content,
      events.flatMap(({ refused }) => refused),
    ),
  };
}

/** Every record parsed by its schema, with the sentences refusing the ones that do not parse. */
export function parseRecords(input: ContentInput): { content: ParsedContent; refused: string[] } {
  const episodes = parseAll({ kind: 'Episode', key: 'slug', schema: episodeSchema }, input.episodes);
  const events = parseAll({ kind: 'Event', key: 'slug', schema: eventSchema }, input.events);
  const playlists = parseAll({ kind: 'Playlist', key: 'id', schema: playlistSchema }, input.playlists);
  return {
    content: { episodes: episodes.parsed, events: events.parsed, playlists: playlists.parsed },
    refused: [...episodes.refused, ...events.refused, ...playlists.refused],
  };
}
