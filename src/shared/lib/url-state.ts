import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import { anchorLanding } from './anchor-geometry.pure';
import { linkTarget, observeNavigation, observeRestoration } from './url-state-browser';
import type { SlideNavigation, UrlLink, UrlNavigationBrowser, UrlState, UrlWindow } from './url-state.types';
export type { SlideNavigation, UrlLink, UrlNavigationBrowser, UrlState, UrlWindow } from './url-state.types';

/** At most one history write per interval: ~67 per 10 s, under WebKit's 100 (research §2). */
export const WRITE_INTERVAL_MS = 150;

/** Bounds intent suppression; expiry needs measured arrival evidence or reports timeout. */
export const NAVIGATION_TIMEOUT_MS = 1000;

function hashOf(win: UrlWindow): string {
  const raw = win.location.hash.slice(1);
  if (raw === '') return TITLE_ANCHOR;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

class UrlStateStore implements UrlState {
  private current: string;
  private readonly listeners = new Set<() => void>();
  private readonly navigationListeners = new Set<(navigation: SlideNavigation) => void>();
  private navigation: SlideNavigation | null = null;
  private sequence = 0;
  private detachFlight: (() => void) | null = null;
  private arrivalCheck: ReturnType<typeof setTimeout> | null = null;
  private flight: ReturnType<typeof setTimeout> | null = null;
  private pending: string | null = null;
  private trailing: ReturnType<typeof setTimeout> | null = null;
  private lastWrite = -Infinity;
  private detachLinks: (() => void) | null = null;
  private attached = false;
  private detachRestoration: (() => void) | null = null;
  /** The path this page lives at, taken on first subscription: a router writes the URL after the first render. */
  private ownPath: string | null = null;

  constructor(
    private readonly win: UrlWindow,
    private readonly browser?: UrlNavigationBrowser,
  ) {
    this.current = hashOf(win);
  }

  getSlide = () => this.current;

  attach = () => {
    if (this.attached) return;
    this.attached = true;
    this.watchRestoration();
    const owner = this.detachRestoration;
    this.detachLinks =
      this.browser?.subscribeLinks?.(
        (link) => this.attached && owner === this.detachRestoration && this.followLink(link),
      ) ?? null;
    if (this.flight === null) this.resync();
  };

  getNavigation = () => this.navigation;

  subscribeNavigation = (listener: (navigation: SlideNavigation) => void) => {
    this.watchRestoration();
    this.navigationListeners.add(listener);
    return () => {
      this.navigationListeners.delete(listener);
      this.unwatchIfUnused();
    };
  };

  subscribe = (listener: () => void) => {
    const first = this.listeners.size === 0;
    if (first) {
      this.watchRestoration();
    }
    this.listeners.add(listener);
    // The URL may have moved since creation: a router writes it after the new page first renders.
    if (first && this.flight === null) this.resync();
    return () => {
      this.listeners.delete(listener);
      this.unwatchIfUnused();
    };
  };

  navigateTo = (id: string) => {
    const request = ++this.sequence;
    if (this.navigation) this.finishNavigation(this.navigation.id, 'superseded');
    if (this.sequence !== request) return;
    const navigation = { id: request, target: id, status: 'navigating' } as const;
    this.flight = setTimeout(() => {
      this.finishNavigation(navigation.id, this.hasArrived(id) ? 'settled' : 'timed-out');
    }, NAVIGATION_TIMEOUT_MS);
    const checkArrival = () => {
      if (this.hasArrived(id)) this.finishNavigation(navigation.id, 'settled');
    };
    this.detachFlight = observeNavigation(this.win, checkArrival, () =>
      this.finishNavigation(navigation.id, 'interrupted'),
    );
    this.publishNavigation(navigation);
    if (this.navigation !== navigation) return;
    this.set(id);
    if (this.navigation !== navigation) return;
    this.browser?.scrollTo(id);
    this.arrivalCheck = setTimeout(checkArrival, 0);
  };

  followLink = (link: UrlLink): boolean => {
    const id = linkTarget(this.win.location, link);
    if (id === null || !this.browser?.readPosition(id)) return false;
    this.navigateTo(id);
    return true;
  };

  reportReading = (id: string) => {
    if (this.flight === null) this.set(id);
  };

  dispose = () => {
    this.endFlight();
    this.cancelWrite();
    this.listeners.clear();
    this.navigationListeners.clear();
    this.navigation = null;
    this.detachLinks?.();
    this.detachLinks = null;
    this.attached = false;
    this.unwatchRestoration();
  };

  private watchRestoration() {
    if (this.detachRestoration) return;
    this.ownPath ??= this.win.location.pathname;
    const detach = observeRestoration(this.win, () => {
      if (this.detachRestoration === detach) this.onPopState();
    });
    this.detachRestoration = detach;
  }

  private unwatchRestoration() {
    this.detachRestoration?.();
    this.detachRestoration = null;
  }

  private unwatchIfUnused() {
    if (!this.attached && this.listeners.size === 0 && this.navigationListeners.size === 0) this.unwatchRestoration();
  }

  private publishNavigation(navigation: SlideNavigation) {
    this.navigation = navigation;
    this.navigationListeners.forEach((listener) => {
      if (this.navigation === navigation) listener(navigation);
    });
  }

  private set(id: string) {
    if (id === this.current) return;
    this.current = id;
    this.schedule(id);
    this.listeners.forEach((listener) => listener());
  }

  private onPopState = () => {
    const request = this.sequence;
    if (this.navigation) this.finishNavigation(this.navigation.id, 'interrupted');
    if (this.sequence !== request) return;
    this.cancelWrite();
    this.resync();
  };

  /** Fragment-history restoration can leave an old page mounted on another path. */
  private isForeign(): boolean {
    return this.ownPath !== null && this.win.location.pathname !== this.ownPath;
  }

  /** Adopts the hash the URL carries now, notifying only when it differs. */
  private resync() {
    if (this.isForeign() || this.pending !== null) return;
    const hash = hashOf(this.win);
    if (hash === this.current) return;
    this.current = hash;
    this.listeners.forEach((listener) => listener());
  }

  private endFlight = () => {
    if (this.flight !== null) clearTimeout(this.flight);
    if (this.arrivalCheck !== null) clearTimeout(this.arrivalCheck);
    this.arrivalCheck = null;
    this.flight = null;
    this.detachFlight?.();
    this.detachFlight = null;
  };

  private hasArrived(target: string): boolean {
    const position = this.browser?.readPosition(target);
    if (!position) return false;
    const landing =
      target === TITLE_ANCHOR
        ? 0
        : anchorLanding({ top: position.top, offset: position.offset, maximum: position.maxScroll });
    return Math.abs(position.scroll - landing) <= 1;
  }

  private finishNavigation(id: number, status: SlideNavigation['status']) {
    if (this.navigation?.id !== id || this.navigation.status !== 'navigating') return;
    this.endFlight();
    this.publishNavigation({ ...this.navigation, status });
  }

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
    if (this.isForeign()) return;
    this.lastWrite = Date.now();
    try {
      this.win.history.replaceState(this.win.history.state, '', this.urlOf(id));
    } catch {
      // WebKit throws SecurityError past its history-write limit; subscribers stay correct while the URL lags.
    }
  };

  /** The Title slide is the bare path: no `#`, query kept. */
  private urlOf(id: string): string {
    if (id === TITLE_ANCHOR) return `${this.win.location.pathname}${this.win.location.search}`;
    return `#${encodeURIComponent(id)}`;
  }

  private cancelWrite() {
    if (this.trailing !== null) clearTimeout(this.trailing);
    this.trailing = null;
    this.pending = null;
  }
}

export function createUrlState(win: UrlWindow, browser?: UrlNavigationBrowser): UrlState {
  return new UrlStateStore(win, browser);
}
