import { describe, expect, it } from 'vitest';
import { custOf, dials } from './factory-dials.pure.ts';
import { buildFactory } from './factory-model.pure.ts';
import { presetOf } from './factory-run.pure.ts';
import {
  aiChoicesOf,
  aiKeyOf,
  pageSettings,
  withAi,
  withCustomer,
  withOver,
  withReality,
} from './factory-settings.pure.ts';
import { builtinBundle } from './use-case-data.ts';

const B = builtinBundle('tire');
const at = (id: string) => pageSettings(B, presetOf(B, id), null);

describe('success cases', () => {
  it('keeps the company, AI quality, mechanics and strengths across a state change, as the reference build does', () => {
    // ARRANGE
    const before = { ...at('realistic'), company: 'service' as const, aiq: 'worse' as const };
    const mech = { rework: false, churn: true, complaints: true };
    const strength = { rework: 0.8, churn: 2 };
    // ACT
    const next = pageSettings(B, presetOf(B, 'ideal'), { ...before, mech, strength });
    // ASSERT
    expect(next).toMatchObject({ preset: 'ideal', reality: 0, company: 'service', aiq: 'worse', mech });
    expect(next.strength).toEqual(strength);
  });

  it('shows a dashboard dial as set and with AI: efficiency 100 % runs at 250 % with AI on', () => {
    // ARRANGE
    const m = buildFactory(B, { s: at('ideal') });
    const eng = m.nodes.get('eng');
    if (!eng) throw new Error('no engineer');
    const setAndEffective = [100, 250];
    // ACT
    const s = withOver(at('ideal'), 'eng', { ai: true });
    const d = dials(eng, s);
    // ASSERT
    expect([d.eff, d.effEff]).toEqual(setAndEffective);
  });

  it('offers AI off, every set a preset names and everywhere, and names the one in effect', () => {
    // ARRANGE
    const titles = { eng: 'Engineer', support: 'Support', qa: 'Quality assurance' };
    // ACT
    const choices = aiChoicesOf(B, (id) => titles[id as keyof typeof titles] ?? id);
    const key = aiKeyOf(B, withAi(at('ideal'), ['eng']));
    // ASSERT
    expect(choices[0]?.id).toBe('off');
    expect(choices.at(-1)?.id).toBe('ai:all');
    expect(choices.map((c) => c.label)).toContain('Engineer');
    expect(key).toBe('ai:eng');
  });
});

describe('failure cases', () => {
  it('caps a follow-up chance so that together they stay below 0.95', () => {
    // ARRANGE
    const m = buildFactory(B, { s: at('realistic') });
    const [sales, asked, capped] = [0.5, 0.9, 0.45];
    const s0 = withCustomer(at('realistic'), custOf(m, at('realistic')), { kind: 'good', to: 'sales', v: sales });
    // ACT
    const s = withCustomer(s0, custOf(m, s0), { kind: 'good', to: 'pm', v: asked });
    // ASSERT
    expect(s.cust?.good.pm).toBeCloseTo(capped);
  });
});

describe('edge cases', () => {
  it('drops dashboard efficiency and effectiveness overrides when the Model slides reality', () => {
    // ARRANGE
    const s0 = withOver(withOver(at('ideal'), 'qa', { eff: 300, effv: 50 }), 'qa', { ai: true });
    const reality = 60;
    // ACT
    const s = withReality(s0, reality);
    // ASSERT
    expect(s.reality).toBe(reality);
    expect(s.over.qa).toEqual({ ai: true });
  });

  it('drops a dashboard AI override when the Model picks where AI works', () => {
    // ARRANGE
    const aiSpeed = 3;
    const s0 = withOver(at('ideal'), 'qa', { ai: true, aiSpeed });
    // ACT
    const s = withAi(s0, 'all');
    // ASSERT
    expect(s.over.qa).toEqual({ aiSpeed });
    expect(aiKeyOf(B, s)).toBe('ai:all');
  });
});
