import { explorablePageParams } from '@/content-store/store';
import type { ComposedPage } from '@/episodes/lib/composed-page';
import { ExplorableHomesProvider } from '@/shared/components/core-components/explorable-home/explorable-home.client';
import { explorableHomeSlugs } from '@/shared/components/core-components/explorable-home/explorable-home.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

export async function ExplorableHomes({
  page,
  locale,
  children,
}: {
  page: ComposedPage;
  locale: Locale;
  children: ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: 'explorableHome' });
  const slugs = explorableHomeSlugs(
    explorablePageParams().map(({ slug }) => slug),
    page.kind === 'explorable-page' ? page.slug : undefined,
  );
  return (
    <ExplorableHomesProvider slugs={slugs} locale={locale} label={t('exploreIt')}>
      {children}
    </ExplorableHomesProvider>
  );
}
