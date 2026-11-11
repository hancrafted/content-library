import type { ExplorablePageInput } from '../schemas/explorable-page.schema';

export const explorablePage = {
  slug: 'software-ecology',
  // Needs human: choose the Tag; the Brief names none, so this is the closest existing one.
  tags: ['agentic-workflow'],
  visibility: 'public',
} as const satisfies ExplorablePageInput;
