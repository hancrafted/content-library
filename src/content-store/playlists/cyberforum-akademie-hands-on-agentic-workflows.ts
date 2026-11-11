import type { PlaylistInput } from '../schemas/playlist.schema';

/**
 * The Episodes the CyberForum Akademie hands-on workshop presents, in teaching order: its intro, for now a verbatim copy
 * of the 2026-10-28 webinar's, then the public Episode "From shared understanding to shared context". Public, so the
 * Event is listed and indexed.
 */
export const playlist = {
  id: 'cyberforum-akademie-hands-on-agentic-workflows',
  visibility: 'public',
  episodes: [
    '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows__intro',
    'from-shared-understanding-to-shared-context',
  ],
} satisfies PlaylistInput;
