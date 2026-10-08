import type { Locale } from '@/lib/locale.pure';
import { MESSAGES } from '@/lib/messages';

export function EpisodeTemplatePage({ locale }: { locale: Locale }) {
  return (
    <main data-testid="episode-template-page" className="p-4">
      <h1 data-testid="page-title" className="text-2xl font-semibold">
        {MESSAGES[locale].episodeTemplate.title}
      </h1>
    </main>
  );
}
