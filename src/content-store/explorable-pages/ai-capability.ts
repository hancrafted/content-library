import type { ExplorablePageInput } from '../schemas/explorable-page.schema';

export const explorablePage = {
  slug: 'ai-capability',
  tags: ['agentic-ai', 'workflow'],
  visibility: 'public',
} as const satisfies ExplorablePageInput;
