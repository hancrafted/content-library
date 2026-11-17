import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './loan.module.css';
import { SEA, type Facet } from './sea-facets';

export type ClampIcon = 'written' | 'sites' | 'arm' | 'overlap';

const PLATE: readonly Facet[] = [
  ['plate-lit', 'M28 28L28 1L51 15Z'],
  ['plate', 'M28 28L51 15L51 42Z'],
  ['plate-shade', 'M28 28L51 42L28 55ZM28 28L28 55L5 42Z'],
  ['plate', 'M28 28L5 42L5 15Z'],
  ['plate-lit', 'M28 28L5 15L28 1Z'],
];

const PROPS: Record<ClampIcon, readonly Facet[]> = {
  written: [
    ['tab-a', 'M29 8L38 8L38 13L29 13Z'],
    ['paper-lit', 'M15 12L41 12L15 44Z'],
    ['paper', 'M41 12L41 44L15 44Z'],
    ['paper-shade', 'M35 44L41 38L41 44Z'],
    ['paper-rule', 'M19 21L36 21L36 23L19 23ZM19 27L31 27L31 29L19 29ZM19 34L36 34L36 35L19 35Z'],
  ],
  sites: [
    ['tab-b', 'M29 9L38 9L38 14L29 14Z'],
    ['paper-lit', 'M16 13L40 13L16 43Z'],
    ['paper', 'M40 13L40 43L16 43Z'],
    ['paper-shade', 'M35 43L40 38L40 43Z'],
    ['paper-rule', 'M20 21L36 21L36 23L20 23ZM20 27L31 27L31 29L20 29ZM20 33L36 33L36 35L20 35Z'],
    ['pin', 'M18 27L40 24L41 26L19 29Z'],
  ],
  arm: [
    ['robot-shade', 'M14 40L24 36L26 42L16 45Z'],
    ['robot-lit', 'M17 38L22 36L34 22L30 19Z'],
    ['robot', 'M22 36L25 38L37 24L34 22Z'],
    ['robot-glint', 'M30 19L37 24L42 16L37 13Z'],
    ['robot', 'M37 13L42 16L44 11L40 9Z'],
    ['robot-dark', 'M40 9L44 11L47 7L44 5ZM44 11L46 14L49 12L47 9Z'],
    ['glint', 'M32 20L35 22L34 23L31 22Z'],
  ],
  overlap: [
    ['tab-c', 'M22 14L29 13L30 17L23 18Z'],
    ['paper-lit', 'M12 18L31 16L15 44Z'],
    ['paper', 'M31 16L35 42L15 44Z'],
    ['paper-shade', 'M30 42L34 37L35 42Z'],
    ['paper-rule', 'M16 25L29 24L29 25L16 26ZM16 30L25 29L26 31L16 32Z'],
    ['tab-a', 'M35 10L42 11L42 15L35 14Z'],
    ['paper-lit', 'M24 12L44 14L22 38Z'],
    ['paper', 'M44 14L42 40L22 38Z'],
    ['paper-shade', 'M38 39L42 35L42 40Z'],
    ['paper-rule', 'M27 20L40 21L40 22L27 21ZM26 25L35 26L35 27L26 26Z'],
  ],
};

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

export function ClampArt({ icon, label }: { readonly icon: ClampIcon; readonly label: string }) {
  return (
    <svg viewBox="0 0 56 56" role="img" aria-label={label} className={cn(styles.art, 'relative z-10 size-14 shrink-0')}>
      <ToneFacets facets={PLATE} />
      <ToneFacets facets={PROPS[icon]} />
    </svg>
  );
}

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
