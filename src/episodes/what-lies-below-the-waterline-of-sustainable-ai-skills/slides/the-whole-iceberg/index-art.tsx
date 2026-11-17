import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { cn } from '@/shared/lib/utils';
import styles from './iceberg.module.css';

type Facet = readonly [tone: string, d: string];

const PAGE_BOX = '620 133 328 264';
const PAGE: readonly Facet[] = [
  ['paper-lit', 'M620 143L819 137L626 321Z'],
  ['paper', 'M819 137L940 133L948 387L628 397L626 321Z'],
  ['paper-shade', 'M926 388L947 367L948 387Z'],
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
  ['paper-shade', 'M501 367L528 369L528 358L498 354Z'],
  ['paper', 'M498 354L528 358L526 352L501 349Z'],
  ['paper-lit', 'M528 369L556 367L558 354L528 358Z'],
  ['paper', 'M528 358L558 354L556 349L531 352Z'],
  ['spine', 'M526 369L530 369L529 357L527 357Z'],
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
    ['bubble', 'M217 530L216 532L214 532L213 530L214 528L216 528Z'],
    ['glint', 'M214 530L215 528L215 530Z'],
  ],
  [
    ['bubble', 'M240 610L239 613L235 613L234 610L235 607L239 607Z'],
    ['glint', 'M235 609L237 608L237 609Z'],
  ],
  [
    ['bubble', 'M220 690L218 692L216 692L214 690L216 688L218 688Z'],
    ['glint', 'M216 690L217 688L217 690Z'],
  ],
  [
    ['bubble', 'M238 760L237 763L233 763L232 760L233 757L237 757Z'],
    ['glint', 'M233 759L235 758L235 759Z'],
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
