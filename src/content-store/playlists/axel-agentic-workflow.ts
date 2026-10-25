import type { PlaylistInput } from '../schemas/playlist.schema';

/** The Episodes the AXEL seminar presented, in the order it taught them. */
export const playlist = {
  id: 'axel-agentic-workflow',
  visibility: 'public',
  episodes: ['onboard-ai-every-time', 'ai-attention-span', 'ai-gives-you-more-work'],
} satisfies PlaylistInput;
