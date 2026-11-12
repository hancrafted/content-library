/*
 * Where a finished job's spawns go (design-ADR 0024 §3): Ideal routes steadily (a chance spawn every so often, a choice
 * in turn), Realistic rolls the dice; how many documents each hands on; and whether a ticket is passed on under pressure.
 */
import { passShareOf } from './factory-dials.pure.ts';
import type { Belt, ChooseRule, FactoryNode, SpawnRule } from './factory.types';
import type { Settings } from './software-ecology.types';

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

/**
 * Whether one ticket is passed on, at a share from 0 to 1: Ideal takes turns (carried over until it adds up to one),
 * Realistic rolls. A share of 0 draws nothing and carries nothing over.
 */
const passByShare = (n: FactoryNode, sp: SpawnRule, x: { share: number; steady: boolean }): boolean => {
  if (x.share <= 0) return false;
  if (!x.steady) return n.rr() < x.share;
  sp.pacc = (sp.pacc || 0) + x.share;
  if (sp.pacc < 1 - 1e-9) return false;
  sp.pacc -= 1;
  return true;
};

/** A station's first spawn: the one its `escalate` resolves onto, and the belt a ticket passed on rides from. */
export const firstSpawn = (n: FactoryNode): SpawnRule | undefined => n.spawns[0];

/**
 * Pass-on under pressure (design-ADR 0024 §5, grill 11 Q220, Q227): whether a station with `escalate` passes the ticket
 * it takes up on to `escalate.to` unanswered, at the share `passShareOf` gives: none until its pile turns red, then
 * rising with its pressure up to all of them. Below the mark nothing is drawn, so its routing is unchanged there.
 */
export const passesOn = (s: Settings, n: FactoryNode): boolean => {
  const sp = firstSpawn(n);
  if (!sp?.pass) return false;
  return passByShare(n, sp, { share: passShareOf(s, n, sp.pass.under), steady: s.reality === 0 });
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
