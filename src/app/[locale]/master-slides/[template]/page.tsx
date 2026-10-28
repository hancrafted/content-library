import { templateParams } from '@/content-store/store';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { TemplatePage, templatePageCopy, templatePageOf } from '@/page-assembly/template/template-page';
import { resolveLocale } from '../../params';

interface TemplateParamsProp {
  params: Promise<{ locale: string; template: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = () => templateParams('master-slide');

export async function generateMetadata({ params }: TemplateParamsProp) {
  const page = templatePageOf('master-slide', await params);
  const locale = await resolveLocale(params);
  return pageMetadata(page, locale, templatePageCopy(page, locale));
}

export default async function Page({ params }: TemplateParamsProp) {
  return <TemplatePage page={templatePageOf('master-slide', await params)} locale={await resolveLocale(params)} />;
}
