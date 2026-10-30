import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { theTechnicalRouteSection } from './sections/the-technical-route';
import { yourAiAgentSection } from './sections/your-ai-agent';
import { yourFirstSkillSection } from './sections/your-first-skill';
import { yourFolderSection } from './sections/your-folder';
import { yourTerminalSection } from './sections/your-terminal';
import { hero } from './slides/hero/slide';

/*
 * "Get workshop-ready": a Guide (design-ADR 0019 as amended by #450), not an Episode, built from the approved Spec. A
 * first-timer opens a terminal, installs an AI agent, starts it in the starter folder and runs a first skill, in
 * four steps. Its Title slide's hero is a terminal window previewing the end (Title-slide Option 0b).
 *
 * Each Section is one placement marker under `sections/`, named after the Section's slug and listed here in Spec
 * order: a Section job adds its page Slides to its own marker, so parallel Section branches never edit one line.
 */
export const setupAiAgentAndStarterFolder = episode({
  slug: 'setup-ai-agent-and-starter-folder',
  messages: { en, de },
  title: hero,
  sections: [
    yourTerminalSection,
    yourAiAgentSection,
    yourFolderSection,
    yourFirstSkillSection,
    theTechnicalRouteSection,
  ],
});
