/*
 * A tour step's `set` applied to the settings (design-ADR 0024 §10): dials per center, the Customer, where AI works, the
 * reality.
 */
import { copyKinds, kindChancesOf } from './defect.pure.ts';
import { firstOf } from './factory-dials.pure.ts';
import type { Bundle, Cust, Over, Settings, StepSet } from './software-ecology.types';
import { custOf } from './start-settings.pure.ts';

const SET_IN: Readonly<Record<string, keyof Over>> = {
  efficiency: 'eff',
  effectiveness: 'effv',
  fanout: 'fan',
  ai: 'ai',
  aiSpeed: 'aiSpeed',
  aiExtra: 'aiExtra',
};

const setDials = (dials: StepSet['dials'], s: Settings): void => {
  for (const [id, o] of Object.entries(dials ?? {})) {
    const x = (s.over[id] ??= {}) as Record<string, number | boolean>;
    for (const [k, v] of Object.entries(o)) x[SET_IN[k]] = v as number | boolean;
  }
};

/** The Customer after a step's changes: given fields replace, the rest stay as they are now. */
const setCustomer = (c: NonNullable<StepSet['customer']>, cu: Cust): Cust => ({
  ...cu,
  mix: { ...firstOf(c.mix, cu.mix) },
  good: { ...firstOf(c.good, cu.good) },
  bad: c.bad ? kindChancesOf(c.bad) : copyKinds(cu.bad),
  ...(c.rate !== undefined ? { rate: c.rate } : {}),
  ...(c.arrivals ? { mode: c.arrivals } : {}),
});

/** Applies a step's `set` to the settings in place: dials per center, the Customer, where AI works, the reality. */
export const applySet = (set: StepSet | undefined, m: { readonly B: Bundle }, s: Settings): void => {
  if (!set) return;
  if (set.reality !== undefined) s.reality = set.reality;
  if (set.ai !== undefined) s.ai = Array.isArray(set.ai) ? [...set.ai] : set.ai;
  setDials(set.dials, s);
  if (set.customer) s.cust = setCustomer(set.customer, custOf(m, s));
};
