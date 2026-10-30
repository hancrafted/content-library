import { guideParams } from '@/content-store/store';
import { GuidePage, guideCopy, guideOf } from '@/page-assembly/guide/guide-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { resolveLocale } from '../../params';

interface SlugParams {
  params: Promise<{ locale: string; slug: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = () => guideParams();

export async function generateMetadata({ params }: SlugParams) {
  const page = guideOf(await params);
  const locale = await resolveLocale(params);
  return pageMetadata(page, locale, guideCopy(page, locale));
}

export default async function Page({ params }: SlugParams) {
  return <GuidePage page={guideOf(await params)} locale={await resolveLocale(params)} />;
}
