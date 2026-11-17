import type { ExplorablePageSlug } from '@/content-store/catalogue/record-routes';

export const EXPLORABLE_CARD_ARTWORK = {
  'context-window': 'intention-capacity',
  'human-in-the-loop': 'review-funnel',
  'ai-capability': 'cumulative-orchestration',
  'software-ecology': 'review-funnel',
} as const satisfies Record<ExplorablePageSlug, string>;
