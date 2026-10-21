/*
 * Slide 5's strip of 100 units of attention: one segment per message of the chat, in chat order, each in its group
 * (start, middle, newest), the middle's largest share marked as the spike a repeated detail keeps. Pure: the Slide
 * hands it the cornerstone's attention override and the chat's step kinds.
 */

export type StripGroup = 'start' | 'middle' | 'newest';
export type StripKind = 'start' | 'memory' | 'you' | 'ai' | 'tool';

export interface StripSegment {
  readonly id: string;
  readonly units: number;
  readonly group: StripGroup;
  readonly kind: StripKind;
  readonly spike: boolean;
}

export interface StripInput {
  /** The chat's step ids and kinds, in chat order. */
  readonly steps: readonly { readonly id: string; readonly kind: string }[];
  /** Units of attention per step id; a step without units is left out of the strip. */
  readonly units: Readonly<Record<string, number>>;
  /** The step ids that open the chat and the ones that close it; every other step is the middle. */
  readonly start: readonly string[];
  readonly newest: readonly string[];
}

/** The attention a strip shares out: the Brief's hundred units. */
export const STRIP_TOTAL = 100;

const KINDS: ReadonlySet<string> = new Set<StripKind>(['start', 'memory', 'you', 'ai', 'tool']);

function groupOf(id: string, input: StripInput): StripGroup {
  if (input.start.includes(id)) return 'start';
  return input.newest.includes(id) ? 'newest' : 'middle';
}

/** The strip's segments; throws when the units do not add up to a hundred or a step is no message kind. */
export function stripSegments(input: StripInput): readonly StripSegment[] {
  const placed = input.steps.flatMap(({ id, kind }) => {
    const units = input.units[id];
    if (units === undefined) return [];
    if (!KINDS.has(kind)) throw new Error(`attention strip: step "${id}" is a ${kind}, not a message`);
    return [{ id, units, group: groupOf(id, input), kind: kind as StripKind }];
  });
  const total = placed.reduce((sum, { units }) => sum + units, 0);
  if (total !== STRIP_TOTAL) throw new Error(`attention strip: the units add up to ${total}, not ${STRIP_TOTAL}`);
  const middle = placed.filter(({ group }) => group === 'middle');
  const top = middle.reduce((most, each) => Math.max(most, each.units), 0);
  const spike = middle.find(({ units }) => units === top)?.id;
  return placed.map((segment) => ({ ...segment, spike: segment.id === spike }));
}

/** The units of each group, and where the spike starts along the strip. */
export function stripTotals(segments: readonly StripSegment[]): Readonly<Record<StripGroup, number>> & {
  readonly beforeSpike: number;
} {
  const sum = (group: StripGroup) =>
    segments.filter((each) => each.group === group).reduce((total, each) => total + each.units, 0);
  const spikeAt = segments.findIndex((each) => each.spike);
  const beforeSpike = segments.slice(0, Math.max(spikeAt, 0)).reduce((total, each) => total + each.units, 0);
  return { start: sum('start'), middle: sum('middle'), newest: sum('newest'), beforeSpike };
}
