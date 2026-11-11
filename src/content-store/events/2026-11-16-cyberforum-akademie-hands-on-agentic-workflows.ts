import type { EventInput } from '../schemas/event.schema';

/** The CyberForum Akademie hands-on workshop on agentic workflows; its title and description are Translation keys by slug (FE-003). */
export const event = {
  slug: '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows',
  date: '2026-11-16',
  kind: 'workshop',
  organizers: ['cyberforum'],
  listing: 'https://www.cyberforum.de/veranstaltungen/hands-on-workshop-introduction-to-agentic-workflows-16-11-2026',
  references: [{ label: 'Next_KARL', url: 'https://kompetenzzentrum-karl.de/' }],
  image: {
    src: '/images/events/2026-11-16-cyberforum-akademie-hands-on-agentic-workflows.webp',
    credit: '© CyberForum e.V.',
  },
  audience: 'individual',
  time: '14:00–18:00 CET',
  tags: ['agentic-ai', 'agentic-workflow'],
  format: 'remote',
  platform: 'zoom',
  playlist: 'cyberforum-akademie-hands-on-agentic-workflows',
} as const satisfies EventInput;
