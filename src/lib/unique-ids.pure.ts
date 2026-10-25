import type { ResearchRecord } from './research-record.pure';

/*
 * Ids that must be unique across records: research ids across the wiki and Staging. The content store reports
 * these refusals with the rest; Slide slugs have their own module (`slide-slugs.pure.ts`).
 */

/** One refusal of a doubled id, in the content store's refusal shape. */
export interface UniquenessRefusal {
  readonly kind: 'research';
  readonly record: string;
  readonly message: string;
}

/** Every item that occurs more than once, each once. */
export function duplicates(items: readonly string[]): string[] {
  return [...new Set(items.filter((item, at) => items.indexOf(item) !== at))];
}

export function researchIdRefusals(research: readonly ResearchRecord[]): UniquenessRefusal[] {
  return duplicates(research.map(({ id }) => id)).map((id) => ({
    kind: 'research' as const,
    record: id,
    message: 'the id is used by more than one research file',
  }));
}
