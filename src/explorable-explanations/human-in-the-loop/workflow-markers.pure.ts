import { BUILT_IN_MARKERS, REVIEWER_MARKERS, type SectionDef, type SlotDef } from './workflow-schema.types';

/* The `{{markers}}` of a section's text, and which of them a scope may use. */

/** Every marker name in the sections' text, trimmed, in order, repeats kept. */
export const markersIn = (sections: readonly SectionDef[]): string[] =>
  sections.flatMap((section) =>
    [...section.text.matchAll(/\{\{([^{}]+)\}\}/g)].map((found) => (found[1] ?? '').trim()),
  );

/** The marker names a slot fills: `id`, or `id_1` … `id_N` of a multiple slot over a fan-out of `width` chats. */
export function slotMarkers(slot: SlotDef, width: number): string[] {
  if (slot.mode === 'single') return [slot.id];
  return Array.from({ length: width }, (_, at) => `${slot.id}_${at + 1}`);
}

export interface MarkerScope {
  /** The sections of a task's prompt, or the general reviewer. */
  readonly reviewer: boolean;
  readonly slots: readonly SlotDef[];
  /** The chats of the task itself (for `{{n}}`). */
  readonly fanOut: number | undefined;
  /** The chats of the fan-out each multiple slot takes, by slot id. */
  readonly widths?: ReadonlyMap<string, number>;
}

/** The markers a scope may use: built-ins (`n` only in a fan-out), reviewer markers in the reviewer, its slots. */
export function allowedMarkers({ reviewer, slots, fanOut, widths }: MarkerScope): ReadonlySet<string> {
  const builtIn = BUILT_IN_MARKERS.filter((name) => name !== 'n' || (!reviewer && fanOut !== undefined));
  const own = reviewer ? REVIEWER_MARKERS : slots.flatMap((slot) => slotMarkers(slot, widths?.get(slot.id) ?? 0));
  return new Set<string>([...builtIn, ...own]);
}

/** The markers of the sections that the scope does not allow. */
export const unknownMarkers = (sections: readonly SectionDef[], scope: MarkerScope): string[] => {
  const allowed = allowedMarkers(scope);
  return [...new Set(markersIn(sections).filter((marker) => !allowed.has(marker)))];
};
