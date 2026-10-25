import { WorkshopPage, workshopPageCopy } from '@/components/pages/workshop-page';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { isEventSlug, workshopParams } from '@/lib/routes';
import { notFound } from 'next/navigation';

interface WorkshopParams {
  params: Promise<{ workshop: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = workshopParams;

export async function generateMetadata({ params }: WorkshopParams) {
  const { workshop } = await params;
  if (!isEventSlug(workshop)) notFound();
  return pageMetadata({ workshop }, DEFAULT_LOCALE, workshopPageCopy(workshop, DEFAULT_LOCALE));
}

export default async function Page({ params }: WorkshopParams) {
  return <WorkshopPage slug={(await params).workshop} locale={DEFAULT_LOCALE} />;
}
