import type { z } from 'zod';
import {
  episodeSchema,
  KEBAB,
  slideFolderSchema,
  slideSourceSchema,
  tagSchema,
  workshopSchema,
  type RecordKind,
  type SlideFolder,
  type SlideSource,
} from './content-schemas.pure';
import { tagProblems, type EpisodeMetadata } from './episode-metadata.pure';
import { LAYOUT_REFERENCES, type ACCENTS, type ICONS } from './episode-overview';
import { readResearchFile, type ResearchRecord } from './research-record.pure';
import { EPISODE_SLUGS } from './routes';
import { workshopProblems, type WorkshopRecord } from './workshops.pure';

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

/** The records as the repository holds them, before any is trusted. A research file arrives as its text. */
export interface RawContent {
  readonly tags: unknown;
  readonly episodes: readonly unknown[];
  readonly workshops: readonly unknown[];
  readonly research: readonly { readonly path: string; readonly markdown: string }[];
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

/** An instance takes a slug of its own at the copy, never its origin's (design-ADR 0016, Slide reuse rule 7). */
function instanceSlugRefusals(slides: readonly SlideFolder[]): Refusal[] {
  return slides
    .filter(({ slug, copiedFrom }) => copiedFrom === slug)
    .map(({ path, slug }) => ({
      kind: 'slide' as const,
      record: slug,
      message: `${path} is an instance of "${slug}" under its origin's slug: an instance takes a slug of its own`,
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

/** What the records say about each other: Tags in the vocabulary, a published Episode with a page, a Workshop's Episodes known. */
function crossChecks(episodes: readonly EpisodeMetadata[], workshops: readonly WorkshopRecord[]): Refusal[] {
  const slugs = episodes.map(({ slug }) => slug);
  const own = (kind: RecordKind) => (message: string) => ({ kind, record: message.split(':')[0], message });
  return [
    ...tagProblems(episodes).map(own('episode')),
    ...duplicates(slugs).map((slug) => own('episode')(`${slug}: the slug is used twice`)),
    ...episodes
      .filter(({ slug, status }) => status === 'published' && !LISTED_SLUGS.includes(slug))
      .map(({ slug }) =>
        own('episode')(`${slug}: a published Episode needs a registered page, and this slug names none`),
      ),
    ...workshopProblems(workshops, [...EPISODE_SLUGS, ...slugs]).map(own('workshop')),
  ];
}

/**
 * Loads every record through its schema. The answer is the typed store when every record is sound, or all the
 * refusals at once, each naming the kind of record and which one. It never throws on a malformed record.
 */
export function loadContentStore(raw: RawContent): LoadResult {
  const tags = readTags(raw.tags);
  const episodes = readAll('episode', episodeSchema, raw.episodes);
  const workshops = readAll('workshop', workshopSchema, raw.workshops);
  const slideSources = readAll('slide-source', slideSourceSchema, raw.slideSources);
  const slides = readAll('slide', slideFolderSchema, raw.slides);
  const research = readResearch(raw.research);
  // The schemas checked each record's shape; the cross-checks need only the records that passed them.
  const soundEpisodes = episodes.value as unknown as EpisodeMetadata[];
  const soundWorkshops = workshops.value as WorkshopRecord[];
  const refusals = [
    ...[tags, episodes, workshops, slideSources, slides, research].flatMap((part) => part.refusals),
    ...researchIdRefusals(research.value),
    ...slideSlugRefusals(slides.value),
    ...instanceSlugRefusals(slides.value),
    ...crossChecks(soundEpisodes, soundWorkshops),
  ];
  if (refusals.length > 0) return { ok: false, refusals };
  const store = {
    tags: tags.value,
    episodes: soundEpisodes,
    workshops: soundWorkshops,
    research: research.value,
    slideSources: slideSources.value,
    slides: slides.value,
  };
  return { ok: true, store };
}
