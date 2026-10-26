import { EpisodeOverviewPage } from '@/page-assembly/episode-overview/episode-overview-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
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
  return <EpisodeOverviewPage locale={await resolveLocale(params)} />;
}
