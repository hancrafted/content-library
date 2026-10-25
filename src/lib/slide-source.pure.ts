import type { z } from 'zod';
import type { slideSourceSchema } from './content-schemas.pure';

/** A source item, typed as the contract allows it: exactly one of `research` or `url` (design-ADR 0016, rule 7). */
export type SlideSource = Omit<z.infer<typeof slideSourceSchema>, 'research' | 'url'> &
  ({ readonly research: string; readonly url?: undefined } | { readonly url: string; readonly research?: undefined });
