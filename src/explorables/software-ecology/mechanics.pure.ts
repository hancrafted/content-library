/*
 * The use-case file's `mechanics` (design-ADR 0024 §5): the strengths a toolbar toggle switches and a slider sets, and
 * the model's constants, which no control shows. Each has its range in the file and its default; the settings carry
 * them apart, `strength` and `consts`.
 */
import type { Bundle, Constant, MechKey, Settings, Strength } from './software-ecology.types';

type Range = readonly [min: number, max: number, byDefault: number];

/** Each strength's range in the file and on its slider, and its default. */
export const STRENGTH_RANGE: Readonly<Record<Strength, Range>> = {
  rework: [0, 1, 0.4],
  churn: [1, 4, 1.2],
};
/**
 * Each constant's range in the file, and its default: an inspection's catch over a plain station's, a sent-back job's
 * size, the extra work of a kept bad input, the times a document may be sent back (the traffic solve tracks at most 2),
 * and how hard a filling backlog makes an inspection pass bad work unread.
 */
export const CONST_RANGE: Readonly<Record<Constant, Range>> = {
  inspect: [1, 5, 2.4],
  redo: [0.1, 1, 0.3],
  keepExtra: [0, 2, 0.3],
  maxBounces: [0, 2, 2],
  pressure: [0, 3, 1.4],
};
/** Every key a file's `mechanics` may hold: the strengths, then the constants. */
export const MECH_RANGE: Readonly<Record<MechKey, Range>> = { ...STRENGTH_RANGE, ...CONST_RANGE };
/** The mechanics with a strength slider on the page. */
export const STRENGTHS = Object.keys(STRENGTH_RANGE) as Strength[];
export const MECH_KEYS = Object.keys(MECH_RANGE) as MechKey[];

/** A table's keys, each the file's value when it has one, else its default. */
const valuesOf = <K extends MechKey>(
  table: Readonly<Record<K, Range>>,
  file: Partial<Record<MechKey, number>>,
): Record<K, number> =>
  Object.fromEntries(Object.entries<Range>(table).map(([k, r]) => [k, file[k as K] ?? r[2]])) as Record<K, number>;

/** A use case's strengths and constants: its file's `mechanics` over the defaults, each in its own field. */
export const fileMechanics = (B: Bundle): Pick<Settings, 'strength' | 'consts'> => {
  const file = B.data.mechanics ?? {};
  return { strength: valuesOf(STRENGTH_RANGE, file), consts: valuesOf(CONST_RANGE, file) };
};
/** A strength's default, for a slider that has no value yet. */
export const strengthDefault = (k: Strength): number => STRENGTH_RANGE[k][2];
/** A constant at these settings: the file's, else its default. */
export const constOf = (s: Pick<Settings, 'consts'>, k: Constant): number => s.consts[k] ?? CONST_RANGE[k][2];
