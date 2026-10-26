import { EventPage, eventPageCopy } from '@/components/pages/event-page';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { eventParams, isEventSlug } from '@/lib/routes';
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
