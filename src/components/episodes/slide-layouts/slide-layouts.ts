import { episode } from '@/components/slide-master/episode-record';
import { basicPage } from './slides/basic-page';
import { sectionSlide } from './slides/section-slide';
import { threeColumn } from './slides/three-column';

/*
 * A gallery, not a talk: one Slide per Slide layout, so a reader can see each
 * layout rendered and an author can pick one. Unlisted: registered, but linked
 * from neither the landing page nor the header. Add a Slide here when a layout
 * is added to `slide-master/`.
 */
export const slideLayouts = episode({
  slug: 'slide-layouts',
  sections: [[sectionSlide, basicPage, threeColumn]],
});
