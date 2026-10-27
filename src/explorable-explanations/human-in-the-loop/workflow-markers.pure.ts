import {
  BUILT_IN_MARKERS,
  REVIEWER_MARKERS,
  type LimitDef,
  type SectionDef,
  type SlotDef,
} from './workflow-schema.types';

/* The `{{markers}}` of a section's text, and which of them a scope may use. */

/** Every marker name in the sections' text, trimmed, in order, repeats kept. */
export const markersIn = (sections: readonly SectionDef[]): string[] =>
  markerNamesIn(sections.map((each) => each.text));

/** Every marker name in the texts, trimmed, in order, repeats kept. */
export const markerNamesIn = (texts: readonly string[]): string[] =>
  texts.flatMap((text) => [...text.matchAll(/\{\{([^{}]+)\}\}/g)].map((found) => (found[1] ?? '').trim()));

/** The marker names a slot fills: `id`, or `id_1` … `id_N` of a multiple slot over a repeated stage of `width` rounds. */
export function slotMarkers(slot: SlotDef, width: number): string[] {
  if (slot.mode === 'single') return [slot.id];
  return Array.from({ length: width }, (_, at) => `${slot.id}_${at + 1}`);
}

/** The rule between the entries a `{{id_*}}` marker expands into. */
const BETWEEN = '\n\n---\n\n';

/** The text with each `{{id_*}}` of a multiple slot written out as `{{id_1}}` … `{{id_N}}`, `N` being the slot's width. */
export function expandEach(text: string, slots: readonly SlotDef[], widths: ReadonlyMap<string, number>): string {
  return text.replace(/\{\{\s*([^{}]+?)_\*\s*\}\}/g, (marker, id: string) => {
    const slot = slots.find((each) => each.id === id && each.mode === 'multiple');
    if (!slot) return marker;
    return slotMarkers(slot, widths.get(id) ?? 0)
      .map((name) => `{{${name}}}`)
      .join(BETWEEN);
  });
}

/** The sections with every `{{id_*}}` expanded. */
export const expandSections = (
  sections: readonly SectionDef[],
  slots: readonly SlotDef[],
  widths: ReadonlyMap<string, number>,
): SectionDef[] => sections.map((section) => ({ ...section, text: expandEach(section.text, slots, widths) }));

/** The marker a limit fills. */
export const limitMarker = (name: string): string => `limit.${name}`;

/** The value of a limit: its demo value in demo mode, else its full one. */
export const limitValue = (limit: LimitDef, demo: boolean): number => (demo ? limit.demo : limit.full);

export interface MarkerScope {
  /** The sections of a task's prompt, or the general reviewer. */
  readonly reviewer: boolean;
  readonly slots: readonly SlotDef[];
  /** Whether the task's stage repeats (for `{{item}}`). */
  readonly repeated: boolean;
  /** The rounds of the repeated stage each multiple slot takes, by slot id. */
  readonly widths?: ReadonlyMap<string, number>;
  /** The names the task declares under `limits`. */
  readonly limits?: readonly string[];
}

/** The markers a scope may use: built-ins (`item` only in a repeated stage), reviewer markers in the reviewer, its slots and limits. */
export function allowedMarkers({ reviewer, slots, repeated, widths, limits }: MarkerScope): ReadonlySet<string> {
  const builtIn = BUILT_IN_MARKERS.filter((name) => name !== 'item' || (!reviewer && repeated));
  const own = reviewer ? REVIEWER_MARKERS : slots.flatMap((slot) => slotMarkers(slot, widths?.get(slot.id) ?? 0));
  return new Set<string>([...builtIn, ...own, ...(reviewer ? [] : (limits ?? []).map(limitMarker))]);
}

/** The markers of the sections that the scope does not allow; `{{id_*}}` counts as the markers it expands into. */
export const unknownMarkers = (sections: readonly SectionDef[], scope: MarkerScope): string[] => {
  const allowed = allowedMarkers(scope);
  const expanded = expandSections(sections, scope.slots, scope.widths ?? new Map());
  return [...new Set(markersIn(expanded).filter((marker) => !allowed.has(marker)))];
};

/** The markers of a job's review checks that its stage does not allow: `{{item}}` in a repeated stage, and its limits. */
export const unknownCheckMarkers = (
  checks: readonly string[],
  scope: { readonly repeated: boolean; readonly limits?: readonly string[] },
): string[] => {
  const allowed = new Set<string>([...(scope.repeated ? ['item'] : []), ...(scope.limits ?? []).map(limitMarker)]);
  return [...new Set(markerNamesIn(checks).filter((marker) => !allowed.has(marker)))];
};
