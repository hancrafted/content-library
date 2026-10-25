import { z } from 'zod';
import { episodeSlidesSchema } from './canonical-episode.pure';
import { CONFIDENCES } from './confidence.pure';
import { ACCENTS, ICONS } from './episode-overview';
import { AUDIENCES, EVENT_KINDS } from './events.pure';
import { slugOf } from './kebab.pure';
import { PLAYLIST_TYPES, VISIBILITIES } from './playlists.pure';
import { slideFolderSchema } from './slide-folder-schema.pure';
import { slideSourceSchema } from './slide-source.pure';

/*
 * The schemas the content store loads each record kind through. They are its contract, so each field says what it
 * is for. Nothing here reads a file.
 */

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

/** The records a Speaker note's citations rest on: its source items and the Source baseline. */
type CitationKind = 'slide-source' | 'source-baseline';
/** What each record kind is: the name every refusal carries. */
export type RecordKind =
  'theme' | 'concept' | 'episode' | 'event' | 'playlist' | 'research' | 'slide' | 'definition-slide' | CitationKind;

export const themeSchema = z
  .object({
    icon: z.enum(ICONS).describe('The icon the landing draws on a card themed by this top Concept, by name'),
    accent: z
      .enum(ACCENTS)
      .describe('The colour family a card themed by this top Concept draws; the design owns the shade'),
  })
  .describe('The look one top Concept gives the Episode cards that name it in applyThemeFromConcept');

const conceptIds = (what: string) => z.array(slugOf('A Concept id: the folder name of its concept.md')).describe(what);

const verification = z
  .object({
    by: z.string().min(1).describe('Who confirmed the file, as an OKF actor'),
    at: z.string().min(1).describe('When they confirmed it, a UTC datetime'),
  })
  .describe('One confirmation of the file');

export const conceptSchema = z
  .strictObject({
    type: z.literal('concept').describe('The kind of evidence file this is'),
    title: z.string().min(1).describe('The Concept name, in English'),
    description: z
      .string()
      .min(1)
      .max(200)
      .describe('The one-sentence scoping definition against its neighbours, at most 200 characters'),
    aliases: z
      .array(z.string().min(1))
      .optional()
      .describe('Other names for the Concept; a better name becomes an alias, the id never changes'),
    broader: conceptIds('SKOS broader: the parent Concept ids; [] makes a top Concept, the only kind with a theme'),
    related: conceptIds(
      'SKOS related: associative Concept ids, stored on one side only; the store mirrors them',
    ).optional(),
    generated: z
      .object({
        by: z.string().min(1).describe('Who or what wrote the file, as an OKF actor'),
        at: z.string().min(1).describe('When the file was written, a UTC datetime'),
      })
      .describe('The provenance of the file'),
    stale_after: z.string().min(1).optional().describe('The instant after which the definition needs a re-check'),
    verified: z
      .union([verification, z.array(verification)])
      .optional()
      .describe('OKF trust: who confirmed the file and when, one { by, at } or a list of them'),
  })
  .describe('The frontmatter of one Concept file; narrower is derived by the store, never written');

export const definitionSlideSchema = z
  .object({
    episode: slugOf('The Episode whose Slide it is'),
    slide: slugOf('The Slide slug'),
    defines: slugOf('The id of the Concept the Slide defines'),
  })
  .describe('A page Slide that teaches one Concept and declares it in defines');

const visibility = (what: string) =>
  z.enum(VISIBILITIES).describe(`${what}; unlisted is not private, and attendees waits for horizon 3`);

const sharedEpisode = {
  slug: slugOf('The Episode slug: its folder name and the last part of its URL, unique across all Episodes'),
  format: z.enum(['foundations', 'teardown', 'short']).describe('The Episode format the overview filters by'),
  concepts: z
    .array(z.string())
    .min(1)
    .describe('The top Concepts the Episode teaches, in the order its card names them'),
  applyThemeFromConcept: z
    .string()
    .describe('The top Concept, one of concepts, whose icon and accent the Episode card draws'),
};

