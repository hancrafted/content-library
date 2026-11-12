/*
 * The factory model's tunables and dials (design-ADR 0024 §2–§3): Reality → center defaults → per-center overrides →
 * AI, the Customer at given settings, and the settings a preset starts from. Values are the reference build's,
 * illustrative, not measured.
 */
import { copyKinds, kindChancesOf } from './defect.pure.ts';
import type { Factory, FactoryNode } from './factory.types';
import { constOf, fileMechanics } from './mechanics.pure.ts';
import type {
  AiQuality,
  AiSet,
  Arrivals,
  Bundle,
  CenterDials,
  Cust,
  Defect,
  Dials,
  Over,
  OwnSet,
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
const baseCatch = (s: Pick<Settings, 'strength' | 'consts'>, n: FactoryNode, kind: Defect): number => {
  const r = s.strength.rework ?? 0;
  if (n.def.catch) return n.def.catch[kind] ?? 0;
  return n.def.inspection ? Math.min(0.95, r * constOf(s, 'inspect')) : r;
};
/**
 * A station's chance to send back a bad input of one kind: its `catch` for that kind when it has one, else the rework
 * strength (an inspection's times `inspect`), times the role's `aiCatch` while AI is on there; nothing while the rework
 * toggle is off (design-ADR 0024 §5, §6).
 */
export const catchOf = (s: Settings, at: { n: FactoryNode; d: Dials }, kind: Defect): number => {
  if (!s.mech.rework) return 0;
  const p = baseCatch(s, at.n, kind);
  return at.d.ai ? p * (at.n.role.aiCatch ?? 1) : p;
};
/** Whether a station's `catch` can catch a kind at all, whatever AI and the rework toggle do: its unread share counts only these. */
export const catches = (s: Pick<Settings, 'strength' | 'consts'>, n: FactoryNode, kind: Defect): boolean =>
  baseCatch(s, n, kind) > 0;
/** The share of speed a stalled station loses now: its `stall` once enough work waits, none while AI works there. */
export const stallOf = (n: FactoryNode, d: Dials): number => {
  const st = n.def.stall;
  return st && !d.ai && n.Ws >= st.at ? st.slow : 0;
};
/** `mechanics.pressure` times a strength times a pressure from 0 to 1, capped at 1. */
const bite = (s: Pick<Settings, 'consts'>, strength: number, press: number): number =>
  Math.min(1, constOf(s, 'pressure') * strength * press);
/**
 * A pile's pressure, 0 to 1: its weeks of work waiting over RED, full where the pile turns red. The one pressure source:
 * `pressureOf` reads it from `n.Ws`, and pass-on measures it from the red mark.
 */
export const pressAt = (weeks: number): number => Math.min(1, Math.max(0, weeks) / RED);
/**
 * How hard a filling backlog bites at an inspection, for its `stampUnderPressure`: the pressure term over the station's
 * pressure (design-ADR 0024 §5).
 */
export const pressureOf = (s: Settings, n: FactoryNode, strength: number): number => bite(s, strength, pressAt(n.Ws));
/**
 * The share of the tickets a station takes up that it passes on unanswered, for its `escalate.underPressure`: the same
 * pressure term over its pressure measured from RED, so none until its pile turns red (design-ADR 0024 §5, grill 11 Q227,
 * Q231).
 */
export const passShareOf = (s: Settings, n: FactoryNode, strength: number): number =>
  bite(s, strength, pressAt(n.Ws - RED));
/** Jobs a week at size 1. */
export const speedOf = (n: FactoryNode, d: Dials): number => n.mu * (d.eff / 100) * (d.ai ? d.aiSpeed : 1);
export const rushOf = (n: FactoryNode): number =>
  RUSH_MAX * Math.max(0, Math.min(1, (n.Ws - RUSH_FROM) / (RUSH_TO - RUSH_FROM)));
export const effvNow = (n: FactoryNode, d: Dials): number => Math.max(5, d.effv - rushOf(n)) / 100;
interface OwnSource {
  readonly id: string;
  readonly rate: number;
  readonly arrivals?: Arrivals;
}
/** A source's values as the file gives them; the state's arrivals fill what the file leaves out. */
export const fileOwnOf = (src: OwnSource, state: Arrivals): Required<OwnSet> => ({
  rate: src.rate,
  arrivals: src.arrivals ?? state,
});
/** A source's tickets a week and its arrivals at these settings: the dashboard's, else the file's, else the state's. */
export const ownOf = (
  src: OwnSource,
  x: { readonly s: Pick<Settings, 'own'>; readonly mode: Arrivals },
): Required<OwnSet> => {
  const o: OwnSet = x.s.own[src.id] ?? {},
    file = fileOwnOf(src, x.mode);
  return { rate: firstOf(o.rate, file.rate), arrivals: firstOf(o.arrivals, file.arrivals) };
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
