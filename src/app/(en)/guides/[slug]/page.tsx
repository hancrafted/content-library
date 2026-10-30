import { guideParams } from '@/content-store/store';
import { GuidePage, guideCopy, guideOf } from '@/page-assembly/guide/guide-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

interface SlugParams {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = () => guideParams();

export async function generateMetadata({ params }: SlugParams) {
  const page = guideOf(await params);
  return pageMetadata(page, DEFAULT_LOCALE, guideCopy(page, DEFAULT_LOCALE));
}

export default async function Page({ params }: SlugParams) {
  return <GuidePage page={guideOf(await params)} locale={DEFAULT_LOCALE} />;
}
