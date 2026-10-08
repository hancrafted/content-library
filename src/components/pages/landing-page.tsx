import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute } from '@/lib/routes';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function LandingPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'landing' });
  return (
    <main data-testid="landing-page" className="flex flex-col gap-4 p-4">
      <h1 data-testid="page-title" className="text-2xl font-semibold">
        {t('title')}
      </h1>
      <Link
        href={localizePath(episodeRoute('page-template'), locale)}
        data-testid="landing-page-link"
        className="underline underline-offset-4"
      >
        {t('link')}
      </Link>
    </main>
  );
}
