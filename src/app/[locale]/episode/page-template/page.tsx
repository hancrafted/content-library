import { EpisodeTemplatePage } from '@/components/pages/episode-template-page';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { prefixedLocaleParams, resolveLocale, type LocaleParams } from '../../params';

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: LocaleParams) {
  return pageMetadata('episodeTemplate', await resolveLocale(params));
}

export default async function Page({ params }: LocaleParams) {
  return <EpisodeTemplatePage locale={await resolveLocale(params)} />;
}
