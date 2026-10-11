import '@/app/globals.css';
import { SiteHeader } from '@/components/site-header';
import type { Locale } from '@/lib/locale.pure';
import { buildThemeInitScript } from '@/lib/theme.pure';
import { createElement, type ReactNode } from 'react';

const THEME_INIT_SCRIPT = buildThemeInitScript();

/**
 * The `<html>` document every root layout renders. English and German each have
 * their own root layout (see README), and both delegate here.
 */
export async function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  // Dev-only. The condition is a build-time constant, so `next build` drops the import and the editor's chunk is never emitted.
  const devTools =
    process.env.NODE_ENV === 'development'
      ? (await import('@/components/design-system-token-editor/token-editor-loader.client')).DesignSystemTokenEditor
      : null;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {/* First in <body>: sets the theme class before anything below paints. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <SiteHeader locale={locale} />
        {children}
        {devTools && createElement(devTools)}
      </body>
    </html>
  );
}
