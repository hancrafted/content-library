import { EventsIndexPage } from '@/components/pages/events-index-page';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { pageMetadata } from '@/lib/page-metadata.pure';

export const metadata = pageMetadata('events', DEFAULT_LOCALE);

export default async function Page() {
  return <EventsIndexPage locale={DEFAULT_LOCALE} />;
}
