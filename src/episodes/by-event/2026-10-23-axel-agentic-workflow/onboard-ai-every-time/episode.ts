import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { fiveMovesToBriefAFreelancerSection } from './sections/five-moves-to-brief-a-freelancer';
import { theThoughtExperimentSection } from './sections/the-thought-experiment';
import { hero } from './slides/hero/slide';

// decision: docs/adr/0016-content-data-model.md
export const axelOnboardAiEveryTime = episode({
  slug: 'onboard-ai-every-time',
  messages: { en, de },
  title: hero,
  segments: [{ slug: 'welcome' }],
  sections: [theThoughtExperimentSection, fiveMovesToBriefAFreelancerSection],
});
