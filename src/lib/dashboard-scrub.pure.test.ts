import { describe, expect, it } from 'vitest';
import { graphGeometry, scrubPosition, scrubTime, scrubTimeline, snapScrubPosition } from './dashboard-scrub.pure';

describe('success cases', () => {
  it('aligns a structural stage with its weighted graph centre in both directions', () => {
    // ARRANGE
    const weights = [1, 4, 1, 1];
    const expectedVisual = 5 / 12;
    const stage = 1 / 3;
    // ACT
    const geometry = graphGeometry(weights);
    const visual = scrubPosition(geometry.stops, stage);
    const structural = scrubTime(geometry.stops, expectedVisual);
    // ASSERT
    expect(visual).toBeCloseTo(expectedVisual);
    expect(structural).toBeCloseTo(stage);
  });
  it('keeps parallel pending work unfilled and reaches PR only when the Run finishes', () => {
    // ARRANGE
    const pending = { start: null, end: null };
    const parallel = [[{ start: 0, end: 10 }, { start: 0, end: null }, pending], [pending], [pending]];
    const complete = [[{ start: 0, end: 10 }], [{ start: 10, end: 20 }], [{ start: 20, end: 30 }]];
    const expectedParallel = 1 / 3;
    // ACT
    const edge = scrubPosition(scrubTimeline(parallel, { start: 0, end: 20 }), 20);
    const finished = scrubPosition(scrubTimeline(complete, { start: 0, end: 30 }), 30);
    // ASSERT
    expect(edge).toBeCloseTo(expectedParallel);
    expect(finished).toBe(1);
  });
  it('keeps Live at observed mid-run progress and maps its leading edge back to now', () => {
    // ARRANGE
    const stages = [[{ start: 0, end: 10 }], [{ start: 10, end: null }], [{ start: null, end: null }]];
    const expectedEdge = 0.75;
    const now = 20;
    // ACT
    const timeline = scrubTimeline(stages, { start: 0, end: now });
    const edge = scrubPosition(timeline, now);
    const time = scrubTime(timeline, expectedEdge);
    // ASSERT
    expect(edge).toBe(expectedEdge);
    expect(time).toBe(now);
  });
  it('lets a pointer scrub through the final Stage instead of jumping over its events', () => {
    // ARRANGE
    const stages = [[{ start: 0, end: 10 }], [{ start: 10, end: 30 }], [{ start: 30, end: 60 }]];
    const expectedTime = 45;
    const expectedPosition = 0.875;
    // ACT
    const timeline = scrubTimeline(stages, { start: 0, end: 60 });
    const time = scrubTime(timeline, expectedPosition);
    const position = scrubPosition(timeline, expectedTime);
    // ASSERT
    expect(time).toBe(expectedTime);
    expect(position).toBe(expectedPosition);
  });
  it('lightly snaps near a stage but leaves the middle of a gap freely scrubbable', () => {
    // ARRANGE
    const stageCount = 7;
    const expected = [0.5, 0.45];
    // ACT
    const positions = [0.506, 0.45].map((position) => snapScrubPosition(position, stageCount));
    // ASSERT
    expect(positions).toEqual(expected);
  });
  it('gives each Job equal space within its stage gap, not equal time', () => {
    // ARRANGE
    const stages = [
      [
        { start: 0, end: 10 },
        { start: 10, end: 30 },
      ],
      [{ start: 30, end: 50 }],
      [{ start: 50, end: 60 }],
    ];
    const expectedPosition = 0.375;
    const expectedTime = 20;
    // ACT
    const timeline = scrubTimeline(stages, { start: 0, end: 60 });
    const position = scrubPosition(timeline, 20);
    const time = scrubTime(timeline, 0.375);
    // ASSERT
    expect(position).toBe(expectedPosition);
    expect(time).toBe(expectedTime);
  });

  it('moves parallel branches together without assigning the longest Job extra space', () => {
    // ARRANGE
    const stages = [
      [
        { start: 0, end: 10 },
        { start: 0, end: 30 },
      ],
      [],
      [],
    ];
    const expectedPosition = 1 / 3;
    const expectedTime = 10;
    // ACT
    const timeline = scrubTimeline(stages, { start: 0, end: 60 });
    const position = scrubPosition(timeline, 10);
    const time = scrubTime(timeline, expectedPosition);
    // ASSERT
    expect(position).toBeCloseTo(expectedPosition);
    expect(time).toBeCloseTo(expectedTime);
  });
});

describe('failure cases', () => {
  it('rejects an inverted replay range rather than presenting backwards time', () => {
    // ARRANGE
    const range = { start: 60, end: 0 };
    // ACT
    const build = () => scrubTimeline([], range);
    // ASSERT
    expect(build).toThrow(RangeError);
  });
});

describe('edge cases', () => {
  it('keeps the final edge at the latest read without inventing starts for unplanned stages', () => {
    // ARRANGE
    const stages = [[{ start: 10, end: null }], [], [{ start: null, end: null }]];
    const expectedStart = 0;
    const expectedEnd = 40;
    const expectedEdge = 0.5;
    // ACT
    const timeline = scrubTimeline(stages, { start: 0, end: 40 });
    const start = scrubTime(timeline, -1);
    const end = scrubTime(timeline, 1);
    const live = scrubPosition(timeline, 40);
    // ASSERT
    expect(start).toBe(expectedStart);
    expect(end).toBe(expectedEnd);
    expect(live).toBe(expectedEdge);
  });
  it('keeps a zero-length Run usable', () => {
    // ARRANGE
    const instant = 25;
    // ACT
    const timeline = scrubTimeline([], { start: instant, end: instant });
    const time = scrubTime(timeline, 0.5);
    // ASSERT
    expect(time).toBe(instant);
  });
});
