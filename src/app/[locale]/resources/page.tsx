import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { ResourcesOverviewPage } from '@/page-assembly/resources-overview/resources-overview-page';
import { prefixedLocaleParams, resolveLocale } from '../params';

interface ResourcesParams {
  params: Promise<{ locale: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: ResourcesParams) {
  return pageMetadata({ kind: 'resources' }, await resolveLocale(params));
}

export default async function Page({ params }: ResourcesParams) {
  return <ResourcesOverviewPage locale={await resolveLocale(params)} />;
}
