import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { fiveMovesToBriefAFreelancerSection } from './sections/five-moves-to-brief-a-freelancer';
import { theThoughtExperimentSection } from './sections/the-thought-experiment';
import { hero } from './slides/hero/slide';

// decision: docs/decision-records/0016-content-data-model.md
export const introHitlOnboardAiEveryTime = episode({
  slug: 'onboard-ai-every-time',
  messages: { en, de },
  title: hero,
  notes: [
    { slug: 'junior-to-freelancer', target: 'title' },
    { slug: 'check-in', target: 'title' },
  ],
  segments: [{ slug: 'welcome' }],
  sections: [theThoughtExperimentSection, fiveMovesToBriefAFreelancerSection],
});
