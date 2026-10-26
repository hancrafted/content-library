import { describe, expect, it } from 'vitest';
import { advancePaperPile, pileShadowPath } from './paper-pile.pure';

describe('success cases', () => {
  it('clears the pile at full speed while the reader is on Explore why', () => {
    // ARRANGE
    const startingPapers = 80;
    const expectedPapers = 60;
    // ACT
    const papers = advancePaperPile(startingPapers, 0.75, 'primary');
    // ASSERT
    expect(papers).toBe(expectedPapers);
  });
  it('rebuilds the workload when the reader leaves a promise', () => {
    // ARRANGE
    const empty = 0;
    const elapsedSeconds = 2;
    const expectedPapers = 20;
    // ACT
    const papers = advancePaperPile(empty, elapsedSeconds, 'none');
    // ASSERT
    expect(papers).toBe(expectedPapers);
  });
  it('empties a large stack rapidly and starts growing again on leave', () => {
    // ARRANGE
    const stackedPapers = 20;
    const expectedEmpty = 0;
    const expectedRebuilt = 5;
    // ACT
    const emptied = advancePaperPile(stackedPapers, 1, 'primary');
    const rebuilt = advancePaperPile(emptied, 0.5, 'none');
    // ASSERT
    expect(emptied).toBe(expectedEmpty);
    expect(rebuilt).toBe(expectedRebuilt);
  });
  it('starts clearing the pile slowly while the pointer is right beside the button', () => {
    // ARRANGE
    const startingPapers = 50;
    const expectedInside = 40;
    const expectedHalfway = 50;
    const expectedApproaching = 55;
    // ACT
    const inside = advancePaperPile(startingPapers, 1, 1);
    const halfway = advancePaperPile(startingPapers, 1, 0.5);
    const approaching = advancePaperPile(startingPapers, 1, 0.25);
    // ASSERT
    expect(inside).toBe(expectedInside);
    expect(halfway).toBe(expectedHalfway);
    expect(approaching).toBe(expectedApproaching);
  });
  it('treats a pointer far from the button like no pointer at all', () => {
    // ARRANGE
    const startingPapers = 50;
    const expected = 60;
    // ACT
    const far = advancePaperPile(startingPapers, 1, 0);
    // ASSERT
    expect(far).toBe(expected);
  });
  it('casts only a short shadow from the empty tray', () => {
    // ARRANGE
    const expected = 'M-12 16H300L392 145L394.4 175H-48Z';
    // ACT
    const path = pileShadowPath(0);
    // ASSERT
    expect(path).toBe(expected);
  });
  it('fans the shadow down-left, away from the window, as the pile grows', () => {
    // ARRANGE
    const expectedHalf = 'M-12 16H300L392 145L402.85 280.6H-174.72Z';
    const expectedFull = 'M-12 16H300L392 145L411.3 386.2H-301.44Z';
    // ACT
    const half = pileShadowPath(48);
    const full = pileShadowPath(96);
    // ASSERT
    expect(half).toBe(expectedHalf);
    expect(full).toBe(expectedFull);
  });
});
describe('failure cases', () => {
  it.each([-0.1, 1.1, Number.NaN])('rejects proximity %s outside zero to one', (proximity) => {
    // ARRANGE
    const expected = 'Proximity must be between 0 and 1.';
    // ACT
    const advance = () => advancePaperPile(10, 1, proximity);
    // ASSERT
    expect(advance).toThrow(expected);
  });
  it.each([-1, Number.NaN])('rejects an invalid paper count %s for the shadow', (papers) => {
    // ARRANGE
    const expected = 'Paper count must be finite and non-negative.';
    // ACT
    const cast = () => pileShadowPath(papers);
    // ASSERT
    expect(cast).toThrow(expected);
  });
  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid elapsed time %s', (elapsed) => {
    // ARRANGE
    const expected = 'Paper count and elapsed time must be finite and non-negative.';
    // ACT
    const advance = () => advancePaperPile(10, elapsed, 'none');
    // ASSERT
    expect(advance).toThrow(expected);
  });
});
describe('edge cases', () => {
  it('stops lengthening the shadow once the pile reaches capacity', () => {
    // ARRANGE
    const expectedFull = 'M-12 16H300L392 145L411.3 386.2H-301.44Z';
    // ACT
    const overfull = pileShadowPath(200);
    // ASSERT
    expect(overfull).toBe(expectedFull);
  });
  it('bounds the drawn pile after it extends beyond the scene', () => {
    // ARRANGE
    const expectedVisibleCapacity = 96;
    // ACT
    const papers = advancePaperPile(90, 60, 'none');
    // ASSERT
    expect(papers).toBe(expectedVisibleCapacity);
  });
  it('does not depend on the frame rate', () => {
    // ARRANGE
    const expected = 5;
    // ACT
    const oneFrame = advancePaperPile(0, 0.5, 'none');
    const twoFrames = advancePaperPile(advancePaperPile(0, 0.25, 'none'), 0.25, 'none');
    // ASSERT
    expect(oneFrame).toBe(expected);
    expect(twoFrames).toBe(expected);
  });
});
