// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import type { Bundle, Constant, MechKey, Settings, Strength } from './software-ecology.types';

type Range = readonly [min: number, max: number, byDefault: number];

export const STRENGTH_RANGE: Readonly<Record<Strength, Range>> = {
  rework: [0, 1, 0.4],
  churn: [1, 4, 1.2],
};
export const CONST_RANGE: Readonly<Record<Constant, Range>> = {
  inspect: [1, 5, 2.4],
  redo: [0.1, 1, 0.3],
  keepExtra: [0, 2, 0.3],
  maxBounces: [0, 2, 2],
  pressure: [0, 3, 1.4],
};
export const MECH_RANGE: Readonly<Record<MechKey, Range>> = { ...STRENGTH_RANGE, ...CONST_RANGE };
export const STRENGTHS = Object.keys(STRENGTH_RANGE) as Strength[];
export const MECH_KEYS = Object.keys(MECH_RANGE) as MechKey[];

const valuesOf = <K extends MechKey>(
  table: Readonly<Record<K, Range>>,
  file: Partial<Record<MechKey, number>>,
): Record<K, number> =>
  Object.fromEntries(Object.entries<Range>(table).map(([k, r]) => [k, file[k as K] ?? r[2]])) as Record<K, number>;

export const fileMechanics = (B: Bundle): Pick<Settings, 'strength' | 'consts'> => {
  const file = B.data.mechanics ?? {};
  return { strength: valuesOf(STRENGTH_RANGE, file), consts: valuesOf(CONST_RANGE, file) };
};
export const strengthDefault = (k: Strength): number => STRENGTH_RANGE[k][2];
export const constOf = (s: Pick<Settings, 'consts'>, k: Constant): number => s.consts[k] ?? CONST_RANGE[k][2];
