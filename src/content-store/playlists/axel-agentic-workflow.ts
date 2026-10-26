import type { PlaylistInput } from '../schemas/playlist.schema';

/**
 * The Episodes the AXEL seminar presented, in the order it taught them: unlisted copies of the public Episodes, each
 * the composition its recording shows, each in the Event's folder. The Playlist stays public, so the Event is listed and indexed.
 */
export const playlist = {
  id: 'axel-agentic-workflow',
  visibility: 'public',
  episodes: [
    '2026-10-23-axel-agentic-workflow__onboard-ai-every-time',
    '2026-10-23-axel-agentic-workflow__ai-attention-span',
    '2026-10-23-axel-agentic-workflow__ai-gives-you-more-work',
  ],
} satisfies PlaylistInput;
