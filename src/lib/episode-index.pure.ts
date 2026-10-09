import { isEpisodeSlug, type EpisodeSlug } from './routes';

/*
 * The Episode index: one locale-neutral record per Episode the landing page can
 * list, published or upcoming. It holds ids, dates and ranks only; every title,
 * caption and label is a Translation key (FE-002 §5), so the index can later be
 * read from another data source without touching a locale. No React (FE-007 §3).
 */

export const TOPICS = ['ai-collaboration', 'documentation', 'economics', 'adoption'] as const;
export type TopicId = (typeof TOPICS)[number];

export const FORMATS = ['foundations', 'teardown', 'short'] as const;
export type FormatId = (typeof FORMATS)[number];

/** A colour family a design may tint an Episode with; the index names it, the design owns the shade. */
export const ACCENTS = ['primary', 'amber', 'emerald', 'sky', 'rose', 'violet'] as const;
export type Accent = (typeof ACCENTS)[number];

/** An icon by name, so the index stays data; the page that draws it owns the mapping to a component. */
export const ICONS = [
  'book-open',
  'file-text',
  'coins',
  'brain',
  'users',
  'compass',
  'shield-check',
  'git-branch',
] as const;
export type EpisodeIcon = (typeof ICONS)[number];

export const STATUSES = ['published', 'upcoming'] as const;
export type EpisodeStatus = (typeof STATUSES)[number];

interface IndexedEpisode {
  readonly topic: TopicId;
  readonly format: FormatId;
  readonly accent: Accent;
  readonly icon: EpisodeIcon;
}

/** An Episode that exists: `slug` is a registered Episode, so it has a page. */
export interface PublishedEpisode extends IndexedEpisode {
  readonly slug: EpisodeSlug;
  readonly status: 'published';
  /** ISO calendar date, `YYYY-MM-DD`. */
  readonly publishedOn: string;
  /** Editorial order among published Episodes: 1 is the most featured. */
  readonly featuredRank: number;
}

/** An Episode announced but not written: no page, so no link. */
export interface UpcomingEpisode extends IndexedEpisode {
  readonly slug: string;
  readonly status: 'upcoming';
}

export type EpisodeIndexEntry = PublishedEpisode | UpcomingEpisode;

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SHARED_FIELDS = ['slug', 'status', 'topic', 'format', 'accent', 'icon'];
const PUBLISHED_ONLY_FIELDS = ['publishedOn', 'featuredRank'];

function fail(slug: unknown, message: string): never {
  throw new Error(`${String(slug)}: ${message}`);
}

/** `slug` and `field` read as "<slug>: <field>" in the error, so the message names the entry and the field at fault. */
function pick<T extends string>(where: [slug: unknown, field: string], value: unknown, allowed: readonly T[]): T {
  const found = allowed.find((candidate) => candidate === value);
  if (found === undefined) fail(where[0], `${where[1]} ${JSON.stringify(value)} is not one of ${allowed.join(', ')}`);
  return found;
}

/** `2026-02-30` matches the shape but is not a day: only a date that survives a round trip is one. */
function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function checkFields(slug: string, record: Record<string, unknown>, allowed: readonly string[]): void {
  const unknown = Object.keys(record).find((field) => !allowed.includes(field));
  if (unknown !== undefined) fail(slug, `unknown field ${JSON.stringify(unknown)}; the index holds ids, not strings`);
}

function parseSlug(raw: Record<string, unknown>, index: number): string {
  const { slug } = raw;
  if (typeof slug !== 'string' || !KEBAB_CASE.test(slug)) {
    fail(slug ?? `entry ${index}`, 'slug must be kebab-case');
  }
  return slug;
}

function parsePublished(slug: string, raw: Record<string, unknown>, common: IndexedEpisode): PublishedEpisode {
  if (!isEpisodeSlug(slug)) fail(slug, 'a published entry must name a registered Episode');
  const { publishedOn, featuredRank } = raw;
  if (!isCalendarDate(publishedOn)) fail(slug, 'publishedOn must be a calendar date, YYYY-MM-DD');
  if (!Number.isInteger(featuredRank) || (featuredRank as number) < 1) {
    fail(slug, 'featuredRank must be a positive whole number');
  }
  return { slug, status: 'published', ...common, publishedOn, featuredRank: featuredRank as number };
}

