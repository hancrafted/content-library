import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { foundations } from './slides/foundations/slide';
import { nextSteps } from './slides/next-steps/slide';
import { whatComesNext } from './slides/what-comes-next/slide';
import { whyATemplate } from './slides/why-a-template/slide';

/*
 * The copy source for a new Episode (FE-002): two Sections of Slides. Each
 * Slide is one folder under `slides/`, named after its slug, holding its server
 * entry, client widgets, CSS and its own Translation files. The Episode's own
 * title, caption and description sit in `i18n/`. Copying a Slide in from
 * another Episode is one import and one list entry. Every Slide layout is
 * shown in the `slide-layouts` Episode.
 */
export const pageTemplate = episode({
  slug: 'page-template',
  messages: { en, de },
  sections: [
    [foundations, whyATemplate],
    [nextSteps, whatComesNext],
  ],
});
