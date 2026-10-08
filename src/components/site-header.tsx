import { LocaleToggle } from '@/components/locale-toggle.client';
import { NavLink } from '@/components/nav-link.client';
import { SiteBrand } from '@/components/site-brand';
import { ThemeToggle } from '@/components/theme-toggle.client';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute, ROUTES } from '@/lib/routes';
import { getTranslations } from 'next-intl/server';

/**
 * A floating, translucent bar. It is sticky rather than fixed, so it keeps its
 * place in the document flow: every page starts below it with no per-page offset.
 */
export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const themeLabels = {
    label: t('theme.label'),
    light: t('theme.light'),
    dark: t('theme.dark'),
    system: t('theme.system'),
  };
  return (
    <header
      data-testid="site-header"
      className="sticky top-4 z-50 mx-4 mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-header/60 px-4 py-2 shadow-header backdrop-blur-xl backdrop-saturate-150"
    >
      <SiteBrand locale={locale} />
      <nav aria-label={t('nav.label')} data-testid="site-nav" className="flex gap-1">
        <NavLink
          section={ROUTES.episodes}
          href={localizePath(episodeRoute('page-template'), locale)}
          data-testid="nav-episodes"
        >
          {t('nav.episodes')}
        </NavLink>
      </nav>
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle labels={themeLabels} />
        <LocaleToggle locale={locale} label={t('locale.label')} />
      </div>
    </header>
  );
}
