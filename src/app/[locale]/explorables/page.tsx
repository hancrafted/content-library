import { ExplorablesOverviewPage } from '@/page-assembly/explorables-overview/explorables-overview-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { prefixedLocaleParams, resolveLocale } from '../params';

interface ExplorablesParams {
  params: Promise<{ locale: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: ExplorablesParams) {
  return pageMetadata({ kind: 'explorables' }, await resolveLocale(params));
}

export default async function Page({ params }: ExplorablesParams) {
  return <ExplorablesOverviewPage locale={await resolveLocale(params)} />;
}
