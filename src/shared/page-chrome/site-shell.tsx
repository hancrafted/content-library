import '@/app/globals.css';
import { InkPage } from '@/shared/components/animations/magnetic-ink.client';
import type { Locale, LocalesByRoute } from '@/shared/lib/locale.pure';
import { buildThemeInitScript } from '@/shared/lib/theme.pure';
import { SiteBackToTop } from '@/shared/page-chrome/back-to-top.client';
import { SiteHeader } from '@/shared/page-chrome/header/site-header';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

const THEME_INIT_SCRIPT = buildThemeInitScript();

// decision: docs/adr/0012-slide-header-and-play-once-motion.md
const JS_CLASS_SCRIPT = "document.documentElement.classList.add('js')";

export async function SiteShell({
  locale,
  localesByRoute,
  navSections,
  children,
}: {
  locale: Locale;
  localesByRoute: LocalesByRoute;
  navSections: readonly string[];
  children: ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: 'tableOfContents' });
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_CLASS_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <InkPage>
          <SiteHeader locale={locale} localesByRoute={localesByRoute} navSections={navSections} />
          {children}
          <SiteBackToTop label={t('backToTop')} />
        </InkPage>
      </body>
    </html>
  );
}
