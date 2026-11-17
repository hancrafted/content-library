import type { TagId } from '@/content-store/schemas/fields';
import type { ResourceKind } from './resource-index.pure';

// decision: FE-007 §3
// decision: FE-001 §1.3
// decision: docs/decision-records/0019-resources-overview.md
export interface ResourceSelection {
  readonly query: string;
  readonly tags: readonly string[];
  readonly kinds: readonly string[];
}

export const NO_SELECTION: ResourceSelection = { query: '', tags: [], kinds: [] };

export interface FilterableResource {
  readonly slug: string;
  readonly kind: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly { readonly id: string; readonly label: string }[];
}

export interface ResourceChoice {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}

const fold = (text: string) => text.trim().toLocaleLowerCase();

export function matchingResources(
  cards: readonly FilterableResource[],
  selection: ResourceSelection,
): ReadonlySet<string> {
  const query = fold(selection.query);
  const kept = cards.filter((card) => {
    const text = fold([card.title, card.description, ...card.tags.map((tag) => tag.label)].join('\n'));
    const tagged = selection.tags.length === 0 || card.tags.some((tag) => selection.tags.includes(tag.id));
    const kinded = selection.kinds.length === 0 || selection.kinds.includes(card.kind);
    return tagged && kinded && text.includes(query);
  });
  return new Set(kept.map((card) => card.slug));
}

export function resourceTagChoices(
  cards: readonly FilterableResource[],
  vocabulary: readonly TagId[],
): ResourceChoice[] {
  return vocabulary.flatMap((id) => {
    const carrying = cards.flatMap((card) => card.tags.filter((tag) => tag.id === id));
    return carrying.length === 0 ? [] : [{ id, label: carrying[0].label, count: carrying.length }];
  });
}

export function resourceKindChoices(
  cards: readonly FilterableResource[],
  kinds: readonly ResourceKind[],
  names: Readonly<Record<ResourceKind, string>>,
): ResourceChoice[] {
  return kinds.flatMap((id) => {
    const count = cards.filter((card) => card.kind === id).length;
    return count === 0 ? [] : [{ id, label: names[id], count }];
  });
}
