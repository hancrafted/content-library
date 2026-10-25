import type { z } from 'zod';
import {
  episodeSchema,
  eventSchema,
  KEBAB,
  playlistSchema,
  slideSourceSchema,
  tagSchema,
  type RecordKind,
  type SlideSource,
} from './content-schemas.pure';
import { deliveryProblems, type DeliveryRecords } from './delivery.pure';
import { tagProblems, type EpisodeMetadata } from './episode-metadata.pure';
import { LAYOUT_REFERENCES, type ACCENTS, type ICONS } from './episode-overview';
import type { EventRecord } from './events.pure';
import type { PlaylistRecord } from './playlists.pure';
import { readResearchFile, type ResearchRecord } from './research-record.pure';
import { EPISODE_SLUGS, UNLISTED_EPISODE_SLUGS } from './routes';

/*
 * The content store: one loader reads every record the site is built from through its Zod schema and answers with
 * the typed store or a list of named refusals, never a thrown parse error. Pages, the sitemap and the checks read
 * the store and never the records. Nothing here reads a file: the caller hands the raw records in
 * (`content-store.ts` for the app, a fixture for a test).
 */

export interface TagLookRecord {
  readonly icon: (typeof ICONS)[number];
  readonly accent: (typeof ACCENTS)[number];
}

/** Every record, typed and cross-checked. */
export interface ContentStore {
  readonly tags: Readonly<Record<string, TagLookRecord>>;
  readonly episodes: readonly EpisodeMetadata[];
  readonly events: readonly EventRecord[];
  readonly playlists: readonly PlaylistRecord[];
  readonly research: readonly ResearchRecord[];
  readonly slideSources: readonly SlideSource[];
}

/** One refusal: the kind of record, which one, and one sentence on what is wrong with it. */
export interface Refusal {
  readonly kind: RecordKind;
  /** The record's slug, id or path, whichever names it. */
  readonly record: string;
  readonly message: string;
}

export type LoadResult =
  { readonly ok: true; readonly store: ContentStore } | { readonly ok: false; readonly refusals: readonly Refusal[] };

/** The records as the repository holds them, before any is trusted. A research file arrives as its text. */
export interface RawContent {
  readonly tags: unknown;
  readonly episodes: readonly unknown[];
  readonly events: readonly unknown[];
  readonly playlists: readonly unknown[];
  readonly research: readonly { readonly path: string; readonly markdown: string }[];
  readonly slideSources: readonly unknown[];
}

interface Parsed<T> {
  readonly value: T;
  readonly refusals: readonly Refusal[];
}

function refuse(kind: RecordKind, record: string, issues: readonly z.core.$ZodIssue[]): Refusal[] {
  return issues.map((issue) => {
    const where = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return { kind, record, message: `${where}${issue.message}` };
  });
}

/** The name a raw record goes by: its slug, or its id for a Playlist. */
function slugOfRaw(raw: unknown): string {
  const fields = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const value = fields.slug ?? fields.id;
  return typeof value === 'string' ? value : '(unnamed)';
}

function readAll<S extends z.ZodType>(kind: RecordKind, schema: S, raws: readonly unknown[]): Parsed<z.infer<S>[]> {
  const value: z.infer<S>[] = [];
  const refusals: Refusal[] = [];
  for (const raw of raws) {
    const result = schema.safeParse(raw);
    if (result.success) value.push(result.data);
    else refusals.push(...refuse(kind, slugOfRaw(raw), result.error.issues));
  }
  return { value, refusals };
}

function readTags(raw: unknown): Parsed<Record<string, TagLookRecord>> {
  const value: Record<string, TagLookRecord> = {};
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { value, refusals: [{ kind: 'tag', record: '(tags)', message: 'the Tags are one record keyed by Tag id' }] };
  }
  const refusals: Refusal[] = [];
  for (const [id, look] of Object.entries(raw)) {
    const result = tagSchema.safeParse(look);
    if (!KEBAB.test(id)) refusals.push({ kind: 'tag', record: id, message: 'the Tag id must be kebab-case' });
    if (result.success) value[id] = result.data;
    else refusals.push(...refuse('tag', id, result.error.issues));
  }
  return { value, refusals };
}

