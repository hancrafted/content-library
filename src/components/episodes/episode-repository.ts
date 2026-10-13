import type { EpisodeMetadata, UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';
import { FEATURED, type ListedEpisodeSlug } from '@/lib/episode-overview';
import { episodeMetadata as aiCodeReviewInCi } from './ai-code-review-in-ci/episode-metadata';
import { episodeMetadata as aiTokenEconomy } from './ai-token-economy/episode-metadata';
import { episodeMetadata as amnesiacFreelancer } from './amnesiac-freelancer/episode-metadata';
import { episodeMetadata as choosingTheRightModel } from './choosing-the-right-model/episode-metadata';
import { episodeMetadata as maintainingMarkdownForAi } from './maintaining-markdown-for-ai/episode-metadata';
import { episodeMetadata as rollingOutAiInATeam } from './rolling-out-ai-in-a-team/episode-metadata';
import { episodeMetadata as specsAnAgentCanFollow } from './specs-an-agent-can-follow/episode-metadata';
import { episodeMetadata as theBottleneckBuildsTheFix } from './the-bottleneck-builds-the-fix/episode-metadata';
import { episodeMetadata as verifyingAiWrittenDocs } from './verifying-ai-written-docs/episode-metadata';

/*
 * The Episode overview's read API (#40): every Episode's own metadata,
 * collected by explicit imports as the registry collects records. No glob, no
 * codegen, no React (FE-007 §3). The one seam a database would replace.
 */

/**
 * Episodes that have a page, by slug: every registered listed one. Its
 * `status` decides published or upcoming, not membership here; an upcoming one
 * with a page sits among them. Typed against the registered slugs, so a
 * registered Episode without metadata, or a key naming another Episode's
 * metadata, fails `tsc`.
 */
const PUBLISHED = {
  'amnesiac-freelancer': amnesiacFreelancer,
  'maintaining-markdown-for-ai': maintainingMarkdownForAi,
  'ai-token-economy': aiTokenEconomy,
} as const satisfies { readonly [S in ListedEpisodeSlug]: EpisodeMetadata & { readonly slug: S } };

/** The slugs whose metadata says `published`. */
type PublishedSlug = {
  [S in keyof typeof PUBLISHED]: (typeof PUBLISHED)[S]['status'] extends 'published' ? S : never;
}[keyof typeof PUBLISHED];

/** The Featured slugs, typed so `tsc` refuses one that names an upcoming Episode. */
export function featuredSlugs(): readonly PublishedSlug[] {
  return FEATURED;
}

/** Upcoming Episodes in the order the overview lists them. */
const UPCOMING: readonly UpcomingEpisodeMetadata[] = [
  specsAnAgentCanFollow,
  aiCodeReviewInCi,
  verifyingAiWrittenDocs,
  choosingTheRightModel,
  rollingOutAiInATeam,
  theBottleneckBuildsTheFix,
];

/** Every Episode's metadata: the published ones, then the upcoming ones in overview order. */
export function listEpisodes(): readonly EpisodeMetadata[] {
  return [...Object.values(PUBLISHED), ...UPCOMING];
}
