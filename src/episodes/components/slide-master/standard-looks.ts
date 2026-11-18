import type { SlidePresentation } from './slide-presentation';

// decision: docs/decision-records/0029-standard-title-and-section-looks-by-position.md
const SOFTENED_SURFACE = 'color-mix(in oklab, var(--tone-paper) 88%, var(--tone-ink))';

const STANDARD_SPACE = { before: '0px', after: '265px', titleAfter: '160px' } as const;

export const STANDARD_TITLE_LOOK: SlidePresentation = {
  tone: 'inverse',
  style: { '--slide-surface': SOFTENED_SURFACE, '--slide-space-after': STANDARD_SPACE.titleAfter },
  leave: { effect: 'liquid' },
};

export const STANDARD_OPENING_SECTION_LOOK: SlidePresentation = {
  style: {
    '--slide-surface': 'var(--section-band)',
    '--slide-space-before': STANDARD_SPACE.before,
    '--slide-space-after': STANDARD_SPACE.after,
  },
};

export const STANDARD_SECTION_LOOK: SlidePresentation = {
  tone: 'inverse',
  style: {
    '--slide-surface': SOFTENED_SURFACE,
    '--slide-space-before': STANDARD_SPACE.before,
    '--slide-space-after': STANDARD_SPACE.after,
  },
  enter: { effect: 'liquid' },
  leave: { effect: 'liquid' },
};
