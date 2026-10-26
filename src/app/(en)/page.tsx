import { LandingPage } from '@/page-assembly/landing/landing-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

export const metadata = pageMetadata({ kind: 'home' }, DEFAULT_LOCALE);

export default function Page() {
  return <LandingPage locale={DEFAULT_LOCALE} />;
}
