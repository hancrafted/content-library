import { ExplorablesOverviewPage } from '@/page-assembly/explorables-overview/explorables-overview-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

export const metadata = pageMetadata({ kind: 'explorables' }, DEFAULT_LOCALE);

export default async function Page() {
  return <ExplorablesOverviewPage locale={DEFAULT_LOCALE} />;
}
