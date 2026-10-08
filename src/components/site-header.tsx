import { LocaleToggle } from '@/components/locale-toggle';
import { NavLink } from '@/components/nav-link';
import { SiteBrand } from '@/components/site-brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { MESSAGES } from '@/lib/messages';
import { ROUTES } from '@/lib/routes';

/**
 * A floating, translucent bar. It is sticky rather than fixed, so it keeps its
 * place in the document flow: every page starts below it with no per-page offset.
 */
export function SiteHeader({ locale }: { locale: Locale }) {
  const t = MESSAGES[locale];
  return (
    <header
      data-testid="site-header"
      className="sticky top-4 z-50 mx-4 mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-header/60 px-4 py-2 shadow-header backdrop-blur-xl backdrop-saturate-150"
    >
      <SiteBrand locale={locale} />
      <nav aria-label={t.nav.label} data-testid="site-nav" className="flex gap-1">
        <NavLink
          section={ROUTES.episodes}
          href={localizePath(ROUTES.episodeTemplate, locale)}
          data-testid="nav-episodes"
        >
          {t.nav.episodes}
        </NavLink>
      </nav>
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle labels={t.theme} />
        <LocaleToggle locale={locale} label={t.locale.label} />
      </div>
    </header>
  );
}
