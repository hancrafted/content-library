import type { UrlState } from '@/lib/url-state';
import { createContext, useContext, useSyncExternalStore } from 'react';

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
 * The active Slide id (FE-001 §4): `top` for the Title slide, which an empty
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
