import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { thePromiseAndTheGap } from './slides/the-promise-and-the-gap/slide';
import { twentyTimesOnPaper } from './slides/twenty-times-on-paper/slide';

/*
 * "Stop prompting AI, start onboarding it": AI relocates the work rather than removing it, so brief it like a
 * brand-new colleague on day one. Built from the Dossier under docs/episodes/onboard-ai-like-a-colleague-run-2/;
 * each Slide is one folder under `slides/`, named after its Dossier heading id. Upcoming until its video is live.
 */
export const onboardAiLikeAColleagueRun2 = episode({
  slug: 'onboard-ai-like-a-colleague-run-2',
  messages: { en, de },
  sections: [[thePromiseAndTheGap, twentyTimesOnPaper]],
});
