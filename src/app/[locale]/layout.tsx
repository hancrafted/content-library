import { SiteShell } from '@/components/site-shell';
import { SITE_URL } from '@/lib/site-url';
import { siteMetadata } from '@/page-assembly/lib/page-metadata.pure';
import type { ReactNode } from 'react';
import { prefixedLocaleParams, resolveLocale, type LocaleParams } from './params';

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: LocaleParams) {
  return siteMetadata(await resolveLocale(params), SITE_URL);
}

/** Root layout for prefixed locales (`/de`). */
export default async function PrefixedLocaleLayout({ children, params }: LocaleParams & { children: ReactNode }) {
  return <SiteShell locale={await resolveLocale(params)}>{children}</SiteShell>;
}
