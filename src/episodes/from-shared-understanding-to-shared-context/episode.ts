import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aThoughtExperimentSection } from './sections/a-thought-experiment';
import { contextIsTheRequirementSection } from './sections/context-is-the-requirement';
import { creatingContextForAgentsSection } from './sections/creating-context-for-agents';
import { everyProductIsATranslationSection } from './sections/every-product-is-a-translation';
import { hero } from './slides/hero/slide';

export const fromSharedUnderstandingToSharedContext = episode({
  slug: 'from-shared-understanding-to-shared-context',
  messages: { en, de },
  title: hero,
  sections: [
    aThoughtExperimentSection,
    everyProductIsATranslationSection,
    contextIsTheRequirementSection,
    creatingContextForAgentsSection,
  ],
});
