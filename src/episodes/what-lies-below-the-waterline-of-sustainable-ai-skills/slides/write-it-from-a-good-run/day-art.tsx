import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import type { ReactNode } from 'react';
import styles from './day-art.module.css';
import { DIVE, DIVE_BUBBLES } from './dive-facets';
import { PINNED_CARD, ROOM_WALL, WALL_CLOCK, WRITTEN_CARD } from './room-facets';
import { AFTERNOON_WINDOW, DAWN_WINDOW, DUSK_WINDOW } from './window-facets';

type ArtFacet = readonly [tone: string, d: string];

const CABLE = { x: 150, bottom: 110 } as const;

export type RoomHour = 'afternoon' | 'dusk' | 'dawn';

const WINDOWS: Record<RoomHour, readonly ArtFacet[]> = {
  afternoon: AFTERNOON_WINDOW,
  dusk: DUSK_WINDOW,
  dawn: DAWN_WINDOW,
};

export function DiveArt({ children }: { readonly children?: ReactNode }) {
  return (
    <g data-dive-art className={styles.art}>
      <ToneFacets facets={DIVE} />
      <line x1={CABLE.x} y1={0} x2={CABLE.x} y2={CABLE.bottom} className={styles.cable} />
      {children}
      <ToneFacets facets={DIVE_BUBBLES} />
    </g>
  );
}

export interface RoomArtProps {
  readonly hour: RoomHour;
  readonly clock?: boolean;
  readonly pinnedCard?: boolean;
  readonly children?: ReactNode;
  readonly front?: ReactNode;
}

export function RoomArt({ hour, clock = false, pinnedCard = false, children, front }: RoomArtProps) {
  return (
    <g data-room-art={hour} className={styles.art}>
      <ToneFacets facets={ROOM_WALL} />
      <ToneFacets facets={WINDOWS[hour]} />
      {clock && (
        <g data-wall-clock>
          <ToneFacets facets={WALL_CLOCK} />
        </g>
      )}
      {pinnedCard && (
        <g data-pinned-card>
          <ToneFacets facets={PINNED_CARD} />
        </g>
      )}
      {children}
      {front}
    </g>
  );
}

export function WrittenCard({ dy }: { readonly dy: number }) {
  return (
    <g data-written-card transform={`translate(0 ${dy})`} className={styles.art}>
      <ToneFacets facets={WRITTEN_CARD} />
    </g>
  );
}
