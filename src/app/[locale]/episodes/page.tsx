import { EpisodesIndexPage } from '@/components/pages/episodes-index-page';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { prefixedLocaleParams, resolveLocale } from '../params';

interface EpisodesParams {
  params: Promise<{ locale: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: EpisodesParams) {
  return pageMetadata({ kind: 'episodes' }, await resolveLocale(params));
}

export default async function Page({ params }: EpisodesParams) {
  return <EpisodesIndexPage locale={await resolveLocale(params)} />;
}
