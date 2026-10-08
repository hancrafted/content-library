/*
 * The URL-state service (FE-001): the only module that writes browser history,
 * and the one place the active Slide lives. A click is intent (`navigateTo`),
 * the Slide observer is a report (`reportReading`); the two are separate calls
 * so the rule "ignore reports while a click's scroll is in flight" is explicit.
 * No React: the hook lives in `src/hooks/use-url-state.ts`.
 */

/** At most one history write per interval: ~67 per 10 s, under WebKit's 100 (research §2). */
export const WRITE_INTERVAL_MS = 150;

/**
 * How long reports stay suppressed when no `scrollend` arrives. A click on a
 * Slide already in view scrolls nothing and fires no `scrollend`; Safari before
 * 26.2 has no `scrollend` at all. Chrome's smooth scroll tops out near 750 ms
 * however far it travels, so 1000 ms covers it with margin yet frees a stuck
 * reader within a second.
 */
export const NAVIGATION_TIMEOUT_MS = 1000;

/** The slice of `Window` the service touches, so tests hand it a fake. */
export interface UrlWindow {
  readonly location: { readonly hash: string };
  readonly history: { readonly state: unknown; replaceState(state: unknown, unused: string, url: string): void };
  addEventListener(type: 'popstate' | 'scrollend', listener: () => void): void;
  removeEventListener(type: 'popstate' | 'scrollend', listener: () => void): void;
}

export interface UrlState {
  /** The active Slide id from the hash; `null` when there is none. */
  getSlide(): string | null;
  /** Calls `listener` whenever the active Slide changes; returns the unsubscribe. */
  subscribe(listener: () => void): () => void;
  /** Intent: the reader chose this Slide. Notifies now, suppresses reports until the scroll ends. */
  navigateTo(id: string): void;
  /** Report: the reading line crossed this Slide. Ignored while a navigation is in flight. */
  reportReading(id: string): void;
}

function hashOf(win: UrlWindow): string | null {
  const raw = win.location.hash.slice(1);
  if (raw === '') return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

class UrlStateStore implements UrlState {
  private current: string | null;
  private readonly listeners = new Set<() => void>();
  private flight: ReturnType<typeof setTimeout> | null = null;
  private pending: string | null = null;
  private trailing: ReturnType<typeof setTimeout> | null = null;
  private lastWrite = -Infinity;

  constructor(private readonly win: UrlWindow) {
    this.current = hashOf(win);
  }

  getSlide = () => this.current;

  subscribe = (listener: () => void) => {
    if (this.listeners.size === 0) this.win.addEventListener('popstate', this.onPopState);
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.win.removeEventListener('popstate', this.onPopState);
    };
  };

  navigateTo = (id: string) => {
    this.endFlight();
    this.flight = setTimeout(this.endFlight, NAVIGATION_TIMEOUT_MS);
    this.win.addEventListener('scrollend', this.endFlight);
    this.set(id);
  };

  reportReading = (id: string) => {
    if (this.flight === null) this.set(id);
  };

  private set(id: string) {
    if (id === this.current) return;
    this.current = id;
    this.listeners.forEach((listener) => listener());
    this.schedule(id);
  }

  private onPopState = () => {
    this.endFlight();
    this.cancelWrite();
    const hash = hashOf(this.win);
    if (hash === this.current) return;
    this.current = hash;
    this.listeners.forEach((listener) => listener());
  };

  private endFlight = () => {
    if (this.flight !== null) clearTimeout(this.flight);
    this.flight = null;
    this.win.removeEventListener('scrollend', this.endFlight);
  };

  /** Writes now when the interval allows, else keeps only the latest value for a trailing flush. */
  private schedule(id: string) {
    this.pending = id;
    if (this.trailing !== null) return;
    const wait = this.lastWrite + WRITE_INTERVAL_MS - Date.now();
    if (wait <= 0) this.flush();
    else this.trailing = setTimeout(this.flush, wait);
  }

  private flush = () => {
    this.trailing = null;
    if (this.pending === null) return;
    const id = this.pending;
    this.pending = null;
    this.lastWrite = Date.now();
    try {
      this.win.history.replaceState(this.win.history.state, '', `#${encodeURIComponent(id)}`);
    } catch {
      // WebKit throws SecurityError past its history-write limit; subscribers stay correct while the URL lags.
    }
  };

  private cancelWrite() {
    if (this.trailing !== null) clearTimeout(this.trailing);
    this.trailing = null;
    this.pending = null;
  }
}

export function createUrlState(win: UrlWindow): UrlState {
  return new UrlStateStore(win);
}

let client: UrlState | undefined;
const onClient = (): UrlState => (client ??= createUrlState(window));

/** The client singleton. Built on first use, so importing it during prerender never touches `window`. */
export const urlState: UrlState = {
  getSlide: () => onClient().getSlide(),
  subscribe: (listener) => onClient().subscribe(listener),
  navigateTo: (id) => onClient().navigateTo(id),
  reportReading: (id) => onClient().reportReading(id),
};
