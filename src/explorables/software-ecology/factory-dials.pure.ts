/*
 * The factory model's tunables and dials (design-ADR 0024 §2–§3): Reality → center defaults → per-center overrides →
 * AI, the Customer at given settings, and the settings a preset starts from. Values are the reference build's,
 * illustrative, not measured.
 */
import type { Factory, FactoryNode } from './factory.types';
import type {
  AiQuality,
  AiSet,
  Arrivals,
  Bundle,
  CenterDials,
  Cust,
  Dials,
  Over,
  Preset,
  Settings,
  Strength,
} from './software-ecology.types';

/** One model step, in weeks. */
export const DTW = 1 / 480;
/** The speeds the page offers, 0 is pause; the schema and the speed menu read this list. */
export const SPEEDS = [0, 1, 2, 5, 10, 20] as const;
/** Working days a week, for the clock. */
export const DAYS = 5;
/** Every handoff takes a quarter working day, whatever the belt length. */
export const HANDOFF = 0.25 / DAYS;
/** Presets settle this many weeks before they show. */
export const WARM_WEEKS = 60;
/** In Ideal every work center is busy 70 % of the time. */
export const RHO_IDEAL = 0.7;
/** An AI work center finishes work this much faster, unless its dials say otherwise. */
export const AI_SPEED = 2.5;
/** Service times vary by 30 % (normal), unless the file says exponential. */
export const CV = 0.3;
/** A bad input that is kept takes 30 % longer. */
export const EXTRA = 0.3;
/** An inspection catches bad work this many times as often as a plain work center. */
export const INSPECT = 2.4;
/** Rates are averaged over about two weeks. */
export const TAU = 2;
/** The Customer's output and satisfaction over about six weeks. */
export const TAU_OUT = 6;
/** Documents in transit are pooled; beyond this they ride as counts on the last token. */
export const MAX_TOKENS = 4000;
/** Weeks of work waiting: amber from one week, red from two. */
export const AMBER = 1;
export const RED = 2;
/** A rework lane shows above 0.3 sent back a week, hides below 0.1. */
export const RET_SHOW = 0.3;
export const RET_HIDE = 0.1;
export { Q } from './factory-docs.pure.ts';

/** Rushing (Q114 B): effectiveness drops linearly from RUSH_FROM to RUSH_TO weeks of work waiting, by up to RUSH_MAX. */
export const RUSH_MAX = 15;
export const RUSH_FROM = 1;
export const RUSH_TO = 3;

/** A mechanic's strength range in the file, and its default. */
export const MECH_RANGE: Readonly<Record<Strength, readonly [number, number, number]>> = {
  rework: [0, 1, 0.4],
  churn: [1, 4, 1.2],
};
export const STRENGTHS = Object.keys(MECH_RANGE) as Strength[];
export const MECH_DEFAULTS = (): Record<Strength, number> => ({
  rework: MECH_RANGE.rework[2],
  churn: MECH_RANGE.churn[2],
});

const AI_QUALITY: Readonly<Record<AiQuality, number>> = { worse: -15, same: 0, better: 15 };
const ALL_DIALS = ['efficiency', 'effectiveness', 'fanout', 'ai'];

export const aiOn = (n: FactoryNode, s: Settings): boolean =>
  s.ai === 'all' ? true : Array.isArray(s.ai) ? s.ai.includes(n.id) : false;

const sliding = (n: FactoryNode, o: Over, s: Settings): { eff: number; base: number } => {
  const d0 = firstOf(n.def.dials, {}),
    m = firstOf(n.def.realistic, [100, 100]),
    k = s.reality / 100;
  return {
    eff: firstOf(o.eff, Math.round(firstOf(d0.efficiency, 100) + (m[0] - 100) * k)),
    base: firstOf(o.effv, Math.round(firstOf(d0.effectiveness, 100) + (m[1] - 100) * k)),
  };
};

