import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './loan.module.css';
import { SEA, type Facet } from './sea-facets';

/*
 * The drawing lifted from the approved Spec's Option 23b (feedback 3, decision 46): the faceted water from the Midnight
 * edge down into the Abyss, its marine snow and the faceted seabed with its rocks, each clamp's faceted plate and the
 * prop it holds, and the stack's blocks. Facets keep the Spec's own numbers; their tones are this Slide's tokens in
 * `loan.module.css`. The robot stays the shared figure; the statement's and the stack's words stay real text. The
 * Spec's flat paper shadows (`drop`) are left out: the Episode draws no drop shadows (feedback 2, decision 19).
 */

export type ClampIcon = 'written' | 'sites' | 'arm' | 'overlap';

/** Each clamp's faceted hexagon plate, lit from the upper left, in the clamp's own 56 by 56 units. */
const PLATE: readonly Facet[] = [
  ['plate-lit', 'M28 28L28 1L51.4 14.5Z'],
  ['plate', 'M28 28L51.4 14.5L51.4 41.5Z'],
  ['plate-shade', 'M28 28L51.4 41.5L28 55ZM28 28L28 55L4.6 41.5Z'],
  ['plate', 'M28 28L4.6 41.5L4.6 14.5Z'],
  ['plate-lit', 'M28 28L4.6 14.5L28 1Z'],
];

/** What each clamp holds: the skill's card, the site list struck through, the robot's arm, two overlapping cards. */
const PROPS: Record<ClampIcon, readonly Facet[]> = {
  written: [
    ['tab-a', 'M29.3 8.2L38.4 8.2L38.4 13L29.3 13Z'],
    ['paper-lit', 'M15 12L41 12L15 44Z'],
    ['paper', 'M41 12L41 44L15 44Z'],
    ['paper-shade', 'M35.3 44L41 38.2L41 44Z'],
    [
      'paper-rule',
      'M19.2 21L36.3 21L36.3 22.6L19.2 22.6ZM19.2 27.4L31.1 27.4L31.1 29L19.2 29ZM19.2 33.8L36.3 33.8L36.3 35.4L19.2 35.4Z',
    ],
  ],
  sites: [
    ['tab-b', 'M29.2 9.4L37.6 9.4L37.6 14L29.2 14Z'],
    ['paper-lit', 'M16 13L40 13L16 43Z'],
    ['paper', 'M40 13L40 43L16 43Z'],
    ['paper-shade', 'M34.7 43L40 37.6L40 43Z'],
    [
      'paper-rule',
      'M19.8 21.4L35.7 21.4L35.7 22.9L19.8 22.9ZM19.8 27.4L30.9 27.4L30.9 28.9L19.8 28.9ZM19.8 33.4L35.7 33.4L35.7 34.9L19.8 34.9Z',
    ],
    ['pin', 'M18 26.5L40 23.5L40.5 25.5L18.5 28.5Z'],
  ],
  arm: [
    ['robot-shade', 'M14 40L24 36L26 42L16 45Z'],
    ['robot-lit', 'M17 38L22 36L34 22L30 19Z'],
    ['robot', 'M22 36L25 38L37 24L34 22Z'],
    ['robot-glint', 'M30 19L37 24L42 16L37 13Z'],
    ['robot', 'M37 13L42 16L44 11L40 9Z'],
    ['robot-dark', 'M40 9L44 11L47 7L44 5ZM44 11L46 14L49 12L47 9Z'],
    ['glint', 'M31.5 20L35 21.5L33.5 23L31 22Z'],
  ],
  overlap: [
    ['tab-c', 'M22.1 13.9L29 13L29.5 17.1L22.6 18Z'],
    ['paper-lit', 'M11.5 18.3L31.4 15.9L14.6 44.1Z'],
    ['paper', 'M31.4 15.9L34.5 41.7L14.6 44.1Z'],
    ['paper-shade', 'M30.1 42.2L33.9 37.1L34.5 41.7Z'],
    ['paper-rule', 'M15.6 25.1L28.7 23.6L28.8 24.8L15.7 26.4ZM16.2 30.3L25.3 29.2L25.5 30.5L16.3 31.6Z'],
    ['tab-a', 'M35.3 10L42.3 10.6L41.9 14.7L35 14.1Z'],
    ['paper-lit', 'M24.1 12.2L44 13.8L22 38.2Z'],
    ['paper', 'M44 13.8L41.9 39.8L22 38.2Z'],
    ['paper-shade', 'M37.5 39.4L42.3 35.1L41.9 39.8Z'],
    ['paper-rule', 'M26.7 19.8L39.8 20.8L39.7 22.1L26.6 21.1ZM26.3 24.9L35.4 25.7L35.3 27L26.2 26.2Z'],
  ],
};

/** One faceted block of the stack, 102 by 42 with its top and side; the writing slab is the same block, 20 high. */
const BLOCK: readonly Facet[] = [
  ['block-lit', 'M0 6L92 6L0 42Z'],
  ['block', 'M92 6L92 42L0 42Z'],
  ['block-shade', 'M92 6L102 0L102 36L92 42Z'],
  ['glint', 'M0 6L10 0L102 0L92 6Z'],
];
const SLAB: readonly Facet[] = [
  ['block-lit', 'M0 6L92 6L0 20Z'],
  ['block', 'M92 6L92 20L0 20Z'],
  ['block-shade', 'M92 6L102 0L102 14L92 20Z'],
  ['glint', 'M0 6L10 0L102 0L92 6Z'],
];

/** The water, snow and seabed behind the whole stage, stretched to it as the Spec does. */
export function SeaArt() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 900 780"
      preserveAspectRatio="none"
      data-sea-art
      className={cn(styles.art, 'pointer-events-none absolute inset-0 -z-10 size-full')}
    >
      <ToneFacets facets={SEA} />
    </svg>
  );
}

/** One clamp on the robot's cable: its faceted plate and the prop for its entry. */
export function ClampArt({ icon, label }: { readonly icon: ClampIcon; readonly label: string }) {
  return (
    <svg viewBox="0 0 56 56" role="img" aria-label={label} className={cn(styles.art, 'relative z-10 size-14 shrink-0')}>
      <ToneFacets facets={PLATE} />
      <ToneFacets facets={PROPS[icon]} />
    </svg>
  );
}

/** A block of the stack, or the thin writing slab. */
export function BlockArt({
  slab,
  className,
  style,
}: {
  readonly slab?: boolean;
  readonly className?: string;
  readonly style?: CSSProperties;
}) {
  return (
    <svg
      aria-hidden
      viewBox={slab ? '0 0 102 20' : '0 0 102 42'}
      style={style}
      className={cn(styles.art, 'block shrink-0', slab ? 'h-5 w-24' : 'h-10 w-24', className)}
    >
      <ToneFacets facets={slab ? SLAB : BLOCK} />
    </svg>
  );
}
