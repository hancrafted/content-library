import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aboutMeSection } from './sections/about-me';
import { agendaSection } from './sections/agenda';
import { closeSection } from './sections/close';
import { groundingSection } from './sections/grounding';
import { handsOnSection } from './sections/hands-on';
import { hookSection } from './sections/hook';
import { inScopeSection } from './sections/in-scope';
import { orgaSection } from './sections/orga';
import { pollSection } from './sections/poll';
import { hero } from './slides/hero/slide';

/*
 * The intro of the CyberForum Akademie hands-on workshop (Event 2026-11-16-cyberforum-akademie-hands-on-agentic-workflows),
 * adapted from the 2026-10-28 webinar's: the orga before the recording, the hook, agenda, scope, what today's AI can do
 * (`grounding`) and About me. Then the Sections the day returns to between its theory Episodes, grouped by kind: every
 * poll in `poll`, every hands-on step in `hands-on`, and the close. The Event's Playlist orders them by time, opening
 * each at its Slide's anchor. Unlisted: it lives only under its Event.
 */
export const cyberforumIntro = episode({
  slug: 'intro',
  messages: { en, de },
  title: hero,
  sections: [
    orgaSection,
    hookSection,
    agendaSection,
    inScopeSection,
    groundingSection,
    aboutMeSection,
    pollSection,
    handsOnSection,
    closeSection,
  ],
});
