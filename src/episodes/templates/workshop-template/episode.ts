import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { aboutMeSection } from './sections/about-me';
import { agendaSection } from './sections/agenda';
import { hookSection } from './sections/hook';
import { inScopeSection } from './sections/in-scope';
import { orgaSection } from './sections/orga';
import { pollSection } from './sections/poll';
import { hero } from './slides/hero/slide';

// spec: docs/features/events.md#add-an-event
export const workshopTemplate = episode({
  slug: 'workshop-template',
  messages: { en, de },
  title: hero,
  sections: [hookSection, agendaSection, inScopeSection, pollSection, aboutMeSection, orgaSection],
});
