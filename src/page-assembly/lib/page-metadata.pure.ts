import {
  episodeRoute,
  matchPage,
  pageLocales,
  routeOf,
  type ListPage,
  type PageKind,
  type PageRef,
  type RecordPage,
} from '@/content-store/catalogue/routes';
import { pageTreatment, type PageTreatment } from '@/content-store/catalogue/visibility.pure';
import type { IsoDate } from '@/content-store/schemas/fields';
import { DEFAULT_LOCALE, localizePath, type Locale } from '@/shared/lib/locale.pure';
import type { Metadata } from 'next';
import { PAGE_WORDS } from './page-words';

/** A root layout's metadata: the absolute base and the site-name title frame. Nothing page-specific. */
export function siteMetadata(locale: Locale, siteUrl: string): Metadata {
  const name = PAGE_WORDS[locale].brand.name;
  return {
    metadataBase: new URL(`${siteUrl}/`),
    title: { default: name, template: `%s · ${name}` },
  };
}

/** A page's `<title>` and meta description in one locale (FE-008 §2). */
export interface PageCopy {
  readonly title: string;
  readonly description: string;
  /** How the site treats the page, from the page catalogue (`treatmentOf` in the content store): robots and canonical. */
  readonly treatment: PageTreatment;
  /** An Episode's release date, the article's `publishedTime`. */
  readonly publishedOn?: IsoDate;
}

/** The site-wide fallback card image: a static file in `public/`, 1200x630 (FE-008 §6). */
export const OG_IMAGE = { url: '/og-image.png', width: 1200, height: 630 } as const;

const OG_LOCALES: Record<Locale, string> = { en: 'en_US', de: 'de_DE' };

/** The logical path a page's canonical names: its own, or that of the public Episode it credits. */
function canonicalRoute(page: PageRef, treatment: PageTreatment): string {
  return treatment.canonical === 'self' ? routeOf(page) : episodeRoute(treatment.canonical.episode);
}

/** Each kind of page's Open Graph type: an Episode's page, its own or under an Event, is an article. */
const OPEN_GRAPH_TYPE: Readonly<Record<PageKind, 'article' | 'website'>> = {
  home: 'website',
  dashboard: 'website',
  episodes: 'website',
  events: 'website',
  episode: 'article',
  tooling: 'website',
  event: 'website',
  'event-episode': 'article',
};

/** Open Graph and Twitter cards: the page's own title and description, the fallback image, its locale and the others. */
function socialCards(
  page: PageRef,
  locale: Locale,
  text: { title: string; description: string; publishedOn?: IsoDate; canonical: string },
): Pick<Metadata, 'openGraph' | 'twitter'> {
  const { publishedOn, canonical, ...words } = text;
  const siteName = PAGE_WORDS[locale].brand.name;
  const alternateLocale = pageLocales(page)
    .filter((each) => each !== locale)
    .map((each) => OG_LOCALES[each]);
  return {
    openGraph: {
      type: OPEN_GRAPH_TYPE[page.kind],
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

/** The copy of a page: the copy its route hands in, else `meta.<kind>` of the Translation file for a page that presents no record. */
function copyOf(page: PageRef, locale: Locale, copy: PageCopy | undefined): Pick<PageCopy, 'title' | 'description'> {
  if (copy !== undefined) return copy;
  const { meta } = PAGE_WORDS[locale];
  const handedIn = ({ kind }: RecordPage) => {
    throw new Error(`A ${kind} page presents a record: its route hands in its copy`);
  };
  return matchPage(page, {
    home: () => meta.home,
    dashboard: () => meta.dashboard,
    episodes: () => meta.episodes,
    events: () => meta.events,
    episode: handedIn,
    tooling: handedIn,
    event: handedIn,
    'event-episode': handedIn,
  });
}

/**
 * A page's metadata: its copy, its canonical, and reciprocal hreflang
 * alternates. The landing page's copy is `meta.home` of page assembly's
 * Translation file; an Episode's comes from its record, which this tier cannot
 * reach, so the route hands it in, with the page's treatment from the page
 * catalogue, which the sitemap reads too: robots and canonical follow it, and a
 * page whose canonical is elsewhere carries no hreflang alternates of its own.
 * A page that presents no record is treated by its kind alone.
 */
export function pageMetadata(page: Exclude<ListPage, { kind: 'dashboard' }>, locale: Locale): Metadata;
export function pageMetadata(page: { readonly kind: 'dashboard' }, locale: 'en'): Metadata;
export function pageMetadata(page: RecordPage, locale: Locale, copy: PageCopy): Metadata;
export function pageMetadata(page: PageRef, locale: Locale, copy?: PageCopy): Metadata {
  const treatment = copy?.treatment ?? pageTreatment(page, {});
  const canonical = localizePath(canonicalRoute(page, treatment), locale);
  const { title, description } = copyOf(page, locale, copy);
  return {
    title,
    description,
    ...socialCards(page, locale, { title, description, publishedOn: copy?.publishedOn, canonical }),
    alternates: { canonical, ...(treatment.canonical === 'self' ? { languages: alternatesOf(page) } : {}) },
    ...(treatment.index ? {} : { robots: { index: false } }),
  };
}

/** Every locale the page is exported in, and `x-default`: only on a page that is its own canonical. */
function alternatesOf(page: PageRef): Record<string, string> {
  const route = routeOf(page);
  const languages = Object.fromEntries(pageLocales(page).map((each) => [each, localizePath(route, each)]));
  return { ...languages, 'x-default': localizePath(route, DEFAULT_LOCALE) };
}
