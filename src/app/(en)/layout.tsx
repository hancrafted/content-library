import { SiteShell } from '@/components/site-shell';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { siteMetadata } from '@/lib/page-metadata.pure';
import { SITE_URL } from '@/lib/site-url';
import type { ReactNode } from 'react';

export const metadata = siteMetadata(DEFAULT_LOCALE, SITE_URL);

/** Root layout for the default locale, served unprefixed. */
export default function DefaultLocaleLayout({ children }: { children: ReactNode }) {
  return <SiteShell locale={DEFAULT_LOCALE}>{children}</SiteShell>;
}
