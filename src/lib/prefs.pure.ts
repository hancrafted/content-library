import { isLocale, type Locale } from './locale.pure';

/** The one localStorage key every client-side preference lives under. */
export const PREFS_KEY = 'hancrafted:prefs';

export const THEMES = ['light', 'dark', 'system'] as const;

export type Theme = (typeof THEMES)[number];

export interface Prefs {
  theme?: Theme;
  locale?: Locale;
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** Reads a stored prefs value, keeping only fields that are valid; anything malformed yields `{}`. */
export function parsePrefs(raw: string | null): Prefs {
  const value = raw === null ? undefined : parseJson(raw);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const prefs: Prefs = {};
  if (isTheme(record.theme)) prefs.theme = record.theme;
  if (isLocale(record.locale)) prefs.locale = record.locale;
  return prefs;
}

/** The serialized prefs after applying `patch` over whatever `raw` holds. */
export function mergePrefs(raw: string | null, patch: Prefs): string {
  return JSON.stringify({ ...parsePrefs(raw), ...patch });
}
