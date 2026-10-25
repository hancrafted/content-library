import { findEpisode } from '@/components/episodes/registry';
import type { Slide } from '@/components/slide-master/slide';
import { loadContentStore, type ContentStore, type RawContent, type Refusal } from '@/lib/content-store.pure';
import type { EpisodeMetadata, UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';
import { TAGS, type ListedEpisodeSlug } from '@/lib/episode-overview';
import { readResearchFiles } from '@/lib/research-files';
import { EPISODE_SLUGS } from '@/lib/routes';
import { EPISODES_DIR, readSlideFolders } from '@/lib/slide-folders';
import { WORKSHOPS } from '@/lib/workshops.pure';
import { episodeMetadata as aiAttentionSpan } from './ai-attention-span/episode-metadata';
import { episodeMetadata as aiGivesYouMoreWork } from './ai-gives-you-more-work/episode-metadata';
import { episodeMetadata as aiTokenEconomy } from './ai-token-economy/episode-metadata';
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

/** Upcoming Episodes in the order the overview lists them. */
export const UPCOMING: readonly UpcomingEpisodeMetadata[] = [];

/** Every source every Speaker note in every Episode cites, flattened to one record each. */
function slideSources(): RawContent['slideSources'] {
  return EPISODE_SLUGS.flatMap((slug) => {
    const episode = findEpisode(slug);
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
          slug: source.slug,
          url: source.url,
        })),
      ),
    );
  });
}

/** Every Slide folder, each marked when it holds its Episode's Title slide, whose slug is exempt from uniqueness. */
function slides(): RawContent['slides'] {
  const titles = new Set(
    EPISODE_SLUGS.flatMap((slug) => {
      const title = findEpisode(slug).title;
      return title === undefined ? [] : [`${EPISODES_DIR}/${slug}/slides/${title.slug}`];
    }),
  );
  return readSlideFolders(process.cwd()).map((folder) => ({ ...folder, title: titles.has(folder.path) }));
}

/** The raw records, gathered and untrusted. Exported so a test can feed the loader a broken copy. */
export function rawContent(): RawContent {
  return {
    tags: TAGS,
    episodes: [...Object.values(REGISTERED), ...UPCOMING],
    workshops: WORKSHOPS,
    research: readResearchFiles(process.cwd()),
    slideSources: slideSources(),
    slides: slides(),
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
