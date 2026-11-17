import {
  episodeRoute,
  matchPage,
  pageLocales,
  routeOf,
  type ListPage,
  type PageKind,
  type PageRef,
  type RecordPage,
} from '@/content-store/catalogue/record-routes';
import { pageTreatment, type PageTreatment } from '@/content-store/catalogue/visibility.pure';
import type { IsoDate } from '@/content-store/schemas/fields';
import { DEFAULT_LOCALE, localizePath, type Locale } from '@/shared/lib/locale.pure';
import type { Metadata } from 'next';
import { PAGE_WORDS } from './page-words';

export function siteMetadata(locale: Locale, siteUrl: string): Metadata {
  const name = PAGE_WORDS[locale].brand.name;
  return { metadataBase: new URL(`${siteUrl}/`), title: { default: name, template: `%s · ${name}` } };
}

// decision: FE-008 §2
export interface PageCopy {
  readonly title: string;
  readonly description: string;
  readonly treatment: PageTreatment;
  readonly publishedOn?: IsoDate;
}

// decision: FE-008 §6
export const OG_IMAGE = { url: '/og-image.png', width: 1200, height: 630 } as const;

const OG_LOCALES: Record<Locale, string> = { en: 'en_US', de: 'de_DE' };

function canonicalRoute(page: PageRef, treatment: PageTreatment): string {
  return treatment.canonical === 'self' ? routeOf(page) : episodeRoute(treatment.canonical.episode);
}

const OPEN_GRAPH_TYPE: Readonly<Record<PageKind, 'article' | 'website'>> = {
  home: 'website',
  dashboard: 'website',
  episodes: 'website',
  events: 'website',
  episode: 'article',
  explorables: 'website',
  guides: 'website',
  resources: 'website',
  'explorable-page': 'website',
  guide: 'website',
  template: 'website',
  event: 'website',
  'event-episode': 'article',
};

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
    explorables: () => meta.explorables,
    guides: () => meta.guides,
    resources: () => meta.resources,
    episode: handedIn,
    'explorable-page': handedIn,
    guide: handedIn,
    template: handedIn,
    event: handedIn,
    'event-episode': handedIn,
  });
}

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

function alternatesOf(page: PageRef): Record<string, string> {
  const route = routeOf(page);
  const languages = Object.fromEntries(pageLocales(page).map((each) => [each, localizePath(route, each)]));
  return { ...languages, 'x-default': localizePath(route, DEFAULT_LOCALE) };
}
