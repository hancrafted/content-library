import { explorablePageParams } from '@/content-store/store';
import { ExplorablePage, explorablePageCopy, explorablePageOf } from '@/page-assembly/explorable-page/explorable-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

interface SlugParams {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = () => explorablePageParams();

export async function generateMetadata({ params }: SlugParams) {
  const page = explorablePageOf(await params);
  return pageMetadata(page, DEFAULT_LOCALE, explorablePageCopy(page, DEFAULT_LOCALE));
}

export default async function Page({ params }: SlugParams) {
  return <ExplorablePage page={explorablePageOf(await params)} locale={DEFAULT_LOCALE} />;
}
