import type { z } from 'zod';
import { canonicalEpisodeProblems } from './canonical-episode.pure';
import type { ConceptFile } from './concept-record.pure';
import {
  conceptProblems,
  isRecord,
  isTopConcept,
  linkConcepts,
  readConcepts,
  readThemes,
  type Concept,
} from './concepts.pure';
import {
  definitionSlideSchema,
  episodeSchema,
  episodeSlidesSchema,
  eventSchema,
  playlistSchema,
  slideFolderSchema,
  slideSourceSchema,
  type DefinitionSlide,
  type EpisodeSlides,
  type RecordKind,
  type SlideFolder,
  type SlideSource,
} from './content-schemas.pure';
import { deliveryProblems, episodePageProblems, type DeliveryRecords } from './delivery.pure';
import { episodeConceptProblems, type EpisodeMetadata } from './episode-metadata.pure';
import type { ThemeLook } from './episode-overview';
import type { EventRecord } from './events.pure';
import type { PlaylistRecord } from './playlists.pure';
import { readResearchFile, type ResearchRecord } from './research-record.pure';
import { duplicates, researchIdRefusals, slideSlugRefusals } from './unique-ids.pure';

/*
 * The content store: one loader reads every record the site is built from through its Zod schema and answers with
 * the typed store or a list of named refusals, never a thrown parse error. Pages, the sitemap and the checks read
 * the store and never the records. Nothing here reads a file: the caller hands the raw records in
 * (`content-store.ts` for the app, a fixture for a test).
 */

