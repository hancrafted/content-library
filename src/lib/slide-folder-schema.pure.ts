import { z } from 'zod';
import { slugOf } from './kebab.pure';

/*
 * The schema the content store loads each Slide folder through: where it lives, its slug, and whether it is an
 * instance of a pool Slide. Nothing here reads a file.
 */

/** Where Slide folders live: an Episode's own `slides/`, or the Slide pool once a second Episode reuses one. */
export const SLIDE_FOLDER = /^src\/components\/(episodes\/[a-z0-9-]+\/slides|slide-pool)\/[a-z0-9-]+$/;

export const slideFolderSchema = z
  .object({
    path: z
      .string()
      .regex(SLIDE_FOLDER)
      .describe("The Slide folder, from the repository root: in an Episode's slides/ or in the Slide pool"),
    slug: slugOf('The Slide slug: the folder name, unique across every Episode and the Slide pool'),
    title: z
      .boolean()
      .describe("Whether the folder holds an Episode's Title slide, whose slug is exempt from uniqueness"),
    copiedFrom: slugOf('Set on an instance only: the slug of the pool Slide it was copied from').optional(),
  })
  .describe('One Slide folder, wherever it lives');

export type SlideFolder = z.infer<typeof slideFolderSchema>;