function parseEntry(raw: unknown, index: number): EpisodeIndexEntry {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error(`Episode index entry ${index} must be an object`);
  }
  const record = raw as Record<string, unknown>;
  const slug = parseSlug(record, index);
  const status = pick([slug, 'status'], record.status, STATUSES);
  checkFields(slug, record, status === 'published' ? [...SHARED_FIELDS, ...PUBLISHED_ONLY_FIELDS] : SHARED_FIELDS);
  const common: IndexedEpisode = {
    topic: pick([slug, 'topic'], record.topic, TOPICS),
    format: pick([slug, 'format'], record.format, FORMATS),
    accent: pick([slug, 'accent'], record.accent, ACCENTS),
    icon: pick([slug, 'icon'], record.icon, ICONS),
  };
  if (status === 'published') return parsePublished(slug, record, common);
  if (isEpisodeSlug(slug)) fail(slug, 'an upcoming entry must not name a registered Episode; publish it instead');
  return { slug, status, ...common };
}

/** Validates raw JSON into the typed index, or throws naming the entry and the field at fault. */
export function parseEpisodeIndex(raw: unknown): readonly EpisodeIndexEntry[] {
  if (!Array.isArray(raw)) throw new Error('Episode index must be an array');
  const entries = raw.map(parseEntry);
  const seen = new Set<string>();
  for (const { slug } of entries) {
    if (seen.has(slug)) throw new Error(`Episode index has a duplicate slug ${JSON.stringify(slug)}`);
    seen.add(slug);
  }
  return entries;
}

/** The published entries, narrowed so a caller reads `publishedOn` without a cast. */
function publishedOf(entries: readonly EpisodeIndexEntry[]): PublishedEpisode[] {
  return entries.filter((entry): entry is PublishedEpisode => entry.status === 'published');
}

function bySlug(a: EpisodeIndexEntry, b: EpisodeIndexEntry): number {
  return a.slug.localeCompare(b.slug);
}

/** Published Episodes by editorial rank, then the newer first, then by slug; at most `limit`. */
export function featured(entries: readonly EpisodeIndexEntry[], limit: number): PublishedEpisode[] {
  const ranked = publishedOf(entries).sort(
    (a, b) => a.featuredRank - b.featuredRank || b.publishedOn.localeCompare(a.publishedOn) || bySlug(a, b),
  );
  return ranked.slice(0, Math.max(limit, 0));
}

/** Published Episodes, newest first, then by slug; at most `limit`. */
export function newest(entries: readonly EpisodeIndexEntry[], limit: number): PublishedEpisode[] {
  const dated = publishedOf(entries).sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || bySlug(a, b));
  return dated.slice(0, Math.max(limit, 0));
}

/** Upcoming Episodes in the order the index lists them: the index is where their order is decided. */
export function upcoming(entries: readonly EpisodeIndexEntry[]): UpcomingEpisode[] {
  return entries.filter((entry): entry is UpcomingEpisode => entry.status === 'upcoming');
}

export interface EpisodeFilter {
  readonly topic?: TopicId;
  readonly format?: FormatId;
  readonly status?: EpisodeStatus;
}

/** Entries matching every field the filter names; an empty filter keeps them all, in their order. */
export function filterEpisodes(entries: readonly EpisodeIndexEntry[], filter: EpisodeFilter): EpisodeIndexEntry[] {
  return entries.filter(
    (entry) =>
      (filter.topic === undefined || entry.topic === filter.topic) &&
      (filter.format === undefined || entry.format === filter.format) &&
      (filter.status === undefined || entry.status === filter.status),
  );
}

export interface TopicGroup {
  readonly topic: TopicId;
  readonly entries: readonly EpisodeIndexEntry[];
}

/** Entries grouped under their topic, in vocabulary order; a topic nobody holds has no group. */
export function groupByTopic(entries: readonly EpisodeIndexEntry[]): TopicGroup[] {
  return TOPICS.map((topic) => ({ topic, entries: filterEpisodes(entries, { topic }) })).filter(
    ({ entries: held }) => held.length > 0,
  );
}

export interface FacetCount<T extends string> {
  readonly id: T;
  readonly count: number;
}

function countBy<T extends string>(
  entries: readonly EpisodeIndexEntry[],
  vocabulary: readonly T[],
  read: (entry: EpisodeIndexEntry) => T,
): FacetCount<T>[] {
  return vocabulary
    .map((id) => ({ id, count: entries.filter((entry) => read(entry) === id).length }))
    .filter(({ count }) => count > 0);
}

/** Topics with their entry counts, in vocabulary order, only those holding at least one entry. */
export function topicCounts(entries: readonly EpisodeIndexEntry[]): FacetCount<TopicId>[] {
  return countBy(entries, TOPICS, (entry) => entry.topic);
}

/** Formats with their entry counts, in vocabulary order, only those holding at least one entry. */
export function formatCounts(entries: readonly EpisodeIndexEntry[]): FacetCount<FormatId>[] {
  return countBy(entries, FORMATS, (entry) => entry.format);
}
