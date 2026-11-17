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

const themeDuringHydration = (): ResolvedTheme => 'light';

export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(subscribe, readTheme, themeDuringHydration);
}
