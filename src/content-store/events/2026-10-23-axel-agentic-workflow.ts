import type { EventInput } from '../schemas/event.schema';

// decision: FE-003 §4
export const event = {
  slug: '2026-10-23-axel-agentic-workflow',
  date: '2026-10-23',
  kind: 'workshop',
  organizers: ['axel'],
  audience: 'organization',
  tags: ['agentic-ai', 'agentic-workflow'],
  format: 'remote',
  platform: 'zoom',
  playlist: 'axel-agentic-workflow',
} as const satisfies EventInput;
