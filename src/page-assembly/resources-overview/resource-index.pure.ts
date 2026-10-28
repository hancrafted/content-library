import type { TagId } from '@/content-store/schemas/fields';
import { TEMPLATE_TYPES } from '@/content-store/schemas/fields';
import type { Locale } from '@/shared/lib/locale.pure';

/*
 * The Resource index's shape (GLOSSARY, `docs/features/resources.md`): one plain, serializable entry per listed page
 * and locale, so a later machine-readable index can serialize it as is. No React (FE-007 §3).
 */

/** What a Resource is, the closed list the kind filter offers in its order: a Template is its type. */
export const RESOURCE_KINDS = ['episode', 'event', 'explorable-page', ...TEMPLATE_TYPES] as const;

export type ResourceKind = (typeof RESOURCE_KINDS)[number];

/** One listed page in one locale. */
export interface ResourceEntry {
  readonly kind: ResourceKind;
  /** The page's slug: unique within its kind. */
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  /** The page's Tags in its record's order, lead Tag first. */
  readonly tags: readonly TagId[];
  /** The page's locale-neutral logical path. */
  readonly route: string;
  /** `route` as `locale` writes it: the page's URL below the site's base path. */
  readonly url: string;
  readonly locale: Locale;
}
