import { localesByRoute, resourceSections } from '@/page-assembly/lib/page-locales';
import { siteMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';
import { SITE_URL } from '@/shared/lib/site-url';
import { SiteShell } from '@/shared/page-chrome/site-shell';
import type { ReactNode } from 'react';

export const metadata = siteMetadata(DEFAULT_LOCALE, SITE_URL);

/** Root layout for the default locale, served unprefixed. */
export default function DefaultLocaleLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell locale={DEFAULT_LOCALE} localesByRoute={localesByRoute()} navSections={resourceSections()}>
      {children}
    </SiteShell>
  );
}
