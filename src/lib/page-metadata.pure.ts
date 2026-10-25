import type { Metadata } from 'next';
import { TRANSLATIONS } from '../i18n/translations';
import type { IsoDate } from './episode-metadata.pure';
import { DEFAULT_LOCALE, localizePath, type Locale } from './locale.pure';
import { episodeRoute, isEpisodePage, pageLocales, routeOf, type PageRef } from './routes';
import { pageTreatment, type PageFacts, type PageTreatment } from './visibility.pure';

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
  /** What the page presents, for its treatment (`pageTreatment`); left off for a page that presents no record. */
  readonly facts?: PageFacts;
  /** An Episode's release date, the article's `publishedTime`. */
  readonly publishedOn?: IsoDate;
}

/** The site-wide fallback card image: a static file in `public/`, 1200x630 (FE-008 §6). */
export const OG_IMAGE = { url: '/og-image.png', width: 1200, height: 630 } as const;

const OG_LOCALES: Record<Locale, string> = { en: 'en_US', de: 'de_DE' };

/** The logical path a page's canonical names: its own, or the public Episode's it credits. */
function canonicalRoute(page: PageRef, treatment: PageTreatment): string {
  return treatment.canonical === 'self' ? routeOf(page) : episodeRoute(treatment.canonical.episode);
}

/** Open Graph and Twitter cards: the page's own title and description, the fallback image, its locale and the others. */
function socialCards(
  page: PageRef,
  locale: Locale,
  text: { title: string; description: string; publishedOn?: IsoDate; canonical: string },
): Pick<Metadata, 'openGraph' | 'twitter'> {
  const { publishedOn, canonical, ...words } = text;
  const siteName = TRANSLATIONS[locale].brand.name;
  const alternateLocale = pageLocales(page)
    .filter((each) => each !== locale)
    .map((each) => OG_LOCALES[each]);
  return {
    openGraph: {
      type: isEpisodePage(page) ? 'article' : 'website',
      ...words,
      url: canonical,
      siteName,
      locale: OG_LOCALES[locale],
      ...(alternateLocale.length > 0 ? { alternateLocale } : {}),
      images: [{ ...OG_IMAGE, alt: siteName }],
      ...(publishedOn ? { publishedTime: publishedOn } : {}),
    },
    twitter: { card: 'summary_large_image', ...words, images: [OG_IMAGE.url] },
  };
}

/** The copy of a page that has no record of its own: `meta.<page>` of the Translation file. */
function listPageCopy(page: PageRef, locale: Locale): Pick<PageCopy, 'title' | 'description'> {
  const { meta } = TRANSLATIONS[locale];
  if (page === 'dashboard' || page === 'episodes' || page === 'events') return meta[page];
  return meta.home;
}

/**
 * A page's metadata: its copy, its canonical, and reciprocal hreflang
 * alternates. The landing page's copy is `meta.home` of the site-wide
 * Translation file; an Episode's comes from its record, which this tier cannot
 * reach, so the route hands it in, with the facts of what the page presents.
 * The visibility predicate turns those into robots and canonical: a page whose
 * canonical is elsewhere carries no hreflang of its own and no `noindex`.
 */
export function pageMetadata(page: 'home' | 'episodes' | 'events', locale: Locale): Metadata;
export function pageMetadata(page: 'dashboard', locale: 'en'): Metadata;
export function pageMetadata(page: Exclude<PageRef, string>, locale: Locale, copy: PageCopy): Metadata;
export function pageMetadata(page: PageRef, locale: Locale, copy?: PageCopy): Metadata {
  const treatment = pageTreatment(page, copy?.facts ?? {});
  const route = routeOf(page);
  const canonical = localizePath(canonicalRoute(page, treatment), locale);
  const languages = Object.fromEntries(pageLocales(page).map((each) => [each, localizePath(route, each)]));
  const { title, description } = copy ?? listPageCopy(page, locale);
  return {
    title,
    description,
    ...socialCards(page, locale, { title, description, publishedOn: copy?.publishedOn, canonical }),
    alternates:
      treatment.canonical === 'self'
        ? { canonical, languages: { ...languages, 'x-default': localizePath(route, DEFAULT_LOCALE) } }
        : { canonical },
    ...(treatment.index ? {} : { robots: { index: false } }),
  };
}
