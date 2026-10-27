import { resourceParams } from '@/content-store/store';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { ResourcePage, resourcePageCopy, resourcePageOf } from '@/page-assembly/resource/resource-page';
import { resolveLocale } from '../../params';

interface ResourceParamsProp {
  params: Promise<{ locale: string; resource: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = () => resourceParams('explorable-explanation');

export async function generateMetadata({ params }: ResourceParamsProp) {
  const page = resourcePageOf('explorable-explanation', await params);
  const locale = await resolveLocale(params);
  return pageMetadata(page, locale, resourcePageCopy(page, locale));
}

export default async function Page({ params }: ResourceParamsProp) {
  return (
    <ResourcePage page={resourcePageOf('explorable-explanation', await params)} locale={await resolveLocale(params)} />
  );
}
