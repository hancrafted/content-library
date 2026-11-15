import type { PlaylistInput } from '../schemas/playlist.schema';

const EVENT = '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows';
const INTRO = `${EVENT}__intro`;

/**
 * The CyberForum Akademie hands-on workshop in the order the afternoon runs: its intro, then each theory Episode
 * followed by its check-in and the hands-on step it leads into, each a Slide of the intro opened by its anchor, and the
 * intro's close last. The intro groups its Slides by kind (`poll`, `hands-on`); this list orders them by time. Public,
 * so the Event is listed and indexed.
 */
export const playlist = {
  id: 'cyberforum-akademie-hands-on-agentic-workflows',
  visibility: 'public',
  episodes: [
    INTRO,
    `${EVENT}__what-agentic-workflows-require`,
    { episode: INTRO, anchor: 'poll--check-in-1' },
    { episode: INTRO, anchor: 'hands-on' },
    { episode: INTRO, anchor: 'hands-on--start-the-interview' },
    'from-shared-understanding-to-shared-context',
    { episode: INTRO, anchor: 'poll--check-in-2' },
    { episode: INTRO, anchor: 'hands-on--spec-and-quiz-page' },
    `${EVENT}__what-lies-below-the-waterline-of-sustainable-ai-skills`,
    { episode: INTRO, anchor: 'poll--check-in-3' },
    { episode: INTRO, anchor: 'hands-on--make-it-a-skill' },
    { episode: INTRO, anchor: 'close' },
  ],
} satisfies PlaylistInput;
