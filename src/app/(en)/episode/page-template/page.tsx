import { EpisodeTemplatePage } from '@/components/pages/episode-template-page';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { pageMetadata } from '@/lib/page-metadata.pure';

export const metadata = pageMetadata('episodeTemplate', DEFAULT_LOCALE);

export default function Page() {
  return <EpisodeTemplatePage locale={DEFAULT_LOCALE} />;
}
