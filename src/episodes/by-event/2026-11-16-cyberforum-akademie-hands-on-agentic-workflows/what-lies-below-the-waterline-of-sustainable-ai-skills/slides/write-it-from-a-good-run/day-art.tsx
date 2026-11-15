import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import type { ReactNode } from 'react';
import styles from './day-art.module.css';
import { DIVE, DIVE_BUBBLES } from './dive-facets';
import { PINNED_CARD, ROOM_WALL, WALL_CLOCK, WRITTEN_CARD } from './room-facets';
import { AFTERNOON_WINDOW, DAWN_WINDOW, DUSK_WINDOW } from './window-facets';

/** One lifted facet: its tone and its SVG path. */
type ArtFacet = readonly [tone: string, d: string];

/** The robot's cable, from the surface down to where the robot hangs. */
const CABLE = { x: 150, bottom: 110 } as const;

/** The hour the control room's window shows. */
export type RoomHour = 'afternoon' | 'dusk' | 'dawn';

const WINDOWS: Record<RoomHour, readonly ArtFacet[]> = {
  afternoon: AFTERNOON_WINDOW,
  dusk: DUSK_WINDOW,
  dawn: DAWN_WINDOW,
};

/**
 * Panel 1's background, lifted from Spec Option 10b (feedback 3, decision 46): the sky over the surface, the Sunlit
 * water with its light rays, the faceted seabed and the robot's cable from above. The shared `Robot` hangs on the
 * cable's end, passed as `children`; the thrusters' bubbles rise in front of it.
 */
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
  /** The wall clock at the upper left. */
  readonly clock?: boolean;
  /** The written card pinned to the wall beside the clock. */
  readonly pinnedCard?: boolean;
  /** The Scene's console and cast, standing on `PANEL_ART.floor`. */
  readonly children?: ReactNode;
  /** Drawn in front of the cast: the card he writes at the console. */
  readonly front?: ReactNode;
}

/**
 * Panels 2 to 4's control room, lifted from Spec Option 10b (feedback 3, decision 46): the faceted wall and floor,
 * the window at its hour (afternoon, a dusk sunset, a low morning sun), and on the next morning the wall clock and
 * the written card pinned up. Scenery only: the shared Console and cast stand in front of it.
 */
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

/** The card he writes at the console in the evening, glowing in the screen light, in panel units. */
export function WrittenCard({ dy }: { readonly dy: number }) {
  return (
    <g data-written-card transform={`translate(0 ${dy})`} className={styles.art}>
      <ToneFacets facets={WRITTEN_CARD} />
    </g>
  );
}
