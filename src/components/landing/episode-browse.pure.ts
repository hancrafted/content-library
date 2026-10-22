import { FILTER_TAGS, FORMATS, type FormatId, type TagId } from '@/lib/episode-overview';
import { fillTemplate } from '@/lib/template.pure';
import type { EpisodeCard, Labelled } from './episode-card.pure';

/*
 * What the Episodes section decides before it draws anything: which published
 * Episodes spotlight, which cards the Browse grid shows for a selection and a
 * search query, and what each filter chip counts. No React (FE-007 §3), so the leaf only wires
 * state to these answers.
 */

/** The chip that lifts a filter. */
export const ALL = 'all';
export type Facet<Id extends string> = Id | typeof ALL;

/** A grid longer than this folds behind "Show all"; with 9 Episodes today the fold is not yet visible. */
export const BROWSE_CAP = 9;

/** Lead plus two companions: the bento holds three, as the Featured slots do. */
export const SPOTLIGHT_SIZE = 3;

/** The visitor's choices in the Browse grid; transient, held in memory only (FE-001). */
export interface BrowseSelection {
  readonly tag: Facet<TagId>;
  readonly format: Facet<FormatId>;
  /** The text the visitor typed into search; blank lifts the search. */
  readonly query: string;
  /** True once the visitor asked for every match instead of the first {@link BROWSE_CAP}. */
  readonly expanded: boolean;
}

export const INITIAL_SELECTION: BrowseSelection = { tag: ALL, format: ALL, query: '', expanded: false };

export interface Spotlight {
  readonly lead: EpisodeCard | null;
  readonly side: readonly EpisodeCard[];
}

/** The published cards holding a Featured slot, by rank: one lead and the rest beside it; upcoming cards never qualify. */
export function spotlightOf(cards: readonly EpisodeCard[], size: number = SPOTLIGHT_SIZE): Spotlight {
  const ranked = cards
    .filter((card) => card.status === 'published' && card.featuredRank !== null)
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0));
  const [lead = null, ...side] = ranked.slice(0, Math.max(size, 0));
  return { lead, side };
}

/** Folds case and accents away, so "befahigung" finds "Befähigung". */
function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

/** The text a query searches: the title, caption and every Tag name in the reader's locale, so a Tag's tooltip is left out. */
function searchText(card: EpisodeCard): string {
  return fold([card.title, card.caption, ...card.tags.map((tag) => tag.label)].join('\n'));
}

/** What narrows the grid: every choice but the fold. */
type Narrowing = Omit<BrowseSelection, 'expanded'>;

function matches(card: EpisodeCard, selection: Narrowing): boolean {
  const query = fold(selection.query);
  return (
    (selection.tag === ALL || card.tags.some((tag) => tag.id === selection.tag)) &&
    (selection.format === ALL || card.format.id === selection.format) &&
    (query === '' || searchText(card).includes(query))
  );
}

export interface BrowseView {
  /** Cards that fit the selection, before the cap. */
  readonly matching: number;
  /** Slugs to show, in card order. */
  readonly visible: ReadonlySet<string>;
  /** Matches folded away by the cap. */
  readonly overflow: number;
  /** True when the matches outnumber the cap, so the fold control has something to fold or unfold. */
  readonly foldable: boolean;
}

/** Which cards the grid shows: every match, until the cap folds the tail unless the visitor expanded it. */
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

export interface FacetOption<Id extends string> extends Labelled<Id> {
  readonly count: number;
}

export interface FacetChoices<Id extends string> {
  /** Cards the other filter leaves, i.e. what the all-chip would show. */
  readonly all: number;
  readonly options: readonly FacetOption<Id>[];
}

interface ChoiceSource<Id extends string> {
  readonly cards: readonly EpisodeCard[];
  readonly vocabulary: readonly Id[];
  /** Every value the card holds for this facet: a card counts under each. */
  readonly read: (card: EpisodeCard) => readonly Labelled<Id>[];
  /** What the other filter lets through: the cards this facet counts. */
  readonly counted: (card: EpisodeCard) => boolean;
}

function choicesOf<Id extends string>({ cards, vocabulary, read, counted }: ChoiceSource<Id>): FacetChoices<Id> {
  const labels = new Map<Id, string>();
  for (const { id, label } of cards.flatMap(read)) labels.set(id, label);
  const kept = cards.filter(counted);
  const options = vocabulary.flatMap((id) => {
    const label = labels.get(id);
    if (label === undefined) return [];
    return [{ id, label, count: kept.filter((card) => read(card).some((value) => value.id === id)).length }];
  });
  return { all: kept.length, options };
}

/**
 * One chip per filter Tag any card carries, in vocabulary order, counting what
 * each would show under the chosen Format and query; an Episode with two Tags counts in both. A chip the Format empties stays, at zero,
 * so the row does not jump while the visitor narrows.
 */
export function tagChoices(cards: readonly EpisodeCard[], selection: BrowseSelection): FacetChoices<TagId> {
  return choicesOf({
    cards,
    vocabulary: FILTER_TAGS,
    read: (card) => card.tags,
    counted: (card) => matches(card, { ...selection, tag: ALL }),
  });
}

/** The Format twin of {@link tagChoices}. */
export function formatChoices(cards: readonly EpisodeCard[], selection: BrowseSelection): FacetChoices<FormatId> {
  return choicesOf({
    cards,
    vocabulary: FORMATS,
    read: (card) => [card.format],
    counted: (card) => matches(card, { ...selection, format: ALL }),
  });
}

/** Whether a card names its Format: only once the cards span two Formats, since one Format tells the visitor nothing. */
export function showsFormat(cards: readonly EpisodeCard[]): boolean {
  return new Set(cards.map((card) => card.format.id)).size >= 2;
}

/** A filter with fewer than two values has nothing to choose between, so it earns no control. */
export function hasChoice(choices: FacetChoices<string>): boolean {
  return choices.options.length >= 2;
}

export interface ResultsLabels {
  readonly none: string;
  readonly one: string;
  readonly other: string;
}

/** The sentence for the live region: German and English both put exactly 1 in the singular. */
export function resultsText(labels: ResultsLabels, count: number): string {
  if (count === 0) return labels.none;
  return count === 1 ? labels.one : fillTemplate(labels.other, { count });
}
