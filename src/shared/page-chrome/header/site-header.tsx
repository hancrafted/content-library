import { DevTokenEditor } from '@/shared/components/design-system-token-editor/dev-token-editor';
import { Button } from '@/shared/components/ui/button';
import { BOOKING_URL } from '@/shared/lib/contact';
import { externalHref } from '@/shared/lib/external-link.pure';
import { type Locale, type LocalesByRoute } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/static-routes';
import { HeaderInk } from '@/shared/page-chrome/header/header-ink.client';
import { HeaderMenu } from '@/shared/page-chrome/header/header-menu.client';
import { HeaderNav as ClientHeaderNav, type HeaderNavLink } from '@/shared/page-chrome/header/header-nav.client';
import { SiteBrand } from '@/shared/page-chrome/header/site-brand';
import { SocialLinks } from '@/shared/page-chrome/social-links';
import { LocaleToggle } from '@/shared/page-chrome/toggles/locale-toggle.client';
import { ThemeToggle } from '@/shared/page-chrome/toggles/theme-toggle.client';
import { ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import styles from './header.module.css';

type HeaderT = Awaited<ReturnType<typeof getTranslations<never>>>;
interface HeaderProps {
  locale: Locale;
  localesByRoute: LocalesByRoute;
  navSections: readonly string[];
}

const DESTINATIONS = {
  explorables: { section: ROUTES.explorables, icon: 'flask' },
  events: { section: ROUTES.events, icon: 'calendar' },
  episodes: { section: ROUTES.episodes, icon: 'play' },
  guides: { section: ROUTES.guides, icon: 'book' },
  resources: { section: ROUTES.resources, icon: 'layers' },
  dashboard: { section: ROUTES.dashboard, icon: 'workflow' },
} as const;

function navLink(name: keyof typeof DESTINATIONS, t: HeaderT): HeaderNavLink {
  return {
    ...DESTINATIONS[name],
    label: t(`nav.${name}`),
    description: t(`nav.descriptions.${name}`),
    testId: `nav-${name}`,
  };
}

function themeLabels(t: HeaderT) {
  return {
    label: t('theme.label'),
    light: t('theme.light'),
    dark: t('theme.dark'),
    system: t('theme.system'),
    switch: t.raw('theme.switch') as string,
  };
}

/**
 * The site's one call to action, so every page offers it and the landing hero needs only one button.
 * It stays in the header row while closed and moves into the mobile menu's utilities while open.
 */
function ContactButton({ label, newTab }: { label: string; newTab: string }) {
  return (
    <Button asChild size="sm" className="min-h-11 shrink-0 rounded-full px-3.5">
      <a data-testid="header-contact" href={externalHref(BOOKING_URL)} target="_blank" rel="noopener noreferrer">
        {label}
        <ArrowUpRight aria-hidden="true" className="max-sm:hidden" />
        <span className="sr-only"> ({newTab})</span>
      </a>
    </Button>
  );
}

function HeaderNav({ locale, t, navSections }: { locale: Locale; t: HeaderT; navSections: readonly string[] }) {
  return (
    <ClientHeaderNav
      locale={locale}
      label={t('nav.label')}
      lead={[navLink('explorables', t), navLink('events', t)]}
      learnLabel={t('nav.learn')}
      learnIntro={t('nav.learnIntro')}
      learn={[
        navLink('episodes', t),
        navLink('guides', t),
        { ...navLink('resources', t), alsoIn: navSections },
        ...(locale === 'en' ? [navLink('dashboard', t)] : []),
      ]}
    />
  );
}

function HeaderSettings({ locale, localesByRoute, t }: Omit<HeaderProps, 'navSections'> & { t: HeaderT }) {
  return (
    <>
      <div className={styles.setting}>
        <ThemeToggle labels={themeLabels(t)} />
      </div>
      <div className={styles.setting}>
        <LocaleToggle locale={locale} label={t('locale.label')} localesByRoute={localesByRoute} />
      </div>
      <DevTokenEditor />
    </>
  );
}

/**
 * A floating, translucent bar, one row at every width. It is sticky rather than fixed, so it keeps its place in the
 * document flow: every page starts below it with no per-page offset. Below `lg` the nav, profiles and toggles fold
 * into a centered mobile menu. The locale toggle offers each page's
 * locales from `localesByRoute`, handed down from the layout.
 */
export async function SiteHeader({ locale, localesByRoute, navSections }: HeaderProps) {
  const t = await getTranslations({ locale });
  return (
    <header
      data-testid="site-header"
      className={`${styles.frame} sticky top-4 z-50 mx-4 mt-4 flex flex-nowrap items-center bg-header/60 px-3 py-2 backdrop-blur-xl backdrop-saturate-150 sm:px-4`}
    >
      <HeaderMenu
        brand={<SiteBrand locale={locale} />}
        label={t('nav.menu')}
        closeLabel={t('nav.close')}
        settings={<HeaderSettings locale={locale} localesByRoute={localesByRoute} t={t} />}
        social={<SocialLinks locale={locale} header />}
        contact={<ContactButton label={t('nav.contact')} newTab={t('nav.newTab')} />}
      >
        <HeaderNav locale={locale} t={t} navSections={navSections} />
      </HeaderMenu>
      <HeaderInk />
    </header>
  );
}
