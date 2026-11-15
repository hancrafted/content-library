import type { PlaylistInput } from '../schemas/playlist.schema';

/**
 * The Episodes the CyberForum Akademie hands-on workshop presents, in teaching order: its intro, for now a verbatim copy
 * of the 2026-10-28 webinar's, then its unlisted copy of "What agentic workflows require of people and organisations",
 * then the public Episode "From shared understanding to shared context", and last its unlisted copy of "What lies below the waterline of sustainable AI skills". Public, so the Event is listed and indexed.
 */
export const playlist = {
  id: 'cyberforum-akademie-hands-on-agentic-workflows',
  visibility: 'public',
  episodes: [
    '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows__intro',
    '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows__what-agentic-workflows-require',
    'from-shared-understanding-to-shared-context',
    '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows__what-lies-below-the-waterline-of-sustainable-ai-skills',
  ],
} satisfies PlaylistInput;
