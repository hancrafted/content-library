import type { TagId } from '@/content-store/schemas/fields';
import { TEMPLATE_TYPES } from '@/content-store/schemas/fields';
import type { Locale } from '@/shared/lib/locale.pure';

// decision: FE-007 §3
export const RESOURCE_KINDS = ['episode', 'event', 'explorable-page', 'guide', ...TEMPLATE_TYPES] as const;

export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export interface ResourceEntry {
  readonly kind: ResourceKind;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly TagId[];
  readonly route: string;
  readonly url: string;
  readonly locale: Locale;
}
