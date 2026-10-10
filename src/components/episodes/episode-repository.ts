import type { EpisodeMetadata, PublishedEpisodeMetadata, UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';
import type { ListedEpisodeSlug } from '@/lib/episode-overview';
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
 * Published Episodes by slug. Typed against the registered slugs, so a
 * registered Episode without metadata, or a key naming another Episode's
 * metadata, fails `tsc`.
 */
const PUBLISHED: { readonly [S in ListedEpisodeSlug]: PublishedEpisodeMetadata & { readonly slug: S } } = {
  'amnesiac-freelancer': amnesiacFreelancer,
  'maintaining-markdown-for-ai': maintainingMarkdownForAi,
  'ai-token-economy': aiTokenEconomy,
};

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
