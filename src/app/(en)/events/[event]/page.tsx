import { EventPage, eventPageCopy } from '@/components/pages/event-page';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { eventParams, isEventSlug } from '@/lib/routes';
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
