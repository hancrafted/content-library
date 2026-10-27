import type { EventInput } from '../schemas/event.schema';

/** The CyberForum Akademie webinar introducing agentic workflows; its title and description are Translation keys by slug (FE-003). */
export const event = {
  slug: '2026-10-28-cyberforum-akademie-intro-agentic-workflow',
  date: '2026-10-28',
  kind: 'webinar',
  organizers: ['cyberforum'],
  listing: 'https://www.cyberforum.de/veranstaltungen/generative-ki-im-arbeitsalltag-28-10-2026',
  references: [{ label: 'Next_KARL', url: 'https://kompetenzzentrum-karl.de/' }],
  image: {
    src: '/images/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow.webp',
    credit: '© CyberForum e.V.',
  },
  audience: 'individual',
  time: '17:00–19:00 CET',
  tags: ['agentic-ai', 'workflow'],
  format: 'remote',
  platform: 'zoom',
  playlist: 'cyberforum-akademie-intro-agentic-workflow',
} as const satisfies EventInput;
