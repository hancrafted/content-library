import type { PlaylistInput } from '../schemas/playlist.schema';

/**
 * The Episodes the CyberForum Akademie webinar presents, in teaching order: the Workshop template's copy first, then
 * unlisted copies of the three Episodes the AXEL seminar taught. Public, so the Event is listed and indexed.
 */
export const playlist = {
  id: 'cyberforum-akademie-intro-agentic-workflow',
  visibility: 'public',
  episodes: [
    'cyberforum-intro',
    'cyberforum-onboard-ai-every-time',
    'cyberforum-ai-attention-span',
    'cyberforum-ai-gives-you-more-work',
  ],
} satisfies PlaylistInput;
