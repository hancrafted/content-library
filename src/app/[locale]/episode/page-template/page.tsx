import { EpisodeTemplatePage } from '@/components/pages/episode-template-page';
import { prefixedLocaleParams, resolveLocale, type LocaleParams } from '../../params';

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export default async function Page({ params }: LocaleParams) {
  return <EpisodeTemplatePage locale={await resolveLocale(params)} />;
}
