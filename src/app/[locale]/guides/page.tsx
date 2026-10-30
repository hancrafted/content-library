import { GuidesOverviewPage } from '@/page-assembly/guides-overview/guides-overview-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { prefixedLocaleParams, resolveLocale } from '../params';

interface GuidesParams {
  params: Promise<{ locale: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: GuidesParams) {
  return pageMetadata({ kind: 'guides' }, await resolveLocale(params));
}

export default async function Page({ params }: GuidesParams) {
  return <GuidesOverviewPage locale={await resolveLocale(params)} />;
}
