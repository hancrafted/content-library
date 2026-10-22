import { DevTokenEditor } from '@/components/design-system-token-editor/dev-token-editor';
import { HeaderMenu } from '@/components/header-menu.client';
import { LocaleToggle } from '@/components/locale-toggle.client';
import { NavLink } from '@/components/nav-link.client';
import { SiteBrand } from '@/components/site-brand';
import { SocialLinks } from '@/components/social-links';
import { ThemeToggle } from '@/components/theme-toggle.client';
import { Button } from '@/components/ui/button';
import { BOOKING_URL } from '@/lib/contact';
import { externalHref } from '@/lib/external-link.pure';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { ROUTES } from '@/lib/routes';
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
      <NavLink section={ROUTES.workshops} href={localizePath(ROUTES.workshops, locale)} data-testid="nav-workshops">
        {t('nav.workshops')}
      </NavLink>
      <DashboardNav locale={locale} label={t('nav.dashboard')} />
    </nav>
  );
}

/**
 * A floating, translucent bar, one row at every width. It is sticky rather than fixed, so it keeps its place in the
 * document flow: every page starts below it with no per-page offset. Below `lg` the nav, profiles and toggles fold
 * into the menu panel; the brand and the call to action stay in the row.
 */
export async function SiteHeader({ locale }: { locale: Locale }) {
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
          <LocaleToggle locale={locale} label={t('locale.label')} />
          <DevTokenEditor />
        </div>
      </HeaderMenu>
      <ContactButton label={t('nav.contact')} newTab={t('nav.newTab')} />
    </header>
  );
}
