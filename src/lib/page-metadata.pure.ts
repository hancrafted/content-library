import type { Metadata } from 'next';
import { CATALOGS } from '../i18n/catalogs';
import { DEFAULT_LOCALE, LOCALES, localizePath, type Locale } from './locale.pure';
import { routeOf, type PageRef } from './routes';

/** Used when the deploy sets no `SITE_URL`: local and pull-request builds. */
const LOCAL_ORIGIN = 'http://localhost:3000';

/**
 * The absolute URL the site is served from — origin plus base path, no trailing
 * slash. The Pages deploy sets `SITE_URL` from `actions/configure-pages`'
 * `base_url`, which follows a custom domain without a code change (FE-008).
 */
export function resolveSiteUrl(env: Readonly<Record<string, string | undefined>>): string {
  const configured = env.SITE_URL?.replace(/\/+$/, '');
  if (!configured) return `${LOCAL_ORIGIN}${env.NEXT_PUBLIC_BASE_PATH ?? ''}`;
  if (!URL.canParse(configured)) throw new Error(`SITE_URL must be an absolute URL, got "${configured}"`);
  return configured;
}

/** A root layout's metadata: the absolute base and the site-name title frame. Nothing page-specific. */
export function siteMetadata(locale: Locale, siteUrl: string): Metadata {
  const name = CATALOGS[locale].brand.name;
  return {
    metadataBase: new URL(`${siteUrl}/`),
    title: { default: name, template: `%s · ${name}` },
  };
}

/** A page's `<title>` and meta description, from the locale's catalog (FE-008 §2). */
function copyOf(page: PageRef, locale: Locale): { title: string; description: string } {
  const catalog = CATALOGS[locale];
  if (page === 'home') return catalog.meta.home;
  const { title, description } = catalog.episodes[page.episode];
  return { title, description };
}

/** A page's metadata: its copy from the catalog, its canonical, and reciprocal hreflang alternates. */
export function pageMetadata(page: PageRef, locale: Locale): Metadata {
  const route = routeOf(page);
  const languages = Object.fromEntries(LOCALES.map((each) => [each, localizePath(route, each)]));
  return {
    ...copyOf(page, locale),
    alternates: {
      canonical: localizePath(route, locale),
      languages: { ...languages, 'x-default': localizePath(route, DEFAULT_LOCALE) },
    },
  };
}
