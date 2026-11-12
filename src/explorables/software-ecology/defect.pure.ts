/*
 * Defect origin (design-ADR 0024 §5): the kinds a bad document can carry, and the Customer's per-kind follow-ups.
 */
import type { BadChances, Defect, KindChances } from './defect.types';

export const DEFECTS: readonly Defect[] = ['spec', 'code'];

/** No defect of either kind yet: a count per kind. */
export const perKind = (): Record<Defect, number> => ({ spec: 0, code: 0 });

const isKinded = (raw: BadChances): raw is Readonly<Partial<Record<Defect, Readonly<Record<string, number>>>>> =>
  Object.entries(raw).every(([k, v]) => (DEFECTS as readonly string[]).includes(k) && typeof v === 'object');

/** `customer.bad` per kind: a file's kinded map, or its one map for every kind; empty when there is none. */
export const kindChancesOf = (raw: BadChances | undefined): KindChances => {
  if (!raw || !Object.keys(raw).length) return { spec: {}, code: {} };
  if (isKinded(raw)) return { spec: { ...raw.spec }, code: { ...raw.code } };
  return { spec: { ...raw }, code: { ...raw } };
};

/** A copy of per-kind chances. */
export const copyKinds = (k: KindChances): KindChances => ({ spec: { ...k.spec }, code: { ...k.code } });

/** Every work center a bad release of any kind can reach. */
export const kindTargets = (k: KindChances): string[] => [...new Set([...Object.keys(k.spec), ...Object.keys(k.code)])];

/** Per-kind chances as a file writes them: one map when both kinds agree, else one map per kind. */
export const badOut = (k: KindChances): BadChances =>
  JSON.stringify(k.spec) === JSON.stringify(k.code) ? { ...k.spec } : copyKinds(k);
