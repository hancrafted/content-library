import { Q, speedOf } from './factory-dials.pure.ts';
import { Run } from './factory-docs.pure.ts';
import { FROM_SRC, MAIN, pushBack } from './factory-flow.pure.ts';
import { waitState } from './factory-wait.pure.ts';
import type { Factory, FactoryNode } from './factory.types';

const showPile = (m: Factory, n: FactoryNode, w: number): void => {
  const d = m.dc[n.idx];
  n.Lavg = n.L;
  waitState(n, d ? n.L / speedOf(n, d) : w);
};

const jobsOf = (n: FactoryNode | undefined, w: number): number => (n?.kind === 'role' ? Math.round(w * n.muIdeal) : 0);

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
