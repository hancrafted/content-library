import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aThoughtExperimentSection } from './sections/a-thought-experiment';
import { howFarYouStepOutSection } from './sections/how-far-you-step-out';
import { whatAnAgenticWorkflowIsSection } from './sections/what-an-agentic-workflow-is';
import { whatItRequiresOfEachPersonSection } from './sections/what-it-requires-of-each-person';
import { whatItRequiresOfTheOrganisationSection } from './sections/what-it-requires-of-the-organisation';
import { hero } from './slides/hero/slide';

export const whatAgenticWorkflowsRequire = episode({
  slug: 'what-agentic-workflows-require',
  messages: { en, de },
  title: hero,
  sections: [
    aThoughtExperimentSection,
    whatAnAgenticWorkflowIsSection,
    howFarYouStepOutSection,
    whatItRequiresOfEachPersonSection,
    whatItRequiresOfTheOrganisationSection,
  ],
});
