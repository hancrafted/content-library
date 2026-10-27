import { resourceParams } from '@/content-store/store';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { ResourcePage, resourcePageCopy, resourcePageOf } from '@/page-assembly/resource/resource-page';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

interface ResourceParamsProp {
  params: Promise<{ resource: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = () => resourceParams('master-slide');

export async function generateMetadata({ params }: ResourceParamsProp) {
  const page = resourcePageOf('master-slide', await params);
  return pageMetadata(page, DEFAULT_LOCALE, resourcePageCopy(page, DEFAULT_LOCALE));
}

export default async function Page({ params }: ResourceParamsProp) {
  return <ResourcePage page={resourcePageOf('master-slide', await params)} locale={DEFAULT_LOCALE} />;
}
