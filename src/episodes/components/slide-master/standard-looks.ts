import type { SlidePresentation } from './slide-presentation';

// decision: docs/decision-records/0029-standard-title-and-section-looks-by-position.md
const SOFTENED_SURFACE = 'color-mix(in oklab, var(--tone-paper) 88%, var(--tone-ink))';

export const STANDARD_TITLE_LOOK: SlidePresentation = {
  style: { '--slide-space-after': '160px' },
};

export const STANDARD_SECTION_LOOK: SlidePresentation = {
  tone: 'inverse',
  style: {
    '--slide-surface': SOFTENED_SURFACE,
    '--slide-space-before': '200px',
    '--slide-space-after': '200px',
  },
  enter: { effect: 'liquid' },
  leave: { effect: 'liquid' },
};
