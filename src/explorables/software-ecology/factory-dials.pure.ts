// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import type { FactoryNode } from './factory.types';
import { constOf } from './mechanics.pure.ts';
import type { AiQuality, Arrivals, Defect, Dials, Over, OwnSet, Settings, Strength } from './software-ecology.types';

export const WEEKS_PER_STEP = 1 / 480;
export const SPEEDS = [0, 1, 2, 5, 10, 20] as const;
export const DAYS = 5;
export const HANDOFF_WEEKS = 0.25 / DAYS;
export const WARM_WEEKS = 60;
export const RHO_IDEAL = 0.7;
export const AI_SPEED_FACTOR = 2.5;
export const CV = 0.3;
export const RATE_AVERAGING_WEEKS = 2;
export const CUSTOMER_AVERAGING_WEEKS = 6;
export const MAX_TOKENS = 4000;
export const AMBER_WEEKS_WAITING = 1;
export const RED_WEEKS_WAITING = 2;
export const REWORK_LANE_SHOW_ABOVE_PER_WEEK = 0.3;
export const RET_HIDE = 0.1;
export { Q } from './factory-docs.pure.ts';

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

export const firstOf = <T>(...xs: (T | null | undefined)[]): T => xs.find((x) => x !== undefined && x !== null) as T;

export const dials = (n: FactoryNode, s: Settings): Dials => {
  const o = firstOf(s.over[n.id], {}),
    d0 = firstOf(n.def.dials, {});
  const { eff, base } = sliding(n, o, s);
  const ai = !!firstOf<boolean>(o.ai, d0.ai, aiOn(n, s));
  const effv = Math.max(5, Math.min(100, base + (ai ? AI_QUALITY[s.aiq] : 0)));
  const fan = firstOf(o.fan, d0.fanout, n.role.fan);
  const aiSpeed = firstOf(o.aiSpeed, d0.aiSpeed, AI_SPEED_FACTOR),
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
export const catchOf = (s: Settings, at: { n: FactoryNode; d: Dials }, kind: Defect): number => {
  if (!s.mech.rework) return 0;
  const p = baseCatch(s, at.n, kind);
  return at.d.ai ? p * (at.n.role.aiCatch ?? 1) : p;
};
export const catches = (s: Pick<Settings, 'strength' | 'consts'>, n: FactoryNode, kind: Defect): boolean =>
  baseCatch(s, n, kind) > 0;
export const stallOf = (n: FactoryNode, d: Dials): number => {
  const st = n.def.stall;
  return st && !d.ai && n.Ws >= st.at ? st.slow : 0;
};
const bite = (s: Pick<Settings, 'consts'>, strength: number, press: number): number =>
  Math.min(1, constOf(s, 'pressure') * strength * press);
export const pressAt = (weeks: number): number => Math.min(1, Math.max(0, weeks) / RED_WEEKS_WAITING);
export const pressureOf = (s: Settings, n: FactoryNode, strength: number): number => bite(s, strength, pressAt(n.Ws));
export const passShareOf = (s: Settings, n: FactoryNode, strength: number): number =>
  bite(s, strength, pressAt(n.Ws - RED_WEEKS_WAITING));
export const speedOf = (n: FactoryNode, d: Dials): number => n.mu * (d.eff / 100) * (d.ai ? d.aiSpeed : 1);
export const rushOf = (n: FactoryNode): number =>
  RUSH_MAX * Math.max(0, Math.min(1, (n.Ws - RUSH_FROM) / (RUSH_TO - RUSH_FROM)));
export const effvNow = (n: FactoryNode, d: Dials): number => Math.max(5, d.effv - rushOf(n)) / 100;
interface OwnSource {
  readonly id: string;
  readonly rate: number;
  readonly arrivals?: Arrivals;
}
export const fileOwnOf = (src: OwnSource, state: Arrivals): Required<OwnSet> => ({
  rate: src.rate,
  arrivals: src.arrivals ?? state,
});
export const ownOf = (
  src: OwnSource,
  x: { readonly s: Pick<Settings, 'own'>; readonly mode: Arrivals },
): Required<OwnSet> => {
  const o: OwnSet = x.s.own[src.id] ?? {},
    file = fileOwnOf(src, x.mode);
  return { rate: firstOf(o.rate, file.rate), arrivals: firstOf(o.arrivals, file.arrivals) };
};
export const srcRate = (rate: number, d: Dials): number => rate * (d.ai ? d.aiExtra : 1);
export const productCo = (s: Settings): boolean => s.company === 'product';
