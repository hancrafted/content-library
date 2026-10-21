import type { Metadata } from 'next';
import { TRANSLATIONS } from '../i18n/translations';
import type { EpisodeStatus, IsoDate } from './episode-metadata.pure';
import { DEFAULT_LOCALE, localizePath, type Locale } from './locale.pure';
import { pageLocales, routeOf, type PageRef } from './routes';

/** Used when the deploy sets no `SITE_URL`: local and pull-request builds. */
const LOCAL_ORIGIN = 'http://localhost:3000';

/**
 * The absolute URL the site is served from — origin plus base path, no trailing
 * slash. The Cloudflare Pages deploy sets `SITE_URL` to https://hancrafted.net;
 * unset, local and pull-request builds fall back to localhost (FE-008).
 */
export function resolveSiteUrl(env: Readonly<Record<string, string | undefined>>): string {
  const configured = env.SITE_URL?.replace(/\/+$/, '');
  if (!configured) return `${LOCAL_ORIGIN}${env.NEXT_PUBLIC_BASE_PATH ?? ''}`;
  if (!URL.canParse(configured)) throw new Error(`SITE_URL must be an absolute URL, got "${configured}"`);
  return configured;
}

/** A root layout's metadata: the absolute base and the site-name title frame. Nothing page-specific. */
export function siteMetadata(locale: Locale, siteUrl: string): Metadata {
  const name = TRANSLATIONS[locale].brand.name;
  return {
    metadataBase: new URL(`${siteUrl}/`),
    title: { default: name, template: `%s · ${name}` },
  };
}

/** A page's `<title>` and meta description in one locale (FE-008 §2). */
export interface PageCopy {
  readonly title: string;
  readonly description: string;
  /** An Episode page's status: an upcoming one is `noindex`. Left off for the landing page. */
  readonly status?: EpisodeStatus;
  /** An Episode's release date, the article's `publishedTime`. */
  readonly publishedOn?: IsoDate;
}

/** The site-wide fallback card image: a static file in `public/`, 1200x630 (FE-008 §6). */
export const OG_IMAGE = { url: '/og-image.png', width: 1200, height: 630 } as const;

const OG_LOCALES: Record<Locale, string> = { en: 'en_US', de: 'de_DE' };

/** Whether a page is kept out of search: the dashboard, and an Episode still upcoming. Metadata and sitemap both ask. */
export function isNoindex(page: PageRef, status?: EpisodeStatus): boolean {
  return page === 'dashboard' || status === 'upcoming';
}

/** Open Graph and Twitter cards: the page's own title and description, the fallback image, its locale and the others. */
function socialCards(
  page: PageRef,
  locale: Locale,
  text: { title: string; description: string; publishedOn?: IsoDate },
): Pick<Metadata, 'openGraph' | 'twitter'> {
  const { publishedOn, ...words } = text;
  const siteName = TRANSLATIONS[locale].brand.name;
  const alternateLocale = pageLocales(page)
    .filter((each) => each !== locale)
    .map((each) => OG_LOCALES[each]);
  return {
    openGraph: {
      type: typeof page === 'string' ? 'website' : 'article',
      ...words,
      url: localizePath(routeOf(page), locale),
      siteName,
      locale: OG_LOCALES[locale],
      ...(alternateLocale.length > 0 ? { alternateLocale } : {}),
      images: [{ ...OG_IMAGE, alt: siteName }],
      ...(publishedOn ? { publishedTime: publishedOn } : {}),
    },
    twitter: { card: 'summary_large_image', ...words, images: [OG_IMAGE.url] },
  };
}

/**
 * A page's metadata: its copy, its canonical, and reciprocal hreflang
 * alternates. The landing page's copy is `meta.home` of the site-wide
 * Translation file; an Episode's comes from its record, which this tier cannot
 * reach, so the route hands it in, with its status: an upcoming Episode's page
 * is `noindex`, so the publish flip removes it from search.
 */
export function pageMetadata(page: 'home' | 'episodes', locale: Locale): Metadata;
export function pageMetadata(page: 'dashboard', locale: 'en'): Metadata;
export function pageMetadata(page: Exclude<PageRef, string>, locale: Locale, copy: PageCopy): Metadata;
export function pageMetadata(page: PageRef, locale: Locale, copy?: PageCopy): Metadata {
  const route = routeOf(page);
  const languages = Object.fromEntries(pageLocales(page).map((each) => [each, localizePath(route, each)]));
  const { title, description } =
    copy ??
    (page === 'dashboard'
      ? TRANSLATIONS[locale].meta.dashboard
      : page === 'episodes'
        ? TRANSLATIONS[locale].meta.episodes
        : TRANSLATIONS[locale].meta.home);
  return {
    title,
    description,
    ...socialCards(page, locale, { title, description, publishedOn: copy?.publishedOn }),
    alternates: {
      canonical: localizePath(route, locale),
      languages: { ...languages, 'x-default': localizePath(route, DEFAULT_LOCALE) },
    },
    ...(isNoindex(page, copy?.status) ? { robots: { index: false } } : {}),
  };
}
