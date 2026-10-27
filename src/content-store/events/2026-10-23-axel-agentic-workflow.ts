import type { EventInput } from '../schemas/event.schema';

/** The AXEL seminar on agentic workflows; its title and description are Translation keys by slug (FE-003). */
export const event = {
  slug: '2026-10-23-axel-agentic-workflow',
  date: '2026-10-23',
  kind: 'workshop',
  organizer: 'axel',
  audience: 'organization',
  tags: ['agentic-ai', 'workflow'],
  format: 'remote',
  platform: 'zoom',
  playlist: 'axel-agentic-workflow',
} as const satisfies EventInput;
