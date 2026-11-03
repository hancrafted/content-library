import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { driveSurfaceClock } from './surface-clock-driver';
import {
  createUrlState,
  NAVIGATION_TIMEOUT_MS,
  WRITE_INTERVAL_MS,
  type SlideNavigation,
  type UrlLink,
  type UrlWindow,
} from './url-state';
import { createUrlNavigationBrowser } from './url-state-browser';

/** A window that is only what the service touches: a hash, a history that records its writes, and events. */
function fakeWindow(initialHash = '') {
  const listeners = new Map<string, Set<(event: Event) => void>>();
  const writes: string[] = [];
  const win = {
    location: { hash: initialHash, pathname: '/episodes/demo', search: '?ref=mail', origin: 'https://example.test' },
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
    addEventListener: (type: string, listener: (event: Event) => void) => {
      listeners.set(type, (listeners.get(type) ?? new Set()).add(listener));
    },
    removeEventListener: (type: string, listener: (event: Event) => void) => void listeners.get(type)?.delete(listener),
  };
  const fire = (type: string, event = new Event(type)) =>
    [...(listeners.get(type) ?? [])].forEach((listener) => listener(event));
  const queued = (type: string) => {
    const callbacks = [...(listeners.get(type) ?? [])];
    return () => callbacks.forEach((listener) => listener(new Event(type)));
  };
  return { win, writes, fire, queued, listenerCount: (type: string) => listeners.get(type)?.size ?? 0 };
}

