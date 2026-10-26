import type { PlaylistInput } from '../schemas/playlist.schema';

/**
 * The Episodes the AXEL seminar presented, in the order it taught them: unlisted copies of the public Episodes, each
 * the composition its recording shows. The Playlist stays public, so the Event is listed and indexed.
 */
export const playlist = {
  id: 'axel-agentic-workflow',
  visibility: 'public',
  episodes: ['axel-onboard-ai-every-time', 'axel-ai-attention-span', 'axel-ai-gives-you-more-work'],
} satisfies PlaylistInput;
