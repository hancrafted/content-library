import { isEventSlug } from '@/content-store/catalogue/routes';
import { eventParams } from '@/content-store/store';
import { EventPage, eventPageCopy } from '@/page-assembly/event/event-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';
import { notFound } from 'next/navigation';

interface EventParams {
  params: Promise<{ event: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = eventParams;

export async function generateMetadata({ params }: EventParams) {
  const { event } = await params;
  if (!isEventSlug(event)) notFound();
  return pageMetadata({ kind: 'event', event }, DEFAULT_LOCALE, eventPageCopy(event, DEFAULT_LOCALE));
}

export default async function Page({ params }: EventParams) {
  return <EventPage slug={(await params).event} locale={DEFAULT_LOCALE} />;
}
