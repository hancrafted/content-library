import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import { catalogStrings, type CatalogNode } from './catalog-strings.pure';
import { CATALOGS, type Messages } from './catalogs';

/** A top-level catalog namespace made only of strings, such as `tableOfContents` or `contextDrawer`. */
type StringNamespace = { [N in keyof Messages]: Messages[N] extends CatalogNode ? N : never }[keyof Messages];

/**
 * The typed catalog-namespace reader: a namespace's strings in `locale`, read
 * through next-intl, shaped and typed as the catalog itself. Replaces a
 * hand-written `t('…')` per label, so a key added to the catalog arrives
 * without a second edit. `omit` names the top-level keys that need ICU
 * arguments; the caller formats those itself.
 */
export async function readCatalogStrings<N extends StringNamespace, K extends keyof Messages[N] & string = never>(
  locale: Locale,
  namespace: N,
  omit: readonly K[] = [],
): Promise<Omit<Messages[N], K>> {
  const t = await getTranslations({ locale });
  // Every key is a leaf path walked out of the typed catalog itself, so it exists by construction.
  const read = (key: string) => t(key as Parameters<typeof t>[0]);
  return catalogStrings(namespace, CATALOGS[locale][namespace] as Messages[N] & CatalogNode, { read, omit });
}
