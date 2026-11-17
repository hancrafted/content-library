// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { passShareOf } from './factory-dials.pure.ts';
import type { Belt, ChooseRule, FactoryNode, SpawnRule } from './factory.types';
import { firstSpawn } from './first-spawn.pure.ts';
import type { Settings } from './software-ecology.types';

export interface Pick {
  readonly e: Belt;
  readonly base: number;
}

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

const everyOther = (sp: SpawnRule): number => {
  sp.acc = (sp.acc || 0) + (sp.p as number);
  if (sp.acc < 1 - 1e-9) return 0;
  sp.acc -= 1;
  return 1;
};

export const pickBelt = (n: FactoryNode, sp: SpawnRule, steady: boolean): Pick => {
  if (sp.choose) return chooseBelt(n, sp, steady);
  const e = sp.e as Belt;
  if (sp.n !== undefined) return { e, base: sp.n };
  return { e, base: steady ? everyOther(sp) : n.rr() < (sp.p as number) ? 1 : 0 };
};

const passByShare = (n: FactoryNode, sp: SpawnRule, x: { share: number; steady: boolean }): boolean => {
  if (x.share <= 0) return false;
  if (!x.steady) return n.rr() < x.share;
  sp.pacc = (sp.pacc || 0) + x.share;
  if (sp.pacc < 1 - 1e-9) return false;
  sp.pacc -= 1;
  return true;
};

export const passesOn = (s: Settings, n: FactoryNode): boolean => {
  const sp = firstSpawn(n.spawns);
  if (!sp?.pass) return false;
  return passByShare(n, sp, { share: passShareOf(s, n, sp.pass.under), steady: s.reality === 0 });
};

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
