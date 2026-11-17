import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { cn } from '@/shared/lib/utils';
import art from './card-art.json';
import styles from './slide.module.css';

export type CardPart = 'clip' | 'head' | 'body' | 'guide' | 'label' | 'preset' | 'sleeveGlint' | 'pocketFront';

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

export function RoomWall() {
  return (
    <g data-room-wall transform={`scale(${SCENE_WIDTH / 476} ${SCENE_HEIGHT / 640})`} className={styles.art}>
      <ToneFacets toneAttribute="data-lp" facets={art.wall} />
    </g>
  );
}
