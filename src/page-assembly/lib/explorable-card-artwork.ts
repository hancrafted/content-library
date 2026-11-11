import type { ExplorablePageSlug } from '@/content-store/catalogue/record-routes';

/** Selected concept diagrams, shared by both overview projections; hero stories remain independent. */
export const EXPLORABLE_CARD_ARTWORK = {
  'context-window': 'intention-capacity',
  'human-in-the-loop': 'review-funnel',
  'ai-capability': 'cumulative-orchestration',
  'software-ecology': 'review-funnel',
} as const satisfies Record<ExplorablePageSlug, string>;
