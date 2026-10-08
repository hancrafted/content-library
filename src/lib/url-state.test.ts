import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createUrlState, NAVIGATION_TIMEOUT_MS, WRITE_INTERVAL_MS, type UrlWindow } from './url-state';

/** A window that is only what the service touches: a hash, a history that records its writes, and events. */
function fakeWindow(initialHash = '') {
  const listeners = new Map<string, Set<() => void>>();
  const writes: string[] = [];
  const win = {
    location: { hash: initialHash, pathname: '/episodes/demo', search: '?ref=mail' },
    history: {
      state: { as: 'router' } as unknown,
      replaceState(state: unknown, _unused: string, url: string) {
        if (win.failWrites) throw new DOMException('too many calls', 'SecurityError');
        win.history.state = state;
        win.location.hash = url.includes('#') ? url.slice(url.indexOf('#')) : '';
        writes.push(url);
      },
    },
    failWrites: false,
    addEventListener: (type: string, listener: () => void) => {
      listeners.set(type, (listeners.get(type) ?? new Set()).add(listener));
    },
    removeEventListener: (type: string, listener: () => void) => void listeners.get(type)?.delete(listener),
  };
  const fire = (type: string) => [...(listeners.get(type) ?? [])].forEach((listener) => listener());
  return { win, writes, fire, listenerCount: (type: string) => listeners.get(type)?.size ?? 0 };
}

