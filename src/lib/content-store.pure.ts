import type { z } from 'zod';
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
  slideFolderSchema,
  slideSourceSchema,
  workshopSchema,
  type DefinitionSlide,
  type RecordKind,
  type SlideFolder,
  type SlideSource,
} from './content-schemas.pure';
import { episodeConceptProblems, type EpisodeMetadata } from './episode-metadata.pure';
import { LAYOUT_REFERENCES, type ThemeLook } from './episode-overview';
import { readResearchFile, type ResearchRecord } from './research-record.pure';
import { EPISODE_SLUGS } from './routes';
import { workshopProblems, type WorkshopRecord } from './workshops.pure';

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
  readonly workshops: readonly WorkshopRecord[];
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
  readonly workshops: readonly unknown[];
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

function slugOfRaw(raw: unknown): string {
  const value = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>).slug : undefined;
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

function duplicates(items: readonly string[]): string[] {
  return [...new Set(items.filter((item, at) => items.indexOf(item) !== at))];
}

/**
 * Slide slugs are unique across every Episode folder and the Slide pool together (design-ADR 0016, Slide reuse rule
 * 7), so a reused Slide keeps its slug and anchor wherever it is placed. A Title slide is exempt: its anchor is `top`.
 */
function slideSlugRefusals(slides: readonly SlideFolder[]): Refusal[] {
  const placed = slides.filter(({ title }) => !title);
  return duplicates(placed.map(({ slug }) => slug)).map((slug) => ({
    kind: 'slide' as const,
    record: slug,
    message: `the slug is used by more than one Slide: ${placed
      .filter((each) => each.slug === slug)
      .map(({ path }) => path)
      .join(', ')}`,
  }));
}

function researchIdRefusals(research: readonly ResearchRecord[]): Refusal[] {
  return duplicates(research.map(({ id }) => id)).map((id) => ({
    kind: 'research' as const,
    record: id,
    message: 'the id is used by more than one research file',
  }));
}

const LISTED_SLUGS: readonly string[] = EPISODE_SLUGS.filter(
  (slug) => !(LAYOUT_REFERENCES as readonly string[]).includes(slug),
);

interface Sound {
  readonly concepts: readonly ConceptFile[];
  /** Every id the theme record keys, a malformed look included, so one bad look is refused once. */
  readonly themed: readonly string[];
  readonly episodes: readonly EpisodeMetadata[];
  readonly workshops: readonly WorkshopRecord[];
  readonly definitionSlides: readonly DefinitionSlide[];
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
 * What the records say about each other: each Episode themed by a top Concept, a published Episode with a page, a
 * Workshop's Episodes known.
 */
function crossChecks(sound: Sound): Refusal[] {
  const { episodes, workshops } = sound;
  const slugs = episodes.map(({ slug }) => slug);
  const own = (kind: RecordKind) => (message: string) => ({ kind, record: message.split(':')[0], message });
  const topConcepts = sound.concepts.filter(isTopConcept).map(({ id }) => id);
  return [
    ...evidenceChecks(sound),
    ...episodeConceptProblems(episodes, topConcepts).map(own('episode')),
    ...duplicates(slugs).map((slug) => own('episode')(`${slug}: the slug is used twice`)),
    ...episodes
      .filter(({ slug, status }) => status === 'published' && !LISTED_SLUGS.includes(slug))
      .map(({ slug }) =>
        own('episode')(`${slug}: a published Episode needs a registered page, and this slug names none`),
      ),
    ...workshopProblems(workshops, [...EPISODE_SLUGS, ...slugs]).map(own('workshop')),
  ];
}

/** Every record read through its schema, each with the refusals of the ones that failed it. */
function readEach(raw: RawContent) {
  return {
    themes: readThemes(raw.themes),
    concepts: readConcepts(raw.concepts),
    definitionSlides: readAll('definition-slide', definitionSlideSchema, raw.definitionSlides),
    episodes: readAll('episode', episodeSchema, raw.episodes),
    workshops: readAll('workshop', workshopSchema, raw.workshops),
    slideSources: readAll('slide-source', slideSourceSchema, raw.slideSources),
    slides: readAll('slide', slideFolderSchema, raw.slides),
    research: readResearch(raw.research),
  };
}

/**
 * Loads every record through its schema. The answer is the typed store when every record is sound, or all the
 * refusals at once, each naming the kind of record and which one. It never throws on a malformed record.
 */
export function loadContentStore(raw: RawContent): LoadResult {
  const read = readEach(raw);
  // The schemas checked each record's shape; the cross-checks need only the records that passed them.
  const sound: Sound = {
    concepts: read.concepts.value,
    themed: isRecord(raw.themes) ? Object.keys(raw.themes) : [],
    episodes: read.episodes.value as unknown as EpisodeMetadata[],
    workshops: read.workshops.value as WorkshopRecord[],
    definitionSlides: read.definitionSlides.value,
  };
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
    workshops: sound.workshops,
    research: read.research.value,
    slideSources: read.slideSources.value,
    slides: read.slides.value,
  };
  return { ok: true, store };
}
