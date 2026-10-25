import { z } from 'zod';
import { slugOf } from './kebab.pure';

/*
 * One Speaker note source item (design-ADR 0016, Citations rules 7 and 8): a Research question by id by default, a
 * Source by URL by exception, never both and never neither. The content store loads each item through this schema.
 */

export const slideSourceSchema = z
  .strictObject({
    episode: slugOf('The Episode whose Slide cites the source'),
    slide: slugOf('The Slide whose Speaker note cites the source'),
    note: slugOf('The Speaker note item that carries the source'),
    slug: slugOf('The source slug; a url item keeps its title under this key in the Slide translation files'),
    research: z
      .string()
      .regex(/^[A-Z]+-\d{4}$/, 'must be a Research question id such as AIE-0001')
      .optional()
      .describe('The Research question the note cites, by id; its title, link and confidence come from the question'),
    url: z.url().optional().describe('The address of a Source the note cites directly, the exception to research'),
  })
  .refine(({ research, url }) => (research === undefined) !== (url === undefined), {
    message: 'a source item holds exactly one of research or url',
  })
  .describe('One source a Speaker note cites: a Research question by default, a Source directly by exception');

/** A source item, typed as the contract allows it: exactly one of `research` or `url` (design-ADR 0016, rule 7). */
export type SlideSource = Omit<z.infer<typeof slideSourceSchema>, 'research' | 'url'> &
  ({ readonly research: string; readonly url?: undefined } | { readonly url: string; readonly research?: undefined });
