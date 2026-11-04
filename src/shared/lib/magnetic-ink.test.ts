import { describe, expect, it } from 'vitest';
import { createMagneticInk } from './magnetic-ink';

const BUTTON = { x: 0, y: 0, width: 160, height: 48, radius: 24 };
const CARD = { x: 0, y: 0, width: 400, height: 300, radius: 16 };
const PRIMARY = { x: 240, y: 240, width: 140, height: 44, radius: 22 };
const SECONDARY = { x: 20, y: 240, width: 190, height: 44, radius: 22 };
const settle = (ink: ReturnType<typeof createMagneticInk>, pointer: { x: number; y: number }) => {
  let result = ink.frame({ pointer, delta: 16, enabled: true });
  for (let i = 0; i < 150 && result.moving; i++) result = ink.frame({ pointer, delta: 16, enabled: true });
  return result;
};

describe('success cases', () => {
  it('registers an actionable host and removes it on disposal', () => {
    // ARRANGE
    const ink = createMagneticInk();
    const id = 'action';
    // ACT
    const host = ink.register(id, { surface: BUTTON });
    const registered = ink.frame({ pointer: null, delta: 16, enabled: true });
    host.dispose();
    const disposed = ink.frame({ pointer: null, delta: 16, enabled: true });
    // ASSERT
    expect(registered.hosts.has(id)).toBe(true);
    expect(disposed.hosts.has(id)).toBe(false);
    expect(disposed.moving).toBe(false);
  });
  it('floods a standalone action and stops at rest', () => {
    // ARRANGE
    const ink = createMagneticInk();
    const id = 'action';
    ink.register(id, { surface: BUTTON });
    // ACT
    const frame = settle(ink, { x: 80, y: 24 });
    const action = frame.hosts.get(id);
    // ASSERT
    expect(action?.primaryFill).toBe(1);
    expect(frame.moving).toBe(false);
  });
  it('carries card ink to its primary action before filling it', () => {
    // ARRANGE
    const ink = createMagneticInk();
    const id = 'card';
    const travelling = 'travelling';
    ink.register(id, { surface: CARD, primary: PRIMARY, secondary: SECONDARY });
    // ACT
    const entry = ink.frame({ pointer: { x: 80, y: 80 }, delta: 16, enabled: true });
    const finished = settle(ink, { x: 80, y: 80 });
    // ASSERT
    expect(entry.hosts.get(id)?.stage).toBe(travelling);
    expect(entry.hosts.get(id)?.primaryFill).toBe(0);
    expect(finished.hosts.get(id)?.primaryFill).toBe(1);
    expect(finished.moving).toBe(false);
  });
  it('reaches the primary action after 300 milliseconds of card travel', () => {
    // ARRANGE
    const ink = createMagneticInk();
    const id = 'card';
    const pointer = { x: 80, y: 80 };
    const frameTime = 10;
    const beforeArrival = 290;
    const travelling = 'travelling';
    const arrived = 'primary';
    ink.register(id, { surface: CARD, primary: PRIMARY });
    // ACT
    let frame = ink.frame({ pointer, delta: frameTime, enabled: true });
    for (let time = frameTime; time < beforeArrival; time += frameTime) {
      frame = ink.frame({ pointer, delta: frameTime, enabled: true });
    }
    const before = frame.hosts.get(id)?.stage;
    const after = ink.frame({ pointer, delta: frameTime, enabled: true }).hosts.get(id);
    // ASSERT
    expect(before).toBe(travelling);
    expect(after?.stage).toBe(arrived);
    expect(after?.primaryFill).toBeGreaterThan(0);
  });
  it('starts slowly and accelerates its travelling blob toward the action', () => {
    // ARRANGE
    const ink = createMagneticInk();
    const id = 'card';
    const pointer = { x: 80, y: 80 };
    const frameTime = 10;
    const checkpoints = [100, 200, 300];
    const distances: number[] = [];
    ink.register(id, { surface: CARD, primary: PRIMARY });
    // ACT
    for (let time = frameTime; time <= checkpoints.at(-1)!; time += frameTime) {
      const view = ink.frame({ pointer, delta: frameTime, enabled: true }).hosts.get(id)!;
      if (checkpoints.includes(time)) {
        const coordinates = (view.paths[0].match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
        distances.push(coordinates[0] ?? PRIMARY.x + PRIMARY.width / 2);
      }
    }
    const [early, middle, late] = distances;
    // ASSERT
    expect(late - middle).toBeGreaterThan(middle - early);
  });
  it('fills the secondary action while draining the primary, and restores it on return', () => {
    // ARRANGE
    const ink = createMagneticInk();
    const id = 'card';
    const secondary = 'secondary';
    ink.register(id, { surface: CARD, primary: PRIMARY, secondary: SECONDARY });
    settle(ink, { x: 80, y: 80 });
    // ACT
    const video = settle(ink, { x: 100, y: 262 });
    const back = settle(ink, { x: 310, y: 262 });
    // ASSERT
    expect(video.hosts.get(id)?.stage).toBe(secondary);
    expect(video.hosts.get(id)?.primaryFill).toBe(0);
    expect(video.hosts.get(id)?.secondaryFill).toBe(1);
    expect(back.hosts.get(id)?.primaryFill).toBe(1);
    expect(back.hosts.get(id)?.secondaryFill).toBe(0);
  });
  it('compresses approaching pools into separate portions of a narrow gap', () => {
    // ARRANGE
    const ink = createMagneticInk();
    const left = 'left';
    const right = 'right';
    const gapLeftLimit = 403;
    const gapRightLimit = 417;
    ink.register(left, { surface: CARD, primary: PRIMARY });
    ink.register(right, { surface: { ...CARD, x: 420 }, primary: { ...PRIMARY, x: 660 } });
    const xs = (paths: string[]) =>
      paths
        .slice(1)
        .flatMap((path) => (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number).filter((_, index) => index % 2 === 0));
    // ACT
    const frame = settle(ink, { x: 410, y: 150 });
    const leftXs = xs(frame.hosts.get(left)!.paths);
    const rightXs = xs(frame.hosts.get(right)!.paths).map((x) => x + 420);
    // ASSERT
    expect(Math.max(...leftXs)).toBeLessThanOrEqual(gapLeftLimit);
    expect(Math.min(...rightXs)).toBeGreaterThanOrEqual(gapRightLimit);
    expect(frame.moving).toBe(false);
  });
});

describe('failure cases', () => {
  it('rejects duplicate registrations instead of replacing a live host', () => {
    // ARRANGE
    const ink = createMagneticInk();
    const id = 'action';
    const message = 'Ink host is already registered.';
    ink.register(id, { surface: BUTTON });
    // ACT
    const duplicate = () => ink.register(id, { surface: BUTTON });
    // ASSERT
    expect(duplicate).toThrow(message);
  });
  it('rejects invalid geometry without leaving a registration', () => {
    // ARRANGE
    const ink = createMagneticInk();
    const message = 'Ink surfaces need finite positive dimensions and reach.';
    // ACT
    const register = () => ink.register('flat', { surface: { ...BUTTON, height: 0 } });
    // ASSERT
    expect(register).toThrow(message);
  });
});

describe('edge cases', () => {
  it('does not fill a host covered by another native hit target', () => {
    // ARRANGE
    const ink = createMagneticInk();
    const id = 'covered';
    ink.register(id, { surface: BUTTON });
    // ACT
    const frame = ink.frame({ pointer: { x: 80, y: 24 }, owner: null, delta: 16, enabled: true });
    // ASSERT
    expect(frame.hosts.get(id)?.primaryFill).toBe(0);
    expect(frame.hosts.get(id)?.paths).toEqual([]);
  });
  it('keeps an empty page idle', () => {
    // ARRANGE
    const ink = createMagneticInk();
    // ACT
    const frame = ink.frame({ pointer: { x: 80, y: 20 }, delta: 16, enabled: true });
    // ASSERT
    expect(frame.hosts.size).toBe(0);
    expect(frame.moving).toBe(false);
  });
  it('clears all motion immediately when disabled', () => {
    // ARRANGE
    const ink = createMagneticInk();
    const id = 'action';
    ink.register(id, { surface: BUTTON });
    settle(ink, { x: 80, y: 24 });
    // ACT
    const frame = ink.frame({ pointer: { x: 80, y: 24 }, delta: 16, enabled: false });
    // ASSERT
    expect(frame.hosts.get(id)?.primaryFill).toBe(0);
    expect(frame.hosts.get(id)?.paths).toEqual([]);
    expect(frame.moving).toBe(false);
  });
  it('suppresses neighbours when one card owns the pointer', () => {
    // ARRANGE
    const ink = createMagneticInk();
    const neighbour = 'neighbour';
    ink.register('card', { surface: CARD, primary: PRIMARY });
    ink.register(neighbour, { surface: { ...CARD, x: 420 }, primary: { ...PRIMARY, x: 660 } });
    // ACT
    const frame = settle(ink, { x: 390, y: 150 });
    // ASSERT
    expect(frame.hosts.get(neighbour)?.paths).toEqual([]);
    expect(frame.hosts.get(neighbour)?.strength).toBe(0);
  });
});
