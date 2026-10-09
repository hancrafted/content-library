import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import { translationStrings, type TranslationNode } from './translation-strings.pure';
import { TRANSLATIONS, type Messages } from './translations';

/** A top-level Translation file namespace made only of strings, such as `tableOfContents` or `contextDrawer`. */
type StringNamespace = { [N in keyof Messages]: Messages[N] extends TranslationNode ? N : never }[keyof Messages];

/**
 * The typed Translation file namespace reader: a namespace's strings in `locale`, read
 * through next-intl, shaped and typed as the Translation file itself. Replaces a
 * hand-written `t('…')` per label, so a key added to the Translation file arrives
 * without a second edit. `omit` names the top-level keys that need ICU
 * arguments; the caller formats those itself.
 */
export async function readTranslationStrings<N extends StringNamespace, K extends keyof Messages[N] & string = never>(
  locale: Locale,
  namespace: N,
  omit: readonly K[] = [],
): Promise<Omit<Messages[N], K>> {
  const t = await getTranslations({ locale });
  // Every key is a leaf path walked out of the typed Translation file itself, so it exists by construction.
  const read = (key: string) => t(key as Parameters<typeof t>[0]);
  return translationStrings(namespace, TRANSLATIONS[locale][namespace] as Messages[N] & TranslationNode, {
    read,
    omit,
  });
}
