import type { TemplateInput } from '../schemas/template.schema';

export const template = {
  slug: 'workshop-template',
  type: 'episode-template',
  tags: ['agentic-workflow'],
  visibility: 'public',
} as const satisfies TemplateInput;
