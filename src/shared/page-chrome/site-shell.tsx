import '@/app/globals.css';
import type { Locale, LocalesByRoute } from '@/shared/lib/locale.pure';
import { buildThemeInitScript } from '@/shared/lib/theme.pure';
import { SiteHeader } from '@/shared/page-chrome/header/site-header';
import type { ReactNode } from 'react';

const THEME_INIT_SCRIPT = buildThemeInitScript();

/** Marks the document as scripted before first paint, so CSS may hide what JavaScript will reveal (design-ADR-0012). */
const JS_CLASS_SCRIPT = "document.documentElement.classList.add('js')";

/**
 * The `<html>` document every root layout renders. English and German each have
 * their own root layout (see README), and both delegate here. Page chrome reads no record: the layout hands in the
 * locales of each page not exported in every locale (`localesByRoute`), for the locale toggle.
 */
export function SiteShell({
  locale,
  localesByRoute,
  children,
}: {
  locale: Locale;
  localesByRoute: LocalesByRoute;
  children: ReactNode;
}) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_CLASS_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased">
        {/* First in <body>: sets the theme class before anything below paints. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <SiteHeader locale={locale} localesByRoute={localesByRoute} />
        {children}
      </body>
    </html>
  );
}
