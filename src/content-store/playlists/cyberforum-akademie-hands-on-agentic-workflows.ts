import type { PlaylistInput } from '../schemas/playlist.schema';

const EVENT = '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows';
const INTRO = `${EVENT}__intro`;

export const playlist = {
  id: 'cyberforum-akademie-hands-on-agentic-workflows',
  visibility: 'public',
  episodes: [
    INTRO,
    `${EVENT}__what-agentic-workflows-require`,
    { episode: INTRO, anchor: 'hands-on' },
    { episode: INTRO, anchor: 'hands-on--start-the-interview' },
    'from-shared-understanding-to-shared-context',
    { episode: INTRO, anchor: 'hands-on--spec-and-quiz-page' },
    `${EVENT}__what-lies-below-the-waterline-of-sustainable-ai-skills`,
    { episode: INTRO, anchor: 'hands-on--make-it-a-skill' },
    { episode: INTRO, anchor: 'close' },
  ],
} satisfies PlaylistInput;
