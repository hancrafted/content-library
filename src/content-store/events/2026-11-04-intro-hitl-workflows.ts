import type { EventInput } from '../schemas/event.schema';

export const event = {
  slug: '2026-11-04-intro-hitl-workflows',
  date: '2026-11-04',
  kind: 'workshop',
  organizers: ['hancrafted'],
  audience: 'organization',
  time: '13:30–14:15 CST',
  tags: ['agentic-ai', 'agentic-workflow'],
  format: 'onsite',
  venue: 'Guangzhou, China (UTC+8)',
  playlist: 'intro-hitl-workflows',
} as const satisfies EventInput;
