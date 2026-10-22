import { WorkshopsIndexPage } from '@/components/pages/workshops-index-page';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { prefixedLocaleParams, resolveLocale } from '../params';

interface WorkshopsParams {
  params: Promise<{ locale: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: WorkshopsParams) {
  return pageMetadata('workshops', await resolveLocale(params));
}

export default async function Page({ params }: WorkshopsParams) {
  return <WorkshopsIndexPage locale={await resolveLocale(params)} />;
}
