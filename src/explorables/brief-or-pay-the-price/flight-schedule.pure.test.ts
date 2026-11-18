import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExplorableEvent } from './explorable-state.pure';
import { scheduleLandings, yieldingToViewer, type Timers } from './flight-schedule.pure';

const timers: Timers = {
  set: (run, milliseconds) => setTimeout(run, milliseconds) as unknown as number,
  clear: (id) => clearTimeout(id as unknown as NodeJS.Timeout),
};

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

const flights = (landed: number[]) => ({
  count: 5,
  landsAt: (index: number) => 1000 + index * 400,
  land: (index: number) => landed.push(index + 1),
  timers,
});

describe('success cases', () => {
  it('lands every flight, one after the other, when nobody interrupts', () => {
    // ARRANGE
    const landed: number[] = [];
    const everyFlight = [1, 2, 3, 4, 5];
    scheduleLandings(flights(landed));
    // ACT
    vi.advanceTimersByTime(10_000);
    // ASSERT
    expect(landed).toEqual(everyFlight);
  });

  it('cancels the remaining flights when the viewer picks a BRACE step mid-flight', () => {
    // ARRANGE
    const landed: number[] = [];
    const cancel = scheduleLandings(flights(landed));
    const seen: ExplorableEvent[] = [];
    const picked: ExplorableEvent = { type: 'braceStep', step: 4 };
    const landedBeforePick = [1, 2];
    const dispatch = yieldingToViewer((event) => seen.push(event), cancel);
    vi.advanceTimersByTime(1500);
    // ACT
    dispatch(picked);
    vi.advanceTimersByTime(10_000);
    // ASSERT
    expect(landed).toEqual(landedBeforePick);
    expect(seen).toEqual([picked]);
  });

  it('cancels the remaining flights when the viewer presses Play mid-flight', () => {
    // ARRANGE
    const landed: number[] = [];
    const cancel = scheduleLandings(flights(landed));
    const landedBeforePlay = [1];
    const dispatch = yieldingToViewer(() => undefined, cancel);
    vi.advanceTimersByTime(1100);
    // ACT
    dispatch({ type: 'play' });
    vi.advanceTimersByTime(10_000);
    // ASSERT
    expect(landed).toEqual(landedBeforePlay);
  });
});

describe('failure cases', () => {
  it('lets events that are not the viewer’s BRACE choice leave the flights alone', () => {
    // ARRANGE
    const landed: number[] = [];
    const cancel = scheduleLandings(flights(landed));
    const everyFlight = [1, 2, 3, 4, 5];
    const dispatch = yieldingToViewer(() => undefined, cancel);
    // ACT
    dispatch({ type: 'light', lit: { kind: 'move', id: 'break-it-down' } });
    vi.advanceTimersByTime(10_000);
    // ASSERT
    expect(landed).toEqual(everyFlight);
  });
});

describe('edge cases', () => {
  it('may be cancelled twice, or after every flight landed, without a fault', () => {
    // ARRANGE
    const landed: number[] = [];
    const flightCount = 5;
    const cancel = scheduleLandings(flights(landed));
    vi.advanceTimersByTime(10_000);
    // ACT
    const stop = () => {
      cancel();
      cancel();
    };
    // ASSERT
    expect(stop).not.toThrow();
    expect(landed).toHaveLength(flightCount);
  });
});
