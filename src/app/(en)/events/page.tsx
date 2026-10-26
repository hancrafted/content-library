import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { EventsOverviewPage } from '@/page-assembly/events-overview/events-overview-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';

export const metadata = pageMetadata({ kind: 'events' }, DEFAULT_LOCALE);

export default async function Page() {
  return <EventsOverviewPage locale={DEFAULT_LOCALE} />;
}
