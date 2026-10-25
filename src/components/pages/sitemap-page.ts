import { episodeSlugPublishedOn } from '@/components/episodes/episode-status';
import { pageFacts } from '@/components/episodes/page-facts';
import { sitemapEntries } from '@/lib/sitemap.pure';
import type { MetadataRoute } from 'next';

/** The sitemap's composition root (FE-007 §1): the route reaches each page's facts only through here. */
export function sitemapPage(siteUrl: string): MetadataRoute.Sitemap {
  return sitemapEntries(siteUrl, pageFacts, episodeSlugPublishedOn);
}
