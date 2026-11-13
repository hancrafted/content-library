/*
 * The settings a run starts from (design-ADR 0024 §3): the Customer at given settings, Ideal, Realistic and the
 * settings a preset sets. Values come from the Bundle's file; the dials' own tunables stay in `factory-dials.pure.ts`.
 */
import { copyKinds, kindChancesOf } from './defect.pure.ts';
import { firstOf } from './factory-dials.pure.ts';
import type { Factory } from './factory.types';
import { fileMechanics } from './mechanics.pure.ts';
import type { AiSet, Bundle, CenterDials, Cust, Over, Preset, Settings } from './software-ecology.types';

/** The Customer at given settings: the file's values, a preset's overrides, then the dashboard's. */
export const custOf = (m: Pick<Factory, 'B'>, s: Settings): Cust => {
  const base = m.B.data.customer,
    c: Partial<Cust> = firstOf<Partial<Cust>>(s.cust, {});
  return {
    rate: firstOf(c.rate, base.rate, 0),
    mode: firstOf<Cust['mode']>(c.mode, base.arrivals, s.reality > 0 ? 'random' : 'steady'),
    mix: firstOf(c.mix, { ...base.mix }),
    good: firstOf(c.good, { ...firstOf(base.good, {}) }),
    bad: c.bad ? copyKinds(c.bad) : kindChancesOf(base.bad),
  };
};

/** The settings of Ideal, keeping the company. */
export const idealSettings = (company: Settings['company']): Settings => ({
  preset: 'ideal',
  reality: 0,
  ai: 'off',
  aiq: 'same',
  over: {},
  own: {},
  cust: null,
  mech: { rework: true, churn: true, complaints: true },
  strength: {},
  consts: {},
  company,
});

/** A preset's dial names, as the overrides call them; a preset's `ai` per center is not an override. */
const OVER_OF: readonly (readonly [keyof CenterDials, keyof Over])[] = [
  ['efficiency', 'eff'],
  ['effectiveness', 'effv'],
  ['fanout', 'fan'],
  ['aiSpeed', 'aiSpeed'],
  ['aiExtra', 'aiExtra'],
];

const overOf = (p: Preset): Record<string, Over> =>
  Object.fromEntries(
    Object.entries(firstOf(p.dials, {})).map(([id, o]) => [
      id,
      Object.fromEntries(OVER_OF.filter(([k]) => o[k] !== undefined).map(([k, x]) => [x, o[k]])) as Over,
    ]),
  );

/** The settings a preset sets: reality, AI, dial overrides and the Customer. */
export const presetSettings = (B: Bundle, p: Preset): Pick<Settings, 'preset' | 'reality' | 'ai' | 'over' | 'cust'> => {
  const reality = firstOf(p.reality, 0),
    base = B.data.customer,
    pc = firstOf(p.customer, {});
  const cust: Cust = {
    rate: firstOf(pc.rate, base.rate),
    mode: firstOf<Cust['mode']>(pc.arrivals, base.arrivals, reality > 0 ? 'random' : 'steady'),
    mix: { ...firstOf(pc.mix, base.mix) },
    good: { ...firstOf(pc.good, base.good, {}) },
    bad: kindChancesOf(firstOf(pc.bad, base.bad, {})),
  };
  return { preset: p.id, reality, ai: firstOf<AiSet>(p.ai, 'off'), over: overOf(p), cust };
};

/** The settings of Realistic: the file's realistic preset if it has one. */
export const realisticSettings = (B: Bundle, company: Settings['company']): Settings => {
  const p = B.data.presets.find((x) => x.id === 'realistic') ?? { id: 'realistic', reality: 100 };
  return {
    ...idealSettings(company),
    ...presetSettings(B, p),
    reality: 100,
    ai: 'off',
    over: {},
    ...fileMechanics(B),
  };
};

/** The settings a preset starts from, the way the page applies them. */
export const startSettings = (B: Bundle, p: Preset): Settings => ({
  ...idealSettings(B.data.company ?? 'service'),
  ...fileMechanics(B),
  ...presetSettings(B, p),
});
