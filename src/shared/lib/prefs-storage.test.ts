import { afterEach, describe, expect, it } from 'vitest';
import { readProgress, removeProgress, writeProgress } from './prefs-storage';
import { PROGRESS_KEY } from './progress.pure';

/** A hand-written Storage over a map; `full` makes every write throw as a full quota does. */
function fakeStorage(items: Record<string, string> = {}, full = false) {
  return {
    items,
    getItem: (key: string) => items[key] ?? null,
    setItem: (key: string, value: string) => {
      if (full) throw new Error('QuotaExceededError');
      items[key] = value;
    },
  };
}

const install = (storage: object) => Object.assign(globalThis, { window: { localStorage: storage } });
const entry = { hash: 'h', teaching: true, results: { 'a.b': 'text' } };
const KEY = 'human-in-the-loop/x';

/** What `window` was before any test: put back after each, so no test leaks an ambient `window` into the next. */
const ambient = Object.getOwnPropertyDescriptor(globalThis, 'window');

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'window');
  if (ambient) Object.defineProperty(globalThis, 'window', ambient);
});

describe('success cases', () => {
  it('writes an entry under the progress key and reads it back', () => {
    // ARRANGE
    const storage = fakeStorage();
    install(storage);
    // ACT
    const saved = writeProgress(KEY, entry);
    // ASSERT
    expect(saved).toBe(true);
    expect(Object.keys(storage.items)).toEqual([PROGRESS_KEY]);
    expect(readProgress(KEY)).toEqual(entry);
  });

  it('removes one entry and leaves the others', () => {
    // ARRANGE
    install(fakeStorage());
    writeProgress(KEY, entry);
    writeProgress('other', entry);
    // ACT
    removeProgress(KEY);
    // ASSERT
    expect(readProgress(KEY)).toBeUndefined();
    expect(readProgress('other')).toEqual(entry);
  });
});

describe('failure cases', () => {
  it('reports a write that storage refuses, so the viewer can be told to download', () => {
    // ARRANGE
    install(fakeStorage({}, true));
    // ACT
    const saved = writeProgress(KEY, entry);
    // ASSERT
    expect(saved).toBe(false);
  });

  it('reads no progress and saves nothing when storage is unavailable', () => {
    // ARRANGE
    Reflect.deleteProperty(globalThis, 'window');
    // ACT
    const saved = writeProgress(KEY, entry);
    // ASSERT
    expect(saved).toBe(false);
    expect(readProgress(KEY)).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('leaves the prefs key alone when progress is written', () => {
    // ARRANGE
    const storage = fakeStorage({ 'hancrafted:prefs': '{"theme":"dark"}' });
    install(storage);
    // ACT
    writeProgress(KEY, entry);
    // ASSERT
    expect(storage.items['hancrafted:prefs']).toBe('{"theme":"dark"}');
  });
});
