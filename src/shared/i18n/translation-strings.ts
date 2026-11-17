import type { Locale } from '@/shared/lib/locale.pure';
import type { Messages } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { translationStrings, type TranslationNode } from './translation-strings.pure';

type StringNamespace = { [N in keyof Messages]: Messages[N] extends TranslationNode ? N : never }[keyof Messages];

export async function readTranslationStrings<N extends StringNamespace, K extends keyof Messages[N] & string = never>(
  locale: Locale,
  namespace: N,
  omit: readonly K[] = [],
): Promise<Omit<Messages[N], K>> {
  const t = await getTranslations({ locale });
  const read = (key: string) => t(key as Parameters<typeof t>[0]);
  return translationStrings(
    namespace,
    t.raw(namespace as Parameters<typeof t.raw>[0]) as Messages[N] & TranslationNode,
    {
      read,
      omit,
    },
  );
}
