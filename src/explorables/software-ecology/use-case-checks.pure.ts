/*
 * What a use-case file must hold (schema software-ecology-factory/5, design-ADR 0024 §8–§11): each problem one line,
 * naming the path and what belongs there. Ported from the reference build's validate(), messages and order unchanged;
 * the presets and the saved state are checked in use-case-preset-checks.pure.ts.
 */
import { firstSpawn } from './first-spawn.pure.ts';

export const SCHEMA_ID = 'software-ecology-factory/5';
/** The glyphs a role may name. */
export const ICONS = ['customer', 'sales', 'pm', 'ba', 'doc', 'eng', 'ops', 'billing', 'support', 'lead', 'qa'];

export type Map_ = Record<string, unknown>;
export type Sink = (problem: string) => void;
/** A rule: the problem it finds, or false when there is none. */
export type Rule<T> = (x: T) => string | false;

export const isNum = (v: unknown, lo = -Infinity, hi = Infinity): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
export const isXY = (v: unknown): boolean => Array.isArray(v) && v.length === 2 && v.every((x) => isNum(x));
export const isMap = (v: unknown): v is Map_ => !!v && typeof v === 'object' && !Array.isArray(v);
export const isWord = (v: unknown): v is string => typeof v === 'string' && /^[\w-]+$/.test(v);
export const mapOf = (v: unknown): Map_ => (isMap(v) ? v : {});
/** A list in the file, or none: what to walk when a key may be missing or not a list. */
export const itemsOf = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
export const oneOf = (v: unknown, allowed: readonly string[]): boolean => allowed.includes(v as string);
/** Whether a value is left out, or else passes the test. */
export const absentOr = (v: unknown, ok: (v: unknown) => boolean): boolean => v === undefined || ok(v);
/** Runs every rule in order and hands each problem found to the sink. */
export const apply = <T>(rules: readonly Rule<T>[], x: T, E: Sink): void => {
  for (const rule of rules) {
    const problem = rule(x);
    if (problem) E(problem);
  }
};

/** The ids of the work centers, in file order. */
export const centerIdsOf = (doc: Map_, E: Sink): Set<string> => {
  const ids = new Set(['customer']),
    centerIds = new Set<string>();
  if (!Array.isArray(doc.centers) || !doc.centers.length) E('centers: a list of work centers');
  itemsOf(doc.centers).forEach((c, i) => {
    const id = mapOf(c).id;
    if (!isWord(id)) return E(`centers[${i}].id: a word`);
    if (ids.has(id))
      E(`centers[${i}].id: "${id}" is used twice${id === 'customer' ? ' (customer is the Customer)' : ''}`);
    ids.add(id);
    centerIds.add(id);
  });
  return centerIds;
};

const PILES = ['heap', 'stack', 'drift'];

/** A map of work center id to weeks of work waiting at the start (0 to 12), as `backlog` holds it. */
export const backlogProblems = (v: unknown, at: { p: string; ids: Set<string> }, E: Sink): void => {
  if (v === undefined) return;
  if (!isMap(v)) return E(`${at.p}: a map { <center id>: weeks of work waiting, 0 to 12 }`);
  for (const [id, w] of Object.entries(v)) {
    if (!at.ids.has(id)) E(`${at.p}.${id}: no such work center`);
    else if (!isNum(w, 0, 12)) E(`${at.p}.${id}: weeks of work waiting, 0 to 12`);
  }
};

/** A `display` map: the pile-up style and belt motion a state starts with. */
export const displayProblems = (v: unknown, p: string, E: Sink): void => {
  if (v === undefined) return;
  if (!isMap(v)) return E(`${p}: a map { pile, beltMotion }`);
  if (!absentOr(v.pile, (x) => oneOf(x, PILES))) E(`${p}.pile: ${PILES.join(', ')}`);
  if (!absentOr(v.beltMotion, (x) => typeof x === 'boolean')) E(`${p}.beltMotion: true or false`);
};

export const TOP: readonly Rule<Map_>[] = [
  (d) => !absentOr(d.schema, (v) => v === SCHEMA_ID) && `schema: ${SCHEMA_ID} (this file says ${String(d.schema)})`,
  (d) => !isWord(d.id) && 'id: a word such as tire',
  (d) =>
    !(isNum(mapOf(d.layout).width, 200, 4000) && isNum(mapOf(d.layout).height, 100, 3000)) &&
    'layout: width and height in layout units',
];

