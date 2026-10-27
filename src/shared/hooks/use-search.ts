import { useSyncExternalStore } from 'react';

const NO_UNSUBSCRIBE = () => undefined;
const never = () => NO_UNSUBSCRIBE;

/**
 * The page's query string, read on the client only: empty in the prerendered HTML and at hydration, then the real
 * one, so the static page and the first client render agree (no hydration mismatch).
 */
export function useSearch(): string {
  return useSyncExternalStore(
    never,
    () => window.location.search,
    () => '',
  );
}
