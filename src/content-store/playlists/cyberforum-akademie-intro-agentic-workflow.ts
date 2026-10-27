import type { PlaylistInput } from '../schemas/playlist.schema';

/**
 * The Episodes the CyberForum Akademie webinar presents, in teaching order: the Workshop template's copy first, then
 * unlisted copies of the three Episodes the AXEL seminar taught, each followed by its check-in in the intro, where the
 * audience answers its poll questions. Public, so the Event is listed and indexed.
 */
/** The intro Episode, listed first and again at each check-in. */
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
