import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

export async function EpisodeTemplatePage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'episodeTemplate' });
  return (
    <main data-testid="episode-template-page" className="p-4">
      <h1 data-testid="page-title" className="text-2xl font-semibold">
        {t('title')}
      </h1>
    </main>
  );
}
