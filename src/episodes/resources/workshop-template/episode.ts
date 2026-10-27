import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { agenda } from './slides/agenda/slide';
import { inScope } from './slides/in-scope/slide';
import { orga } from './slides/orga/slide';
import { outOfScope } from './slides/out-of-scope/slide';

/*
 * The Workshop template (GLOSSARY): the copy source for the opening Episode of a new Event. Its Title slide reads the
 * title and caption in `i18n/`; then the agenda, what is in and out of scope, and the organisation. Every word is a
 * placeholder to replace in the copy. A Resource, not an Episode: it has no metadata and no visibility, so the
 * copy gets both when it is registered (docs/features/events.md, "Add an Event").
 */
export const workshopTemplate = episode({
  slug: 'workshop-template',
  messages: { en, de },
  sections: [[agenda], [inScope, outOfScope], [orga]],
});
