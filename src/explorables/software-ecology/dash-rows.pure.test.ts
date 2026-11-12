import { describe, expect, it } from 'vitest';
import { dialRowsOf, num, rowTexts } from './dash-rows.pure.ts';
import type { Dials } from './factory.types';

const TPL = '{set} → {eff} with AI';
const ALL = ['efficiency', 'effectiveness', 'fanout', 'ai'];
const eng: Dials = {
  eff: 88,
  effEff: 220,
  base: 91,
  effv: 91,
  fan: 1,
  fanEff: 2,
  ai: true,
  aiSpeed: 2.5,
  aiExtra: 2,
  en: ALL,
};

describe('success cases', () => {
  it('reads the engineer at AI compare as the Spec shows it: set and in effect with AI', () => {
    // ARRANGE
    const summary = '88 % → 220 % with AI · 91 % · 1× → 2× with AI';
    // ACT
    const t = rowTexts(eng, TPL);
    // ASSERT
    expect(`${t.eff} · ${t.effv} · ${t.fan}`).toBe(summary);
  });
});

describe('failure cases', () => {
  it('offers only the dials the file enables', () => {
    // ARRANGE
    const keys = ['effv'];
    // ACT
    const rows = dialRowsOf({ ...eng, en: ['effectiveness'] }, TPL);
    // ASSERT
    expect(rows.map((r) => r.key)).toEqual(keys);
  });
});

describe('edge cases', () => {
  it('shows only the set value while AI is off, and prints whole numbers from 10', () => {
    // ARRANGE
    const set = '88 %';
    const [small, large] = ['9.6', '12'];
    const [under, over] = [9.61, 12.4];
    // ACT
    const t = rowTexts({ ...eng, ai: false }, TPL);
    const printed = [num(under), num(over)];
    // ASSERT
    expect(t.eff).toBe(set);
    expect(printed).toEqual([small, large]);
  });
});
