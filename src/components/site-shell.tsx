import '@/app/globals.css';
import { SiteHeader } from '@/components/site-header';
import type { Locale } from '@/lib/locale.pure';
import { buildThemeInitScript } from '@/lib/theme.pure';
import type { ReactNode } from 'react';

const THEME_INIT_SCRIPT = buildThemeInitScript();

/** Marks the document as scripted before first paint, so CSS may hide what JavaScript will reveal (FE-012). */
const JS_CLASS_SCRIPT = "document.documentElement.classList.add('js')";

/**
 * The `<html>` document every root layout renders. English and German each have
 * their own root layout (see README), and both delegate here.
 */
export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_CLASS_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased">
        {/* First in <body>: sets the theme class before anything below paints. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <SiteHeader locale={locale} />
        {children}
      </body>
    </html>
  );
}
