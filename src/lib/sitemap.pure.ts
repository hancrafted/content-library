import type { MetadataRoute } from 'next';
import type { EpisodeStatus } from './episode-metadata.pure';
import { DEFAULT_LOCALE, localizePath } from './locale.pure';
import { EPISODE_SLUGS, pageLocales, routeOf, type PageRef } from './routes';

/** Every page with its own metadata that a crawler may index: `dashboard` is `noindex`, so it is absent (FE-008 §2). */
const CANDIDATES: readonly PageRef[] = ['home', 'episodes', ...EPISODE_SLUGS.map((episode) => ({ episode }))];

/** The URL a page is served at: `trailingSlash` makes it the canonical, the origin alone for the home page. */
function servedUrl(siteUrl: string, path: string): string {
  return path === '/' ? `${siteUrl}/` : `${siteUrl}${path}/`;
}

/**
 * The sitemap: one entry per indexable page and locale, each carrying the full hreflang set, English canonical at
 * the bare root and German at `/de`. An upcoming Episode is `noindex`, so it is left out in every locale.
 */
export function sitemapEntries(siteUrl: string, statusOf: (slug: string) => EpisodeStatus): MetadataRoute.Sitemap {
  return CANDIDATES.filter((page) => typeof page === 'string' || statusOf(page.episode) === 'published').flatMap(
    (page) => {
      const route = routeOf(page);
      const locales = pageLocales(page);
      const languages = {
        ...Object.fromEntries(locales.map((locale) => [locale, servedUrl(siteUrl, localizePath(route, locale))])),
        'x-default': servedUrl(siteUrl, localizePath(route, DEFAULT_LOCALE)),
      };
      return locales.map((locale) => ({
        url: servedUrl(siteUrl, localizePath(route, locale)),
        alternates: { languages },
      }));
    },
  );
}

/** `robots.txt`: crawl everything, and say where the sitemap is. Page-level `noindex` does the excluding. */
export function robotsFor(siteUrl: string): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${siteUrl}/sitemap.xml` };
}