export interface RoleAt {
  readonly k: string;
  readonly raw: unknown;
}
export const ROLE: readonly Rule<RoleAt>[] = [
  ({ k, raw }) =>
    !(isMap(raw) && isNum(raw.fan ?? 1, 1, 50) && isNum(raw.aiSize ?? 1, 0.1, 20)) &&
    `roles.${k}: fan 1 to 50, aiSize a positive number`,
  ({ k, raw }) =>
    mapOf(raw).aiFan !== undefined &&
    `roles.${k}.aiFan: retired in schema /5; set AI per work center (dials aiSpeed, aiExtra)`,
  ({ k, raw }) => !absentOr(mapOf(raw).origin, (v) => oneOf(v, DEFECT_KEYS)) && `roles.${k}.origin: spec or code`,
  ({ k, raw }) =>
    !absentOr(mapOf(raw).aiCatch, (v) => isNum(v, 0, 1)) &&
    `roles.${k}.aiCatch: 0 to 1, how much of its catch holds while AI checks`,
  ({ k, raw }) => {
    const icon = mapOf(raw).icon;
    return (
      !!icon &&
      !ICONS.includes(String(icon)) &&
      `roles.${k}.icon: unknown icon "${String(icon)}" (one of ${ICONS.join(', ')})`
    );
  },
];

/** Where the Customer's checks run: the map, its path, the work centers, whether every field is required. */
export interface CustAt {
  readonly cu: Map_;
  readonly p: string;
  readonly ids: Set<string>;
  readonly full: boolean;
}

const mixProblems = (x: CustAt, E: Sink): void => {
  const { cu, p, ids } = x;
  if (!isMap(cu.mix) || !Object.keys(cu.mix).length)
    return E(`${p}.mix: where requests go, e.g. { sales: 30, pm: 50, support: 20 }`);
  for (const [to, w] of Object.entries(cu.mix)) {
    if (!ids.has(to)) E(`${p}.mix.${to}: no such work center`);
    if (!isNum(w, 0, 1000)) E(`${p}.mix.${to}: a weight, 0 or more`);
  }
  if (!Object.values(cu.mix).some((w) => (w as number) > 0)) E(`${p}.mix: at least one weight above 0`);
};

const chanceProblems = (v: unknown, at: { p: string; ids: Set<string> }, E: Sink): void => {
  if (!isMap(v)) return E(`${at.p}: a map of chances, e.g. { pm: 0.2 }`);
  let sum = 0;
  for (const [to, c] of Object.entries(v)) {
    if (!at.ids.has(to)) E(`${at.p}.${to}: no such work center`);
    if (isNum(c, 0, 1)) sum += c;
    else E(`${at.p}.${to}: a chance, 0 to 1`);
  }
  if (sum >= 1) E(`${at.p}: the chances add up to ${sum}; keep them below 1, or the follow-up requests never end`);
};

const DEFECT_KEYS: readonly string[] = ['spec', 'code'];
const isKinded = (v: unknown): v is Map_ => isMap(v) && Object.keys(v).some((k) => DEFECT_KEYS.includes(k));

/** `customer.bad`: one map of chances for every defect kind, or one per kind, `{ spec: {…}, code: {…} }`. */
const badProblems = (v: unknown, at: { p: string; ids: Set<string> }, E: Sink): void => {
  if (!isKinded(v)) return chanceProblems(v, at, E);
  for (const [k, c] of Object.entries(v))
    if (DEFECT_KEYS.includes(k)) chanceProblems(c, { ...at, p: `${at.p}.${k}` }, E);
    else E(`${at.p}.${k}: spec or code, the defect kind a bad release comes back by`);
};

/** A station's `catch`: per defect kind, the chance it sends a bad input back. */
const catchOk = (v: unknown): boolean =>
  isMap(v) && Object.entries(v).every(([k, c]) => DEFECT_KEYS.includes(k) && isNum(c, 0, 1));

const CUSTOMER: readonly Rule<CustAt>[] = [
  (x) => x.full && !isXY(x.cu.at) && `${x.p}.at: a position [x, y]`,
  (x) => (x.full || x.cu.rate !== undefined) && !isNum(x.cu.rate, 0, 200) && `${x.p}.rate: requests a week, 0 to 200`,
  (x) => !absentOr(x.cu.arrivals, (v) => oneOf(v, ['steady', 'random'])) && `${x.p}.arrivals: steady or random`,
];

const releasesOk = (v: unknown, ids: Set<string>): boolean => Array.isArray(v) && v.every((r) => ids.has(r as string));

