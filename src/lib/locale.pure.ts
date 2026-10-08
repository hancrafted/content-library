export const LOCALES = ['en', 'de'] as const;

export type Locale = (typeof LOCALES)[number];

/** The default locale is served unprefixed: the bare path is its canonical URL. */
export const DEFAULT_LOCALE: Locale = 'en';

/** Locales that live under a `/<locale>` path segment. */
export const PREFIXED_LOCALES: readonly Locale[] = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

function normalize(pathname: string): string {
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const trimmed = withLeadingSlash.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

function prefixOf(pathname: string): Locale | undefined {
  const [, first] = normalize(pathname).split('/');
  return PREFIXED_LOCALES.find((locale) => locale === first);
}

/** The locale a pathname belongs to: a prefixed locale's segment, else the default locale. */
export function localeFromPathname(pathname: string): Locale {
  return prefixOf(pathname) ?? DEFAULT_LOCALE;
}

/** The locale-neutral logical path: `/de/episode/x` → `/episode/x`, `/de` → `/`. */
export function stripLocale(pathname: string): string {
  const path = normalize(pathname);
  const prefix = prefixOf(path);
  return prefix === undefined ? path : normalize(path.slice(prefix.length + 1));
}

/** The URL of a logical path in a locale: unprefixed for the default locale. */
export function localizePath(logicalPath: string, locale: Locale): string {
  const path = normalize(logicalPath);
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}
