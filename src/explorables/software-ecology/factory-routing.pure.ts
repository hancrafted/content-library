/*
 * Where a finished job's spawns go (design-ADR 0024 §3): Ideal routes steadily (a chance spawn every so often, a choice
 * in turn), Realistic rolls the dice; and how many documents each hands on.
 */
import type { Belt, ChooseRule, FactoryNode, SpawnRule } from './factory.types';

export interface Pick {
  readonly e: Belt;
  readonly base: number;
}

/** Smooth weighted round robin: the choices in strict turns. */
const inTurn = (ch: ChooseRule[], W: number): number => {
  let i = 0,
    best = -Infinity;
  ch.forEach((c, k) => {
    c.cur = (c.cur || 0) + c.w;
    if (c.cur > best) {
      best = c.cur;
      i = k;
    }
  });
  ch[i].cur = (ch[i].cur as number) - W;
  return i;
};

const byWeight = (ch: ChooseRule[], r: number): number => {
  let i = 0;
  while (i < ch.length - 1 && r >= ch[i].w) r -= ch[i++].w;
  return i;
};

const chooseBelt = (n: FactoryNode, sp: SpawnRule, steady: boolean): Pick => {
  const ch = sp.choose as ChooseRule[],
    W = sp.W as number;
  return { e: ch[steady ? inTurn(ch, W) : byWeight(ch, n.rr() * W)].e, base: 1 };
};

/** A chance spawn in Ideal: carried over until it adds up to one document (every other one for p 0.5). */
const everyOther = (sp: SpawnRule): number => {
  sp.acc = (sp.acc || 0) + (sp.p as number);
  if (sp.acc < 1 - 1e-9) return 0;
  sp.acc -= 1;
  return 1;
};

/** Ideal routes steadily (every other one for p 0.5, in turn for choose); Realistic rolls the dice. */
export const pickBelt = (n: FactoryNode, sp: SpawnRule, steady: boolean): Pick => {
  if (sp.choose) return chooseBelt(n, sp, steady);
  const e = sp.e as Belt;
  if (sp.n !== undefined) return { e, base: sp.n };
  return { e, base: steady ? everyOther(sp) : n.rr() < (sp.p as number) ? 1 : 0 };
};

/** How many documents a spawn hands on: whole ones, and a fraction carried over (Ideal) or rolled (Realistic). */
export const countOf = (n: FactoryNode, sp: SpawnRule, x: { f: number; steady: boolean }): number => {
  let k = Math.floor(x.f);
  if (x.f <= k) return k;
  if (!x.steady) return n.rr() < x.f - k ? k + 1 : k;
  sp.facc = (sp.facc || 0) + (x.f - k);
  if (sp.facc >= 1 - 1e-9) {
    sp.facc -= 1;
    k++;
  }
  return k;
};
