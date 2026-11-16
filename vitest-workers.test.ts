import { describe, expect, it } from 'vitest';
import { workersFor } from './vitest-workers.mts';

describe('workersFor', () => {
  it('gives an idle machine every core but one', () => {
    expect(workersFor(16, 0)).toBe(15);
  });

  it('shares the cores left over on a partly loaded machine', () => {
    expect(workersFor(16, 6.4)).toBe(9);
  });

  it('keeps the floor of 2 on a saturated or overloaded machine', () => {
    expect(workersFor(16, 15)).toBe(2);
    expect(workersFor(16, 40)).toBe(2);
  });

  it('caps a small machine at cores minus one', () => {
    expect(workersFor(4, 0)).toBe(3);
    expect(workersFor(4, 3.5)).toBe(2);
  });
});
