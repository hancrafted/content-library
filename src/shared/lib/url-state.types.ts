/** Browser inputs to the page's single URL authority. */
export interface UrlWindow {
  readonly location: {
    readonly hash: string;
    readonly pathname: string;
    readonly search: string;
    readonly origin: string;
  };
  readonly history: { readonly state: unknown; replaceState(state: unknown, unused: string, url: string): void };
  addEventListener(type: UrlEvent, listener: (event: Event) => void, options?: AddEventListenerOptions): void;
  removeEventListener(type: UrlEvent, listener: (event: Event) => void): void;
}

export type UrlEvent =
  'popstate' | 'hashchange' | 'scroll' | 'scrollend' | 'wheel' | 'touchstart' | 'pointerdown' | 'keydown';

export interface UrlState {
  /** Attaches page-owned browser actions; safe after disposal for React effect reattachment. */
  attach(): void;
  /** Active Slide; an empty hash is the Title slide (`top`). */
  getSlide(): string | null;
  /** Active-Slide changes only. Returns unsubscribe. */
  subscribe(listener: () => void): () => void;
  /** Current or most recently terminated explicit flight; null before any intent or after disposal. */
  getNavigation(): SlideNavigation | null;
  /** Synchronous lifecycle events, including repeated intent. Read current navigation when joining late. */
  subscribeNavigation(listener: (navigation: SlideNavigation) => void): () => void;
  /** Explicit intent: publish immediately, scroll and suppress intermediate reading reports. */
  navigateTo(id: string): void;
  /** True only for an owned same-page Slide link; callers cancel only that click. */
  followLink(link: UrlLink): boolean;
  /** Reading-line report; ignored during explicit navigation. */
  reportReading(id: string): void;
  /** Releases listeners, subscriptions and scheduled work; attach/subscribe can reactivate the instance. */
  dispose(): void;
}

/** Correlation is page-instance-local and monotonic, including repeated targets and effect reattachment. */
export interface SlideNavigation {
  readonly id: number;
  readonly target: string;
  readonly status: 'navigating' | 'settled' | 'interrupted' | 'timed-out' | 'superseded';
}

/** Handwritten browser/time adapters exercise the existing authority's public seam. */
export interface UrlNavigationBrowser {
  readPosition(id: string): { scroll: number; top: number; offset: number; maxScroll: number } | null;
  scrollTo(id: string): void;
  subscribeLinks?(listener: (link: UrlLink) => boolean): () => void;
}

export interface UrlLink {
  readonly href: string;
  readonly button: number;
  readonly metaKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly altKey?: boolean;
  readonly shiftKey?: boolean;
  readonly defaultPrevented?: boolean;
  readonly download?: boolean;
  readonly target?: string;
}
