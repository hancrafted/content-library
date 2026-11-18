import { instanceOf } from '@/episodes/lib/episode-instance';
import { onboardAiEveryTime } from '@/episodes/onboard-ai-every-time/episode';
import de from './i18n/de.json';
import en from './i18n/en.json';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
export const cyberforumOnboardAiEveryTime = instanceOf(onboardAiEveryTime, {
  title: {
    notes: [
      { slug: 'junior-to-freelancer', target: 'title' },
      { slug: 'check-in', target: 'title' },
    ],
    messages: { en, de },
  },
  sections: [{ move: 'manage-the-price', after: 'five-moves-to-brief-a-freelancer' }],
});
