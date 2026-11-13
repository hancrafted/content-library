import { describe, expect, it } from 'vitest';
import type { Bundle, Preset } from './software-ecology.types';
import { custOf, idealSettings, presetSettings, realisticSettings, startSettings } from './start-settings.pure.ts';
import { builtinBundle } from './use-case-data.ts';

/*
 * The settings a run starts from (design-ADR 0024 §3): Ideal, Realistic, a preset's own, and the Customer at them.
 */
const B: Bundle = builtinBundle('tire');
const presetOf = (id: string): Preset => B.data.presets.find((p) => p.id === id) as Preset;

describe('success cases', () => {
  it('sets Ideal at no reality and no AI, with every mechanic on, keeping the company', () => {
    // ARRANGE
    const company = 'product' as const;
    // ACT
    const s = idealSettings(company);
    // ASSERT
    expect([s.preset, s.reality, s.ai, s.company, s.mech]).toEqual([
      'ideal',
      0,
      'off',
      company,
      { rework: true, churn: true, complaints: true },
    ]);
  });

  it('sets Realistic at full reality with no AI and no overrides', () => {
    // ARRANGE
    const company = 'service' as const,
      reality = 100;
    // ACT
    const s = realisticSettings(B, company);
    // ASSERT
    expect([s.reality, s.ai, s.over, s.company]).toEqual([reality, 'off', {}, company]);
  });

  it('starts a preset from Ideal with the preset’s own reality, AI and Customer on top', () => {
    // ARRANGE
    const p = presetOf('realistic');
    // ACT
    const s = startSettings(B, p);
    // ASSERT
    expect([s.preset, s.reality, s.cust]).toEqual([p.id, presetSettings(B, p).reality, presetSettings(B, p).cust]);
  });

  it('reads the Customer from the file when the settings override none', () => {
    // ARRANGE
    const s = idealSettings('service');
    // ACT
    const cu = custOf({ B }, s);
    // ASSERT
    expect([cu.rate, cu.mode]).toEqual([B.data.customer.rate, B.data.customer.arrivals ?? 'steady']);
  });
});

describe('failure cases', () => {
  it('lets a preset without dials override no center', () => {
    // ARRANGE
    const p: Preset = { id: 'bare' };
    // ACT
    const s = presetSettings(B, p);
    // ASSERT
    expect([s.over, s.ai, s.reality]).toEqual([{}, 'off', 0]);
  });
});

describe('edge cases', () => {
  it('lets the settings’ own Customer win over the file’s', () => {
    // ARRANGE
    const rate = 42,
      s = { ...idealSettings('service'), cust: { ...custOf({ B }, idealSettings('service')), rate } };
    // ACT
    const cu = custOf({ B }, s);
    // ASSERT
    expect(cu.rate).toBe(rate);
  });

  it('falls back to a plain Realistic preset when the file has none', () => {
    // ARRANGE
    const bare = { ...B, data: { ...B.data, presets: [] } } as Bundle,
      reality = 100;
    // ACT
    const s = realisticSettings(bare, 'service');
    // ASSERT
    expect([s.preset, s.reality]).toEqual(['realistic', reality]);
  });
});
