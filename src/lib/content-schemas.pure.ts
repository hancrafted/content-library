import { z } from 'zod';
import { ACCENTS, ICONS } from './episode-overview';

/*
 * The schemas the content store loads each record kind through. They are its contract, so each field says what it
 * is for. Nothing here reads a file.
 */

export const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const CLOCK = /^\d{2}:\d{2}$/;
export const RESEARCH_ID = /^([A-Z]+-\d{4})__[a-z0-9]+(-[a-z0-9]+)*$/;

/** Only a date that survives a round trip is a day: `2026-02-30` has the shape but is not one. */
function isCalendarDay(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

const isoDay = (what: string) =>
  z
    .string()
    .regex(ISO_DAY)
    .refine(isCalendarDay, 'is not a real calendar day')
    .describe(`${what}, a real calendar day written YYYY-MM-DD`);

const slugOf = (what: string) => z.string().regex(KEBAB, 'must be kebab-case').describe(what);

/** What each record kind is: the name every refusal carries. */
export type RecordKind = 'tag' | 'episode' | 'workshop' | 'research' | 'slide-source' | 'slide';

export const tagSchema = z
  .object({
    icon: z.enum(ICONS).describe('The icon the landing draws on a card led by this Tag, by name'),
    accent: z.enum(ACCENTS).describe('The colour family a card led by this Tag draws; the design owns the shade'),
  })
  .describe('The look one Tag gives its Episodes');

const sharedEpisode = {
  slug: slugOf('The Episode slug: its folder name and the last part of its URL'),
  format: z.enum(['foundations', 'teardown', 'short']).describe('The Episode format the overview filters by'),
  tags: z
    .array(z.string())
    .describe('Tag ids from the closed vocabulary, lead Tag first: it gives the Episode card its icon and accent'),
};

export const episodeSchema = z
  .discriminatedUnion('status', [
    z.object({
      ...sharedEpisode,
      status: z.literal('published').describe('The Episode has a page and is announced'),
      publishedOn: isoDay('The release date'),
    }),
    z.object({
      ...sharedEpisode,
      status: z.literal('upcoming').describe('The Episode is announced but not written: no page, no link'),
    }),
  ])
  .describe('What an Episode declares about itself for the overview');

export const workshopSchema = z
  .object({
    slug: slugOf('A readable name and the date, so a shared link says what and when'),
    date: isoDay('The day the Workshop takes place'),
    time: z.string().regex(CLOCK, 'must be HH:MM').optional().describe('The start as the venue writes it, HH:MM'),
    location: z.string().min(1).optional().describe('A place name, the same in every locale'),
    episodes: z.array(z.string()).describe('Episode slugs in the order the Workshop teaches them'),
  })
  .describe('A dated, ordered set of Episodes');

export const slideSourceSchema = z
  .object({
    episode: slugOf('The Episode whose Slide cites the source'),
    slide: slugOf('The Slide whose Speaker note cites the source'),
    note: slugOf('The Speaker note item that carries the source'),
    slug: slugOf('The source slug, the key of its title in the Slide translation files'),
    url: z.url().describe('The address the source links to'),
  })
  .describe('One source a Speaker note cites');

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
  })
  .describe('One Slide folder, wherever it lives');

export const researchSchema = z
  .object({
    type: z.literal('research').describe('The kind of Staging file this is'),
    title: z.string().min(1).describe('The question, written as one'),
    description: z.string().min(1).max(200).describe('The answer in one sentence, at most 200 characters'),
    generated: z
      .object({
        by: z.string().min(1).describe('Who or what wrote the file'),
        at: z.string().min(1).describe('When the file was written, a UTC datetime'),
      })
      .describe('The provenance of the file'),
    stale_after: z.string().min(1).optional().describe('The instant after which the answer needs a re-run'),
    sources: z
      .array(
        z.object({
          id: z.number().int().positive().describe('The number the body cites as [n]'),
          resource: z.string().min(1).describe('The address of the source'),
          title: z.string().min(1).describe('The source as a reader would name it'),
        }),
      )
      .describe('The sources the answer rests on, numbered 1..n'),
  })
  .describe('The frontmatter of one research file');

/** The schemas the store loads each kind through, for a caller that needs the contract itself. */
export const CONTENT_SCHEMAS = {
  tag: tagSchema,
  episode: episodeSchema,
  workshop: workshopSchema,
  slideSource: slideSourceSchema,
  slideFolder: slideFolderSchema,
  research: researchSchema,
} as const;

export type SlideSource = z.infer<typeof slideSourceSchema>;
export type SlideFolder = z.infer<typeof slideFolderSchema>;
export type ResearchFrontmatter = z.infer<typeof researchSchema>;
