import { LocaleToggle } from '@/components/locale-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { MESSAGES } from '@/lib/messages';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = MESSAGES[locale];
  return (
    <header data-testid="site-header" className="flex flex-wrap items-center gap-4 border-b p-4">
      <nav aria-label={t.nav.label} data-testid="site-nav" className="flex gap-1">
        <Button asChild variant="ghost" size="sm">
          <Link href={localizePath(ROUTES.home, locale)} data-testid="nav-home">
            {t.nav.home}
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={localizePath(ROUTES.episodeTemplate, locale)} data-testid="nav-page">
            {t.nav.page}
          </Link>
        </Button>
      </nav>
      <div className="ml-auto flex flex-wrap gap-4">
        <ThemeToggle labels={t.theme} />
        <LocaleToggle locale={locale} label={t.locale.label} />
      </div>
    </header>
  );
}
