import type { ExplorablePageInput } from '../schemas/explorable-page.schema';

export const explorablePage = {
  slug: 'context-window',
  tags: ['context-engineering'],
  visibility: 'public',
} as const satisfies ExplorablePageInput;
