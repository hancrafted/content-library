import { TOP_CONCEPT_IDS, type TopConceptId } from '@/lib/episode-overview';
import { fillTemplate } from '@/lib/template.pure';
import type { EpisodeCard, Labelled } from './episode-card.pure';

/*
 * What the Episodes section decides before it draws anything: which published
 * Episodes spotlight, which cards the Browse grid shows for a selection and a
 * search query, and what each filter chip counts. No React (FE-007 §3), so the leaf only wires
 * state to these answers.
 */

/** A grid longer than this folds behind "Show all"; with 9 Episodes today the fold is not yet visible. */
export const BROWSE_CAP = 9;

/** Lead plus two companions: the bento holds three, as the Featured slots do. */
export const SPOTLIGHT_SIZE = 3;

/** The visitor's choices in the Browse grid; transient, held in memory only (FE-001). */
export interface BrowseSelection {
  /** The top Concepts the visitor pressed; a card needs any one of them, and none pressed lifts the filter. */
  readonly concepts: readonly TopConceptId[];
  /** The text the visitor typed into search; blank lifts the search. */
  readonly query: string;
  /** True once the visitor asked for every match instead of the first {@link BROWSE_CAP}. */
  readonly expanded: boolean;
}

export const INITIAL_SELECTION: BrowseSelection = { concepts: [], query: '', expanded: false };

/** The selection with the top Concept pressed, or released if it was already pressed. */
export function toggleConcept(selection: BrowseSelection, concept: TopConceptId): BrowseSelection {
  const pressed = selection.concepts;
  const concepts = pressed.includes(concept) ? pressed.filter((id) => id !== concept) : [...pressed, concept];
  return { ...selection, concepts };
}

/** Whether a top Concept is pressed or a query typed, i.e. whether "Reset filters" has anything to lift. */
export function hasActiveFilters(selection: BrowseSelection): boolean {
  return selection.concepts.length > 0 || fold(selection.query) !== '';
}

/** The cards newest first, ties by slug, then the upcoming ones in the order given. */
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

/** The text a query searches: the title, caption and every Concept name in the reader's locale, so a Concept's tooltip is left out. */
function searchText(card: EpisodeCard): string {
  return fold([card.title, card.caption, ...card.concepts.map((concept) => concept.label)].join('\n'));
}

function matchesQuery(card: EpisodeCard, query: string): boolean {
  const folded = fold(query);
  return folded === '' || searchText(card).includes(folded);
}

function matches(card: EpisodeCard, selection: BrowseSelection): boolean {
  const named = selection.concepts.length === 0 || card.concepts.some(({ id }) => selection.concepts.includes(id));
  return named && matchesQuery(card, selection.query);
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

export interface ConceptOption extends Labelled<TopConceptId> {
  readonly count: number;
}

/**
 * One chip per top Concept any card names, in theme order, counting what
 * pressing it alone would show under the typed query; an Episode with two
 * Concepts counts in both. The pressed Concepts do not change a count, so the row neither
 * jumps nor shrinks as the visitor widens the OR, and a chip the query
 * empties stays, at zero.
 */
export function conceptChoices(cards: readonly EpisodeCard[], selection: BrowseSelection): ConceptOption[] {
  const labels = new Map<TopConceptId, string>();
  for (const { id, label } of cards.flatMap((card) => card.concepts)) labels.set(id, label);
  const searched = cards.filter((card) => matchesQuery(card, selection.query));
  return TOP_CONCEPT_IDS.flatMap((id) => {
    const label = labels.get(id);
    if (label === undefined) return [];
    return [{ id, label, count: searched.filter((card) => card.concepts.some((concept) => concept.id === id)).length }];
  });
}

/** Whether a card names its Format: only once the cards span two Formats, since one Format tells the visitor nothing. */
export function showsFormat(cards: readonly EpisodeCard[]): boolean {
  return new Set(cards.map((card) => card.format.id)).size >= 2;
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
