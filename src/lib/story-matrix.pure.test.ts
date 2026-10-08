import { describe, expect, it } from 'vitest';
import { countUpAt, highlightedAxes, matrixCells, statAt, type StoryPlacement } from './story-matrix.pure';

describe('success cases', () => {
  it('lays the six crossings out one row per who, process before technology, a story where one is placed', () => {
    // ARRANGE
    const placements: StoryPlacement[] = [{ id: 'pitch', who: 'individual', what: 'process' }];
    const expected = [
      { kind: 'story', who: 'individual', what: 'process', storyId: 'pitch' },
      { kind: 'empty', who: 'individual', what: 'technology' },
      { kind: 'empty', who: 'team', what: 'process' },
      { kind: 'empty', who: 'team', what: 'technology' },
      { kind: 'empty', who: 'organisation', what: 'process' },
      { kind: 'empty', who: 'organisation', what: 'technology' },
    ];
    // ACT
    const cells = matrixCells(placements);
    // ASSERT
    expect(cells).toEqual(expected);
  });

  it('lights the row and column of the hovered crossing', () => {
    // ARRANGE
    const hovered = { who: 'organisation', what: 'technology' } as const;
    const expected = { who: 'organisation', what: 'technology' };
    // ACT
    const axes = highlightedAxes(hovered);
    // ASSERT
    expect(axes).toEqual(expected);
  });

  it('eases out, so halfway through the duration the stat is seven eighths there', () => {
    // ARRANGE
    const target = 40;
    const duration = 1000;
    const expected = 35; // 40 × (1 − 0.5³)
    // ACT
    const shown = countUpAt(target, 500, duration);
    // ASSERT
    expect(shown).toBe(expected);
  });

  it('counts every number in a stat up together, keeping the marks around them', () => {
    // ARRANGE
    const halfway = 0.5;
    const expected = ['8–10', '25+', '~3'];
    // ACT
    const shown = ['15–20', '50+', '~5'].map((stat) => statAt(stat, halfway));
    // ASSERT
    expect(shown).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('lights no axis while nothing is hovered', () => {
    // ARRANGE
    const expected = { who: null, what: null };
    // ACT
    const axes = highlightedAxes(null);
    // ASSERT
    expect(axes).toEqual(expected);
  });

  it('leaves a stat with no number in it as written', () => {
    // ARRANGE
    const stat = 'n/a';
    // ACT
    const shown = statAt(stat, 0);
    // ASSERT
    expect(shown).toBe(stat);
  });

  it('lands on the target rather than NaN when the duration is zero', () => {
    // ARRANGE
    const target = 30;
    // ACT
    const shown = countUpAt(target, 0, 0);
    // ASSERT
    expect(shown).toBe(target);
  });
});

describe('edge cases', () => {
  it('keeps the first story when two are placed on the same crossing', () => {
    // ARRANGE
    const placements: StoryPlacement[] = [
      { id: 'first', who: 'team', what: 'technology' },
      { id: 'second', who: 'team', what: 'technology' },
    ];
    const owner = { kind: 'story', who: 'team', what: 'technology', storyId: 'first' };
    const crossingIndex = 3;
    // ACT
    const cells = matrixCells(placements);
    // ASSERT
    expect(cells[crossingIndex]).toEqual(owner);
  });

  it('holds at the target once the duration has passed, and at zero before it starts', () => {
    // ARRANGE
    const target = 12;
    const duration = 800;
    const expected = [0, target];
    // ACT
    const shown = [countUpAt(target, -50, duration), countUpAt(target, 2000, duration)];
    // ASSERT
    expect(shown).toEqual(expected);
  });

  it('rounds a mid-count number to a whole one, so no fraction flickers past', () => {
    // ARRANGE
    const stat = '30';
    const justUnderHalfway = 0.49;
    const expected = '15'; // 30 × 0.49 = 14.7
    // ACT
    const shown = statAt(stat, justUnderHalfway);
    // ASSERT
    expect(shown).toBe(expected);
  });
});
