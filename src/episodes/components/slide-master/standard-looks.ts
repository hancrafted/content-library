import type { SlidePresentation } from './slide-presentation';
import { SOFT_MIRROR } from './surface';

// decision: docs/decision-records/0029-standard-title-and-section-looks-by-position.md
// decision: docs/decision-records/0030-slide-surface-and-the-inverse-flag.md
export const STANDARD_TITLE_LOOK: SlidePresentation = {
  style: { '--slide-space-after': '160px' },
};

export const STANDARD_SECTION_LOOK: SlidePresentation = {
  inverse: true,
  surface: SOFT_MIRROR,
  style: {
    '--slide-space-before': '200px',
    '--slide-space-after': '200px',
  },
  enter: { effect: 'liquid' },
  leave: { effect: 'liquid' },
};
