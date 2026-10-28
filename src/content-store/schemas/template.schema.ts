import { z } from 'zod';
import { TEMPLATE_TYPES, slug, tags, visibility } from './fields';

/*
 * A Template: an Episode template or a Master slide, a page that is not an Episode, shaped
 * like an Episode (design-ADR 0019). Its composition is the folder `episodes/templates/<slug>/`, which also holds its
 * title, caption and description in its own Translation files. Its route is worked out from its type and slug, never stored.
 */

const type = z.enum(TEMPLATE_TYPES, {
  error: (issue) =>
    issue.input === undefined
      ? `is required, one of ${TEMPLATE_TYPES.join(', ')}`
      : `is "${String(issue.input)}", but must be one of ${TEMPLATE_TYPES.join(', ')}`,
});

export const templateSchema = z
  .object({
    slug: slug.describe(
      "The Template slug: its composition folder's name `episodes/templates/<slug>/` and the last part of its URL",
    ),
    type: type.describe(
      'What kind of Template it is; it decides the URL path (`/episode-templates/<slug>/`, `/master-slides/<slug>/`) and the overview filter',
    ),
    tags: tags.describe(
      'Tag ids from the closed vocabulary, lead Tag first: the overview searches and filters by them',
    ),
    visibility: visibility.describe(
      'public is listed on /resources/ and indexed; unlisted is built but noindex and not listed. A missing one is refused, so a forgotten field fails closed',
    ),
  })
  .describe('A page that is not an Episode, shaped like one: its type and slug give its URL');

/** A Template record, as the store loads it. */
export type Template = z.infer<typeof templateSchema>;

/** A Template record as its file writes it, before the store parses it. */
export type TemplateInput = z.input<typeof templateSchema>;
