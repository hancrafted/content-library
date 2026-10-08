import { readPrefs, writePrefs } from '@/lib/prefs-storage';
import type { Theme } from '@/lib/prefs.pure';
import { DARK_QUERY, resolveTheme } from '@/lib/theme.pure';
import { useCallback, useEffect, useState } from 'react';

/**
 * The chosen theme and a setter that persists it. `null` until mounted, since a
 * static page cannot know the stored choice at build time. While `system` is
 * chosen, OS theme changes apply live.
 */
export function useTheme(): [Theme | null, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme | null>(null);

  useEffect(() => {
    setThemeState(readPrefs().theme ?? 'system');
  }, []);

  useEffect(() => {
    if (theme === null) return;
    const media = window.matchMedia(DARK_QUERY);
    const apply = () => {
      document.documentElement.classList.toggle('dark', resolveTheme(theme, media.matches) === 'dark');
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    writePrefs({ theme: next });
    setThemeState(next);
  }, []);

  return [theme, setTheme];
}
