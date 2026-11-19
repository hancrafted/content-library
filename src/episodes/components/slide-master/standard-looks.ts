import type { SlidePresentation } from './slide-presentation';

// decision: docs/decision-records/0029-standard-title-and-section-looks-by-position.md
// decision: docs/decision-records/0030-slide-surface-and-the-inverse-flag.md
export const SOFT_MIRROR = 'color-mix(in oklab, var(--background) 88%, var(--foreground))';

export const STANDARD_TITLE_LOOK: SlidePresentation = {
  style: { '--slide-space-after': '160px' },
};

export const STANDARD_SECTION_LOOK: SlidePresentation = {
  inverse: true,
  style: {
    '--slide-surface': SOFT_MIRROR,
    '--slide-space-before': '200px',
    '--slide-space-after': '200px',
  },
  enter: { effect: 'liquid' },
  leave: { effect: 'liquid' },
};
