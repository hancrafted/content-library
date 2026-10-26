import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { LandingPage } from '@/page-assembly/landing/landing-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';

export const metadata = pageMetadata({ kind: 'home' }, DEFAULT_LOCALE);

export default function Page() {
  return <LandingPage locale={DEFAULT_LOCALE} />;
}
