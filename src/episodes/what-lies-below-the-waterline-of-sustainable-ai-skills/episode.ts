import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aThoughtExperimentSection } from './sections/a-thought-experiment';
import { keepingItAliveSection } from './sections/keeping-it-alive';
import { sharingItSection } from './sections/sharing-it';
import { theLabelSection } from './sections/the-label';
import { whatASkillIsSection } from './sections/what-a-skill-is';
import { whatGoesInsideSection } from './sections/what-goes-inside';
import { whatStaysBesideSection } from './sections/what-stays-beside';
import { whenToWriteOneSection } from './sections/when-to-write-one';
import { hero } from './slides/hero/slide';

/*
 * "What lies below the waterline of sustainable AI skills": spot when a repeated task should become a skill, and tell
 * what goes into the skill and what stays in project context. Built from the approved Spec under
 * docs/episodes/what-lies-below-the-waterline-of-sustainable-ai-skills/, its Title slide the picked Option 0a, the
 * research ship lowering its diving robot to the waterline. Upcoming until its video is live.
 *
 * Each Section is one placement marker under `sections/`, named after the Brief's Section title and listed here in Spec
 * order: a Section job adds its page Slides to its own marker, so parallel Section branches never edit one line.
 */
export const whatLiesBelowTheWaterlineOfSustainableAiSkills = episode({
  slug: 'what-lies-below-the-waterline-of-sustainable-ai-skills',
  messages: { en, de },
  title: hero,
  sections: [
    aThoughtExperimentSection,
    whatASkillIsSection,
    whenToWriteOneSection,
    theLabelSection,
    whatGoesInsideSection,
    whatStaysBesideSection,
    sharingItSection,
    keepingItAliveSection,
  ],
});
