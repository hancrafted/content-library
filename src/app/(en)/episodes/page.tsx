import { EpisodesIndexPage } from '@/components/pages/episodes-index-page';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { pageMetadata } from '@/lib/page-metadata.pure';

export const metadata = pageMetadata({ kind: 'episodes' }, DEFAULT_LOCALE);

export default async function Page() {
  return <EpisodesIndexPage locale={DEFAULT_LOCALE} />;
}
