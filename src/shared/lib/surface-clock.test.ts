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
  it('suppresses only the current explicit flight while geometry remains reversible after settlement', () => {
    // ARRANGE
    const clock = createSurfaceClock();
    const half = 0.5;
    clock.setGeometry(geometry, 1500);
    // ACT
    clock.setNavigation({ id: 1, status: 'navigating' });
    const navigating = clock.getSnapshot().suppressed;
    clock.setPosition(1800);
    clock.setNavigation({ id: 1, status: 'settled' });
    const arrival = clock.getSnapshot();
    clock.setPosition(1500);
    // ASSERT
    expect(navigating).toBe(true);
    expect(arrival.suppressed).toBe(false);
    expect(arrival.edges[0].progress).toBe(1);
    expect(clock.getSnapshot().edges[0].progress).toBe(half);
  });
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
  it('ignores stale terminals and releases interruption and timeout without latching destination progress', () => {
    // ARRANGE
    const clock = createSurfaceClock();
    const half = 0.5;
    const statuses = ['interrupted', 'timed-out', 'superseded'] as const;
    clock.setGeometry(geometry, 1500);
    // ACT
    const observations = statuses.map((status, index) => {
      const id = index + 2;
      clock.setNavigation({ id, status: 'navigating' });
      clock.setNavigation({ id: 1, status: 'settled' });
      const protectedFlight = clock.getSnapshot().suppressed;
      clock.setNavigation({ id, status });
      return {
        protectedFlight,
        suppressed: clock.getSnapshot().suppressed,
        progress: clock.getSnapshot().edges[0].progress,
      };
    });
    // ASSERT
    expect(observations).toEqual(statuses.map(() => ({ protectedFlight: true, suppressed: false, progress: half })));
  });
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
  it('tracks overlapping edge ranges independently through reverse, fast jumps and refreshed offsets', () => {
    // ARRANGE
    const clock = createSurfaceClock();
    const surfaces = [
      { id: 'a', top: 0, tone: 'normal' as const },
      { id: 'b', top: 1000, tone: 'inverse' as const, anchorOffset: 100 },
      { id: 'c', top: 1300, tone: 'normal' as const, anchorOffset: 100 },
    ];
    const input = { viewport: 800, maximum: 1500, samplingLine: 76, surfaces };
    const forward = [5 / 7, 2 / 7];
    const refreshed = [0.75, 2 / 7];
    const reverse = [2 / 7, 0];
    // ACT
    clock.setGeometry(input, 700);
    const first = clock.getSnapshot().edges.map((edge) => edge.progress);
    clock.setGeometry({ ...input, surfaces: [surfaces[0], { ...surfaces[1], startOffset: -100 }, surfaces[2]] });
    const edited = clock.getSnapshot().edges.map((edge) => edge.progress);
    clock.setPosition(1500);
    const jump = clock.getSnapshot().edges.map((edge) => edge.progress);
    clock.setGeometry(input, 400);
    const back = clock.getSnapshot().edges.map((edge) => edge.progress);
    // ASSERT
    expect(first).toEqual(forward);
    expect(edited).toEqual(refreshed);
    expect(jump).toEqual([1, 1]);
    expect(back).toEqual(reverse);
  });
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
