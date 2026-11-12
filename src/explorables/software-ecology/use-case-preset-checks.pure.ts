/*
 * What a use-case file's presets, tours and saved state must hold (schema software-ecology-factory/5), ported from the
 * reference build's validate(), messages and order unchanged.
 */
import { SPEEDS } from './factory-dials.pure.ts';
import { validKey, validTest } from './factory-scenario.pure.ts';
import { OWN_RATE_MAX } from './own-work.types.ts';
import {
  absentOr,
  apply,
  backlogProblems,
  customerProblems,
  displayProblems,
  isMap,
  isNum,
  isWord,
  listOf,
  mapOf,
  oneOf,
  type Map_,
  type Rule,
  type Sink,
} from './use-case-checks.pure.ts';

/** Swing and Roles merged into the roles state (feedback 08); `swing` is the retired id and view. */
export const RETIRED_STATE = 'swing';
export const ROLES_STATE = 'roles';
/** An id or view naming the retired `swing`, as the roles state; anything else as it is. */
export const unretired = <T>(v: T): T | typeof ROLES_STATE => (v === RETIRED_STATE ? ROLES_STATE : v);

/** `swing` is retired: `use-case-file.ts` reads it as `roles` (`unretired`) before these checks run. */
export const VIEWS = [ROLES_STATE, 'factory'];
const MECHS = ['rework', 'churn', 'complaints'];
const EXPECT_KEYS =
  'customer.<output|sat|headroom|leadDays|bugsPerWeek|changesPerWeek|own|backlog> or <center>.<weeksWaiting|busy|bugShare|backlog|done|rework|rush|unread|stall>';

const aiOk = (ids: Set<string>) => (ai: unknown) =>
  ai === 'all' || ai === 'off' || (Array.isArray(ai) && ai.every((x) => ids.has(x as string)));
const compareOk = (ids: Set<string>) => (v: unknown) =>
  Array.isArray(v) && v.length <= 3 && v.every((x) => ids.has(x as string));
const unknownIds = (v: unknown, ids: Set<string>): string[] => Object.keys(mapOf(v)).filter((id) => !ids.has(id));

/** A map of something: the map, its path, the work center ids. */
interface At {
  readonly x: Map_;
  readonly p: string;
  readonly ids: Set<string>;
}

const SET: readonly Rule<At>[] = [
  ({ x, p, ids }) => !absentOr(x.ai, aiOk(ids)) && `${p}.set.ai: all, off or a list of center ids`,
  ({ x, p }) => !absentOr(x.reality, (v) => isNum(v, 0, 100)) && `${p}.set.reality: 0 to 100`,
];

const setProblems = (set: unknown, at: Omit<At, 'x'>, E: Sink): void => {
  if (!isMap(set)) return E(`${at.p}.set: a map { dials, customer, ai, reality }`);
  for (const id of unknownIds(set.dials, at.ids)) E(`${at.p}.set.dials.${id}: no such work center`);
  if (set.customer !== undefined)
    customerProblems(set.customer, { p: `${at.p}.set.customer`, ids: at.ids, full: false }, E);
  apply(SET, { ...at, x: set }, E);
};

const expectProblems = (st: Map_, at: Omit<At, 'x'>, E: Sink): void => {
  if (!absentOr(st.expect, isMap)) E(`${at.p}.expect: a map { "customer.output": "0.9–1.1" }`);
  for (const [k, t] of Object.entries(mapOf(st.expect))) {
    if (!validKey(k, at.ids)) E(`${at.p}.expect.${k}: ${EXPECT_KEYS}`);
    if (!validTest(String(t))) E(`${at.p}.expect.${k}: a test such as ">2", "<0.5", "0.9–1.1", rises or falls`);
  }
};

const settlesOk = (t: unknown): boolean => validTest(String(t)) && !['rises', 'falls'].includes(String(t).trim());

