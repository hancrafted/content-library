import { urlState } from '@/lib/url-state';
import { useSyncExternalStore } from 'react';

const NO_SLIDE = () => null;

/**
 * The active Slide id (FE-001 §4), or `null` when the URL names none. The one
 * way a component reads it. The server snapshot is `null`, because prerendered
 * HTML cannot know the hash; the client snapshot is read from the hash itself,
 * so a deep link is correct at hydration, before any observer has run.
 */
export function useActiveSlide(): string | null {
  return useSyncExternalStore(urlState.subscribe, urlState.getSlide, NO_SLIDE);
}
