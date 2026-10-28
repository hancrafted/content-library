import type { TemplateInput } from '../schemas/template.schema';

export const template = {
  slug: 'explorable-page',
  type: 'episode-template',
  tags: ['workflow'],
  visibility: 'public',
} as const satisfies TemplateInput;