/** The Customer: its values in the file (`full`), or a preset's overrides of them. */
export const customerProblems = (cu: unknown, at: Omit<CustAt, 'cu'>, E: Sink): void => {
  if (!isMap(cu)) return E(`${at.p}: a map`);
  const x = { ...at, cu };
  apply(CUSTOMER, x, E);
  if (x.full || cu.mix !== undefined) mixProblems(x, E);
  if (cu.good !== undefined) chanceProblems(cu.good, { p: `${at.p}.good`, ids: at.ids }, E);
  if (cu.bad !== undefined) badProblems(cu.bad, { p: `${at.p}.bad`, ids: at.ids }, E);
  if (!absentOr(cu.releases, (v) => releasesOk(v, at.ids)))
    E(`${at.p}.releases: a list of work centers whose shipments are releases`);
};

const DIAL_RANGES: readonly [string, number, number, string][] = [
  ['efficiency', 10, 1000, '10 to 1000'],
  ['effectiveness', 5, 100, '5 to 100'],
  ['fanout', 1, 5, 'tasks handed on per task, 1 to 5'],
  ['aiSpeed', 1, 5, 'AI speed-up, 1 to 5'],
  ['aiExtra', 1, 5, 'extra tasks per task with AI, 1 to 5'],
];

export interface CenterAt {
  readonly c: Map_;
  readonly p: string;
  readonly roles: Set<string>;
}
const realisticOk = (re: unknown): boolean =>
  Array.isArray(re) && re.length === 2 && isNum(re[0], 10, 1000) && isNum(re[1], 5, 100);

/** The work centers a center's spawns hand work to (the Customer left out). */
const handsTo = (c: Map_): string[] =>
  itemsOf(c.spawns).flatMap((sp) => {
    const m = mapOf(sp);
    return [m.to, ...itemsOf(m.choose).map((ch) => mapOf(ch).to)].filter(
      (to): to is string => typeof to === 'string' && to !== 'customer',
    );
  });
const escalateOk =
  (c: Map_) =>
  (v: unknown): boolean =>
    isMap(v) && handsTo(c).includes(v.to as string) && isNum(v.underPressure, 0, 2);

export const CENTER: readonly Rule<CenterAt>[] = [
  ({ c, p, roles }) =>
    !roles.has(c.role as string) && `${p}.role: unknown role "${String(c.role)}" (one of ${[...roles].join(', ')})`,
  ({ c, p }) => !isXY(c.at) && `${p}.at: a position [x, y]`,
  ({ c, p }) =>
    !absentOr(c.buffer, (v) => isNum(v, 1, 1000)) && `${p}.buffer: 1 to 1000 (leave it out for an unlimited backlog)`,
  ({ c, p }) =>
    !absentOr(c.service, (v) => oneOf(v, ['normal', 'exponential'])) && `${p}.service: normal or exponential`,
  ({ c, p }) => !absentOr(c.realistic, realisticOk) && `${p}.realistic: [efficiency 10-1000, effectiveness 5-100]`,
  ...DIAL_RANGES.map(
    ([k, lo, hi, say]): Rule<CenterAt> =>
      ({ c, p }) =>
        !absentOr(mapOf(c.dials)[k], (v) => isNum(v, lo, hi)) && `${p}.dials.${k}: ${say}`,
  ),
  ({ c, p }) =>
    !absentOr(c.stampUnderPressure, (v) => !!c.inspection && isNum(v, 0, 2)) &&
    `${p}.stampUnderPressure: 0 to 2, on an inspection only`,
  ({ c, p }) => !absentOr(c.catch, catchOk) && `${p}.catch: { spec, code }, each the chance to send it back, 0 to 1`,
  ({ c, p }) => !absentOr(c.origin, (v) => oneOf(v, DEFECT_KEYS)) && `${p}.origin: spec or code`,
  ({ c, p }) =>
    !absentOr(c.stall, (v) => isMap(v) && isNum(v.at, 0, 50) && isNum(v.slow, 0, 0.95)) &&
    `${p}.stall: { at: weeks of work waiting 0 to 50, slow: the share of speed lost, 0 to 0.95 }`,
  ({ c, p }) =>
    !absentOr(c.escalate, escalateOk(c)) &&
    `${p}.escalate: { to: a work center it hands work to, underPressure: 0 to 2 }`,
];

export const FIRST_SPAWN: Rule<CenterAt> = ({ c, p }) => {
  const spawns = itemsOf(c.spawns),
    first = firstSpawn(spawns),
    f = mapOf(first);
  if (!spawns.length) return `${p}.spawns: what a finished job creates, e.g. [{ to: ops, n: 1 }]`;
  return isMap(first) && f.choose === undefined && f.n === undefined
    ? `${p}.spawns[0]: the first spawn carries the request on, so it is { to, n } or choose`
    : false;
};
