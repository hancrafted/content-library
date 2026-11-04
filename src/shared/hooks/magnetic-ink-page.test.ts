import type { InkView } from '@/shared/lib/magnetic-ink';
import { describe, expect, it } from 'vitest';
import { createInkPage } from './magnetic-ink-page';

function clock() {
  let next = 0;
  const frames = new Map<number, (time: number) => void>();
  return {
    frames,
    request: (callback: (time: number) => void) => {
      frames.set(++next, callback);
      return next;
    },
    cancel: (id: number) => {
      frames.delete(id);
    },
    advance(time: number) {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((callback) => callback(time));
    },
  };
}
const surface = { x: 0, y: 0, width: 160, height: 48, radius: 24 };

describe('success cases', () => {
  it('updates native pointer ownership when geometry changes without pointer movement', () => {
    // ARRANGE
    const timer = clock();
    let owner = 'first';
    let first = surface;
    let second = { ...surface, y: 200 };
    const page = createInkPage({ ...timer, ownerAt: () => owner });
    const painted: InkView[] = [];
    page.attach('first', { read: () => ({ surface: first }), paint: () => undefined });
    page.attach('second', { read: () => ({ surface: second }), paint: (view) => painted.push(view) });
    page.follow({ x: 80, y: 24 }, owner);
    timer.advance(16);
    // ACT
    first = { ...surface, y: -200 };
    second = surface;
    owner = 'second';
    page.refresh();
    for (let time = 32; time <= 2400; time += 16) timer.advance(time);
    // ASSERT
    expect(painted.at(-1)?.primaryFill).toBe(1);
    expect(timer.frames.size).toBe(0);
  });
  it('shares a demand-driven scheduler and sleeps once the action settles', () => {
    // ARRANGE
    const timer = clock();
    const page = createInkPage(timer);
    const painted: InkView[] = [];
    page.attach('button', { read: () => ({ surface }), paint: (view) => painted.push(view) });
    // ACT
    page.follow({ x: 80, y: 24 });
    for (let time = 16; time <= 2400; time += 16) timer.advance(time);
    // ASSERT
    expect(painted.at(-1)?.primaryFill).toBe(1);
    expect(timer.frames.size).toBe(0);
  });
});

describe('failure cases', () => {
  it('clears pending drawing when the page is disabled', () => {
    // ARRANGE
    const timer = clock();
    const page = createInkPage(timer);
    const painted: InkView[] = [];
    page.attach('button', { read: () => ({ surface }), paint: (view) => painted.push(view) });
    page.follow({ x: 80, y: 24 });
    timer.advance(16);
    // ACT
    page.enable(false);
    // ASSERT
    expect(timer.frames.size).toBe(0);
    expect(painted.at(-1)?.paths).toEqual([]);
    expect(painted.at(-1)?.primaryFill).toBe(0);
  });
});

describe('edge cases', () => {
  it('hands ownership to the next native hit target when the hovered host is removed', () => {
    // ARRANGE
    const timer = clock();
    let owner = 'first';
    const page = createInkPage({ ...timer, ownerAt: () => owner });
    const remove = page.attach('first', { read: () => ({ surface }), paint: () => undefined });
    const painted: InkView[] = [];
    page.attach('second', { read: () => ({ surface }), paint: (view) => painted.push(view) });
    page.follow({ x: 80, y: 24 }, owner);
    timer.advance(16);
    // ACT
    owner = 'second';
    remove();
    for (let time = 32; time <= 2400; time += 16) timer.advance(time);
    // ASSERT
    expect(painted.at(-1)?.primaryFill).toBe(1);
    expect(timer.frames.size).toBe(0);
  });
  it('disposes and remounts a host without an old cleanup removing the new registration', () => {
    // ARRANGE
    const timer = clock();
    const page = createInkPage(timer);
    const old = page.attach('button', { read: () => ({ surface }), paint: () => undefined });
    old();
    const painted: InkView[] = [];
    page.attach('button', { read: () => ({ surface }), paint: (view) => painted.push(view) });
    // ACT
    old();
    page.follow({ x: 80, y: 24 });
    timer.advance(16);
    page.dispose();
    const before = painted.length;
    timer.advance(32);
    // ASSERT
    expect(before).toBeGreaterThan(0);
    expect(painted.length).toBe(before);
    expect(timer.frames.size).toBe(0);
  });
});
