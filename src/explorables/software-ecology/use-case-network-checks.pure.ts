/*
 * What a use-case file's work centers, spawns, routes, sources and mechanics must hold (schema
 * software-ecology-factory/5), ported from the reference build's validate(), messages and order unchanged.
 */
import { MECH_RANGE, STRENGTHS } from './factory-dials.pure.ts';
import type { Strength } from './software-ecology.types';
import {
  absentOr,
  apply,
  backlogProblems,
  CENTER,
  centerIdsOf,
  customerProblems,
  displayProblems,
  FIRST_SPAWN,
  isMap,
  isNum,
  isXY,
  listOf,
  mapOf,
  oneOf,
  ROLE,
  TOP,
  type Map_,
  type Rule,
  type Sink,
} from './use-case-checks.pure.ts';

interface SpawnAt {
  readonly sp: Map_;
  readonly q: string;
  readonly ids: Set<string>;
  readonly self: string;
}

const toOk = (to: unknown, ids: Set<string>): boolean => to === 'customer' || ids.has(to as string);
const countOk = (n: unknown): boolean => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 20;

const SPAWN: readonly Rule<SpawnAt>[] = [
  ({ sp, q, ids }) => !toOk(sp.to, ids) && `${q}.to: a work center, or customer`,
  ({ sp, q, self }) => sp.to === self && `${q}.to: a work center cannot spawn into itself`,
  ({ sp, q }) => (sp.n === undefined) === (sp.p === undefined) && `${q}: exactly one of n (a count) or p (a chance)`,
  ({ sp, q }) => !absentOr(sp.n, countOk) && `${q}.n: a whole number 1 to 20`,
  ({ sp, q }) => !absentOr(sp.p, (v) => isNum(v, 0.001, 1)) && `${q}.p: a chance, more than 0, at most 1`,
];

const choiceProblems = (x: SpawnAt, E: Sink): void => {
  const { sp, q, ids } = x;
  if (!Array.isArray(sp.choose) || sp.choose.length < 2) return E(`${q}.choose: two or more { to, w }`);
  sp.choose.forEach((ch, k) => {
    const c = mapOf(ch);
    if (!toOk(c.to, ids)) E(`${q}.choose[${k}].to: a work center, or customer`);
    if (!absentOr(c.w, (v) => isNum(v, 0.001, 1000))) E(`${q}.choose[${k}].w: a positive weight`);
  });
};

const spawnProblems = (sp: unknown, at: Omit<SpawnAt, 'sp'>, E: Sink): void => {
  if (!isMap(sp)) return E(`${at.q}: { to, n }, { to, p } or { choose: [{ to, w }] }`);
  if (sp.choose !== undefined) return choiceProblems({ ...at, sp }, E);
  apply(SPAWN, { ...at, sp }, E);
};

const centerProblems = (doc: Map_, x: { ids: Set<string>; roles: Set<string> }, E: Sink): void => {
  listOf(doc.centers).forEach((raw, i) => {
    const c = mapOf(raw),
      p = `centers[${i}]`;
    if (typeof c.id !== 'string') return;
    apply([...CENTER, FIRST_SPAWN], { c, p, roles: x.roles }, E);
    listOf(c.spawns).forEach((sp, j) =>
      spawnProblems(sp, { q: `${p}.spawns[${j}]`, ids: x.ids, self: c.id as string }, E),
    );
  });
};

const shipsToCustomer = (doc: Map_): boolean =>
  listOf(doc.centers).some((c) =>
    listOf(mapOf(c).spawns).some(
      (sp) => mapOf(sp).to === 'customer' || listOf(mapOf(sp).choose).some((ch) => mapOf(ch).to === 'customer'),
    ),
  );

interface RouteAt {
  readonly k: string;
  readonly r: Map_;
}
const viaOk = (v: unknown): boolean => Array.isArray(v) && v.length > 0 && v.every(isXY);
const ROUTE: readonly Rule<RouteAt>[] = [
  ({ k }) => !/^[\w-]+-[\w-]+$/.test(k) && `routes.${k}: a key from-to, e.g. sales-billing`,
  ({ k, r }) => !absentOr(r.via, viaOk) && `routes.${k}.via: a list of [x, y]`,
  ({ k, r }) => !absentOr(r.xm, (v) => isNum(v)) && `routes.${k}.xm: an x position`,
];

const networkProblems = (doc: Map_, E: Sink): void => {
  if (doc.centers && !shipsToCustomer(doc)) E('centers: at least one spawn must ship to the Customer (to: customer)');
  for (const [k, r] of Object.entries(mapOf(doc.routes))) apply(ROUTE, { k, r: mapOf(r) }, E);
  if (!absentOr(doc.company, (v) => oneOf(v, ['service', 'product']))) E('company: service or product');
};

interface SourceAt {
  readonly s: Map_;
  readonly i: number;
  readonly ids: Set<string>;
}
const SOURCE: readonly Rule<SourceAt>[] = [
  ({ s, i }) => typeof s.id !== 'string' && `sources[${i}].id: a word`,
  ({ s, i, ids }) => !ids.has(s.at as string) && `sources[${i}].at: the work center that writes these tickets`,
  ({ s, i }) => !isNum(s.rate, 0, 50) && `sources[${i}].rate: tickets a week, 0 to 50`,
  ({ s, i }) =>
    !absentOr(s.arrivals, (v) => v === 'steady' || v === 'random') && `sources[${i}].arrivals: steady or random`,
];

const mechanicProblem = (k: string, v: unknown): string | false => {
  const range = MECH_RANGE[k as Strength];
  if (!range)
    return `mechanics.${k}: unknown (one of ${STRENGTHS.join(', ')}; complaints take their chance from customer.bad)`;
  return !isNum(v, range[0], range[1]) && `mechanics.${k}: ${range[0]} to ${range[1]}`;
};

const sourceProblems = (doc: Map_, ids: Set<string>, E: Sink): void => {
  if (doc.sources !== undefined && !Array.isArray(doc.sources)) E('sources: a list of { id, at, rate }');
  listOf(doc.sources).forEach((s, i) => apply(SOURCE, { s: mapOf(s), i, ids }, E));
  if (!absentOr(doc.bottleneck, (v) => ids.has(v as string)))
    E('bottleneck: the work center that is the bottleneck at Realistic');
  for (const [k, v] of Object.entries(mapOf(doc.mechanics))) {
    const problem = mechanicProblem(k, v);
    if (problem) E(problem);
  }
};

/** Everything but the presets and the saved state; returns the work center ids the rest checks against. */
export const dataProblems = (doc: Map_, x: { E: Sink; catalog: readonly string[] }): Set<string> => {
  const E = x.E;
  apply(TOP, doc, E);
  for (const [k, raw] of Object.entries(mapOf(doc.roles))) apply(ROLE, { k, raw }, E);
  const ids = centerIdsOf(doc, E),
    roles = new Set([...x.catalog, ...Object.keys(mapOf(doc.roles))]);
  if (!doc.customer) E('customer: { at, rate, mix, good, bad }');
  else customerProblems(doc.customer, { p: 'customer', ids, full: true }, E);
  centerProblems(doc, { ids, roles }, E);
  networkProblems(doc, E);
  sourceProblems(doc, ids, E);
  backlogProblems(doc.backlog, { p: 'backlog', ids }, E);
  displayProblems(doc.display, 'display', E);
  return ids;
};
