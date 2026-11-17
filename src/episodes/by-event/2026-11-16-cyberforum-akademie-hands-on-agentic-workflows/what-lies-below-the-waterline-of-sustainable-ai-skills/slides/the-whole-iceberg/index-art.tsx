import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { cn } from '@/shared/lib/utils';
import styles from './iceberg.module.css';

type Facet = readonly [tone: string, d: string];

const PAGE_BOX = '620 133 328 264';
const PAGE: readonly Facet[] = [
  ['paper-lit', 'M620.3 142.9L818.6 136.9L625.6 320.6Z'],
  ['paper', 'M818.6 136.9L940.1 133.3L947.7 387.1L627.9 396.7L625.6 320.6Z'],
  ['paper-shade', 'M925.7 387.8L947.1 367.2L947.7 387.1Z'],
];

export function IndexPaper() {
  return (
    <svg
      aria-hidden
      viewBox={PAGE_BOX}
      preserveAspectRatio="none"
      className={cn(styles.art, 'pointer-events-none absolute inset-0 -z-10 size-full')}
    >
      <ToneFacets facets={PAGE} />
    </svg>
  );
}

const MANUAL_FOOT = { x: 528, y: 369 } as const;
const MANUAL: readonly Facet[] = [
  ['paper-shade', 'M500.5 366.5L528 369L528 357.8L498 354Z'],
  ['paper', 'M498 354L528 357.8L525.5 351.5L500.5 349Z'],
  ['paper-lit', 'M528 369L555.5 366.5L558 354L528 357.8Z'],
  ['paper', 'M528 357.8L558 354L555.5 349L530.5 351.5Z'],
  ['spine', 'M526.1 369L529.9 369L529.2 356.5L526.8 356.5Z'],
];

export function ManualArt({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g aria-hidden className={styles.art} transform={`translate(${x - MANUAL_FOOT.x} ${y - MANUAL_FOOT.y})`}>
      <ToneFacets facets={MANUAL} />
    </g>
  );
}

const SPEC_TRAIL_X = 225;
const SPEC_NODES = [510, 589, 671, 752] as const;
const BUBBLES: readonly (readonly Facet[])[] = [
  [
    ['bubble', 'M217.4 530L216.2 532.1L213.8 532.1L212.6 530L213.8 527.9L216.2 527.9Z'],
    ['glint', 'M213.8 529.5L214.8 528.4L214.9 529.5Z'],
  ],
  [
    ['bubble', 'M240.4 610L238.7 612.9L235.3 612.9L233.6 610L235.3 607.1L238.7 607.1Z'],
    ['glint', 'M235.3 609.3L236.7 607.8L236.8 609.3Z'],
  ],
  [
    ['bubble', 'M219.6 690L218.3 692.3L215.7 692.3L214.4 690L215.7 687.7L218.3 687.7Z'],
    ['glint', 'M215.7 689.5L216.7 688.3L216.9 689.5Z'],
  ],
  [
    ['bubble', 'M238.2 760L236.6 762.8L233.4 762.8L231.8 760L233.4 757.2L236.6 757.2Z'],
    ['glint', 'M233.4 759.4L234.7 757.9L234.8 759.4Z'],
  ],
];

export function TrailBubbles({ trailX, nodes }: { readonly trailX: number; readonly nodes: readonly number[] }) {
  return (
    <g aria-hidden className={styles.art} data-trail-bubbles>
      {BUBBLES.map((bubble, n) => {
        const y = nodes[n];
        const specY = SPEC_NODES[n];
        return y === undefined || specY === undefined ? null : (
          <g key={specY} transform={`translate(${trailX - SPEC_TRAIL_X} ${y - specY})`}>
            <ToneFacets facets={bubble} />
          </g>
        );
      })}
    </g>
  );
}
