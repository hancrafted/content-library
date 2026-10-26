import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { agenda } from './slides/agenda/slide';
import { inScope } from './slides/in-scope/slide';
import { orga } from './slides/orga/slide';
import { outOfScope } from './slides/out-of-scope/slide';

/*
 * The opening Episode the CyberForum Akademie webinar (Event 2026-10-28-cyberforum-akademie-intro-agentic-workflow)
 * presents: a copy of the Workshop template (docs/features/events.md, "Add an Event"), its Slides' placeholder words
 * still to be replaced with the webinar's agenda, scope and orga. Unlisted: it lives only under its Event.
 */
export const cyberforumIntro = episode({
  slug: 'intro',
  messages: { en, de },
  sections: [[agenda], [inScope, outOfScope], [orga]],
});
