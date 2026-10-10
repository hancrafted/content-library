import { LocaleToggle } from '@/components/locale-toggle.client';
import { NavLink } from '@/components/nav-link.client';
import { SiteBrand } from '@/components/site-brand';
import { SocialLinks } from '@/components/social-links';
import { ThemeToggle } from '@/components/theme-toggle.client';
import { Button } from '@/components/ui/button';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute, ROUTES } from '@/lib/routes';
import { ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

type HeaderT = Awaited<ReturnType<typeof getTranslations<never>>>;

function themeLabels(t: HeaderT) {
  return { label: t('theme.label'), light: t('theme.light'), dark: t('theme.dark'), system: t('theme.system') };
}

/**
 * The site's one call to action, so every page offers it and the landing hero needs only one button.
 * On a phone it shares the brand's row while the nav and toggles wrap below.
 */
function ContactButton({ label, newTab }: { label: string; newTab: string }) {
  return (
    <Button asChild size="sm" className="rounded-full px-3.5 max-sm:ml-auto">
      <a
        data-testid="header-contact"
        href="https://calendly.com/hanche2001/30min"
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
        <ArrowUpRight aria-hidden="true" className="max-sm:hidden" />
        <span className="sr-only"> ({newTab})</span>
      </a>
    </Button>
  );
}

/**
 * A floating, translucent bar. It is sticky rather than fixed, so it keeps its
 * place in the document flow: every page starts below it with no per-page offset.
 */
export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  return (
    <header
      data-testid="site-header"
      className="sticky top-4 z-50 mx-4 mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-header/60 px-4 py-2 shadow-header backdrop-blur-xl backdrop-saturate-150"
    >
      <SiteBrand locale={locale} />
      <nav aria-label={t('nav.label')} data-testid="site-nav" className="flex gap-1 max-sm:order-1">
        <NavLink
          section={ROUTES.episodes}
          href={localizePath(episodeRoute('page-template'), locale)}
          data-testid="nav-episodes"
        >
          {t('nav.episodes')}
        </NavLink>
      </nav>
      <SocialLinks locale={locale} className="ml-auto max-sm:order-1" />
      <div className="flex items-center gap-3 max-sm:order-2 max-sm:ml-auto">
        <ThemeToggle labels={themeLabels(t)} />
        <LocaleToggle locale={locale} label={t('locale.label')} />
      </div>
      <ContactButton label={t('nav.contact')} newTab={t('nav.newTab')} />
    </header>
  );
}
