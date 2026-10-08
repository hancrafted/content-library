import { localizePath, type Locale } from '@/lib/locale.pure';
import { MESSAGES } from '@/lib/messages';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';

export function LandingPage({ locale }: { locale: Locale }) {
  const t = MESSAGES[locale].landing;
  return (
    <main data-testid="landing-page" className="flex flex-col gap-4 p-4">
      <h1 data-testid="page-title" className="text-2xl font-semibold">
        {t.title}
      </h1>
      <Link
        href={localizePath(ROUTES.episodeTemplate, locale)}
        data-testid="landing-page-link"
        className="underline underline-offset-4"
      >
        {t.link}
      </Link>
    </main>
  );
}
