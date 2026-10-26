import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { EpisodeOverviewPage } from '@/page-assembly/episode-overview/episode-overview-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';

export const metadata = pageMetadata({ kind: 'episodes' }, DEFAULT_LOCALE);

export default async function Page() {
  return <EpisodeOverviewPage locale={DEFAULT_LOCALE} />;
}
