import { sitemapPage } from '@/page-assembly/sitemap/sitemap-page';
import { SITE_URL } from '@/shared/lib/site-url';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapPage(SITE_URL);
}
