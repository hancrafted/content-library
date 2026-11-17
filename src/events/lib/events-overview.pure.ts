import type { IsoDate, TagId } from '@/content-store/schemas/fields';
import { monthLabelOf } from '@/shared/lib/date-label.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { isPastEvent } from './events.pure';

// decision: FE-007 §3
// decision: FE-001 §1.3
// decision: docs/adr/0018-events-overview.md
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

export interface EventSelection {
  readonly query: string;
  readonly tags: readonly string[];
}

export const NO_SELECTION: EventSelection = { query: '', tags: [] };

interface Filterable {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly { readonly id: string; readonly label: string }[];
}

const fold = (text: string) => text.trim().toLocaleLowerCase();

export function matchingEvents(cards: readonly Filterable[], selection: EventSelection): ReadonlySet<string> {
  const query = fold(selection.query);
  const kept = cards.filter((card) => {
    const text = fold([card.title, card.description, ...card.tags.map((tag) => tag.label)].join('\n'));
    const tagged = selection.tags.length === 0 || card.tags.some((tag) => selection.tags.includes(tag.id));
    return tagged && text.includes(query);
  });
  return new Set(kept.map((card) => card.slug));
}

export interface EventTagChoice {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}

export function eventTagChoices(cards: readonly Filterable[], vocabulary: readonly TagId[]): EventTagChoice[] {
  return vocabulary.flatMap((id) => {
    const carrying = cards.flatMap((card) => card.tags.filter((tag) => tag.id === id));
    return carrying.length === 0 ? [] : [{ id, label: carrying[0].label, count: carrying.length }];
  });
}
