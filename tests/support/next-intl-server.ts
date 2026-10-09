import { TRANSLATIONS } from '@/i18n/translations';
import type { Locale } from '@/lib/locale.pure';

/**
 * Stand-in for `next-intl/server` in the fast vitest suite, wired in by
 * `vitest.config.ts`. The real `getTranslations` needs a Next request scope
 * and the react-server build of next-intl. This one reads the same Translation
 * files, so an Episode's `content(locale)` runs unchanged and a missing key
 * still throws, as in the static build. It returns each string as written, with
 * no ICU formatting, so use it to read structure, never wording.
 */
export async function getTranslations({ locale, namespace }: { locale: Locale; namespace?: string }) {
  const read = (key: string): string => {
    const path = [...(namespace?.split('.') ?? []), ...key.split('.')];
    const leaf = path.reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      TRANSLATIONS[locale],
    );
    if (typeof leaf !== 'string') throw new Error(`Missing Translation key "${path.join('.')}" in ${locale}.`);
    return leaf;
  };
  const has = (key: string): boolean => {
    try {
      read(key);
      return true;
    } catch {
      return false;
    }
  };
  return Object.assign((key: string) => read(key), {
    rich: (key: string) => read(key),
    markup: (key: string) => read(key),
    raw: (key: string) => read(key),
    has,
  });
}
