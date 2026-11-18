import type { LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import type { SlidePresentation } from '@/episodes/components/slide-master/slide-presentation';
import {
  STANDARD_OPENING_SECTION_LOOK,
  STANDARD_SECTION_LOOK,
  STANDARD_TITLE_LOOK,
} from '@/episodes/components/slide-master/standard-looks';
import { slideSizeOf } from './episode-page-container.pure';

// decision: docs/decision-records/0029-standard-title-and-section-looks-by-position.md
export function withStandardSlideLooks<
  S extends Pick<LocalizedSlide, 'level' | 'withoutSectionSlide' | 'presentation'>,
>(slides: readonly S[]): S[] {
  let opening = true;
  return slides.map((slide) => {
    if (slideSizeOf(slide) !== 'section') return slide;
    const look = opening ? STANDARD_OPENING_SECTION_LOOK : STANDARD_SECTION_LOOK;
    opening = false;
    return slide.presentation === undefined ? { ...slide, presentation: look } : slide;
  });
}

export function standardTitleLook(declared: SlidePresentation | undefined, tone: 'inverse' | undefined) {
  return declared ?? (tone === undefined ? STANDARD_TITLE_LOOK : undefined);
}
