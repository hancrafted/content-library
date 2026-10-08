import { SiteShell } from '@/components/site-shell';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { prefixedLocaleParams, resolveLocale, type LocaleParams } from './params';

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;
export const metadata: Metadata = { title: 'Content Library' };

/** Root layout for prefixed locales (`/de`). */
export default async function PrefixedLocaleLayout({ children, params }: LocaleParams & { children: ReactNode }) {
  return <SiteShell locale={await resolveLocale(params)}>{children}</SiteShell>;
}
