import { EventsOverviewPage } from '@/page-assembly/events-overview/events-overview-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

export const metadata = pageMetadata({ kind: 'events' }, DEFAULT_LOCALE);

export default async function Page() {
  return <EventsOverviewPage locale={DEFAULT_LOCALE} />;
}
