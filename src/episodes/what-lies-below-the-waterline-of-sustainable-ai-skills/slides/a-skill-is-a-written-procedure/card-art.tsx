import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { cn } from '@/shared/lib/utils';
import art from './card-art.json';
import styles from './slide.module.css';

/*
 * The clipboard's drawing, lifted facet by facet from the approved Spec's Option 3a (feedback 3, decision 46):
 * `card-art.json` holds it as rows of tone and outline, in the Spec's 476 by 640 units and its paint order. The card's
 * words stay HTML, so each paper, the clip and the extras are drawn as their own picture behind or beside them, each
 * cut from the Spec's sheet by its own window.
 */

export type CardPart = 'clip' | 'head' | 'body' | 'guide' | 'label' | 'preset' | 'sleeveGlint' | 'pocketFront';

/** Each part's window onto the Spec's sheet: `x y width height`. */
const WINDOW: Readonly<Record<CardPart, string>> = {
  clip: '214 20 76 48',
  head: '58 72 395 151',
  body: '58 230 395 227',
  guide: '58 460 138 125',
  label: '186 484 158 87',
  preset: '344 468 114 111',
  sleeveGlint: '34 46 436 554',
  pocketFront: '34 476 436 124',
};

/**
 * One part of the clipboard as its own picture. `fill` stretches it over its box, for a paper or the sleeve's shine
 * whose box follows the words; without it the part keeps its shape, as the clip and the extras do.
 */
export function CardArt({
  part,
  fill = false,
  className,
}: {
  readonly part: CardPart;
  readonly fill?: boolean;
  readonly className?: string;
}) {
  return (
    <svg
      viewBox={WINDOW[part]}
      preserveAspectRatio={fill ? 'none' : undefined}
      aria-hidden
      className={cn(styles.art, className)}
    >
      <ToneFacets toneAttribute="data-lp" facets={art[part]} />
    </svg>
  );
}

/**
 * The control-room wall the clipboard hangs on, in large lit facets, with the console's blue edge along its foot. It
 * stretches the Spec's 476 by 640 wall over the Scene's 1200 by 800, so it covers the whole Scene.
 */
export function RoomWall() {
  return (
    <g data-room-wall transform={`scale(${SCENE_WIDTH / 476} ${SCENE_HEIGHT / 640})`} className={styles.art}>
      <ToneFacets toneAttribute="data-lp" facets={art.wall} />
    </g>
  );
}
