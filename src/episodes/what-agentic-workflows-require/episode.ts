import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aThoughtExperimentSection } from './sections/a-thought-experiment';
import { howFarYouStepOutSection } from './sections/how-far-you-step-out';
import { whatAnAgenticWorkflowIsSection } from './sections/what-an-agentic-workflow-is';
import { whatItRequiresOfEachPersonSection } from './sections/what-it-requires-of-each-person';
import { whatItRequiresOfTheOrganisationSection } from './sections/what-it-requires-of-the-organisation';
import { hero } from './slides/hero/slide';

/*
 * "What agentic workflows require of people and organisations": what an agentic workflow is, how far a person can
 * step out of the loop per task, and what it requires of each person and of the organisation, so the workflow is
 * designed around the goal, not the org chart. Built from the approved Spec under
 * docs/episodes/what-agentic-workflows-require/, its Title slide the picked Option 0b, one seam of the party board
 * zoomed with its contract card. Upcoming until its video is live.
 *
 * Each Section is one placement marker under `sections/`, named after the Brief's Section title and listed here in Spec
 * order: a Section job adds its page Slides to its own marker, so parallel Section branches never edit one line.
 */
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
