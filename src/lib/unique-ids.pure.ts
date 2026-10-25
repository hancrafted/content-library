import type { SlideFolder } from './content-schemas.pure';
import type { ResearchRecord } from './research-record.pure';

/*
 * The ids that must be unique across records: Slide slugs across every Episode folder and the Slide pool, and
 * research ids across the wiki and Staging. The content store reports these refusals with the rest.
 */

/** One refusal of a doubled id, in the content store's refusal shape. */
export interface UniquenessRefusal {
  readonly kind: 'slide' | 'research';
  readonly record: string;
  readonly message: string;
}

/** Every item that occurs more than once, each once. */
export function duplicates(items: readonly string[]): string[] {
  return [...new Set(items.filter((item, at) => items.indexOf(item) !== at))];
}

/**
 * Slide slugs are unique across every Episode folder and the Slide pool together (design-ADR 0016, Slide reuse rule
 * 7), so a reused Slide keeps its slug and anchor wherever it is placed. A Title slide is exempt: its anchor is `top`.
 */
export function slideSlugRefusals(slides: readonly SlideFolder[]): UniquenessRefusal[] {
  const placed = slides.filter(({ title }) => !title);
  return duplicates(placed.map(({ slug }) => slug)).map((slug) => ({
    kind: 'slide' as const,
    record: slug,
    message: `the slug is used by more than one Slide: ${placed
      .filter((each) => each.slug === slug)
      .map(({ path }) => path)
      .join(', ')}`,
  }));
}

export function researchIdRefusals(research: readonly ResearchRecord[]): UniquenessRefusal[] {
  return duplicates(research.map(({ id }) => id)).map((id) => ({
    kind: 'research' as const,
    record: id,
    message: 'the id is used by more than one research file',
  }));
}
