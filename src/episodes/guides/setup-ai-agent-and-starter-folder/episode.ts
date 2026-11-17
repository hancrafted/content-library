import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { theTechnicalRouteSection } from './sections/the-technical-route';
import { yourAiAgentSection } from './sections/your-ai-agent';
import { yourFirstSkillSection } from './sections/your-first-skill';
import { yourFolderSection } from './sections/your-folder';
import { yourTerminalSection } from './sections/your-terminal';
import { hero } from './slides/hero/slide';

// decision: docs/decision-records/0019-resources-overview.md
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
