import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { agendaSection } from './sections/agenda';
import { groundingSection } from './sections/grounding';
import { inScopeSection } from './sections/in-scope';
import { orgaSection } from './sections/orga';
import { pollSection } from './sections/poll';
import { hero } from './slides/hero/slide';

/*
 * The opening Episode the CyberForum Akademie webinar (Event 2026-10-28-cyberforum-akademie-intro-agentic-workflow)
 * presents: a copy of the Workshop template (docs/features/events.md, "Add an Event"), its hook renamed `grounding`
 * because it grounds: the three layers of the evening. Then the agenda, the scope, a poll with the About me Slide from
 * the Slide pool, and the organisation. Unlisted: it lives only under its Event.
 */
export const cyberforumIntro = episode({
  slug: 'intro',
  messages: { en, de },
  title: hero,
  sections: [groundingSection, agendaSection, inScopeSection, pollSection, orgaSection],
});
