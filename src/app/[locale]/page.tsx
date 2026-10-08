import { LandingPage } from '@/components/pages/landing-page';
import { prefixedLocaleParams, resolveLocale, type LocaleParams } from './params';

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export default async function Page({ params }: LocaleParams) {
  return <LandingPage locale={await resolveLocale(params)} />;
}
