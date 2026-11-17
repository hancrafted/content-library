import { z } from 'zod';
import { TEMPLATE_TYPES, slug, tags, visibility } from './fields';

// decision: docs/adr/0019-resources-overview.md
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
      'What kind of Template it is; it decides the URL path (`/episode-templates/<slug>/`, `/master-slides/<slug>/`, `/themes/<slug>/`) and the overview filter',
    ),
    tags: tags.describe(
      'Tag ids from the closed vocabulary, lead Tag first: the overview searches and filters by them',
    ),
    visibility: visibility.describe(
      'public is listed on /resources/ and indexed; unlisted is built but noindex and not listed. A missing one is refused, so a forgotten field fails closed',
    ),
  })
  .describe('A page that is not an Episode, shaped like one: its type and slug give its URL');

export type Template = z.infer<typeof templateSchema>;

export type TemplateInput = z.input<typeof templateSchema>;
