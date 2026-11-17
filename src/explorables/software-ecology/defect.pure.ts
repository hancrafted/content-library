// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import type { BadChances, Defect, KindChances } from './defect.types';

export const DEFECTS: readonly Defect[] = ['spec', 'code'];

export const perKind = (): Record<Defect, number> => ({ spec: 0, code: 0 });

const isKinded = (raw: BadChances): raw is Readonly<Partial<Record<Defect, Readonly<Record<string, number>>>>> =>
  Object.entries(raw).every(([k, v]) => (DEFECTS as readonly string[]).includes(k) && typeof v === 'object');

export const kindChancesOf = (raw: BadChances | undefined): KindChances => {
  if (!raw || !Object.keys(raw).length) return { spec: {}, code: {} };
  if (isKinded(raw)) return { spec: { ...raw.spec }, code: { ...raw.code } };
  return { spec: { ...raw }, code: { ...raw } };
};

export const copyKinds = (k: KindChances): KindChances => ({ spec: { ...k.spec }, code: { ...k.code } });

export const kindTargets = (k: KindChances): string[] => [...new Set([...Object.keys(k.spec), ...Object.keys(k.code)])];

export const badOut = (k: KindChances): BadChances =>
  JSON.stringify(k.spec) === JSON.stringify(k.code) ? { ...k.spec } : copyKinds(k);
