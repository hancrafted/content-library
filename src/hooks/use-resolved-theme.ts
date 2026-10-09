import { useSyncExternalStore } from 'react';

type ResolvedTheme = 'light' | 'dark';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function readTheme(): ResolvedTheme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

// The static HTML is rendered without a theme; hydration must see the same value before switching.
const serverTheme = (): ResolvedTheme => 'light';

/**
 * Returns the currently active DOM theme ('light' | 'dark') by observing
 * the 'dark' class on document.documentElement.
 */
export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(subscribe, readTheme, serverTheme);
}
