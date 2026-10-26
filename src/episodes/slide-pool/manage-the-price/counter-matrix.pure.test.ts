import { describe, expect, it } from 'vitest';
import { BRIEF, counterTotals, TRAITS, type MoveCounters } from './counter-matrix.pure';

describe('success cases', () => {
  it('counts the moves that counter each PRICE trait as the Spec board totals them: 3, 3, 1, 2, 2', () => {
    // ARRANGE
    const expected = { probabilistic: 3, relentless: 3, informed: 1, confident: 2, 'every-word-billed': 2 };
    // ACT
    const totals = counterTotals(BRIEF);
    // ASSERT
    expect(totals).toEqual(expected);
  });

  it('maps the five moves to the traits the Spec names, eleven ticks in all', () => {
    // ARRANGE
    const expected = 11;
    // ACT
    const ticks = BRIEF.reduce((sum, move) => sum + move.counters.length, 0);
    // ASSERT
    expect(ticks).toBe(expected);
  });
});

describe('failure cases', () => {
  it('counts a trait no move counters as zero', () => {
    // ARRANGE
    const moves: readonly MoveCounters[] = [{ slug: 'break-it-down', counters: ['relentless'] }];
    // ACT
    const totals = counterTotals(moves);
    // ASSERT
    expect(totals.informed).toBe(0);
    expect(totals.relentless).toBe(1);
  });
});

describe('edge cases', () => {
  it('keeps the traits in PRICE order and the moves in BRIEF order', () => {
    // ARRANGE
    const expectedTraits = ['probabilistic', 'relentless', 'informed', 'confident', 'every-word-billed'];
    const expectedMoves = [
      'break-it-down',
      'requirements-first',
      'interview-yourself-with-ai',
      'evaluate-each-step',
      'fresh-start-for-each-piece',
    ];
    // ACT
    const moves = BRIEF.map((move) => move.slug);
    // ASSERT
    expect(TRAITS).toEqual(expectedTraits);
    expect(moves).toEqual(expectedMoves);
  });
});
