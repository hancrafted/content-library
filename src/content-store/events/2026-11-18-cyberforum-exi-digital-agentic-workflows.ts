import type { EventInput } from '../schemas/event.schema';

/** The CyberForum EXI Digital workshop on agentic workflows for founders; its title and description are Translation keys by slug (FE-003). */
export const event = {
  slug: '2026-11-18-cyberforum-exi-digital-agentic-workflows',
  date: '2026-11-18',
  kind: 'workshop',
  organizers: ['cyberforum'],
  listing:
    'https://www.cyberforum.de/veranstaltungen/exi-digital-workshop-agentic-workflows-komplexe-aufgaben-mit-ki-loesen-18-11-2026',
  image: {
    src: '/images/events/2026-11-18-cyberforum-exi-digital-agentic-workflows.webp',
    credit: '© CyberForum e.V.',
  },
  audience: 'individual',
  time: '14:00–17:00 CET',
  tags: ['agentic-ai', 'agentic-workflow'],
  format: 'remote',
  platform: 'zoom',
  playlist: 'cyberforum-exi-digital-agentic-workflows',
} as const satisfies EventInput;
