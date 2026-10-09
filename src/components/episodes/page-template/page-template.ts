import { episode } from '@/components/slide-master/episode-record';
import { foundations } from './slides/foundations';
import { nextSteps } from './slides/next-steps';
import { whatComesNext } from './slides/what-comes-next';
import { whyATemplate } from './slides/why-a-template';

/*
 * The copy source for a new Episode (FE-002): two Sections of Slides. Each
 * Slide, in `slides/`, declares its slug, notes and segments and renders its
 * Canvas; strings live under `episodes.page-template.slides.<slide>` in both
 * Translation files, the Episode's own under `episodes.page-template`. Every
 * Slide layout is shown in the `slide-layouts` Episode.
 */
export const pageTemplate = episode({
  slug: 'page-template',
  sections: [
    [foundations, whyATemplate],
    [nextSteps, whatComesNext],
  ],
});
