import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { basicPage } from './slides/basic-page/slide';
import { sectionSlide } from './slides/section-slide/slide';
import { threeColumn } from './slides/three-column/slide';

/*
 * A gallery, not a talk: one Slide per Slide layout, so a reader can see each
 * layout rendered and an author can pick one. Unlisted: registered, but linked
 * from neither the landing page nor the header. Add a Slide here when a layout
 * is added to `slide-master/`.
 */
export const slideLayouts = episode({
  slug: 'slide-layouts',
  messages: { en, de },
  header: 'authored',
  sections: [[sectionSlide, basicPage, threeColumn]],
});
