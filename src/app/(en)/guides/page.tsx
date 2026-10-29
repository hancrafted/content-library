import { GuidesOverviewPage } from '@/page-assembly/guides-overview/guides-overview-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

export const metadata = pageMetadata({ kind: 'guides' }, DEFAULT_LOCALE);

export default async function Page() {
  return <GuidesOverviewPage locale={DEFAULT_LOCALE} />;
}
