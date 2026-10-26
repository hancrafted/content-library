import { DevTokenEditor } from '@/shared/components/design-system-token-editor/dev-token-editor';
import { Button } from '@/shared/components/ui/button';
import { BOOKING_URL } from '@/shared/lib/contact';
import { externalHref } from '@/shared/lib/external-link.pure';
import { localizePath, type Locale, type LocalesByRoute } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/routes';
import { HeaderMenu } from '@/shared/page-chrome/header/header-menu.client';
import { NavLink } from '@/shared/page-chrome/header/nav-link.client';
import { SiteBrand } from '@/shared/page-chrome/header/site-brand';
import { SocialLinks } from '@/shared/page-chrome/header/social-links';
import { LocaleToggle } from '@/shared/page-chrome/toggles/locale-toggle.client';
import { ThemeToggle } from '@/shared/page-chrome/toggles/theme-toggle.client';
import { ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

type HeaderT = Awaited<ReturnType<typeof getTranslations<never>>>;

function themeLabels(t: HeaderT) {
  return { label: t('theme.label'), light: t('theme.light'), dark: t('theme.dark'), system: t('theme.system') };
}

/**
 * The site's one call to action, so every page offers it and the landing hero needs only one button.
 * It stays in the one header row at every width; on a phone the menu button follows it.
 */
function ContactButton({ label, newTab }: { label: string; newTab: string }) {
  return (
    <Button asChild size="sm" className="shrink-0 rounded-full px-3.5 max-lg:ml-auto">
      <a data-testid="header-contact" href={externalHref(BOOKING_URL)} target="_blank" rel="noopener noreferrer">
        {label}
        <ArrowUpRight aria-hidden="true" className="max-sm:hidden" />
        <span className="sr-only"> ({newTab})</span>
      </a>
    </Button>
  );
}

function DashboardNav({ locale, label }: { locale: Locale; label: string }) {
  if (locale !== 'en') return null;
  return (
    <NavLink section={ROUTES.dashboard} href={localizePath(ROUTES.dashboard, locale)} data-testid="nav-dashboard">
      {label}
    </NavLink>
  );
}

function HeaderNav({ locale, t }: { locale: Locale; t: HeaderT }) {
  return (
    <nav aria-label={t('nav.label')} data-testid="site-nav" className="flex gap-1 max-lg:flex-col max-lg:self-stretch">
      <NavLink section={ROUTES.episodes} href={localizePath(ROUTES.episodes, locale)} data-testid="nav-episodes">
        {t('nav.episodes')}
      </NavLink>
      <NavLink section={ROUTES.events} href={localizePath(ROUTES.events, locale)} data-testid="nav-events">
        {t('nav.events')}
      </NavLink>
      <DashboardNav locale={locale} label={t('nav.dashboard')} />
    </nav>
  );
}

/**
 * A floating, translucent bar, one row at every width. It is sticky rather than fixed, so it keeps its place in the
 * document flow: every page starts below it with no per-page offset. Below `lg` the nav, profiles and toggles fold
 * into the menu panel; the brand and the call to action stay in the row. The locale toggle offers each page's
 * locales from `localesByRoute`, handed down from the layout.
 */
export async function SiteHeader({ locale, localesByRoute }: { locale: Locale; localesByRoute: LocalesByRoute }) {
  const t = await getTranslations({ locale });
  return (
    <header
      data-testid="site-header"
      className="sticky top-4 z-50 mx-4 mt-4 flex flex-nowrap items-center gap-x-2 rounded-2xl bg-header/60 px-3 py-2 shadow-header backdrop-blur-xl backdrop-saturate-150 sm:px-4 lg:gap-x-5"
    >
      <SiteBrand locale={locale} />
      <HeaderMenu label={t('nav.menu')}>
        <HeaderNav locale={locale} t={t} />
        <SocialLinks locale={locale} className="lg:ml-auto lg:max-xl:hidden" />
        <div className="flex items-center gap-3 lg:max-xl:ml-auto">
          <ThemeToggle labels={themeLabels(t)} />
          <LocaleToggle locale={locale} label={t('locale.label')} localesByRoute={localesByRoute} />
          <DevTokenEditor />
        </div>
      </HeaderMenu>
      <ContactButton label={t('nav.contact')} newTab={t('nav.newTab')} />
    </header>
  );
}
