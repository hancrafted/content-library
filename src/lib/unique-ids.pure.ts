import { refreshShadows } from './research-plan.pure';
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

/**
 * One refusal per research id held by more than one file. A staged refresh that its own plan lists shadows its wiki id
 * with leave (design-ADR 0016, Pipeline and evidence rule 4), so it is not counted.
 */
export function researchIdRefusals(
  research: readonly ResearchRecord[],
  plans: readonly { readonly path: string; readonly markdown: string }[],
): UniquenessRefusal[] {
  const shadows = refreshShadows(research, plans);
  return duplicates(research.filter((record) => !shadows.has(record)).map(({ id }) => id)).map((id) => ({
    kind: 'research' as const,
    record: id,
    message: 'the id is used by more than one research file',
  }));
}
