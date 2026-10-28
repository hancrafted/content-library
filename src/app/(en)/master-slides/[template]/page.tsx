import { templateParams } from '@/content-store/store';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { TemplatePage, templatePageCopy, templatePageOf } from '@/page-assembly/template/template-page';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

interface TemplateParamsProp {
  params: Promise<{ template: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = () => templateParams('master-slide');

export async function generateMetadata({ params }: TemplateParamsProp) {
  const page = templatePageOf('master-slide', await params);
  return pageMetadata(page, DEFAULT_LOCALE, templatePageCopy(page, DEFAULT_LOCALE));
}

export default async function Page({ params }: TemplateParamsProp) {
  return <TemplatePage page={templatePageOf('master-slide', await params)} locale={DEFAULT_LOCALE} />;
}
