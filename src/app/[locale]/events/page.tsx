import { EventsOverviewPage } from '@/page-assembly/events-overview/events-overview-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { prefixedLocaleParams, resolveLocale } from '../params';

interface EventsParams {
  params: Promise<{ locale: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: EventsParams) {
  return pageMetadata({ kind: 'events' }, await resolveLocale(params));
}

export default async function Page({ params }: EventsParams) {
  return <EventsOverviewPage locale={await resolveLocale(params)} />;
}
