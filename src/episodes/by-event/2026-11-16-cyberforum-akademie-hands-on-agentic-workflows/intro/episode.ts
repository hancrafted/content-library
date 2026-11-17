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
import { hero } from './slides/hero/slide';

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
    handsOnSection,
    closeSection,
  ],
});