function setup(initialHash = '') {
  const fake = fakeWindow(initialHash);
  const state = createUrlState(fake.win as unknown as UrlWindow);
  const seen: (string | null)[] = [];
  const unsubscribe = state.subscribe(() => seen.push(state.getSlide()));
  return { ...fake, state, seen, unsubscribe };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('reading the hash', () => {
  it('reads a deep-link hash on creation', () => {
    // ARRANGE
    const { state } = setup('#intro--why');
    // ACT
    const slide = state.getSlide();
    // ASSERT
    expect(slide).toBe('intro--why');
  });

  it('reads an empty hash as the Title slide', () => {
    // ARRANGE / ACT
    const { state } = setup('');
    // ASSERT
    expect(state.getSlide()).toBe('top');
  });

  it('lands a #top deep link on the Title slide', () => {
    // ARRANGE / ACT
    const { state } = setup('#top');
    // ASSERT
    expect(state.getSlide()).toBe('top');
  });
});

describe('navigateTo', () => {
  it('notifies subscribers immediately and writes the hash', () => {
    // ARRANGE
    const { state, seen, writes } = setup();
    // ACT
    state.navigateTo('outro');
    // ASSERT
    expect([seen, writes]).toEqual([['outro'], ['#outro']]);
  });

  it('passes the current history state through the write', () => {
    // ARRANGE
    const { state, win } = setup();
    const before = win.history.state;
    // ACT
    state.navigateTo('outro');
    // ASSERT
    expect(win.history.state).toBe(before);
  });

  it('ignores reports while the scroll is in flight', () => {
    // ARRANGE
    const { state, seen } = setup();
    state.navigateTo('outro');
    // ACT
    state.reportReading('intro--why');
    // ASSERT
    expect([state.getSlide(), seen]).toEqual(['outro', ['outro']]);
  });

  it('resumes reports on scrollend', () => {
    // ARRANGE
    const { state, fire } = setup();
    state.navigateTo('outro');
    fire('scrollend');
    // ACT
    state.reportReading('outro--end');
    // ASSERT
    expect(state.getSlide()).toBe('outro--end');
  });

  it('resumes reports after the timeout when no scrollend comes', () => {
    // ARRANGE
    const { state } = setup();
    state.navigateTo('outro');
    vi.advanceTimersByTime(NAVIGATION_TIMEOUT_MS);
    // ACT
    state.reportReading('outro--end');
    // ASSERT
    expect(state.getSlide()).toBe('outro--end');
  });

  it('keeps ignoring reports just before the timeout', () => {
    // ARRANGE
    const { state } = setup();
    state.navigateTo('outro');
    vi.advanceTimersByTime(NAVIGATION_TIMEOUT_MS - 1);
    // ACT
    state.reportReading('outro--end');
    // ASSERT
    expect(state.getSlide()).toBe('outro');
  });

  it('restarts the window when a second navigation interrupts the first', () => {
    // ARRANGE
    const { state } = setup();
    state.navigateTo('a');
    vi.advanceTimersByTime(NAVIGATION_TIMEOUT_MS - 1);
    state.navigateTo('b');
    vi.advanceTimersByTime(NAVIGATION_TIMEOUT_MS - 1);
    // ACT
    state.reportReading('c');
    // ASSERT
    expect(state.getSlide()).toBe('b');
  });
});

describe('reportReading', () => {
  it('notifies immediately and writes the first report at once', () => {
    // ARRANGE
    const { state, seen, writes } = setup();
    // ACT
    state.reportReading('intro');
    // ASSERT
    expect([seen, writes]).toEqual([['intro'], ['#intro']]);
  });

  it('does not notify again for the same Slide', () => {
    // ARRANGE
    const { state, seen } = setup('#intro');
    // ACT
    state.reportReading('intro');
    // ASSERT
    expect(seen).toEqual([]);
  });

  it('writes at most once per interval and flushes the trailing value', () => {
    // ARRANGE
    const { state, seen, writes } = setup();
    // ACT
    for (const id of ['a', 'b', 'c', 'd']) state.reportReading(id);
    const early = [...writes];
    vi.advanceTimersByTime(WRITE_INTERVAL_MS);
    // ASSERT
    expect([seen, early, writes]).toEqual([['a', 'b', 'c', 'd'], ['#a'], ['#a', '#d']]);
  });

  it('never writes more than once per interval over a long fling', () => {
    // ARRANGE
    const { state, writes } = setup();
    // ACT: a new Slide every 10 ms for 10 s
    for (let tick = 0; tick < 1000; tick++) {
      state.reportReading(`slide-${tick}`);
      vi.advanceTimersByTime(10);
    }
    vi.advanceTimersByTime(WRITE_INTERVAL_MS);
    // ASSERT
    expect(writes.length).toBeLessThanOrEqual(Math.ceil(10_000 / WRITE_INTERVAL_MS) + 1);
    expect(writes.at(-1)).toBe('#slide-999');
  });

  it('keeps subscribers correct when the browser refuses the write', () => {
    // ARRANGE
    const { state, win, seen } = setup();
    win.failWrites = true;
    // ACT
    state.reportReading('a');
    // ASSERT
    expect([state.getSlide(), seen]).toEqual(['a', ['a']]);
  });
});

describe('popstate', () => {
  it('notifies subscribers with the hash Back or Forward landed on', () => {
    // ARRANGE
    const { state, win, seen, fire } = setup('#a');
    win.location.hash = '#b';
    // ACT
    fire('popstate');
    // ASSERT
    expect([state.getSlide(), seen]).toEqual(['b', ['b']]);
  });

  it('drops a pending write so it cannot overwrite the URL Back landed on', () => {
    // ARRANGE
    const { state, win, writes, fire } = setup();
    state.reportReading('a');
    state.reportReading('b');
    win.location.hash = '#earlier';
    // ACT
    fire('popstate');
    vi.advanceTimersByTime(WRITE_INTERVAL_MS * 2);
    // ASSERT
    expect([writes, win.location.hash]).toEqual([['#a'], '#earlier']);
  });

  it('lets reports through again after Back ends a navigation in flight', () => {
    // ARRANGE
    const { state, win, fire } = setup();
    state.navigateTo('outro');
    win.location.hash = '#earlier';
    fire('popstate');
    // ACT
    state.reportReading('earlier--next');
    // ASSERT
    expect(state.getSlide()).toBe('earlier--next');
  });
});

describe('a page that is no longer on screen', () => {
  it('neither adopts the hash nor writes when Back lands on another path', () => {
    // ARRANGE
    const { state, win, seen, writes, fire } = setup('#a');
    state.reportReading('b');
    vi.advanceTimersByTime(WRITE_INTERVAL_MS);
    win.location.pathname = '/episodes/other';
    win.location.hash = '#foreign';
    // ACT
    fire('popstate');
    vi.advanceTimersByTime(WRITE_INTERVAL_MS * 2);
    // ASSERT
    expect([state.getSlide(), seen, writes, win.location.hash]).toEqual(['b', ['b'], ['#b'], '#foreign']);
  });

  it('cancels a pending write when the path changed under it', () => {
    // ARRANGE
    const { state, win, writes, fire } = setup();
    state.reportReading('a');
    state.reportReading('b');
    win.location.pathname = '/episodes/other';
    // ACT
    fire('popstate');
    vi.advanceTimersByTime(WRITE_INTERVAL_MS * 2);
    // ASSERT
    expect(writes).toEqual(['#a']);
  });

  it('drops a trailing write when the path changed without a popstate', () => {
    // ARRANGE
    const { state, win, writes } = setup();
    state.reportReading('a');
    state.reportReading('b');
    win.location.pathname = '/episodes/other';
    // ACT
    vi.advanceTimersByTime(WRITE_INTERVAL_MS * 2);
    // ASSERT
    expect(writes).toEqual(['#a']);
  });

  it('takes the path it first subscribes on as its own, since a router writes the URL after the first render', () => {
    // ARRANGE
    const fake = fakeWindow('#x');
    fake.win.location.pathname = '/episodes/previous';
    const state = createUrlState(fake.win as unknown as UrlWindow);
    fake.win.location.pathname = '/episodes/demo';
    fake.win.location.hash = '#y';
    const seen: (string | null)[] = [];
    // ACT
    state.subscribe(() => seen.push(state.getSlide()));
    // ASSERT
    expect([state.getSlide(), seen]).toEqual(['y', ['y']]);
  });
});

describe('subscriptions', () => {
  it('stops notifying after unsubscribe and releases the window listeners', () => {
    // ARRANGE
    const { state, seen, unsubscribe, listenerCount } = setup();
    // ACT
    unsubscribe();
    state.reportReading('a');
    // ASSERT
    expect([seen, listenerCount('popstate')]).toEqual([[], 0]);
  });

  it('keeps instances isolated from each other', () => {
    // ARRANGE
    const first = setup();
    const second = setup();
    // ACT
    first.state.reportReading('a');
    // ASSERT
    expect(second.state.getSlide()).toBe('top');
  });

  it("keeps one instance free of another instance's pending write and flight", () => {
    // ARRANGE
    const first = setup();
    const second = setup();
    first.state.navigateTo('outro');
    // ACT
    second.state.reportReading('intro');
    // ASSERT
    expect([second.state.getSlide(), second.writes]).toEqual(['intro', ['#intro']]);
  });
});

describe('the Title slide', () => {
  it('clears the hash and keeps path and query when the reader returns to the Title slide', () => {
    // ARRANGE
    const { state, writes, win } = setup('#intro');
    // ACT
    state.reportReading('top');
    // ASSERT
    expect([state.getSlide(), writes, win.location.hash]).toEqual(['top', ['/episodes/demo?ref=mail'], '']);
  });

  it('clears the hash when a click navigates to the Title slide', () => {
    // ARRANGE
    const { state, writes } = setup('#intro');
    // ACT
    state.navigateTo('top');
    // ASSERT
    expect(writes).toEqual(['/episodes/demo?ref=mail']);
  });

  it('writes nothing for a #top deep link until the reader moves', () => {
    // ARRANGE
    const { state, writes } = setup('#top');
    // ACT
    state.reportReading('top');
    // ASSERT
    expect(writes).toEqual([]);
  });

  it('reads Back to a hash-less entry as the Title slide', () => {
    // ARRANGE
    const { state, win, seen, fire } = setup('#a');
    win.location.hash = '';
    // ACT
    fire('popstate');
    // ASSERT
    expect([state.getSlide(), seen]).toEqual(['top', ['top']]);
  });
});

describe('the first subscription', () => {
  it('re-reads a hash that changed since creation, as when a router writes the URL after the page rendered', () => {
    // ARRANGE
    const fake = fakeWindow('');
    const state = createUrlState(fake.win as unknown as UrlWindow);
    fake.win.location.hash = '#onboarding--keep-it-short';
    const seen: (string | null)[] = [];
    // ACT
    state.subscribe(() => seen.push(state.getSlide()));
    // ASSERT
    expect([state.getSlide(), seen]).toEqual(['onboarding--keep-it-short', ['onboarding--keep-it-short']]);
  });
});

describe('dispose', () => {
  it("cancels a pending trailing write so a dead page cannot rewrite the next page's URL", () => {
    // ARRANGE
    const { state, writes } = setup();
    state.reportReading('a');
    state.reportReading('b');
    // ACT
    state.dispose();
    vi.advanceTimersByTime(WRITE_INTERVAL_MS * 2);
    // ASSERT
    expect(writes).toEqual(['#a']);
  });

  it('ends a navigation in flight and releases every window listener', () => {
    // ARRANGE
    const { state, listenerCount } = setup();
    state.navigateTo('outro');
    // ACT
    state.dispose();
    // ASSERT
    expect([listenerCount('scrollend'), listenerCount('popstate')]).toEqual([0, 0]);
  });

  it('stays usable afterwards, as a remount in strict mode needs', () => {
    // ARRANGE
    const { state, seen } = setup();
    state.dispose();
    // ACT
    const unsubscribe = state.subscribe(() => undefined);
    state.reportReading('a');
    unsubscribe();
    // ASSERT
    expect([state.getSlide(), seen]).toEqual(['a', []]);
  });
});
