import type { ExplorablePageSlug } from '@/content-store/catalogue/record-routes';
import type { Story } from '@/episodes/components/slide-shared/explorable-hero/drift.pure';

/** The Message drift each Explorable page's hero draws, which its card strip stills; a new page adds its row here. */
export const STORY_OF: Record<ExplorablePageSlug, Story> = {
  'ai-disciplines': 'ai-disciplines',
  'context-window': 'context-window',
  'human-in-the-loop': 'human-in-the-loop',
};
