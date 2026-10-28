import { explorablePageParams } from '@/content-store/store';
import { ExplorablePage, explorablePageCopy, explorablePageOf } from '@/page-assembly/explorable-page/explorable-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { resolveLocale } from '../../params';

interface SlugParams {
  params: Promise<{ locale: string; slug: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = () => explorablePageParams();

export async function generateMetadata({ params }: SlugParams) {
  const page = explorablePageOf(await params);
  const locale = await resolveLocale(params);
  return pageMetadata(page, locale, explorablePageCopy(page, locale));
}

export default async function Page({ params }: SlugParams) {
  return <ExplorablePage page={explorablePageOf(await params)} locale={await resolveLocale(params)} />;
}
