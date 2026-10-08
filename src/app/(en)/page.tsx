import { LandingPage } from '@/components/pages/landing-page';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { pageMetadata } from '@/lib/page-metadata.pure';

export const metadata = pageMetadata('home', DEFAULT_LOCALE);

export default function Page() {
  return <LandingPage locale={DEFAULT_LOCALE} />;
}
