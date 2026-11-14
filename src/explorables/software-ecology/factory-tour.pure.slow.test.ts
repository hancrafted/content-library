import { describe, expect, it } from 'vitest';
import { headless, shown } from './factory-tour.fixture.ts';
import { startTour } from './factory-tour.pure.ts';
import { builtinBundle } from './use-case-data.ts';

/*
 * The slow half of factory-tour.pure.test.ts: tire swing's shipped tours, each played frame by frame to its end
 * (seconds a tour). They run in the slow lane, `npm run test:slow` (ARCH-003-testing §4).
 */
const B = builtinBundle('tire');
const TOURS = B.data.presets.filter((p) => p.tour).map((p) => p.id);

describe('success cases', () => {
  it.each(TOURS)('tire %s: every step shows the values the headless runner reads', (id) => {
    // ARRANGE
    const expected = headless(B, id);
    const started = startTour(B, id, { userSpeed: 5 });
    if (!started) throw new Error(`no tour ${id}`);
    // ACT
    const seen = shown(started.run, started.tour);
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
