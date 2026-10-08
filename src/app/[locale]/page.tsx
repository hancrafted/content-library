import { LandingPage } from '@/components/pages/landing-page';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { prefixedLocaleParams, resolveLocale, type LocaleParams } from './params';

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: LocaleParams) {
  return pageMetadata('home', await resolveLocale(params));
}

export default async function Page({ params }: LocaleParams) {
  return <LandingPage locale={await resolveLocale(params)} />;
}
