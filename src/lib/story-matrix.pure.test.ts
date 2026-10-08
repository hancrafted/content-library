import { describe, expect, it } from 'vitest';
import { countUpAt, formatStat, highlightedAxes, matrixCells, type StoryPlacement } from './story-matrix.pure';

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

  it("writes a decimal stat with each locale's own separator", () => {
    // ARRANGE
    const expected = ['2.5', '2,5'];
    // ACT
    const written = [formatStat(2.5, 1, 'en'), formatStat(2.5, 1, 'de')];
    // ASSERT
    expect(written).toEqual(expected);
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
  it('marks the crossing a story spills into without giving it a second card', () => {
    // ARRANGE
    const placements: StoryPlacement[] = [
      { id: 'rib-team', who: 'team', what: 'process', spillsInto: { who: 'team', what: 'technology' } },
    ];
    const spill = { kind: 'spill', who: 'team', what: 'technology', storyId: 'rib-team' };
    const spillIndex = 3;
    // ACT
    const cells = matrixCells(placements);
    // ASSERT
    expect(cells[spillIndex]).toEqual(spill);
  });

  it('keeps the owning story when a spill lands on a crossing that has its own story', () => {
    // ARRANGE
    const placements: StoryPlacement[] = [
      { id: 'rib-team', who: 'team', what: 'process', spillsInto: { who: 'team', what: 'technology' } },
      { id: 'tooling', who: 'team', what: 'technology' },
    ];
    const owner = { kind: 'story', who: 'team', what: 'technology', storyId: 'tooling' };
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

  it("rounds a mid-count value to the stat's own precision, so no fraction flickers past", () => {
    // ARRANGE
    const expected = '35';
    // ACT
    const written = formatStat(34.7, 0, 'en');
    // ASSERT
    expect(written).toBe(expected);
  });
});
