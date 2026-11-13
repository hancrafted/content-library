/*
 * A pile's wait state (design-ADR 0024 §5): the weeks of work waiting at a work center and the level they read as.
 * `waitState` is its one writer; the pressure the pile puts on its station is computed from `Ws` where it is read.
 */
import { AMBER, RED } from './factory-dials.pure.ts';
import type { FactoryNode } from './factory.types';

/** Weeks of work waiting: amber from one week, red from two, with a gap so it never blinks. */
export const level = (lvl: number, w: number): number => {
  if (lvl === 0) return w >= AMBER ? 1 : 0;
  if (lvl === 1) return w >= RED ? 2 : w < AMBER * 0.85 ? 0 : 1;
  return w < RED * 0.9 ? 1 : 2;
};

/** Sets the node's weeks waiting and the level they read as. */
export const waitState = (n: FactoryNode, Ws: number): void => {
  n.Ws = Ws;
  n.lvl = level(n.lvl, Ws);
};
