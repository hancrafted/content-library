import type { ExplorablePageInput } from '../schemas/explorable-page.schema';

export const explorablePage = {
  slug: 'software-ecology',
  tags: ['agentic-workflow'],
  visibility: 'public',
} as const satisfies ExplorablePageInput;
