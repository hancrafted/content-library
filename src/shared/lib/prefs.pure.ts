import { isLocale, type Locale } from './locale.pure';

/** The one localStorage key every client-side preference lives under. */
export const PREFS_KEY = 'hancrafted:prefs';

export const THEMES = ['light', 'dark', 'system'] as const;

export type Theme = (typeof THEMES)[number];

/** How the Context drawer sits from `md`: beside the Slides (they make room) or over them. */
export const DRAWER_MODES = ['beside', 'over'] as const;

export type DrawerMode = (typeof DRAWER_MODES)[number];

export const DEFAULT_DRAWER_MODE: DrawerMode = 'beside';

export interface Prefs {
  theme?: Theme;
  locale?: Locale;
  drawerMode?: DrawerMode;
}

export function isDrawerMode(value: unknown): value is DrawerMode {
  return typeof value === 'string' && (DRAWER_MODES as readonly string[]).includes(value);
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

const FIELD_GUARDS: { [K in keyof Prefs]-?: (value: unknown) => value is NonNullable<Prefs[K]> } = {
  theme: isTheme,
  locale: isLocale,
  drawerMode: isDrawerMode,
};

/** Reads a stored prefs value, keeping only fields that are valid; anything malformed yields `{}`. */
export function parsePrefs(raw: string | null): Prefs {
  const value = raw === null ? undefined : parseJson(raw);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const prefs: Record<string, unknown> = {};
  for (const [field, isValid] of Object.entries(FIELD_GUARDS)) {
    if (isValid(record[field])) prefs[field] = record[field];
  }
  return prefs as Prefs;
}

/** The serialized prefs after applying `patch` over whatever `raw` holds. */
export function mergePrefs(raw: string | null, patch: Prefs): string {
  return JSON.stringify({ ...parsePrefs(raw), ...patch });
}
