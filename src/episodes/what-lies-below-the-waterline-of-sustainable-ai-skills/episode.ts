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

export const whatLiesBelowTheWaterlineOfSustainableAiSkills = episode({
  slug: 'what-lies-below-the-waterline-of-sustainable-ai-skills',
  messages: { en, de },
  title: hero,
  agentView: true,
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
