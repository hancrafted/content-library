import { localesByRoute } from '@/page-assembly/lib/page-locales';
import { siteMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { SITE_URL } from '@/shared/lib/site-url';
import { SiteShell } from '@/shared/page-chrome/site-shell';
import type { ReactNode } from 'react';
import { prefixedLocaleParams, resolveLocale, type LocaleParams } from './params';

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: LocaleParams) {
  return siteMetadata(await resolveLocale(params), SITE_URL);
}

/** Root layout for prefixed locales (`/de`). */
export default async function PrefixedLocaleLayout({ children, params }: LocaleParams & { children: ReactNode }) {
  return (
    <SiteShell locale={await resolveLocale(params)} localesByRoute={localesByRoute()}>
      {children}
    </SiteShell>
  );
}
