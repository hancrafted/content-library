import { findEpisode } from '@/components/episodes/registry';
import type { EpisodeRecord, Slide } from '@/components/slide-master/slide';
import { loadContentStore, type ContentStore, type RawContent, type Refusal } from '@/lib/content-store.pure';
import type { EpisodeMetadata, UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';
import { CONCEPT_THEMES, type ListedEpisodeSlug } from '@/lib/episode-overview';
import { EVENTS } from '@/lib/events.pure';
import { readConceptFiles, readResearchFiles, readResearchPlans } from '@/lib/evidence-files';
import { PLAYLISTS } from '@/lib/playlists.pure';
import { ANY_EPISODE_SLUGS, type UnlistedEpisodeSlug } from '@/lib/routes';
import { EPISODES_DIR, readSlideFolders, type SlideFolderPath } from '@/lib/slide-folders';
import SOURCE_BASELINE from '@/lib/source-baseline.json';
import { TOOLING_SLUGS } from '@/lib/tooling-pages';
import { episodeMetadata as aiAttentionSpan } from './ai-attention-span/episode-metadata';
import { episodeMetadata as aiGivesYouMoreWork } from './ai-gives-you-more-work/episode-metadata';
import { episodeMetadata as aiTokenEconomy } from './ai-token-economy/episode-metadata';
import { episodeMetadata as axelAgenticWorkflowAgenda } from './axel-agentic-workflow-agenda/episode-metadata';
import { episodeMetadata as maintainingMarkdownForAi } from './maintaining-markdown-for-ai/episode-metadata';
import { episodeMetadata as neverTooEarlySales } from './never-too-early-sales/episode-metadata';
import { episodeMetadata as onboardAiEveryTime } from './onboard-ai-every-time/episode-metadata';

/*
 * The app's one content store: the records gathered by explicit imports as the registry collects them, no glob, no
 * codegen, no React (FE-007 §3), loaded once through their schemas. Pages, the sitemap and the checks read it and
 * never the records. A refusal here is a build failure that names every record at fault.
 */

/**
 * Episodes that have a page, by slug: every registered listed one. Typed against the registered slugs, so a
 * registered Episode without metadata, or a key naming another Episode's metadata, fails `tsc`.
 */
export const REGISTERED = {
  'maintaining-markdown-for-ai': maintainingMarkdownForAi,
  'ai-token-economy': aiTokenEconomy,
  'never-too-early-sales': neverTooEarlySales,
  'onboard-ai-every-time': onboardAiEveryTime,
  'ai-attention-span': aiAttentionSpan,
  'ai-gives-you-more-work': aiGivesYouMoreWork,
} as const satisfies { readonly [S in ListedEpisodeSlug]: EpisodeMetadata & { readonly slug: S } };

/** Unlisted Episodes, by slug: each lives only under the Event whose Playlist presents it. */
export const UNLISTED = {
  'axel-agentic-workflow-agenda': axelAgenticWorkflowAgenda,
} as const satisfies { readonly [S in UnlistedEpisodeSlug]: EpisodeMetadata & { readonly slug: S } };

/** Upcoming Episodes in the order the overview lists them. */
export const UPCOMING: readonly UpcomingEpisodeMetadata[] = [];

/**
 * Every Slide record the store reads: each Episode's, listed or unlisted, and each tooling page's. An unlisted Episode
 * has every ability a listed one has (product vision, rule 4), so every gatherer below reads this one list.
 */
const RECORD_SLUGS = [...ANY_EPISODE_SLUGS, ...TOOLING_SLUGS] as const;

/** Looks up one Slide record by slug: the registry's, or a test's stand-in. */
type FindRecord = (slug: string) => EpisodeRecord;

/** Every source every Speaker note in every Episode and tooling page cites, flattened to one record each. */
function slideSources(find: FindRecord): RawContent['slideSources'] {
  return RECORD_SLUGS.flatMap((slug) => {
    const episode = find(slug);
    const slides: readonly { slide: string; notes: Slide['notes'] }[] = [
      { slide: 'title', notes: episode.notes ?? [] },
      ...episode.sections.flatMap((section) => section.map((each) => ({ slide: each.slug, notes: each.notes }))),
    ];
    return slides.flatMap(({ slide, notes }) =>
      notes.flatMap((note) =>
        (note.sources ?? []).map((source) => ({
          episode: slug,
          slide,
          note: note.slug,
          ...source,
        })),
      ),
    );
  });
}

/** Every Definition Slide in every Episode and tooling page: a Slide that declares the Concept it defines. */
function definitionSlides(find: FindRecord): RawContent['definitionSlides'] {
  return RECORD_SLUGS.flatMap((episode) =>
    find(episode).sections.flatMap((section) =>
      section.flatMap(({ slug, defines }) => (defines === undefined ? [] : [{ episode, slide: slug, defines }])),
    ),
  );
}

/**
 * Every Slide folder, each marked when it holds its Episode's Title slide, whose slug is exempt from uniqueness, and,
 * for an instance, with the slug it was copied from. An instance lives in its own Episode's `slides/`.
 */
function slides(find: FindRecord, folders: readonly SlideFolderPath[]): RawContent['slides'] {
  const titles = new Set(
    RECORD_SLUGS.flatMap((slug) => {
      const title = find(slug).title;
      return title === undefined ? [] : [`${EPISODES_DIR}/${slug}/slides/${title.slug}`];
    }),
  );
  const origins = new Map<string, string>(
    RECORD_SLUGS.flatMap((slug) =>
      find(slug).sections.flatMap((section) =>
        section.flatMap(({ slug: own, copiedFrom }) =>
          copiedFrom === undefined ? [] : [[`${EPISODES_DIR}/${slug}/slides/${own}`, copiedFrom.slug] as const],
        ),
      ),
    ),
  );
  return folders.map((folder) => {
    const copiedFrom = origins.get(folder.path);
    return { ...folder, title: titles.has(folder.path), ...(copiedFrom !== undefined && { copiedFrom }) };
  });
}

/** Every Pinned anchor: each Episode's reference to a pool Slide placed under a retired instance slug. */
function pins(find: FindRecord): RawContent['pins'] {
  return RECORD_SLUGS.flatMap((episode) =>
    find(episode).sections.flatMap((section) =>
      section.flatMap(({ pinnedSlug }) => (pinnedSlug === undefined ? [] : [{ episode, slug: pinnedSlug }])),
    ),
  );
}

/** Each Episode's Slide list, the Slides its Sections place, so the store can tell an Episode derived from another. */
function episodeSlides(find: FindRecord): RawContent['episodeSlides'] {
  return ANY_EPISODE_SLUGS.map((episode) => ({
    episode,
    slides: find(episode).sections.flatMap((section) => section.map(({ slug }) => slug)),
  }));
}

/**
 * The raw records, gathered and untrusted. Exported so a test can feed the loader a broken copy, or gather from a
 * stand-in Slide record and Slide folders.
 */
export function rawContent(
  find: FindRecord = findEpisode,
  folders: readonly SlideFolderPath[] = readSlideFolders(process.cwd()),
): RawContent {
  return {
    themes: CONCEPT_THEMES,
    concepts: readConceptFiles(process.cwd()),
    definitionSlides: definitionSlides(find),
    episodes: [...Object.values(REGISTERED), ...Object.values(UNLISTED), ...UPCOMING],
    episodeSlides: episodeSlides(find),
    events: EVENTS,
    playlists: PLAYLISTS,
    research: readResearchFiles(process.cwd()),
    slideSources: slideSources(find),
    sourceBaseline: SOURCE_BASELINE,
    slides: slides(find, folders),
    pins: pins(find),
    researchPlans: readResearchPlans(process.cwd()),
  };
}

let loaded: ContentStore | undefined;

function describeRefusals(refusals: readonly Refusal[]): string {
  return refusals.map(({ kind, record, message }) => `  ${kind} ${record}: ${message}`).join('\n');
}

/** The content store, loaded once. It throws, naming every refusal, when a record is malformed: the build stops. */
export function contentStore(): ContentStore {
  if (loaded === undefined) {
    const result = loadContentStore(rawContent());
    if (!result.ok)
      throw new Error(
        `The content store refused ${result.refusals.length} record(s):\n${describeRefusals(result.refusals)}`,
      );
    loaded = result.store;
  }
  return loaded;
}
