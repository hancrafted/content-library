import { EventsIndexPage } from '@/components/pages/events-index-page';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { prefixedLocaleParams, resolveLocale } from '../params';

interface EventsParams {
  params: Promise<{ locale: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: EventsParams) {
  return pageMetadata('events', await resolveLocale(params));
}

export default async function Page({ params }: EventsParams) {
  return <EventsIndexPage locale={await resolveLocale(params)} />;
}
