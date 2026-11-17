import { z } from 'zod';
import { slug, tags, visibility, YOUTUBE_ID } from './fields';

// decision: docs/adr/0019-resources-overview.md
export const guideSchema = z
  .object({
    slug: slug.describe(
      "The Guide slug: its composition folder's name `episodes/guides/<slug>/` and the last part of its URL `/guides/<slug>/`",
    ),
    tags: tags.describe(
      'Tag ids from the closed vocabulary, lead Tag first: the overviews show them and give the card its icon and accent',
    ),
    visibility: visibility.describe(
      'public is listed on /guides/ and /resources/ and indexed; unlisted is built but noindex and not listed. A missing one is refused, so a forgotten field fails closed',
    ),
    youtube: z
      .record(z.string(), z.string().regex(YOUTUBE_ID, 'is no YouTube video id'))
      .optional()
      .describe(
        'The Video played from the Title slide, optional until uploaded: at most one YouTube video id per locale, by locale',
      ),
  })
  .describe('A Guide: a step-by-step page; its slug gives its URL');

export type Guide = z.infer<typeof guideSchema>;

export type GuideInput = z.input<typeof guideSchema>;
