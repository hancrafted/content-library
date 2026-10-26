import { isEventSlug } from '@/content-store/catalogue/record-routes';
import { eventParams } from '@/content-store/store';
import { EventPage, eventPageCopy } from '@/page-assembly/event/event-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { notFound } from 'next/navigation';
import { resolveLocale } from '../../params';

interface EventParams {
  params: Promise<{ locale: string; event: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = eventParams;

export async function generateMetadata({ params }: EventParams) {
  const { event } = await params;
  if (!isEventSlug(event)) notFound();
  const locale = await resolveLocale(params);
  return pageMetadata({ kind: 'event', event }, locale, eventPageCopy(event, locale));
}

export default async function Page({ params }: EventParams) {
  return <EventPage slug={(await params).event} locale={await resolveLocale(params)} />;
}