/** The first value that is neither undefined nor null: `a ?? b ?? c`, with every value worked out first. */
export const firstOf = <T>(...xs: (T | null | undefined)[]): T => xs.find((x) => x !== undefined && x !== null) as T;

/** A work center's dials at the given settings. */
export const dials = (n: FactoryNode, s: Settings): Dials => {
  const o = firstOf(s.over[n.id], {}),
    d0 = firstOf(n.def.dials, {});
  const { eff, base } = sliding(n, o, s);
  const ai = !!firstOf<boolean>(o.ai, d0.ai, aiOn(n, s));
  const effv = Math.max(5, Math.min(100, base + (ai ? AI_QUALITY[s.aiq] : 0)));
  const fan = firstOf(o.fan, d0.fanout, n.role.fan);
  const aiSpeed = firstOf(o.aiSpeed, d0.aiSpeed, AI_SPEED),
    aiExtra = firstOf(o.aiExtra, d0.aiExtra, 1);
  const fanEff = fan * (ai ? aiExtra : 1),
    effEff = Math.round(eff * (ai ? aiSpeed : 1));
  return { eff, effv, base, ai, fan, aiSpeed, aiExtra, fanEff, effEff, en: firstOf(n.def.enabled, ALL_DIALS) };
};

export const mechOf = (s: Settings, k: Strength): number => (s.mech[k] ? (s.strength[k] ?? 0) : 0);
/** Jobs a week at size 1. */
export const speedOf = (n: FactoryNode, d: Dials): number => n.mu * (d.eff / 100) * (d.ai ? d.aiSpeed : 1);
export const rushOf = (n: FactoryNode): number =>
  RUSH_MAX * Math.max(0, Math.min(1, (n.Ws - RUSH_FROM) / (RUSH_TO - RUSH_FROM)));
export const effvNow = (n: FactoryNode, d: Dials): number => Math.max(5, d.effv - rushOf(n)) / 100;
/** A source's tickets a week and its arrivals at these settings: the dashboard's, else the file's, else the state's. */
export const ownOf = (
  src: { readonly id: string; readonly rate: number; readonly arrivals?: Arrivals },
  x: { readonly s: Pick<Settings, 'own'>; readonly mode: Arrivals },
): { rate: number; mode: Arrivals } => {
  const o = x.s.own[src.id] ?? {};
  return { rate: firstOf(o.rate, src.rate), mode: firstOf<Arrivals>(o.mode, src.arrivals, x.mode) };
};
/** Own tickets scale with the role's AI extra tasks. */
export const srcRate = (rate: number, d: Dials): number => rate * (d.ai ? d.aiExtra : 1);
export const productCo = (s: Settings): boolean => s.company === 'product';

/** The Customer at given settings: the file's values, a preset's overrides, then the dashboard's. */
export const custOf = (m: Pick<Factory, 'B'>, s: Settings): Cust => {
  const base = m.B.data.customer,
    c: Partial<Cust> = firstOf<Partial<Cust>>(s.cust, {});
  return {
    rate: firstOf(c.rate, base.rate, 0),
    mode: firstOf<Cust['mode']>(c.mode, base.arrivals, s.reality > 0 ? 'random' : 'steady'),
    mix: firstOf(c.mix, { ...base.mix }),
    good: firstOf(c.good, { ...firstOf(base.good, {}) }),
    bad: firstOf(c.bad, { ...firstOf(base.bad, {}) }),
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
    bad: { ...firstOf(pc.bad, base.bad, {}) },
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
    strength: { ...MECH_DEFAULTS(), ...(B.data.mechanics ?? {}) },
  };
};

/** The settings a preset starts from, the way the page applies them. */
export const startSettings = (B: Bundle, p: Preset): Settings => ({
  ...idealSettings(B.data.company ?? 'service'),
  strength: { ...MECH_DEFAULTS(), ...(B.data.mechanics ?? {}) },
  ...presetSettings(B, p),
});
