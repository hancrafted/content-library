import type { EventInput } from '../schemas/event.schema';

/** The CyberForum Akademie webinar introducing agentic workflows; its title and description are Translation keys by slug (FE-003). */
export const event = {
  slug: '2026-10-28-cyberforum-akademie-intro-agentic-workflow',
  date: '2026-10-28',
  kind: 'webinar',
  audience: 'individual',
  time: '17:00–19:00 CET',
  location: 'remote',
  playlist: 'cyberforum-akademie-intro-agentic-workflow',
} as const satisfies EventInput;
