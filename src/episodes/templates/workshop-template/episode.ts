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

/*
 * The Workshop template (GLOSSARY): the copy source for the opening Episode of a new Event. Its Title slide reads the
 * title and caption in `i18n/`; then a hook (or grounding), the agenda, what is in and out of scope, a poll, About me (the value
 * chain) as its own Section, and the organisation. Every word but About me's is a placeholder to replace in the copy. A
 * Template, not an Episode: it has no metadata and no visibility, so the copy gets both when it is registered
 * (docs/features/events.md, "Add an Event"). Each Section is one placement marker under `sections/`.
 */
export const workshopTemplate = episode({
  slug: 'workshop-template',
  messages: { en, de },
  title: hero,
  sections: [hookSection, agendaSection, inScopeSection, pollSection, aboutMeSection, orgaSection],
});
