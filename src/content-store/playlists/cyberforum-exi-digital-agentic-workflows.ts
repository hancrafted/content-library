import type { PlaylistInput } from '../schemas/playlist.schema';

const EVENT = '2026-11-18-cyberforum-exi-digital-agentic-workflows';
const INTRO = `${EVENT}__intro`;

export const playlist = {
  id: 'cyberforum-exi-digital-agentic-workflows',
  visibility: 'public',
  episodes: [
    INTRO,
    `${EVENT}__onboard-ai-every-time`,
    { episode: INTRO, anchor: 'check-in-1' },
    `${EVENT}__ai-attention-span`,
    { episode: INTRO, anchor: 'check-in-2' },
    `${EVENT}__ai-gives-you-more-work`,
    { episode: INTRO, anchor: 'check-in-3' },
  ],
} satisfies PlaylistInput;
