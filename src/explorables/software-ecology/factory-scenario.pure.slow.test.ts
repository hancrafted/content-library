import { describe, expect, it } from 'vitest';
import { AI_AT_ENG, SEEDS, withTour } from './factory-scenario.fixture.ts';
import { judgeScenario } from './factory-scenario.pure.ts';

/*
 * The slow half of factory-scenario.pure.test.ts: a judge that runs every seed 40 weeks past its beat (seconds). It
 * runs in the slow lane, `npm run test:slow` (ARCH-003-testing §4).
 */
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
