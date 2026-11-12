/*
 * A loaded start for the factory model (feedback 09): weeks of work put into work centers' backlogs at once, as the
 * requests they would be had the Customer sent them. Model-internal: `createFactory`'s handle exposes it as `pile`.
 */
import { pressAt, Q, speedOf } from './factory-dials.pure.ts';
import { Run } from './factory-docs.pure.ts';
import { FROM_SRC, MAIN, pushBack } from './factory-flow.pure.ts';
import { level } from './factory-step.pure.ts';
import type { Factory, FactoryNode } from './factory.types';

/** The node's waiting time, level and average, as the averages would read them: at once, not after they catch up. */
const showPile = (m: Factory, n: FactoryNode, w: number): void => {
  const d = m.dc[n.idx];
  n.Lavg = n.L;
  n.Ws = d ? n.L / speedOf(n, d) : w;
  n.press = pressAt(n.Ws);
  n.lvl = level(n.lvl, n.Ws);
};

/** Jobs a pile of `w` weeks holds: weeks times the center's Ideal capacity; none at the Customer or at a stranger. */
const jobsOf = (n: FactoryNode | undefined, w: number): number => (n?.kind === 'role' ? Math.round(w * n.muIdeal) : 0);

/** Weeks of work, at each named work center's Ideal capacity, as requests waiting in its backlog now. */
export const seedBacklog = (m: Factory, weeks: Readonly<Record<string, number>>): void => {
  for (const [id, w] of Object.entries(weeks)) {
    const n = m.nodes.get(id) as FactoryNode,
      c = jobsOf(n, w);
    if (c <= 0) continue;
    pushBack(n, new Run({ q: Q.GOOD, ai: 0, fl: FROM_SRC | MAIN, e: n.ins[0]?.i ?? -1, b: 0, wk: Math.floor(m.t), c }));
    m.wip += c;
    m.created += c;
    showPile(m, n, w);
  }
};
