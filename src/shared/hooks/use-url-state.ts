import type { UrlState } from '@/shared/lib/url-state';
import { createContext, useContext, useSyncExternalStore, type MouseEvent } from 'react';

/** The page's URL-state service, provided once per Episode page by `UrlStateProvider` (FE-001 §2). */
export const UrlStateContext = createContext<UrlState | null>(null);

/** The page's service, or `null` outside an Episode page and during prerender. For `navigateTo`/`reportReading` callers. */
export function useUrlState(): UrlState | null {
  return useContext(UrlStateContext);
}

const NO_SLIDE = () => null;
const NO_UNSUBSCRIBE = () => undefined;
const NEVER_NOTIFIES = () => NO_UNSUBSCRIBE;

/**
 * The active Slide id (FE-001 §2): `top` for the Title slide, which an empty
 * hash also reads as. The one way a component reads it. `null` only means
 * "not known yet": the server snapshot, because prerendered HTML cannot know
 * the hash, and any render outside an Episode page. The client snapshot is
 * read from the hash itself, so a deep link is correct at hydration.
 */
export function useActiveSlide(): string | null {
  const service = useUrlState();
  return useSyncExternalStore(
    service ? service.subscribe : NEVER_NOTIFIES,
    service ? service.getSlide : NO_SLIDE,
    NO_SLIDE,
  );
}

/**
 * A click handler factory: tells the page's URL-state service the reader chose
 * this Slide, then glides to it. Every consumer shows it at once and the
 * observer stays quiet until the glide ends. The service replaces the URL, so
 * Back leaves the page instead of replaying every jump. Only a click glides: a
 * reload or a shared link lands on its fragment at once, without scrolling
 * through what precedes it. A modified click is left to the browser.
 */
export function useGlideTo(): (event: MouseEvent<HTMLAnchorElement>, id: string) => void {
  const url = useUrlState();
  return (event) => {
    const anchor = event.currentTarget;
    const handled = url?.followLink({
      href: anchor.href,
      button: event.button,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      defaultPrevented: event.defaultPrevented,
      download: anchor.hasAttribute('download'),
      target: anchor.target || document.querySelector('base')?.target,
    });
    if (handled) event.preventDefault();
  };
}
