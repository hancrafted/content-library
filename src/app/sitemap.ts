import { episodeSlugStatus } from '@/components/pages/episode-page';
import { SITE_URL } from '@/lib/site-url';
import { sitemapEntries } from '@/lib/sitemap.pure';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(SITE_URL, episodeSlugStatus);
}
