// decision: ARCH-003 §4
// decision: ARCH-003 §4.4
import { describe, expect, it } from 'vitest';
import { AI_AT_ENG, SEEDS, withTour } from './factory-scenario.fixture.ts';
import { judgeScenario } from './factory-scenario.pure.ts';

describe('success cases', () => {
  it('checks settles after the beat’s settings run 40 weeks more', () => {
    // ARRANGE
    const B = withTour([{ set: AI_AT_ENG, run: 6, settles: { 'qa.weeksWaiting': '>8' } }]);
    const pile = 8;
    // ACT
    const check = judgeScenario(B, 'probe', { seeds: SEEDS }).beats[0]?.checks.find((c) => c.kind === 'settles');
    // ASSERT
    expect(Math.min(...(check?.means ?? []))).toBeGreaterThan(pile);
  });
});
