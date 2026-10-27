import type { ResourceInput } from '../schemas/resource.schema';

export const resource = {
  slug: 'human-in-the-loop',
  type: 'explorable-explanation',
  tags: ['agentic-ai', 'workflow'],
  visibility: 'public',
} as const satisfies ResourceInput;
