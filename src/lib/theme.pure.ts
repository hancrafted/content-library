import { PREFS_KEY, type Theme } from './prefs.pure';

export const DARK_QUERY = '(prefers-color-scheme: dark)';

export type ResolvedTheme = 'light' | 'dark';

/** The theme actually shown: `system` defers to the OS preference. */
export function resolveTheme(theme: Theme, systemPrefersDark: boolean): ResolvedTheme {
  if (theme === 'system') return systemPrefersDark ? 'dark' : 'light';
  return theme;
}

/**
 * An inline script that applies the stored theme before first paint, so a
 * statically exported page never flashes the wrong theme. Reads `PREFS_KEY` only.
 */
export function buildThemeInitScript(): string {
  return [
    '(function(){try{',
    `var p=JSON.parse(localStorage.getItem(${JSON.stringify(PREFS_KEY)})||'{}');`,
    'var t=p&&p.theme;',
    `var d=t==='dark'||(t!=='light'&&window.matchMedia(${JSON.stringify(DARK_QUERY)}).matches);`,
    "document.documentElement.classList.toggle('dark',d);",
    '}catch(e){}})();',
  ].join('');
}
