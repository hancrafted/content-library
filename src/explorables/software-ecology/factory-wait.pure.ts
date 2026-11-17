// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { AMBER, RED } from './factory-dials.pure.ts';
import type { FactoryNode } from './factory.types';

export const level = (lvl: number, w: number): number => {
  if (lvl === 0) return w >= AMBER ? 1 : 0;
  if (lvl === 1) return w >= RED ? 2 : w < AMBER * 0.85 ? 0 : 1;
  return w < RED * 0.9 ? 1 : 2;
};

export const waitState = (n: FactoryNode, Ws: number): void => {
  n.Ws = Ws;
  n.lvl = level(n.lvl, Ws);
};
