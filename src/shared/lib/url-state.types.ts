export interface UrlWindow {
  readonly location: {
    readonly href: string;
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
  | 'popstate'
  | 'hashchange'
  | 'scroll'
  | 'scrollend'
  | 'wheel'
  | 'touchstart'
  | 'pointerdown'
  | 'keydown';

export interface UrlState {
  attach(): void;
  getSlide(): string | null;
  subscribe(listener: () => void): () => void;
  getNavigation(): SlideNavigation | null;
  subscribeNavigation(listener: (navigation: SlideNavigation) => void): () => void;
  navigateTo(id: string): void;
  followLink(link: UrlLink): boolean;
  reportReading(id: string): void;
  dispose(): void;
}

export interface SlideNavigation {
  readonly id: number;
  readonly target: string;
  readonly status: 'navigating' | 'settled' | 'interrupted' | 'timed-out' | 'superseded';
}

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
