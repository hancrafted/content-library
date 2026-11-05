import type { TemplateInput } from '../schemas/template.schema';

export const template = {
  slug: 'grids',
  type: 'master-slide',
  tags: ['agentic-workflow'],
  visibility: 'public',
} as const satisfies TemplateInput;
