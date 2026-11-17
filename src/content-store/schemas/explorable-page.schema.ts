import { z } from 'zod';
import { slug, tags, visibility, YOUTUBE_ID } from './fields';

export const explorablePageSchema = z
  .object({
    slug: slug.describe(
      "The Explorable page slug: its primary Explorable's folder name `explorables/<slug>/`, its composition folder's name `episodes/explorable-pages/<slug>/` and the last part of its URL",
    ),
    tags: tags.describe(
      'Tag ids from the closed vocabulary, lead Tag first: the overview shows them and gives the card its icon and accent',
    ),
    visibility: visibility.describe(
      'public is listed on /explorables/ and indexed; unlisted is built but noindex and not listed. A missing one is refused, so a forgotten field fails closed',
    ),
    youtube: z
      .record(z.string(), z.string().regex(YOUTUBE_ID, 'is no YouTube video id'))
      .optional()
      .describe(
        'The Video played from the Title slide, optional until uploaded: one YouTube video id per locale, by locale',
      ),
  })
  .describe('An Explorable page: its slug names its primary Explorable and gives its URL');

export type ExplorablePage = z.infer<typeof explorablePageSchema>;

export type ExplorablePageInput = z.input<typeof explorablePageSchema>;
