import type { TemplateInput } from '../schemas/template.schema';

export const template = {
  slug: 'timelines',
  type: 'master-slide',
  tags: ['workflow'],
  visibility: 'public',
} as const satisfies TemplateInput;
