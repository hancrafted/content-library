import type { PlaylistInput } from '../schemas/playlist.schema';

/**
 * The Episodes the CyberForum Akademie webinar presents, in teaching order: the Workshop template's copy first, then
 * unlisted copies of the three Episodes the AXEL seminar taught. Public, so the Event is listed and indexed.
 */
export const playlist = {
  id: 'cyberforum-akademie-intro-agentic-workflow',
  visibility: 'public',
  episodes: [
    '2026-10-28-cyberforum-akademie-intro-agentic-workflow__intro',
    '2026-10-28-cyberforum-akademie-intro-agentic-workflow__onboard-ai-every-time',
    '2026-10-28-cyberforum-akademie-intro-agentic-workflow__ai-attention-span',
    '2026-10-28-cyberforum-akademie-intro-agentic-workflow__ai-gives-you-more-work',
  ],
} satisfies PlaylistInput;
