import type { TemplateInput } from '../schemas/template.schema';

export const template = {
  slug: 'ice-berg',
  type: 'theme',
  tags: ['agentic-ai', 'overview'],
  visibility: 'public',
} as const satisfies TemplateInput;
