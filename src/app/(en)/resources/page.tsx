import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { ResourcesOverviewPage } from '@/page-assembly/resources-overview/resources-overview-page';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

export const metadata = pageMetadata({ kind: 'resources' }, DEFAULT_LOCALE);

export default async function Page() {
  return <ResourcesOverviewPage locale={DEFAULT_LOCALE} />;
}
