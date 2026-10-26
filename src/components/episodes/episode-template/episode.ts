import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { foundations } from './slides/foundations/slide';
import { hero } from './slides/hero/slide';
import { nextSteps } from './slides/next-steps/slide';
import { whatComesNext } from './slides/what-comes-next/slide';
import { whyATemplate } from './slides/why-a-template/slide';

/*
 * The copy source for a new Episode (FE-002): two Sections of Slides. Each
 * Slide is one folder under `slides/`, named after its slug, holding its server
 * entry, client widgets, CSS and its own Translation files. The Episode's own
 * title, caption and description sit in `i18n/`. Copying a Slide in from
 * another Episode is one import and one list entry. A tooling page, not an
 * Episode: the Slide layouts are the frame components in `slide-master/` and
 * the Slide library.
 *
 * The Slide wrapper renders every Slide's header (Eyebrow, title, caption)
 * from the Slide's own `title` and `caption`, and types it in once, so a Scene
 * holds its visual only. `title` is the Title slide's hero Scene, which sets
 * the Hero motif each section slide's Scene echoes.
 */
export const episodeTemplate = episode({
  slug: 'episode-template',
  messages: { en, de },
  title: hero,
  sections: [
    [foundations, whyATemplate],
    [nextSteps, whatComesNext],
  ],
});
