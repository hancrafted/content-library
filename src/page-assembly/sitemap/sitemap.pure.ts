import type { EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import { matchPage, pageLocales, routeOf, type EpisodeId, type PageRef } from '@/content-store/catalogue/record-routes';
import type { TreatedPage } from '@/content-store/catalogue/visibility.pure';
import type { IsoDate } from '@/content-store/schemas/fields';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';
import { servedUrl } from '@/shared/lib/static-routes';
import type { MetadataRoute } from 'next';

function lastModifiedOf(
  page: PageRef,
  publishedOnOf: (episode: EpisodeRef<EpisodeId>) => IsoDate | undefined,
): IsoDate | undefined {
  const none = () => undefined;
  return matchPage<PageRef, IsoDate | undefined>(page, {
    home: none,
    dashboard: none,
    episodes: none,
    events: none,
    explorables: none,
    guides: none,
    resources: none,
    episode: ({ episode }) => publishedOnOf(episode),
    'explorable-page': none,
    guide: none,
    template: none,
    event: none,
    'event-episode': none,
  });
}

export function sitemapEntries(
  siteUrl: string,
  pages: readonly TreatedPage[],
  publishedOnOf: (episode: EpisodeRef<EpisodeId>) => IsoDate | undefined,
): MetadataRoute.Sitemap {
  const indexable = pages.filter(({ treatment }) => treatment.inSitemap).map(({ page }) => page);
  return indexable.flatMap((page) => {
    const route = routeOf(page);
    const locales = pageLocales(page);
    const languages = {
      ...Object.fromEntries(locales.map((locale) => [locale, servedUrl(siteUrl, route, locale)])),
      'x-default': servedUrl(siteUrl, route, DEFAULT_LOCALE),
    };
    const lastModified = lastModifiedOf(page, publishedOnOf);
    return locales.map((locale) => ({
      url: servedUrl(siteUrl, route, locale),
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages },
    }));
  });
}

export function robotsFor(siteUrl: string): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${siteUrl}/sitemap.xml` };
}