/** Han's claim, a words key, and `settles:`, a bound or range read 40 weeks after the beat. */
const claimProblems = (st: Map_, at: Omit<At, 'x'>, E: Sink): void => {
  if (!absentOr(st.claim, isWord)) E(`${at.p}.claim: a words key, such as clean-line`);
  if (!absentOr(st.settles, isMap)) E(`${at.p}.settles: a map { "qa.weeksWaiting": "<0.5" }`);
  for (const [k, t] of Object.entries(mapOf(st.settles))) {
    if (!validKey(k, at.ids)) E(`${at.p}.settles.${k}: ${EXPECT_KEYS}`);
    if (!settlesOk(t))
      E(`${at.p}.settles.${k}: a bound or a range such as ">2" or "0.9–1.1"; settles has no beat before it`);
  }
};

/** One tour step or check; returns the week it runs to when valid, else the week before. */
const stepProblems = (raw: unknown, at: Omit<At, 'x'> & { last: number }, E: Sink): number => {
  if (!isMap(raw)) return (E(`${at.p}: a map { set, run, card, expect }`), at.last);
  const runs = isNum(raw.run, 0.5, 200) && raw.run > at.last;
  if (!runs) E(`${at.p}.run: weeks from the start, 0.5 to 200, later than the step before`);
  if (!absentOr(raw.card, (v) => v === 'customer' || at.ids.has(v as string)))
    E(`${at.p}.card: customer or a work center`);
  if (raw.set !== undefined) setProblems(raw.set, at, E);
  expectProblems(raw, at, E);
  claimProblems(raw, at, E);
  return runs ? (raw.run as number) : at.last;
};

const stepsOf = (p: Map_, at: string): [unknown, string][] => {
  if (Array.isArray(p.tour)) return p.tour.map((st, j) => [st, `${at}.tour[${j}]`]);
  return p.check !== undefined ? [[p.check, `${at}.check`]] : [];
};

const tourOk = (v: unknown): boolean => Array.isArray(v) && v.length >= 1 && v.length <= 6;
const speedOk = (v: unknown): boolean => (SPEEDS as readonly number[]).includes(v as number) && (v as number) > 0;

const PRESET: readonly Rule<At>[] = [
  ({ x, p }) => !!x.view && !oneOf(x.view, VIEWS) && `${p}.view: one of ${VIEWS.join(', ')}`,
  ({ x, p }) => !absentOr(x.reality, (v) => isNum(v, 0, 100)) && `${p}.reality: 0 (Ideal) to 100 (Realistic)`,
  ({ x, p, ids }) => !absentOr(x.ai, aiOk(ids)) && `${p}.ai: all, off or a list of center ids`,
  ({ x, p, ids }) => !absentOr(x.compare, compareOk(ids)) && `${p}.compare: up to three center ids`,
];
const PRESET_TAIL: readonly Rule<At>[] = [
  ({ x, p }) =>
    !absentOr(x.start, (v) => oneOf(v, ['clear', 'warm'])) && `${p}.start: clear (day 0) or warm (60 weeks settled)`,
  ({ x, p }) => !absentOr(x.speed, speedOk) && `${p}.speed: 1, 2, 5, 10 or 20`,
  ({ x, p }) =>
    !absentOr(x.menu, (v) => typeof v === 'boolean') &&
    `${p}.menu: true or false (false keeps the state off the Scenarios menu)`,
  ({ x, p }) => x.tour !== undefined && x.check !== undefined && `${p}: a tour or a check, not both`,
  ({ x, p }) => !absentOr(x.tour, tourOk) && `${p}.tour: 1 to 6 steps`,
];

const presetShape = (at: At, E: Sink): void => {
  apply(PRESET, at, E);
  backlogProblems(at.x.backlog, { p: `${at.p}.backlog`, ids: at.ids }, E);
  displayProblems(at.x.display, `${at.p}.display`, E);
  for (const id of unknownIds(at.x.dials, at.ids)) E(`${at.p}.dials.${id}: no such work center`);
  if (at.x.customer !== undefined)
    customerProblems(at.x.customer, { p: `${at.p}.customer`, ids: at.ids, full: false }, E);
  apply(PRESET_TAIL, at, E);
};

