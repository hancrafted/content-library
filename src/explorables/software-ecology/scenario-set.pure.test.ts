import { describe, expect, it } from 'vitest';
import { applySet } from './scenario-set.pure.ts';
import type { Preset, Settings } from './software-ecology.types';
import { startSettings } from './start-settings.pure.ts';
import { builtinBundle } from './use-case-data.ts';

/* A tour step's `set` applied to the settings (design-ADR 0024 §10). */
const B = builtinBundle('tire');
const realistic = (): Settings => startSettings(B, B.data.presets.find((p) => p.id === 'realistic') as Preset);

describe('success cases', () => {
  it('sets dials per work center under the names the model reads them by', () => {
    // ARRANGE
    const s = realistic();
    const expected = { eff: 150, effv: 70, aiExtra: 2 };
    // ACT
    applySet({ dials: { eng: { efficiency: 150, effectiveness: 70, aiExtra: 2 } } }, { B }, s);
    // ASSERT
    expect(s.over.eng).toEqual(expected);
  });

  it('sets where AI works and the reality', () => {
    // ARRANGE
    const s = realistic();
    const expected = { ai: ['eng', 'qa'], reality: 0 };
    // ACT
    applySet({ ai: ['eng', 'qa'], reality: 0 }, { B }, s);
    // ASSERT
    expect({ ai: s.ai, reality: s.reality }).toEqual(expected);
  });

  it('replaces the Customer fields a step names and keeps the rest', () => {
    // ARRANGE
    const s = realistic();
    const rate = 12;
    const expected = { rate, mix: s.cust?.mix, bad: { spec: { pm: 0.9 }, code: { pm: 0.9 } } };
    // ACT
    applySet({ customer: { rate, bad: { pm: 0.9 } } }, { B }, s);
    // ASSERT
    expect({ rate: s.cust?.rate, mix: s.cust?.mix, bad: s.cust?.bad }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('leaves the settings as they are for a step without a set', () => {
    // ARRANGE
    const s = realistic();
    const before = JSON.stringify(s);
    // ACT
    applySet(undefined, { B }, s);
    // ASSERT
    expect(JSON.stringify(s)).toBe(before);
  });
});

describe('edge cases', () => {
  it('copies a step’s AI list, so the step stays as the file wrote it', () => {
    // ARRANGE
    const s = realistic();
    const list = ['eng'];
    // ACT
    applySet({ ai: list }, { B }, s);
    // ASSERT
    expect(s.ai).not.toBe(list);
  });

  it('keeps a dial set before when a later step sets another one of the same center', () => {
    // ARRANGE
    const s = realistic();
    const expected = { effv: 70, aiExtra: 2 };
    // ACT
    applySet({ dials: { eng: { effectiveness: 70 } } }, { B }, s);
    applySet({ dials: { eng: { aiExtra: 2 } } }, { B }, s);
    // ASSERT
    expect(s.over.eng).toEqual(expected);
  });
});
