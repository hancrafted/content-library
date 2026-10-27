import type { ResourceInput } from '../schemas/resource.schema';

export const resource = {
  slug: 'timelines',
  type: 'master-slide',
  tags: ['workflow'],
  visibility: 'public',
} as const satisfies ResourceInput;
