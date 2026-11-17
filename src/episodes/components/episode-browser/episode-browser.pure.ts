import type { TagId } from '@/content-store/schemas/fields';
import type { EpisodeCard, Labelled } from '@/episodes/components/episode-card/episode-card.pure';
import { fillTemplate } from '@/shared/lib/template.pure';

// decision: FE-007 §3
export const FILTER_TAGS = [
  'context-engineering',
  'agentic-ai',
  'markdown',
  'cost',
  'sales',
] as const satisfies readonly TagId[];

export const BROWSE_CAP = 9;

export const SPOTLIGHT_SIZE = 3;

// decision: FE-001 §1
export interface BrowseSelection {
  readonly tags: readonly TagId[];
  readonly query: string;
  readonly expanded: boolean;
}

export const INITIAL_SELECTION: BrowseSelection = { tags: [], query: '', expanded: false };

export function toggleTag(selection: BrowseSelection, tag: TagId): BrowseSelection {
  const tags = selection.tags.includes(tag) ? selection.tags.filter((id) => id !== tag) : [...selection.tags, tag];
  return { ...selection, tags };
}

export function hasActiveFilters(selection: BrowseSelection): boolean {
  return selection.tags.length > 0 || fold(selection.query) !== '';
}

export function newestFirst(cards: readonly EpisodeCard[]): EpisodeCard[] {
  const published = cards
    .filter((card) => card.status === 'published')
    .sort((a, b) => (b.publishedOn ?? '').localeCompare(a.publishedOn ?? '') || a.slug.localeCompare(b.slug));
  return [...published, ...cards.filter((card) => card.status !== 'published')];
}

export interface Spotlight {
  readonly lead: EpisodeCard | null;
  readonly side: readonly EpisodeCard[];
}

export function spotlightOf(cards: readonly EpisodeCard[], size: number = SPOTLIGHT_SIZE): Spotlight {
  const ranked = cards
    .filter((card) => card.status === 'published' && card.featuredRank !== null)
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0));
  const [lead = null, ...side] = ranked.slice(0, Math.max(size, 0));
  return { lead, side };
}

function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

function searchText(card: EpisodeCard): string {
  return fold([card.title, card.caption, ...card.tags.map((tag) => tag.label)].join('\n'));
}

function matchesQuery(card: EpisodeCard, query: string): boolean {
  const folded = fold(query);
  return folded === '' || searchText(card).includes(folded);
}

function matches(card: EpisodeCard, selection: BrowseSelection): boolean {
  const tagged = selection.tags.length === 0 || card.tags.some((tag) => selection.tags.includes(tag.id));
  return tagged && matchesQuery(card, selection.query);
}

export interface BrowseView {
  readonly matching: number;
  readonly visible: ReadonlySet<string>;
  readonly overflow: number;
  readonly foldable: boolean;
}

export function browseView(
  cards: readonly EpisodeCard[],
  selection: BrowseSelection,
  cap: number = BROWSE_CAP,
): BrowseView {
  const matching = cards.filter((card) => matches(card, selection));
  const shown = selection.expanded ? matching : matching.slice(0, Math.max(cap, 0));
  return {
    matching: matching.length,
    visible: new Set(shown.map((card) => card.slug)),
    overflow: matching.length - shown.length,
    foldable: matching.length > Math.max(cap, 0),
  };
}

export interface TagOption extends Labelled<TagId> {
  readonly count: number;
}

export function tagChoices(cards: readonly EpisodeCard[], selection: BrowseSelection): TagOption[] {
  const labels = new Map<TagId, string>();
  for (const { id, label } of cards.flatMap((card) => card.tags)) labels.set(id, label);
  const searched = cards.filter((card) => matchesQuery(card, selection.query));
  return FILTER_TAGS.flatMap((id) => {
    const label = labels.get(id);
    if (label === undefined) return [];
    return [{ id, label, count: searched.filter((card) => card.tags.some((tag) => tag.id === id)).length }];
  });
}

export function showsFormat(cards: readonly EpisodeCard[]): boolean {
  return new Set(cards.map((card) => card.format.id)).size >= 2;
}

export interface ResultsLabels {
  readonly none: string;
  readonly one: string;
  readonly other: string;
}

export function resultsText(labels: ResultsLabels, count: number): string {
  if (count === 0) return labels.none;
  return count === 1 ? labels.one : fillTemplate(labels.other, { count });
}
