import { useSyncExternalStore } from 'react';

/** Whether the media query matches now and as it changes; `false` on the server, where nothing is measured. */
/** Whether the media query matches now and as it changes; `false` on the server, where nothing is measured. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
