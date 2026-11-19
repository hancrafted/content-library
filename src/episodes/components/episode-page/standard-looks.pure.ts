import type { LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import type { SlidePresentation } from '@/episodes/components/slide-master/slide-presentation';
import { STANDARD_SECTION_LOOK, STANDARD_TITLE_LOOK } from '@/episodes/components/slide-master/standard-looks';
import { slideSizeOf } from './episode-page-container.pure';

// decision: docs/decision-records/0029-standard-title-and-section-looks-by-position.md
export function withStandardSlideLooks<
  S extends Pick<LocalizedSlide, 'level' | 'withoutSectionSlide' | 'presentation'>,
>(slides: readonly S[]): S[] {
  return slides.map((slide) =>
    slideSizeOf(slide) === 'section' && slide.presentation === undefined
      ? { ...slide, presentation: STANDARD_SECTION_LOOK }
      : slide,
  );
}

export function standardTitleLook(declared: SlidePresentation | undefined) {
  return declared ?? STANDARD_TITLE_LOOK;
}