export const presetProblems = (presets: unknown, x: { E: Sink; ids: Set<string> }): void => {
  listOf(presets).forEach((raw, i) => {
    const p = `presets[${i}]`;
    if (typeof mapOf(raw).id !== 'string') x.E(`${p}.id: a word`);
    if (!isMap(raw)) return;
    presetShape({ x: raw, p, ids: x.ids }, x.E);
    let last = 0;
    for (const [st, q] of stepsOf(raw, p)) last = stepProblems(st, { p: q, ids: x.ids, last }, x.E);
  });
};

const STATE: readonly Rule<At>[] = [
  ({ x }) => !absentOr(x.view, (v) => oneOf(v, VIEWS)) && `state.view: one of ${VIEWS.join(', ')}`,
  ({ x }) => !absentOr(x.reality, (v) => isNum(v, 0, 100)) && 'state.reality: 0 to 100',
  ({ x }) =>
    !absentOr(x.speed, (v) => (SPEEDS as readonly number[]).includes(v as number)) &&
    `state.speed: one of ${SPEEDS.join(', ')} (0 is pause)`,
  ({ x }) => !absentOr(x.beltMotion, (v) => typeof v === 'boolean') && 'state.beltMotion: true or false',
  ({ x }) => !absentOr(x.pile, (v) => oneOf(v, ['heap', 'stack', 'drift'])) && 'state.pile: heap, stack or drift',
  ({ x }) => !absentOr(x.company, (v) => oneOf(v, ['service', 'product'])) && 'state.company: service or product',
  ({ x }) =>
    !absentOr(x.aiQuality, (v) => oneOf(v, ['worse', 'same', 'better'])) && 'state.aiQuality: worse, same or better',
];

const stateCenters = (st: Map_, ids: Set<string>, E: Sink): void => {
  for (const [id, o] of Object.entries(mapOf(st.centers))) {
    if (!ids.has(id)) E(`state.centers.${id}: no such work center`);
    else if (!absentOr(mapOf(o).efficiency, (v) => isNum(v, 10, 1000))) E(`state.centers.${id}.efficiency: 10 to 1000`);
  }
};

/** The saved state of an exchange file. */
const stateSources = (st: Map_, sources: Set<string>, E: Sink): void => {
  if (!absentOr(st.sources, isMap)) E('state.sources: a map { <source id>: { rate, arrivals } }');
  for (const [id, o] of Object.entries(mapOf(st.sources))) {
    const p = `state.sources.${id}`;
    if (!sources.has(id)) E(`${p}: no such source`);
    else if (!isMap(o)) E(`${p}: a map { rate, arrivals }`);
    else {
      if (!absentOr(o.rate, (v) => isNum(v, 0, OWN_RATE_MAX))) E(`${p}.rate: tickets a week, 0 to ${OWN_RATE_MAX}`);
      if (!absentOr(o.arrivals, (v) => oneOf(v, ['steady', 'random']))) E(`${p}.arrivals: steady or random`);
    }
  }
};

export const stateProblems = (state: unknown, x: { E: Sink; ids: Set<string>; sources?: Set<string> }): void => {
  const st = mapOf(state),
    { E, ids } = x;
  stateSources(st, x.sources ?? new Set(), E);
  apply(STATE, { x: st, p: 'state', ids }, E);
  for (const [k, v] of Object.entries(mapOf(st.mechanics)))
    if (!MECHS.includes(k) || typeof v !== 'boolean') E(`state.mechanics.${k}: true or false`);
  if (st.customer !== undefined) customerProblems(st.customer, { p: 'state.customer', ids, full: false }, E);
  stateCenters(st, ids, E);
  if (!absentOr(st.compare, compareOk(ids))) E('state.compare: up to three center ids');
};
