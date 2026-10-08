import { SiteShell } from '@/components/site-shell';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'Content Library' };

/** Root layout for the default locale, served unprefixed. */
export default function DefaultLocaleLayout({ children }: { children: ReactNode }) {
  return <SiteShell locale={DEFAULT_LOCALE}>{children}</SiteShell>;
}
