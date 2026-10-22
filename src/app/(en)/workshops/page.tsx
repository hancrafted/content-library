import { WorkshopsIndexPage } from '@/components/pages/workshops-index-page';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { pageMetadata } from '@/lib/page-metadata.pure';

export const metadata = pageMetadata('workshops', DEFAULT_LOCALE);

export default async function Page() {
  return <WorkshopsIndexPage locale={DEFAULT_LOCALE} />;
}