function readResearch(files: RawContent['research']): Parsed<ResearchRecord[]> {
  const reads = files.map((file) => ({ file, read: readResearchFile(file.path, file.markdown) }));
  return {
    value: reads.flatMap(({ read }) => (read.record ? [read.record] : [])),
    refusals: reads.flatMap(({ file, read }) =>
      (read.reasons ?? []).map((message) => ({ kind: 'research' as const, record: file.path, message })),
    ),
  };
}

function duplicates(items: readonly string[]): string[] {
  return [...new Set(items.filter((item, at) => items.indexOf(item) !== at))];
}

const LISTED_SLUGS: readonly string[] = EPISODE_SLUGS.filter(
  (slug) => !(LAYOUT_REFERENCES as readonly string[]).includes(slug),
);

const UNLISTED_SLUGS: readonly string[] = UNLISTED_EPISODE_SLUGS;

/** Where a published Episode's page is registered: a public one at /episodes/, an unlisted one only under its Event. */
function pageProblem({ slug, status, visibility }: EpisodeMetadata): string[] {
  if (status !== 'published') return [];
  const pages = visibility === 'public' ? LISTED_SLUGS : UNLISTED_SLUGS;
  return pages.includes(slug)
    ? []
    : [`${slug}: a published ${visibility} Episode needs a registered page, and this slug names none`];
}

/** What the records say about each other: Tags in the vocabulary, a published Episode with a page, the delivery records consistent. */
function crossChecks(episodes: readonly EpisodeMetadata[], delivery: DeliveryRecords | undefined): Refusal[] {
  const slugs = episodes.map(({ slug }) => slug);
  const own = (kind: RecordKind) => (message: string) => ({ kind, record: message.split(':')[0], message });
  return [
    ...tagProblems(episodes).map(own('episode')),
    ...duplicates(slugs).map((slug) => own('episode')(`${slug}: the slug is used twice`)),
    ...episodes.flatMap(pageProblem).map(own('episode')),
    ...(delivery === undefined ? [] : deliveryProblems(delivery).map(({ kind, message }) => own(kind)(message))),
  ];
}

/** A research id used by more than one file. */
function researchDuplicates(research: readonly ResearchRecord[]): Refusal[] {
  return duplicates(research.map(({ id }) => id)).map((id) => ({
    kind: 'research' as const,
    record: id,
    message: 'the id is used by more than one research file',
  }));
}

/** Every record kind read through its schema, each with the records that passed and the refusals of those that did not. */
function readRecords(raw: RawContent) {
  return {
    tags: readTags(raw.tags),
    episodes: readAll('episode', episodeSchema, raw.episodes),
    events: readAll('event', eventSchema, raw.events),
    playlists: readAll('playlist', playlistSchema, raw.playlists),
    slideSources: readAll('slide-source', slideSourceSchema, raw.slideSources),
    research: readResearch(raw.research),
  };
}

/**
 * Loads every record through its schema. The answer is the typed store when every record is sound, or all the
 * refusals at once, each naming the kind of record and which one. It never throws on a malformed record.
 */
export function loadContentStore(raw: RawContent): LoadResult {
  const parts = readRecords(raw);
  const { tags, episodes, events, playlists, slideSources, research } = parts;
  // The schemas checked each record's shape; the cross-checks need only the records that passed them.
  const soundEpisodes = episodes.value as unknown as EpisodeMetadata[];
  const soundEvents = events.value as EventRecord[];
  // A record the schema refused is missing from the rest; checking how the others point at it would only echo
  // that refusal, so the delivery records are checked together once all of them are sound.
  const delivery = [episodes, events, playlists].every((part) => part.refusals.length === 0)
    ? { episodes: soundEpisodes, events: soundEvents, playlists: playlists.value }
    : undefined;
  const refusals = [
    ...Object.values(parts).flatMap((part) => part.refusals),
    ...researchDuplicates(research.value),
    ...crossChecks(soundEpisodes, delivery),
  ];
  if (refusals.length > 0) return { ok: false, refusals };
  const store = {
    tags: tags.value,
    episodes: soundEpisodes,
    events: soundEvents,
    playlists: playlists.value,
    research: research.value,
    slideSources: slideSources.value,
  };
  return { ok: true, store };
}
