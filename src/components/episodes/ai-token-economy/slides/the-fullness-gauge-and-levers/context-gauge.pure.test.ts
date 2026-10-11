import { describe, expect, it } from 'vitest';
import { evaluateContextGauge } from './context-gauge.pure';

describe('success cases', () => {
  it('puts the context gauge in the safe, warning and danger zone as it fills', () => {
    // ARRANGE
    const expectedZones = ['safe', 'warning', 'danger'];
    // ACT
    const zones = [30, 65, 85].map((percent) => evaluateContextGauge(percent).zone);
    // ASSERT
    expect(zones).toEqual(expectedZones);
  });
});

describe('failure cases', () => {
  it('puts a nearly full context in the danger zone', () => {
    // ARRANGE
    const nearlyFull = 99;
    const expectedZone = 'danger';
    // ACT
    const gauge = evaluateContextGauge(nearlyFull);
    // ASSERT
    expect(gauge.zone).toBe(expectedZone);
  });
});

describe('edge cases', () => {
  it('keeps each zone boundary in the lower zone: 50% safe, 75% warning', () => {
    // ARRANGE
    const expectedZones = ['safe', 'warning'];
    // ACT
    const zones = [50, 75].map((percent) => evaluateContextGauge(percent).zone);
    // ASSERT
    expect(zones).toEqual(expectedZones);
  });
});
