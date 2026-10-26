import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { agenticWorkflowsSection } from './sections/agentic-workflows';
import { contextWindowSection } from './sections/context-window';

/*
 * The cornerstone Slides one by one (FE-002), a tooling page beside the Episode template and the Slide master: one
 * Section per cornerstone, each listing the ways it is shown. A change to an Explorable explanation is previewed here before it
 * reaches an Episode, the browser lane runs against it, and one Slide's anchor is a link to send on its own.
 */
export const explorableExplanations = episode({
  slug: 'explorable-explanations',
  messages: { en, de },
  sections: [contextWindowSection, agenticWorkflowsSection],
});
