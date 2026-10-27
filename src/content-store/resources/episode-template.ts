import type { ResourceInput } from '../schemas/resource.schema';

export const resource = {
  slug: 'episode-template',
  type: 'episode-template',
  tags: ['workflow'],
  visibility: 'public',
} as const satisfies ResourceInput;
