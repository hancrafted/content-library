export const LOCALES = ['en', 'de'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

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

export function localeFromPathname(pathname: string): Locale {
  return prefixOf(pathname) ?? DEFAULT_LOCALE;
}

export function stripLocale(pathname: string): string {
  const path = normalize(pathname);
  const prefix = prefixOf(path);
  return prefix === undefined ? path : normalize(path.slice(prefix.length + 1));
}

function prefixPath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

export function localizePath(logicalPath: string, locale: Locale, fragment?: string): string {
  const url = prefixPath(normalize(logicalPath), locale);
  return fragment ? `${url}#${fragment}` : url;
}

export function isSectionActive(pathname: string, section: string): boolean {
  const logical = stripLocale(pathname);
  const base = normalize(section);
  return logical === base || logical.startsWith(`${base}/`);
}

export function isAnySectionActive(pathname: string, sections: readonly string[]): boolean {
  return sections.some((section) => isSectionActive(pathname, section));
}

export type LocalesByRoute = Readonly<Record<string, readonly Locale[]>>;

export function localesAt(pathname: string, localesByRoute: LocalesByRoute): readonly Locale[] {
  const route = stripLocale(pathname);
  return Object.hasOwn(localesByRoute, route) ? localesByRoute[route] : LOCALES;
}
