// Post-build check of the software ecology Explorable's claim tours (design-ADR 0024 §12, grill 11 Q217): every tour
// whose beats carry Han's claims is judged across ten seeds by the judge `npm run ecology:sim` runs, and every beat
// holds on 8 of them within its 6 to 9 weeks. It needs no `out/`; it sits here because ten seeds a scenario are too
// slow for the fast suite, which judges only checks and claim-free tours on one seed.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadUseCase, simulate } from '../../src/explorables/software-ecology/ecology-sim.node';

const FOLDER = new URL('../../src/explorables/software-ecology/', import.meta.url);
const read = (name: string): string => readFileSync(new URL(name, FOLDER), 'utf8');

/** The use cases that ship, written out. */
const USE_CASES = ['tire', 'gate', 'teams'] as const;
const SEEDS = 10;
/** Ten seeds of a six-beat tour take several seconds; a closed spiral piles more work to simulate. */
const TOUR_TIMEOUT_MS = 60_000;

const claimTours = USE_CASES.flatMap((useCase) =>
  loadUseCase(useCase, read)
    .data.presets.filter((p) => p.tour?.some((st) => st.claim))
    .map((p) => [useCase, p.id] as const),
);

describe('claim tours across seeds', () => {
  it('finds the claim tours the use cases ship', () => {
    const expected = ['tire/ai-spiral', 'tire/clear-requirements'];
    expect(claimTours.map(([u, p]) => `${u}/${p}`)).toEqual(expected);
  });

  it.each(claimTours)(
    '%s %s: every beat holds on 8 of 10 seeds within 6 to 9 weeks',
    (useCase, scenario) => {
      const run = simulate({ useCase, scenario, seeds: SEEDS }, read);
      const failing = run.verdict.beats
        .filter((b) => !b.ok)
        .map((b) => `beat ${b.i + 1}: ${b.passed} of ${b.of} seeds${b.lengthOk ? '' : `, ${b.length} weeks`}`);
      expect(failing).toEqual([]);
    },
    TOUR_TIMEOUT_MS,
  );
});