function setup(initialHash = '') {
  const fake = fakeWindow(initialHash);
  const position = { scroll: 0, top: 2000, offset: 96, maxScroll: 1800 };
  const scrolls: string[] = [];
  let linkListener: ((link: UrlLink) => boolean) | null = null;
  const state = createUrlState(fake.win as unknown as UrlWindow, {
    readPosition: (id) => (id === 'missing' ? null : position),
    scrollTo: (id) => {
      scrolls.push(id);
    },
    subscribeLinks: (listener) => {
      linkListener = listener;
      return () => {
        linkListener = null;
      };
    },
  });
  const seen: (string | null)[] = [];
  const unsubscribe = state.subscribe(() => seen.push(state.getSlide()));
  const nativeLink = (href: string) => linkListener?.({ href, button: 0 }) ?? false;
  return { ...fake, position, scrolls, nativeLink, state, seen, unsubscribe };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('success cases', () => {
  it('lets a late clock consume repeated authoritative flights and hand back to actual geometry', () => {
    // ARRANGE
    const { state, position, fire } = setup();
    const frames: (() => void)[] = [];
    const expectedHalf = 0.5;
    state.navigateTo('b');
    const driver = driveSurfaceClock({
      navigation: state,
      readGeometry: () => ({
        viewport: 800,
        maximum: 1800,
        samplingLine: 96,
        surfaces: [
          { id: 'a', top: 0, tone: 'normal' },
          { id: 'b', top: position.top, tone: 'inverse', anchorOffset: 96 },
        ],
      }),
      readPosition: () => position.scroll,
      frame: (run) => frames.push(run),
      cancelFrame: () => undefined,
      timer: (run, ms) => Number(setTimeout(run, ms)),
      cancelTimer: (id) => clearTimeout(id),
    });
    // ACT
    const late = driver.clock.getSnapshot().suppressed;
    frames.splice(0).forEach((run) => run());
    state.navigateTo('b');
    position.scroll = 1500;
    fire('wheel');
    const interrupted = driver.clock.getSnapshot();
    state.navigateTo('b');
    position.top = 1000;
    position.scroll = 904;
    fire('scrollend');
    const settled = driver.clock.getSnapshot();
    position.scroll = 552;
    driver.scroll();
    frames.splice(0).forEach((run) => run());
    const reverse = driver.clock.getSnapshot();
    driver.dispose();
    state.dispose();
    // ASSERT
    expect(late).toBe(true);
    expect(interrupted.suppressed).toBe(false);
    expect(interrupted.edges[0].progress).toBe(expectedHalf);
    expect(settled.suppressed).toBe(false);
    expect(settled.edges[0].progress).toBe(1);
    expect(reverse.edges[0].progress).toBe(expectedHalf);
  });
  it('returns to document start on an Event recording page whose Title follows Event framing', () => {
    // ARRANGE
    const { win, writes } = fakeWindow('#thought-experiment');
    const eventPath = '/events/workshop/episodes/attention/';
    win.location.pathname = eventPath;
    const titleTop = 221;
    const margin = 96;
    const root = { scrollHeight: 4000 };
    const focusedControl = { id: 'talk-player-back' };
    const target = {
      hasAttribute: () => true,
      getBoundingClientRect: () => ({ top: titleTop - browserWindow.scrollY }),
      scrollIntoView: () => {
        browserWindow.scrollY = titleTop - margin;
      },
    };
    const browserWindow = Object.assign(win, {
      scrollY: 900,
      innerHeight: 800,
      document: { documentElement: root, activeElement: focusedControl, getElementById: () => target },
      getComputedStyle: () => ({ scrollMarginTop: `${margin}px`, scrollPaddingTop: '0px' }),
      matchMedia: () => ({ matches: true }),
      scrollTo: ({ top }: { top: number }) => {
        browserWindow.scrollY = top;
      },
    });
    const state = createUrlState(win, createUrlNavigationBrowser(browserWindow as unknown as Window, 'data-slide'));
    const expected = { id: 1, target: 'top', status: 'settled' };
    const expectedUrl = `${eventPath}?ref=mail`;
    const historyState = win.history.state;
    // ACT
    state.navigateTo('top');
    vi.advanceTimersByTime(0);
    // ASSERT
    expect(browserWindow.scrollY).toBe(0);
    expect(state.getNavigation()).toEqual(expected);
    expect(writes).toEqual([expectedUrl]);
    expect(win.history.state).toBe(historyState);
    expect(browserWindow.document.activeElement).toBe(focusedControl);
  });

  it('settles from measured scrolling even when the browser has no scrollend event', () => {
    // ARRANGE
    const { state, position, fire } = setup();
    const expected = { id: 1, target: 'outro', status: 'settled' };
    const expectedReading = 'after-arrival';
    state.navigateTo('outro');
    vi.advanceTimersByTime(0);
    // ACT
    position.scroll = 1800;
    fire('scroll');
    state.reportReading(expectedReading);
    // ASSERT
    expect(state.getNavigation()).toEqual(expected);
    expect(state.getSlide()).toBe(expectedReading);
  });

  it('attaches native links once, disposes them and safely reattaches the same page service', () => {
    // ARRANGE
    const { state, nativeLink, scrolls, fire } = setup();
    const expectedScrolls = ['intro', 'outro'];
    const expectedStatus = 'interrupted';
    // ACT
    state.attach();
    nativeLink('#intro');
    state.dispose();
    const disposed = nativeLink('#ignored');
    state.attach();
    nativeLink('#outro');
    fire('wheel');
    // ASSERT
    expect(disposed).toBe(false);
    expect(scrolls).toEqual(expectedScrolls);
    expect(state.getNavigation()?.status).toBe(expectedStatus);
  });

  it('routes native and in-content fragment links through the same authority and scroll policy', () => {
    // ARRANGE
    const { state, scrolls } = setup();
    const expected = { id: 1, target: 'intro--why', status: 'navigating' };
    const expectedScrolls = ['intro--why'];
    // ACT
    const handled = state.followLink({ href: '#intro--why', button: 0 });
    // ASSERT
    expect(handled).toBe(true);
    expect(state.getNavigation()).toEqual(expected);
    expect(scrolls).toEqual(expectedScrolls);
  });

  it.each([
    ['ordinary offset', 'outro', { scroll: 1904, top: 2000, offset: 96, maxScroll: 3000 }],
    ['document end', 'outro', { scroll: 1800, top: 2000, offset: 96, maxScroll: 1800 }],
    ['document start', 'intro', { scroll: 0, top: 50, offset: 96, maxScroll: 1800 }],
    ['offset taller than viewport', 'intro', { scroll: 600, top: 2000, offset: 1400, maxScroll: 1800 }],
    ['Title document-start policy', 'top', { scroll: 0, top: 300, offset: 96, maxScroll: 1800 }],
  ])('settles an already-achieved %s landing without waiting for scrollend', (_name, target, geometry) => {
    // ARRANGE
    const { state, position } = setup();
    Object.assign(position, geometry);
    const expected = { id: 1, target, status: 'settled' };
    const expectedDuring = { id: 1, target, status: 'navigating' };
    const seen: unknown[] = [];
    // ACT
    state.navigateTo(target);
    const during = state.getNavigation();
    state.subscribeNavigation((flight) => seen.push(flight));
    vi.advanceTimersByTime(0);
    // ASSERT
    expect(during).toEqual(expectedDuring);
    expect(seen).toEqual([expected]);
    expect(state.getNavigation()).toEqual(expected);
  });

  it('publishes readable explicit intent separately from reading reports, including the current target', () => {
    // ARRANGE
    const { state } = setup('#intro');
    const expected = { id: 1, target: 'intro', status: 'navigating' };
    const navigation: SlideNavigation[] = [];
    state.subscribeNavigation((flight) => navigation.push(flight));
    // ACT
    state.reportReading('intro');
    state.navigateTo('intro');
    // ASSERT
    expect(navigation).toEqual([expected]);
    expect(state.getNavigation()).toEqual(expected);
  });

  describe('reading the hash', () => {
    it('reads a deep-link hash on creation', () => {
      // ARRANGE
      const { state } = setup('#intro--why');
      // ACT
      const slide = state.getSlide();
      // ASSERT
      expect(slide).toBe('intro--why');
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
      const { state, fire, position } = setup();
      state.navigateTo('outro');
      position.scroll = 1800;
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
  });
});

describe('failure cases', () => {
  it('distinguishes browser scrolling keys from keys owned by controls', () => {
    // ARRANGE
    const { state, fire } = setup();
    const key = (key: string, prevented = false) => {
      const event = Object.assign(new Event('keydown', { cancelable: true }), { key });
      if (prevented) event.preventDefault();
      return event;
    };
    const expected = { id: 1, target: 'outro', status: 'interrupted' };
    const expectedInFlightStatus = 'navigating';
    // ACT
    state.navigateTo('outro');
    fire('keydown', key('PageDown', true));
    fire('keydown', key('x'));
    const stillFlying = state.getNavigation();
    fire('keydown', key('PageDown'));
    // ASSERT
    expect(stillFlying?.status).toBe(expectedInFlightStatus);
    expect(state.getNavigation()).toEqual(expected);
  });

  it.each([
    { metaKey: true },
    { ctrlKey: true },
    { altKey: true },
    { shiftKey: true },
    { button: 1 },
    { defaultPrevented: true },
    { download: true },
    { target: '_blank' },
    { href: 'https://other.test/episodes/demo?ref=mail#intro' },
    { href: '/episodes/other#intro' },
    { href: '?ref=other#intro' },
    { href: '#missing' },
    { href: '#%broken' },
    { href: '/episodes/demo?ref=mail' },
    { href: 'http://[' },
  ])('leaves non-owned link behaviour unchanged: %j', (attributes) => {
    // ARRANGE
    const { state, scrolls, writes } = setup();
    const before = [state.getSlide(), state.getNavigation(), [...scrolls], [...writes]];
    // ACT
    const handled = state.followLink({ href: '#intro', button: 0, ...attributes });
    // ASSERT
    expect(handled).toBe(false);
    expect([state.getSlide(), state.getNavigation(), scrolls, writes]).toEqual(before);
  });

  it.each(['wheel', 'touchstart', 'pointerdown'])(
    'releases intent on viewer %s interruption without reporting arrival',
    (event) => {
      // ARRANGE
      const { state, fire } = setup();
      const expected = { id: 1, target: 'outro', status: 'interrupted' };
      const expectedReading = 'intro';
      // ACT
      state.navigateTo('outro');
      fire(event);
      state.reportReading(expectedReading);
      vi.advanceTimersByTime(NAVIGATION_TIMEOUT_MS);
      // ASSERT
      expect(state.getNavigation()).toEqual(expected);
      expect(state.getSlide()).toBe(expectedReading);
    },
  );

  it('does not certify arrival from scrollend away from the achievable destination, and reports timeout distinctly', () => {
    // ARRANGE
    const { state, fire } = setup();
    const expected = { id: 1, target: 'outro', status: 'timed-out' };
    const expectedInFlightStatus = 'navigating';
    const expectedReading = 'intro';
    // ACT
    state.navigateTo('outro');
    fire('scrollend');
    const during = state.getNavigation();
    vi.advanceTimersByTime(NAVIGATION_TIMEOUT_MS);
    state.reportReading(expectedReading);
    // ASSERT
    expect(during?.status).toBe(expectedInFlightStatus);
    expect(state.getNavigation()).toEqual(expected);
    expect(state.getSlide()).toBe(expectedReading);
  });

  describe('reportReading', () => {
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
});

describe('edge cases', () => {
  it.each([false, true])(
    'keeps intent authoritative for late consumers while the throttled hash lags (settled: %s)',
    (settled) => {
      // ARRANGE
      const { state, unsubscribe, position, fire } = setup();
      const expected = 'outro';
      state.reportReading('intro');
      unsubscribe();
      // ACT
      state.navigateTo(expected);
      if (settled) {
        position.scroll = 1800;
        fire('scrollend');
      }
      state.subscribe(() => undefined);
      state.attach();
      // ASSERT
      expect(state.getSlide()).toBe(expected);
      expect(state.getNavigation()?.target).toBe(expected);
    },
  );

  it('keeps the single URL writer on the newer intent when an active-Slide consumer redirects', () => {
    // ARRANGE
    const { state, writes, scrolls } = setup();
    const expectedWrites = ['#outro', '#intro'];
    const expectedScrolls = ['intro'];
    state.subscribe(() => {
      if (state.getSlide() === 'outro') state.navigateTo('intro');
    });
    // ACT
    state.navigateTo('outro');
    vi.advanceTimersByTime(WRITE_INTERVAL_MS);
    // ASSERT
    expect(writes).toEqual(expectedWrites);
    expect(scrolls).toEqual(expectedScrolls);
  });

  it('does not deliver retired intent after a lifecycle consumer synchronously starts a newer flight', () => {
    // ARRANGE
    const { state } = setup();
    const seen: SlideNavigation[] = [];
    const expected = [
      { id: 1, target: 'outro', status: 'superseded' },
      { id: 2, target: 'intro', status: 'navigating' },
    ];
    state.subscribeNavigation((flight) => {
      if (flight.target === 'outro' && flight.status === 'navigating') state.navigateTo('intro');
    });
    state.subscribeNavigation((flight) => seen.push(flight));
    // ACT
    state.navigateTo('outro');
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('lets synchronous supersession own scrolling and active state without replaying the retired intent', () => {
    // ARRANGE
    const { state, scrolls } = setup();
    const expectedScrolls = ['intro'];
    const expected = { id: 2, target: 'intro', status: 'navigating' };
    state.subscribeNavigation((flight) => {
      if (flight.target === 'outro' && flight.status === 'navigating') state.navigateTo('intro');
    });
    // ACT
    state.navigateTo('outro');
    // ASSERT
    expect(state.getNavigation()).toEqual(expected);
    expect(state.getSlide()).toBe(expected.target);
    expect(scrolls).toEqual(expectedScrolls);
  });

  it('prevents retired page callbacks from interrupting a reattached page and releases all owned work', () => {
    // ARRANGE
    const { state, queued, listenerCount } = setup();
    const events = ['popstate', 'hashchange', 'scroll', 'scrollend', 'wheel', 'touchstart', 'pointerdown', 'keydown'];
    const expected = { id: 2, target: 'intro', status: 'navigating' };
    const notifications: unknown[] = [];
    state.attach();
    state.navigateTo('outro');
    const staleRestore = queued('popstate');
    const staleArrival = queued('scrollend');
    const unsubscribe = state.subscribeNavigation((flight) => notifications.push(flight));
    unsubscribe();
    const before = [...notifications];
    // ACT
    state.dispose();
    const released = events.map(listenerCount);
    const timers = vi.getTimerCount();
    state.attach();
    state.navigateTo('intro');
    staleRestore();
    staleArrival();
    // ASSERT
    expect(released).toEqual(events.map(() => 0));
    expect(timers).toBe(0);
    expect(notifications).toEqual(before);
    expect(state.getNavigation()).toEqual(expected);
  });

  it('reconciles initial fragments and history without inventing explicit intent or leaving a flight active', () => {
    // ARRANGE
    const { state, win, fire } = setup('#intro');
    const seen: unknown[] = [];
    const expectedSlide = 'restored';
    const expected = [
      { id: 1, target: 'outro', status: 'navigating' },
      { id: 1, target: 'outro', status: 'interrupted' },
    ];
    state.attach();
    state.subscribeNavigation((flight) => seen.push(flight));
    const initial = state.getNavigation();
    // ACT
    state.navigateTo('outro');
    win.location.hash = '#intro';
    fire('popstate');
    fire('hashchange');
    win.location.hash = `#${expectedSlide}`;
    fire('hashchange');
    vi.advanceTimersByTime(NAVIGATION_TIMEOUT_MS);
    // ASSERT
    expect(initial).toBe(null);
    expect(seen).toEqual(expected);
    expect(state.getSlide()).toBe(expectedSlide);
  });

  it('correlates repeated same-target intent and ignores a retired flight’s queued completion', () => {
    // ARRANGE
    const { state, queued, position } = setup();
    const expected = [
      { id: 1, target: 'outro', status: 'navigating' },
      { id: 1, target: 'outro', status: 'superseded' },
      { id: 2, target: 'outro', status: 'navigating' },
    ];
    const seen: unknown[] = [];
    state.subscribeNavigation((flight) => seen.push(flight));
    state.navigateTo('outro');
    const stale = queued('scrollend');
    // ACT
    state.navigateTo('outro');
    position.scroll = 1800;
    stale();
    // ASSERT
    expect(seen).toEqual(expected);
    expect(state.getNavigation()).toEqual(expected.at(-1));
  });

  describe('reading the hash', () => {
    it('reads an empty hash as the Title slide', () => {
      // ARRANGE
      const { state } = setup('');
      // ACT
      const slide = state.getSlide();
      // ASSERT
      expect(slide).toBe('top');
    });

    it('lands a #top deep link on the Title slide', () => {
      // ARRANGE
      const { state } = setup('#top');
      // ACT
      const slide = state.getSlide();
      // ASSERT
      expect(slide).toBe('top');
    });
  });

  describe('navigateTo', () => {
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
    it('never writes more than once per interval over a long fling', () => {
      // ARRANGE
      const { state, writes } = setup();
      const flingMs = 10_000;
      // ACT: a new Slide every 10 ms for 10 s
      for (let tick = 0; tick < 1000; tick++) {
        state.reportReading(`slide-${tick}`);
        vi.advanceTimersByTime(10);
      }
      vi.advanceTimersByTime(WRITE_INTERVAL_MS);
      // ASSERT
      expect(writes.length).toBeLessThanOrEqual(Math.ceil(flingMs / WRITE_INTERVAL_MS) + 1);
      expect(writes.at(-1)).toBe('#slide-999');
    });
  });

  describe('the Title slide', () => {
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
});
