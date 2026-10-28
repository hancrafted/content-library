import type { TagId, TemplateType } from '@/content-store/schemas/fields';

/*
 * The Resources overview's filter (design-ADR 0019, mirroring the Events overview's): a search over title,
 * description and Tag names, Tag chips and a type filter. A chosen group keeps a Resource that matches any of its
 * choices; the search and the two groups combine with AND. The state is transient (FE-001). No React (FE-007 §3).
 */

/** What the visitor narrowed the overview to; nothing chosen keeps every Resource. */
export interface ResourceSelection {
  readonly query: string;
  readonly tags: readonly string[];
  readonly types: readonly string[];
}

export const NO_SELECTION: ResourceSelection = { query: '', tags: [], types: [] };

/** What the filter reads of a card: its slug, type, words and Tags, in the reader's locale. */
export interface FilterableResource {
  readonly slug: string;
  readonly type: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly { readonly id: string; readonly label: string }[];
}

/** One chip: the Tag or type, its name and how many Resources carry it. */
export interface ResourceChoice {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}

const fold = (text: string) => text.trim().toLocaleLowerCase();

/** The slugs of the Resources the selection keeps, in the order given. */
export function matchingResources(
  cards: readonly FilterableResource[],
  selection: ResourceSelection,
): ReadonlySet<string> {
  const query = fold(selection.query);
  const kept = cards.filter((card) => {
    const text = fold([card.title, card.description, ...card.tags.map((tag) => tag.label)].join('\n'));
    const tagged = selection.tags.length === 0 || card.tags.some((tag) => selection.tags.includes(tag.id));
    const typed = selection.types.length === 0 || selection.types.includes(card.type);
    return tagged && typed && text.includes(query);
  });
  return new Set(kept.map((card) => card.slug));
}

/** A chip for each Tag at least one Resource carries, in the vocabulary's order, with how many carry it. */
export function resourceTagChoices(
  cards: readonly FilterableResource[],
  vocabulary: readonly TagId[],
): ResourceChoice[] {
  return vocabulary.flatMap((id) => {
    const carrying = cards.flatMap((card) => card.tags.filter((tag) => tag.id === id));
    return carrying.length === 0 ? [] : [{ id, label: carrying[0].label, count: carrying.length }];
  });
}

/** A chip for each type at least one Resource has, in the closed order, named by `names`, with how many have it. */
export function resourceTypeChoices(
  cards: readonly FilterableResource[],
  types: readonly TemplateType[],
  names: Readonly<Record<TemplateType, string>>,
): ResourceChoice[] {
  return types.flatMap((id) => {
    const count = cards.filter((card) => card.type === id).length;
    return count === 0 ? [] : [{ id, label: names[id], count }];
  });
}
