import { aiGivesYouMoreWork } from '@/episodes/ai-gives-you-more-work/episode';
import { instanceOf } from '@/episodes/lib/episode-instance';
import de from './i18n/de.json';
import en from './i18n/en.json';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
export const cyberforumAkademieIntroAgenticWorkflowAiGivesYouMoreWork = instanceOf(aiGivesYouMoreWork, {
  title: { notes: [{ slug: 'check-in', target: 'title' }], messages: { en, de } },
});
