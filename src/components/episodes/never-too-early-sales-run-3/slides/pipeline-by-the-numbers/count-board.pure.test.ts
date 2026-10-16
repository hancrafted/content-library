import { describe, expect, it } from 'vitest';
import { cycleBar, formatEuro, PIPELINE, totalConversion, type PipelineStage } from './count-board.pure';

/** Intl separates a German amount from its symbol with a no-break space. */
const NBSP = '\u00a0';

describe('success cases', () => {
  it('multiplies the stage ratios of the worked example into 27 leads for one deal', () => {
    // ARRANGE
    const expected = 27;
    // ACT
    const total = totalConversion(PIPELINE);
    // ASSERT
    expect(total).toBe(expected);
  });

  it('draws the cycle bar to scale: 2 weeks, 6 months and 3 months make 9.5 months', () => {
    // ARRANGE
    const expectedMonths = 9.5;
    const expectedSegments = [
      { id: 'lead', start: 0, end: 0.5 },
      { id: 'opportunity', start: 0.5, end: 6.5 },
      { id: 'deal', start: 6.5, end: 9.5 },
    ];
    const expectedTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    // ACT
    const bar = cycleBar(PIPELINE);
    // ASSERT
    expect(bar.months).toBe(expectedMonths);
    expect(bar.segments).toEqual(expectedSegments);
    expect(bar.ticks).toEqual(expectedTicks);
  });

  it('writes the deal amount in euros in the page locale', () => {
    // ARRANGE
    const amount = 12_000;
    const expectedEn = '€12,000';
    const expectedDe = `12.000${NBSP}€`;
    // ACT
    const en = formatEuro(amount, 'en');
    const de = formatEuro(amount, 'de');
    // ASSERT
    expect(en).toBe(expectedEn);
    expect(de).toBe(expectedDe);
  });
});

describe('failure cases', () => {
  it('counts a stage with no ratio to the next as the end of the chain', () => {
    // ARRANGE
    const stages: readonly PipelineStage[] = [{ id: 'deal', notes: 1, months: 3 }];
    // ACT
    const total = totalConversion(stages);
    // ASSERT
    expect(total).toBe(1);
  });
});

describe('edge cases', () => {
  it('keeps the note counts of the board consistent with its ratios: 27, then 9, then 1', () => {
    // ARRANGE
    const expected = [27, 9, 1];
    // ACT
    const counts = PIPELINE.map((stage) => stage.notes);
    // ASSERT
    expect(counts).toEqual(expected);
  });
});
