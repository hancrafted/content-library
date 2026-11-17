import {
  BUILT_IN_MARKERS,
  REVIEWER_MARKERS,
  type LimitDef,
  type SectionDef,
  type SlotDef,
} from './workflow-schema.types.ts';

export const markersIn = (sections: readonly SectionDef[]): string[] =>
  markerNamesIn(sections.map((each) => each.text));

export const markerNamesIn = (texts: readonly string[]): string[] =>
  texts.flatMap((text) => [...text.matchAll(/\{\{([^{}]+)\}\}/g)].map((found) => (found[1] ?? '').trim()));

export function slotMarkers(slot: SlotDef, width: number): string[] {
  if (slot.mode === 'single') return [slot.id];
  return Array.from({ length: width }, (_, at) => `${slot.id}_${at + 1}`);
}

const BETWEEN = '\n\n---\n\n';

export function expandEach(text: string, slots: readonly SlotDef[], widths: ReadonlyMap<string, number>): string {
  return text.replace(/\{\{\s*([^{}]+?)_\*\s*\}\}/g, (marker, id: string) => {
    const slot = slots.find((each) => each.id === id && each.mode === 'multiple');
    if (!slot) return marker;
    return slotMarkers(slot, widths.get(id) ?? 0)
      .map((name) => `{{${name}}}`)
      .join(BETWEEN);
  });
}

export const expandSections = (
  sections: readonly SectionDef[],
  slots: readonly SlotDef[],
  widths: ReadonlyMap<string, number>,
): SectionDef[] => sections.map((section) => ({ ...section, text: expandEach(section.text, slots, widths) }));

export const limitMarker = (name: string): string => `limit.${name}`;

export const limitValue = (limit: LimitDef, demo: boolean): number => (demo ? limit.demo : limit.full);

export interface MarkerScope {
  readonly reviewer: boolean;
  readonly slots: readonly SlotDef[];
  readonly repeated: boolean;
  readonly widths?: ReadonlyMap<string, number>;
  readonly limits?: readonly string[];
}

export function allowedMarkers({ reviewer, slots, repeated, widths, limits }: MarkerScope): ReadonlySet<string> {
  const builtIn = BUILT_IN_MARKERS.filter((name) => name !== 'item' || (!reviewer && repeated));
  const own = reviewer ? REVIEWER_MARKERS : slots.flatMap((slot) => slotMarkers(slot, widths?.get(slot.id) ?? 0));
  return new Set<string>([...builtIn, ...own, ...(reviewer ? [] : (limits ?? []).map(limitMarker))]);
}

export const unknownMarkers = (sections: readonly SectionDef[], scope: MarkerScope): string[] => {
  const allowed = allowedMarkers(scope);
  const expanded = expandSections(sections, scope.slots, scope.widths ?? new Map());
  return [...new Set(markersIn(expanded).filter((marker) => !allowed.has(marker)))];
};

export const unknownCheckMarkers = (
  checks: readonly string[],
  scope: { readonly repeated: boolean; readonly limits?: readonly string[] },
): string[] => {
  const allowed = new Set<string>([...(scope.repeated ? ['item'] : []), ...(scope.limits ?? []).map(limitMarker)]);
  return [...new Set(markerNamesIn(checks).filter((marker) => !allowed.has(marker)))];
};
