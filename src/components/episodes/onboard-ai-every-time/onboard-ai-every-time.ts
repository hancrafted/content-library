import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { briefInActionSection } from './sections/brief-in-action';
import { fiveMovesToBriefAFreelancerSection } from './sections/five-moves-to-brief-a-freelancer';
import { theThoughtExperimentSection } from './sections/the-thought-experiment';
import { hero } from './slides/hero/slide';

/*
 * "Treat AI like a brilliant freelancer with amnesia": name the five traits that make AI costly (PRICE), and manage
 * them with five moves (BRIEF). Built from the approved Spec under docs/episodes/onboard-ai-every-time/. Upcoming
 * until its video is live.
 *
 * Each Section is one placement marker under `sections/`, named after the Section's slug and listed here in Spec
 * order: a Section job adds its page Slides to its own marker, so parallel Section branches never edit one line.
 */
export const onboardAiEveryTime = episode({
  slug: 'onboard-ai-every-time',
  messages: { en, de },
  title: hero,
  sections: [theThoughtExperimentSection, fiveMovesToBriefAFreelancerSection, briefInActionSection],
});
