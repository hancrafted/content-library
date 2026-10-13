import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { fourOclockThePlanComesBack } from './slides/four-oclock-the-plan-comes-back/slide';
import { sommerfestDueByFive } from './slides/sommerfest-due-by-five/slide';
import { theGap } from './slides/the-gap/slide';
import { thoughtExperiment } from './slides/thought-experiment/slide';
import { twentyXVersusYourScreen } from './slides/twenty-x-versus-your-screen/slide';
import { whatYouWouldSayFirst } from './slides/what-you-would-say-first/slide';

/*
 * "Stop prompting AI, start onboarding it": from the gap between the 20x
 * promise and a flat answer, through one Sommerfest thought experiment, to
 * one habit, the day-one note. Built from the staging files under
 * docs/episodes/onboard-ai-like-a-colleague/ (Dossier and Manuscript); each
 * Slide is one folder under `slides/`, named after its Manuscript h3 id.
 */
export const onboardAiLikeAColleague = episode({
  slug: 'onboard-ai-like-a-colleague',
  messages: { en, de },
  sections: [
    [theGap, twentyXVersusYourScreen],
    [thoughtExperiment, sommerfestDueByFive, whatYouWouldSayFirst, fourOclockThePlanComesBack],
  ],
});
