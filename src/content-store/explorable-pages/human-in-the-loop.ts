import type { ExplorablePageInput } from '../schemas/explorable-page.schema';

export const explorablePage = {
  slug: 'human-in-the-loop',
  tags: ['agentic-ai', 'agentic-workflow'],
  visibility: 'public',
} as const satisfies ExplorablePageInput;
