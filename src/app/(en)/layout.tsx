import { SiteShell } from '@/components/site-shell';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { SITE_URL } from '@/lib/site-url';
import { siteMetadata } from '@/page-assembly/lib/page-metadata.pure';
import type { ReactNode } from 'react';

export const metadata = siteMetadata(DEFAULT_LOCALE, SITE_URL);

/** Root layout for the default locale, served unprefixed. */
export default function DefaultLocaleLayout({ children }: { children: ReactNode }) {
  return <SiteShell locale={DEFAULT_LOCALE}>{children}</SiteShell>;
}
