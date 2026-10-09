import { episode } from '@/components/slide-master/episode-record';
import { buildingBlocks } from './slides/building-blocks';
import { foundations } from './slides/foundations';
import { interlude } from './slides/interlude';
import { nextSteps } from './slides/next-steps';
import { threeLayers } from './slides/three-layers';
import { whatComesNext } from './slides/what-comes-next';
import { whyATemplate } from './slides/why-a-template';

/*
 * The reference Episode (FE-002): three Sections holding 2, 0 and 2 page
 * Slides. The Episode only composes Slides; each Slide, in `slides/`, declares
 * its slug, minutes, notes and segments and renders its Canvas. Every string
 * is a Translation key under `episodes.page-template.slides.<slide>`, and the
 * Episode's title and caption sit under `episodes.page-template`.
 */
export const pageTemplate = episode({
  slug: 'page-template',
  sections: [[foundations, whyATemplate, threeLayers], [interlude], [nextSteps, buildingBlocks, whatComesNext]],
});
