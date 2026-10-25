import { WorkshopPage, workshopPageCopy } from '@/components/pages/workshop-page';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { isEventSlug, workshopParams } from '@/lib/routes';
import { notFound } from 'next/navigation';
import { resolveLocale } from '../../params';

interface WorkshopParams {
  params: Promise<{ locale: string; workshop: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = workshopParams;

export async function generateMetadata({ params }: WorkshopParams) {
  const { workshop } = await params;
  if (!isEventSlug(workshop)) notFound();
  const locale = await resolveLocale(params);
  return pageMetadata({ workshop }, locale, workshopPageCopy(workshop, locale));
}

export default async function Page({ params }: WorkshopParams) {
  return <WorkshopPage slug={(await params).workshop} locale={await resolveLocale(params)} />;
}
