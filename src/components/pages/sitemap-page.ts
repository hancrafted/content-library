import { episodeSlugStatus } from '@/components/episodes/episode-status';
import { sitemapEntries } from '@/lib/sitemap.pure';
import type { MetadataRoute } from 'next';

/** The sitemap's composition root (FE-007 §1): the route reaches the Episode statuses only through here. */
export function sitemapPage(siteUrl: string): MetadataRoute.Sitemap {
  return sitemapEntries(siteUrl, episodeSlugStatus);
}
