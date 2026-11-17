import type { PlaylistInput } from '../schemas/playlist.schema';

const INTRO = '2026-10-28-cyberforum-akademie-intro-agentic-workflow__intro';

export const playlist = {
  id: 'cyberforum-akademie-intro-agentic-workflow',
  visibility: 'public',
  episodes: [
    INTRO,
    '2026-10-28-cyberforum-akademie-intro-agentic-workflow__onboard-ai-every-time',
    { episode: INTRO, anchor: 'check-in-1' },
    '2026-10-28-cyberforum-akademie-intro-agentic-workflow__ai-attention-span',
    { episode: INTRO, anchor: 'check-in-2' },
    '2026-10-28-cyberforum-akademie-intro-agentic-workflow__ai-gives-you-more-work',
    { episode: INTRO, anchor: 'check-in-3' },
  ],
} satisfies PlaylistInput;
