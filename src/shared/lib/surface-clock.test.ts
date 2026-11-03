import { describe, expect, it } from 'vitest';
import { createSurfaceClock } from './surface-clock';
import { driveSurfaceClock } from './surface-clock-driver';

const geometry = {
  viewport: 800,
  maximum: 1800,
  samplingLine: 96,
  surfaces: [
    { id: 'a', top: 0, tone: 'normal' as const },
    { id: 'b', top: 2000, tone: 'inverse' as const, anchorOffset: 96 },
  ],
};

describe('success cases', () => {
  it('publishes refreshed geometry and current position atomically for late readers', () => {
    // ARRANGE
    const clock = createSurfaceClock();
    const seen: number[] = [];
    const expected = [1];
    clock.subscribe(
      (snapshot) => snapshot.edges[0]?.progress,
      (progress) => seen.push(progress ?? -1),
    );
    // ACT
    clock.setGeometry(geometry, 1800);
    const current = clock.getSnapshot().edges[0].progress;
    // ASSERT
    expect(seen).toEqual(expected);
    expect(current).toBe(1);
  });
  it('retains cached geometry throughout resize and refreshes after 500ms quiet', () => {
    // ARRANGE
    let now = 0;
    let reads = 0;
    const frames = new Map<number, () => void>();
    const timers = new Map<number, { at: number; run: () => void }>();
    let sequence = 0;
    const quiet = 500;
    const driver = driveSurfaceClock({
      readGeometry: () => {
        reads++;
        return geometry;
      },
      readPosition: () => 1500,
      frame: (run) => {
        frames.set(++sequence, run);
        return sequence;
      },
      cancelFrame: (id) => {
        frames.delete(id);
      },
      timer: (run, delay) => {
        timers.set(++sequence, { at: now + delay, run });
        return sequence;
      },
      cancelTimer: (id) => {
        timers.delete(id);
      },
    });
    const flush = () => {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((run) => run());
    };
    const tick = (time: number) => {
      now = time;
      for (const [id, task] of timers)
        if (task.at <= now) {
          timers.delete(id);
          task.run();
        }
    };
    // ACT
    flush();
    const initial = reads;
    driver.resize();
    driver.clock.requestRefresh();
    flush();
    tick(quiet - 1);
    driver.resize();
    tick(quiet);
    flush();
    const during = reads;
    tick(quiet * 2 - 1);
    flush();
    const settled = reads;
    driver.clock.requestRefresh();
    driver.dispose();
    flush();
    // ASSERT
    expect(during).toBe(initial);
    expect(settled).toBe(initial + 1);
    expect(reads).toBe(settled);
  });
  it('reads effect-free edge progress at reachable positions and reverses', () => {
    // ARRANGE
    const clock = createSurfaceClock();
    const expected = {
      id: 'a→b',
      outgoing: 'normal',
      incoming: 'inverse',
      top: 2000,
      start: 1200,
      end: 1800,
      progress: 0.5,
    };
    // ACT
    clock.setGeometry(geometry);
    clock.setPosition(1500);
    const midway = clock.getSnapshot().edges[0];
    clock.setPosition(1800);
    const arrival = clock.getSnapshot().edges[0].progress;
    clock.setPosition(1200);
    const reversed = clock.getSnapshot().edges[0].progress;
    // ASSERT
    expect(midway).toEqual(expected);
    expect(arrival).toBe(1);
    expect(reversed).toBe(0);
  });
});

describe('failure cases', () => {
  it('ignores invalid range settings and prevents notifications after disposal', () => {
    // ARRANGE
    const clock = createSurfaceClock();
    const seen: number[] = [];
    clock.subscribe(
      (snapshot) => snapshot.edges[0]?.progress,
      (value) => seen.push(value ?? -1),
    );
    // ACT
    clock.setGeometry({
      ...geometry,
      surfaces: [geometry.surfaces[0], { ...geometry.surfaces[1], startOffset: NaN, endOffset: Infinity }],
    });
    const end = clock.getSnapshot().edges[0].end;
    clock.dispose();
    const before = [...seen];
    clock.setPosition(1800);
    // ASSERT
    expect(end).toBe(geometry.maximum);
    expect(seen).toEqual(before);
  });
});

describe('edge cases', () => {
  it('completes collapsed ranges and samples distinct surfaces without active state', () => {
    // ARRANGE
    const clock = createSurfaceClock();
    const input = {
      viewport: 800,
      maximum: 300,
      samplingLine: 96,
      surfaces: [
        { id: 'a', top: 0, tone: 'normal' as const },
        { id: 'b', top: 40, tone: 'inverse' as const, anchorOffset: 96 },
        { id: 'c', top: 200, tone: 'normal' as const },
      ],
    };
    const inverse = 'inverse';
    const normal = 'normal';
    const count = 2;
    const tones: string[] = [];
    clock.subscribe(
      (snapshot) => snapshot.tone,
      (tone) => tones.push(tone),
    );
    // ACT
    clock.setGeometry(input);
    const start = clock.getSnapshot();
    clock.setPosition(10);
    clock.setPosition(200);
    const end = clock.getSnapshot();
    // ASSERT
    expect(start.edges).toHaveLength(count);
    expect(start.edges[0].progress).toBe(1);
    expect(start.tone).toBe(inverse);
    expect(end.tone).toBe(normal);
    expect(tones).toEqual([inverse, normal]);
  });
});
