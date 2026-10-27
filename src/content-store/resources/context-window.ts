import type { ResourceInput } from '../schemas/resource.schema';

export const resource = {
  slug: 'context-window',
  type: 'explorable-explanation',
  tags: ['context-engineering'],
  visibility: 'public',
} as const satisfies ResourceInput;