/** Every record, typed and cross-checked. */
export interface ContentStore {
  /** The theme record: one look per top Concept, keyed by its id. */
  readonly themes: Readonly<Record<string, ThemeLook>>;
  /** Every Concept, `narrower` derived and `related` mirrored, in folder order. */
  readonly concepts: readonly Concept[];
  /** Every page Slide that declares the Concept it defines. */
  readonly definitionSlides: readonly DefinitionSlide[];
  readonly episodes: readonly EpisodeMetadata[];
  readonly events: readonly EventRecord[];
  readonly playlists: readonly PlaylistRecord[];
  readonly research: readonly ResearchRecord[];
  readonly slideSources: readonly SlideSource[];
  readonly slides: readonly SlideFolder[];
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

/** A markdown evidence file as the repository holds it: its path from the repository root and its text. */
export interface EvidenceFile {
  readonly path: string;
  readonly markdown: string;
}

/** The records as the repository holds them, before any is trusted. A research file arrives as its text. */
export interface RawContent {
  readonly themes: unknown;
  readonly concepts: readonly EvidenceFile[];
  readonly definitionSlides: readonly unknown[];
  readonly episodes: readonly unknown[];
  /** Each Episode's Slide list, which tells an Episode derived from another. */
  readonly episodeSlides: readonly unknown[];
  readonly events: readonly unknown[];
  readonly playlists: readonly unknown[];
  readonly research: readonly EvidenceFile[];
  readonly slideSources: readonly unknown[];
  /** Every Slide folder in every Episode's `slides/` and in the Slide pool. */
  readonly slides: readonly unknown[];
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

/** The name a raw record goes by: its slug, its id for a Playlist, or its Episode for a Slide list. */
function slugOfRaw(raw: unknown): string {
  const fields = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const value = fields.slug ?? fields.id ?? fields.episode;
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

function readResearch(files: RawContent['research']): Parsed<ResearchRecord[]> {
  const reads = files.map((file) => ({ file, read: readResearchFile(file.path, file.markdown) }));
  return {
    value: reads.flatMap(({ read }) => (read.record ? [read.record] : [])),
    refusals: reads.flatMap(({ file, read }) =>
      (read.reasons ?? []).map((message) => ({ kind: 'research' as const, record: file.path, message })),
    ),
  };
}

interface Sound {
  readonly concepts: readonly ConceptFile[];
  /** Every id the theme record keys, a malformed look included, so one bad look is refused once. */
  readonly themed: readonly string[];
  readonly episodes: readonly EpisodeMetadata[];
  readonly delivery: DeliveryRecords | undefined; // absent while an Episode, Event or Playlist fails its schema
  readonly definitionSlides: readonly DefinitionSlide[];
  readonly episodeSlides: readonly EpisodeSlides[];
}

/** What the evidence says about itself and what Slides say about it: the hierarchy sound, every `defines` a Concept. */
function evidenceChecks({ concepts, themed, definitionSlides }: Sound): Refusal[] {
  const known = concepts.map(({ id }) => id);
  return [
    ...duplicates(known).map((id) => ({ kind: 'concept' as const, record: id, message: 'the id is used twice' })),
    ...conceptProblems(concepts, themed),
    ...definitionSlides
      .filter(({ defines }) => !known.includes(defines))
      .map(({ episode, slide, defines }) => ({
        kind: 'definition-slide' as const,
        record: `${episode}/${slide}`,
        message: `defines names ${defines}, which is no Concept`,
      })),
  ];
}

/**
 * What the records say about each other: each Episode themed by a top Concept, a published Episode with a page, the
 * delivery records consistent.
 */
function crossChecks(sound: Sound): Refusal[] {
  const { episodes, delivery } = sound;
  const slugs = episodes.map(({ slug }) => slug);
  const own = (kind: RecordKind) => (message: string) => ({ kind, record: message.split(':')[0], message });
  const topConcepts = sound.concepts.filter(isTopConcept).map(({ id }) => id);
  return [
    ...evidenceChecks(sound),
    ...episodeConceptProblems(episodes, topConcepts).map(own('episode')),
    ...duplicates(slugs).map((slug) => own('episode')(`${slug}: the slug is used twice`)),
    ...episodePageProblems(episodes).map(own('episode')),
    ...canonicalEpisodeProblems(episodes, sound.episodeSlides).map(own('episode')),
    ...(delivery === undefined ? [] : deliveryProblems(delivery).map(({ kind, message }) => own(kind)(message))),
  ];
}

/** Every record read through its schema, each with the refusals of the ones that failed it. */
function readEach(raw: RawContent) {
  return {
    themes: readThemes(raw.themes),
    concepts: readConcepts(raw.concepts),
    definitionSlides: readAll('definition-slide', definitionSlideSchema, raw.definitionSlides),
    episodes: readAll('episode', episodeSchema, raw.episodes),
    episodeSlides: readAll('episode', episodeSlidesSchema, raw.episodeSlides),
    events: readAll('event', eventSchema, raw.events),
    playlists: readAll('playlist', playlistSchema, raw.playlists),
    slideSources: readAll('slide-source', slideSourceSchema, raw.slideSources),
    slides: readAll('slide', slideFolderSchema, raw.slides),
    research: readResearch(raw.research),
  };
}

/** The records that passed their schemas, as the cross-checks read them. */
function soundOf(read: ReturnType<typeof readEach>, raw: RawContent): Sound {
  const episodes = read.episodes.value as unknown as EpisodeMetadata[];
  const events = read.events.value as EventRecord[];
  // Delivery records are cross-checked only once all are sound: a refused one would echo as a dangling reference.
  const deliverySound = [read.episodes, read.events, read.playlists].every((part) => part.refusals.length === 0);
  const delivery = deliverySound ? { episodes, events, playlists: read.playlists.value } : undefined;
  const themed = isRecord(raw.themes) ? Object.keys(raw.themes) : [];
  return {
    concepts: read.concepts.value,
    themed,
    episodes,
    delivery,
    definitionSlides: read.definitionSlides.value,
    episodeSlides: read.episodeSlides.value,
  };
}

/**
 * Loads every record through its schema. The answer is the typed store when every record is sound, or all the
 * refusals at once, each naming the kind of record and which one. It never throws on a malformed record.
 */
export function loadContentStore(raw: RawContent): LoadResult {
  const read = readEach(raw);
  // The schemas checked each record's shape; the cross-checks need only the records that passed them.
  const sound = soundOf(read, raw);
  const refusals = [
    ...Object.values(read).flatMap((part) => part.refusals),
    ...researchIdRefusals(read.research.value),
    ...slideSlugRefusals(read.slides.value),
    ...crossChecks(sound),
  ];
  if (refusals.length > 0) return { ok: false, refusals };
  const store: ContentStore = {
    themes: read.themes.value,
    concepts: linkConcepts(sound.concepts),
    definitionSlides: sound.definitionSlides,
    episodes: sound.episodes,
    events: read.events.value as EventRecord[],
    playlists: read.playlists.value,
    research: read.research.value,
    slideSources: read.slideSources.value,
    slides: read.slides.value,
  };
  return { ok: true, store };
}
