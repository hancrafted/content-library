import type { IsoDate, TagId } from '@/content-store/schemas/fields';
import { monthLabelOf } from '@/shared/lib/date-label.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { isPastEvent } from './events.pure';

/*
 * The Events overview's two sections and its filter (design-ADR Events overview). Upcoming holds every Event from the
 * build day on, oldest first; Past every earlier one, newest first: the same line `isPastEvent` draws for the Event
 * page's notice. Each section is grouped by calendar month. The search and the Tag chips narrow both sections at once;
 * their state is transient (FE-001). No React (FE-007 §3).
 */

/** One month of a section: its key (`2026-10`), its heading in the reader's locale, and its Events in order. */
export interface MonthGroup<T> {
  readonly month: string;
  readonly label: string;
  readonly items: readonly T[];
}

export interface EventSections<T> {
  readonly upcoming: readonly MonthGroup<T>[];
  readonly past: readonly MonthGroup<T>[];
}

function byMonth<T extends { readonly date: IsoDate }>(items: readonly T[], locale: Locale): MonthGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const month = item.date.slice(0, 7);
    groups.set(month, [...(groups.get(month) ?? []), item]);
  }
  return [...groups].map(([month, members]) => ({ month, label: monthLabelOf(month, locale), items: members }));
}

/** Splits the Events on the build day and groups each side by month: Upcoming ascending, Past descending. */
export function groupEventsByMonth<T extends { readonly date: IsoDate }>(
  items: readonly T[],
  buildDay: IsoDate,
  locale: Locale,
): EventSections<T> {
  const ascending = [...items].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = ascending.filter((item) => !isPastEvent(item.date, buildDay));
  const past = ascending.filter((item) => isPastEvent(item.date, buildDay)).reverse();
  return { upcoming: byMonth(upcoming, locale), past: byMonth(past, locale) };
}

/** What the visitor narrowed the overview to: a search and the chosen Tags; none chosen keeps every Event. */
export interface EventSelection {
  readonly query: string;
  readonly tags: readonly string[];
}

export const NO_SELECTION: EventSelection = { query: '', tags: [] };

/** What the filter reads of a card: its slug, its words and its Tags, all in the reader's locale. */
interface Filterable {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly { readonly id: string; readonly label: string }[];
}

const fold = (text: string) => text.trim().toLocaleLowerCase();

/** The slugs of the Events the selection keeps, in the order given: the search over title, description and Tag names, and any chosen Tag. */
export function matchingEvents(cards: readonly Filterable[], selection: EventSelection): ReadonlySet<string> {
  const query = fold(selection.query);
  const kept = cards.filter((card) => {
    const text = fold([card.title, card.description, ...card.tags.map((tag) => tag.label)].join('\n'));
    const tagged = selection.tags.length === 0 || card.tags.some((tag) => selection.tags.includes(tag.id));
    return tagged && text.includes(query);
  });
  return new Set(kept.map((card) => card.slug));
}

/** One Tag chip: the Tag, its name and how many listed Events carry it. */
export interface EventTagChoice {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}

/** A chip for each Tag at least one card carries, in the vocabulary's order, with how many cards carry it. */
export function eventTagChoices(cards: readonly Filterable[], vocabulary: readonly TagId[]): EventTagChoice[] {
  return vocabulary.flatMap((id) => {
    const carrying = cards.flatMap((card) => card.tags.filter((tag) => tag.id === id));
    return carrying.length === 0 ? [] : [{ id, label: carrying[0].label, count: carrying.length }];
  });
}
