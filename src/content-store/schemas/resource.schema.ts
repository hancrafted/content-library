import { z } from 'zod';
import { RESOURCE_TYPES, slug, tags, visibility } from './fields';

/*
 * A Resource: a page that is not an Episode, an Explorable explanation, an Episode template or a Master slide, shaped
 * like an Episode (design-ADR 0019). Its composition is the folder `episodes/resources/<slug>/`, which also holds its
 * title, caption and description in its own Translation files. Its route is worked out from its type and slug, never stored.
 */

const type = z.enum(RESOURCE_TYPES, {
  error: (issue) =>
    issue.input === undefined
      ? `is required, one of ${RESOURCE_TYPES.join(', ')}`
      : `is "${String(issue.input)}", but must be one of ${RESOURCE_TYPES.join(', ')}`,
});

export const resourceSchema = z
  .object({
    slug: slug.describe(
      "The Resource slug: its composition folder's name `episodes/resources/<slug>/` and the last part of its URL",
    ),
    type: type.describe(
      'What kind of Resource it is; it decides the URL path (`/explorable-explanations/<slug>/`, `/episode-templates/<slug>/`, `/master-slides/<slug>/`) and the overview filter',
    ),
    tags: tags.describe(
      'Tag ids from the closed vocabulary, lead Tag first: the overview searches and filters by them',
    ),
    visibility: visibility.describe(
      'public is listed on /resources/ and indexed; unlisted is built but noindex and not listed. A missing one is refused, so a forgotten field fails closed',
    ),
  })
  .describe('A page that is not an Episode, shaped like one: its type and slug give its URL');

/** A Resource record, as the store loads it. */
export type Resource = z.infer<typeof resourceSchema>;

/** A Resource record as its file writes it, before the store parses it. */
export type ResourceInput = z.input<typeof resourceSchema>;
