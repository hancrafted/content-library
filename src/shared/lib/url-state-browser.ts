import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import { anchorOffset } from './anchor-geometry.pure';
import type { UrlLink, UrlNavigationBrowser, UrlWindow } from './url-state.types';

const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
const INTERRUPTION_EVENTS = ['wheel', 'touchstart', 'pointerdown'] as const;
const RESTORATION_EVENTS = ['popstate', 'hashchange'] as const;

/** A traversal's optional hashchange repeats its popstate destination within the same browser task. */
export function observeRestoration(win: UrlWindow, onRestore: () => void): () => void {
  let destination: string | null = null;
  let expiry: ReturnType<typeof setTimeout> | undefined;
  let live = true;
  const clear = () => {
    clearTimeout(expiry);
    destination = null;
  };
  const listener = (event: Event) => {
    if (!live) return;
    const isHash = event.type === 'hashchange' && 'newURL' in event;
    const paired = isHash && event.newURL === destination;
    clear();
    if (paired) return;
    if (event.type === 'popstate') {
      destination = win.location.href;
      expiry = setTimeout(clear, 0);
    }
    onRestore();
  };
  RESTORATION_EVENTS.forEach((type) => win.addEventListener(type, listener));
  return () => {
    live = false;
    clear();
    RESTORATION_EVENTS.forEach((type) => win.removeEventListener(type, listener));
  };
}

/** Event wiring only: the URL authority decides correlation and terminal outcomes. */
export function observeNavigation(win: UrlWindow, onPosition: () => void, onInterrupt: () => void): () => void {
  const onKey = (event: Event) => {
    if (!event.defaultPrevented && 'key' in event && SCROLL_KEYS.has(String(event.key))) onInterrupt();
  };
  win.addEventListener('scrollend', onPosition);
  win.addEventListener('scroll', onPosition, { passive: true });
  win.addEventListener('keydown', onKey);
  for (const event of INTERRUPTION_EVENTS) win.addEventListener(event, onInterrupt, { passive: true });
  return () => {
    win.removeEventListener('scrollend', onPosition);
    win.removeEventListener('scroll', onPosition);
    win.removeEventListener('keydown', onKey);
    for (const event of INTERRUPTION_EVENTS) win.removeEventListener(event, onInterrupt);
  };
}

function isOwnedClick(link: UrlLink): boolean {
  const excluded = [link.metaKey, link.ctrlKey, link.altKey, link.shiftKey, link.defaultPrevented, link.download];
  return link.button === 0 && !excluded.some(Boolean) && (!link.target || link.target === '_self');
}

/** Fragment candidate only; the authority verifies that the page has this stable target. */
export function linkTarget(location: UrlWindow['location'], link: UrlLink): string | null {
  if (!isOwnedClick(link) || !link.href.includes('#')) return null;
  try {
    const url = new URL(link.href, `${location.origin}${location.pathname}${location.search}`);
    const samePage = [
      url.origin === location.origin,
      url.pathname === location.pathname,
      url.search === location.search,
    ].every(Boolean);
    if (!samePage) return null;
    return url.hash ? decodeURIComponent(url.hash.slice(1)) : TITLE_ANCHOR;
  } catch {
    return null;
  }
}

function readPosition(win: Window, target: HTMLElement) {
  const root = win.document.documentElement;
  return {
    scroll: win.scrollY,
    top: target.getBoundingClientRect().top + win.scrollY,
    offset: anchorOffset({
      margin: win.getComputedStyle(target).scrollMarginTop,
      padding: win.getComputedStyle(root).scrollPaddingTop,
      viewport: win.innerHeight,
    }),
    maxScroll: Math.max(0, root.scrollHeight - win.innerHeight),
  };
}

function subscribeLinks(win: Window, listener: (link: UrlLink) => boolean): () => void {
  const onClick = (event: MouseEvent) => {
    const element = event.target as Element | null;
    const anchor = element?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;
    const handled = listener({
      href: anchor.href,
      button: event.button,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      defaultPrevented: event.defaultPrevented,
      download: anchor.hasAttribute('download'),
      target: anchor.target || win.document.querySelector('base')?.target,
    });
    if (handled) event.preventDefault();
  };
  // Capture owns fragment intent before a client router can perform its own scroll.
  win.document.addEventListener('click', onClick, true);
  return () => win.document.removeEventListener('click', onClick, true);
}

/** DOM operations for the URL authority; the container supplies its stable target attribute. */
export function createUrlNavigationBrowser(win: Window, targetAttribute: string): UrlNavigationBrowser {
  const targetOf = (id: string) => {
    const target = win.document.getElementById(id);
    return target?.hasAttribute(targetAttribute) ? target : null;
  };
  return {
    readPosition(id) {
      const target = targetOf(id);
      return target ? readPosition(win, target) : null;
    },
    scrollTo(id) {
      const target = targetOf(id);
      if (!target) return;
      const behavior = win.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
      if (id === TITLE_ANCHOR) win.scrollTo({ top: 0, behavior });
      else target.scrollIntoView({ behavior, block: 'start' });
    },
    subscribeLinks(listener) {
      return subscribeLinks(win, listener);
    },
  };
}
