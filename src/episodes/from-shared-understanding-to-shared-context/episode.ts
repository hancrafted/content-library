import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aThoughtExperimentSection } from './sections/a-thought-experiment';
import { contextIsTheRequirementSection } from './sections/context-is-the-requirement';
import { creatingContextForAgentsSection } from './sections/creating-context-for-agents';
import { everyProductIsATranslationSection } from './sections/every-product-is-a-translation';
import { hero } from './slides/hero/slide';

/*
 * "From shared understanding to shared context": what an agent receives can shape its work; context engineering
 * offers a useful but imperfect analogy to requirements engineering, and an AI interview can help clarify a handover.
 * Built from the Spec and its subsequent content corrections under docs/episodes/from-shared-understanding-to-shared-context/,
 * its Title slide the picked Option 0c, the dartboard. Upcoming until its video is live.
 *
 * Each Section is one placement marker under `sections/`, named after the Section's slug and listed here in Spec
 * order: a Section job adds its page Slides to its own marker, so parallel Section branches never edit one line.
 */
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