export const episodeSchema = z
  .discriminatedUnion('status', [
    z.object({
      ...sharedEpisode,
      type: z
        .enum(['standard', 'event-frame'])
        .describe("standard teaches; event-frame holds one Event's agenda, scope and organisation, and has no video"),
      visibility: visibility(
        'public is listed and indexed at /episodes/<slug>/; unlisted lives only under its Event and is never listed',
      ),
      status: z.literal('published').describe('The Episode has a page and is announced'),
      publishedOn: isoDay('The release date'),
      canonicalEpisode: slugOf(
        'Unlisted only: the public Episode it derives from, which takes its search credit',
      ).optional(),
    }),
    z.object({
      ...sharedEpisode,
      type: z.literal('standard').describe('An upcoming Episode teaches: an event-frame Episode is always published'),
      visibility: z.literal('public').describe('Upcoming applies to public Episodes only'),
      status: z.literal('upcoming').describe('The Episode is announced but not written: no page, no link'),
    }),
  ])
  .refine((episode) => episode.type !== 'event-frame' || episode.visibility === 'unlisted', {
    message: 'an event-frame Episode is always unlisted',
    path: ['visibility'],
  })
  .describe('What an Episode declares about itself: its overview entry, its type and its visibility');

export const eventSchema = z
  .object({
    slug: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}-[a-z0-9]+(-[a-z0-9]+)*$/, 'must be <date>-<name> in kebab-case')
      .describe('The date, then a readable name, so a shared link says when and what'),
    date: isoDay('The day the Event takes place; before the build date, the Event is past'),
    kind: z.enum(EVENT_KINDS).describe('What kind of occasion it is; data, so the URL survives a change of kind'),
    time: z.string().regex(CLOCK, 'must be HH:MM').optional().describe('The start as the venue writes it, HH:MM'),
    location: z.string().min(1).optional().describe('A place name, the same in every locale'),
    audience: z.enum(AUDIENCES).describe('The Audience the Event targets'),
    playlist: slugOf("The id of the one Playlist of type event the Event presents; its visibility is the Event's"),
  })
  .describe('A dated occasion that presents one Playlist and owns no Slides and no text');

export const playlistSchema = z
  .object({
    id: slugOf('The Playlist id an Event names'),
    type: z
      .enum(PLAYLIST_TYPES)
      .describe('event: made for one Event, opening with its event-frame Episode; standard: curated, no Event'),
    visibility: visibility("Whether the Playlist's own surfaces, an Event's pages included, are listed and indexed"),
    episodes: z.array(z.string()).min(1).describe('Episode slugs in the order the Playlist presents them'),
  })
  .describe('An ordered list of Episodes with a type and a visibility, and nothing else');

export const researchSchema = z
  .object({
    type: z.literal('research').describe('The kind of Staging file this is'),
    title: z.string().min(1).describe('The question, written as one'),
    description: z.string().min(1).max(200).describe('The answer in one sentence, at most 200 characters'),
    confidence: z
      .enum(CONFIDENCES)
      .describe(
        "How settled the evidence for the Answer is, never the writer's certainty: settled, contested or open, by the definitions in CONFIDENCE_DEFINITIONS",
      ),
    confidence_reason: z
      .string()
      .min(1)
      .describe(
        "The writer's one line on which Sources earn the confidence, the reason Han reads when he confirms it at the Promotion Gate",
      ),
    informs: conceptIds('The Concepts the question informs, the first the main one').min(
      1,
      'names no Concept: a Research question informs at least one, the first its main one',
    ),
    supersedes: z
      .array(
        z
          .string()
          .regex(/^[A-Z]+-\d{4}$/)
          .describe('A Research question id'),
      )
      .optional()
      .describe(
        'The ids merged into this question at the Promotion Gate, each retired: never reused, every citation re-pointed here',
      ),
    generated: z
      .object({
        by: z.string().min(1).describe('Who or what wrote the file'),
        at: z.string().min(1).describe('When the file was written, a UTC datetime'),
      })
      .describe('The provenance of the file'),
    stale_after: z.string().min(1).optional().describe('The instant after which the answer needs a re-run'),
    verified: z
      .union([verification, z.array(verification)])
      .optional()
      .describe(
        'OKF trust: who confirmed the file and when; an entry by human:han at or after generated.at confirms confidence and informs',
      ),
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
  theme: themeSchema,
  concept: conceptSchema,
  definitionSlide: definitionSlideSchema,
  episode: episodeSchema,
  episodeSlides: episodeSlidesSchema,
  event: eventSchema,
  playlist: playlistSchema,
  slideSource: slideSourceSchema,
  slideFolder: slideFolderSchema,
  research: researchSchema,
} as const;

export type ConceptFrontmatter = z.infer<typeof conceptSchema>;
export type DefinitionSlide = z.infer<typeof definitionSlideSchema>;
export type ResearchFrontmatter = z.infer<typeof researchSchema>;
