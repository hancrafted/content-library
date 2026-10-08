import type { Metadata } from 'next';
import { DEFAULT_LOCALE, LOCALES, localizePath, type Locale } from './locale.pure';
import { MESSAGES } from './messages';
import { ROUTES, type PageKey } from './routes';

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
  const name = MESSAGES[locale].brand.name;
  return {
    metadataBase: new URL(`${siteUrl}/`),
    title: { default: name, template: `%s · ${name}` },
  };
}

/** A page's metadata: its copy from the messages, its canonical, and reciprocal hreflang alternates. */
export function pageMetadata(page: PageKey, locale: Locale): Metadata {
  const route = ROUTES[page];
  const { title, description } = MESSAGES[locale].meta[page];
  const languages = Object.fromEntries(LOCALES.map((each) => [each, localizePath(route, each)]));
  return {
    title,
    description,
    alternates: {
      canonical: localizePath(route, locale),
      languages: { ...languages, 'x-default': localizePath(route, DEFAULT_LOCALE) },
    },
  };
}
