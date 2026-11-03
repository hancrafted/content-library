import type { PlaylistInput } from '../schemas/playlist.schema';

const INTRO = '2026-11-04-intro-hitl-workflows__intro';

export const playlist = {
  id: 'intro-hitl-workflows',
  visibility: 'public',
  episodes: [
    INTRO,
    '2026-11-04-intro-hitl-workflows__onboard-ai-every-time',
    { episode: INTRO, anchor: 'check-in-1' },
    '2026-11-04-intro-hitl-workflows__ai-attention-span',
    { episode: INTRO, anchor: 'check-in-2' },
    '2026-11-04-intro-hitl-workflows__ai-gives-you-more-work',
    { episode: INTRO, anchor: 'check-in-3' },
  ],
} satisfies PlaylistInput;
