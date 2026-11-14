import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { cn } from '@/shared/lib/utils';
import styles from './iceberg.module.css';

/*
 * The props lifted from the approved Spec's Option 26a (feedback 3, decision 46): the index page's faceted paper, the
 * manual's faceted pages and spine, and the bubbles beside the trail's nodes. Facets keep the Spec's numbers; their
 * tones are this Slide's tokens on `.art` in `iceberg.module.css`. The sky, the water, the berg and the seabed stay the
 * shared `WholeDepthScene`, the ship, crew and robot the shared figures. The Spec's flat paper shadow (`drop`) stays
 * out: the Episode draws no drop shadows (feedback 2, decision 19).
 */

type Facet = readonly [tone: string, d: string];

/** The index page in the sky, in the Spec's box. */
const PAGE_BOX = '620 133 328 264';
const PAGE: readonly Facet[] = [
  ['paper-lit', 'M620 143L819 137L626 321Z'],
  ['paper', 'M819 137L940 133L948 387L628 397L626 321Z'],
  ['paper-shade', 'M926 388L947 367L948 387Z'],
];

/** The index page's paper, stretched to the HTML page it backs. */
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

/** The manual open on deck, its spine's foot at the Spec's 528, 369. */
const MANUAL_FOOT = { x: 528, y: 369 } as const;
const MANUAL: readonly Facet[] = [
  ['paper-shade', 'M501 367L528 369L528 358L498 354Z'],
  ['paper', 'M498 354L528 358L526 352L501 349Z'],
  ['paper-lit', 'M528 369L556 367L558 354L528 358Z'],
  ['paper', 'M528 358L558 354L556 349L531 352Z'],
  ['spine', 'M526 369L530 369L529 357L527 357Z'],
];

/** The manual's pages and spine, its spine's foot at `x`, `y`. */
export function ManualArt({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g aria-hidden className={styles.art} transform={`translate(${x - MANUAL_FOOT.x} ${y - MANUAL_FOOT.y})`}>
      <ToneFacets facets={MANUAL} />
    </g>
  );
}

/** The Spec's trail at x 225, and a bubble beside each node below the waterline, from the Sunlit node down. */
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

/** The bubbles beside the trail's nodes, each kept where the Spec put it against its node. */
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
