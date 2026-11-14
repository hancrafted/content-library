import type { ReactNode } from 'react';
import styles from './control-room.module.css';
import { ROOM, roomFacets, windowAt, type RoomSize } from './control-room.pure';

/** The hour the window shows: day, a low sun at dusk on the left, or at dawn on the right. */
export type RoomTime = 'day' | 'dusk' | 'dawn';

const SKY: Record<RoomTime, string | undefined> = {
  day: styles.skyDay,
  dusk: styles.skyDusk,
  dawn: styles.skyDawn,
};

/** The window onto the deck at its hour: sky, a low sun at dusk and dawn, sea, frame and mullion. */
function RoomWindow({ time, size }: { readonly time: RoomTime; readonly size: RoomSize }) {
  const { x, y } = windowAt(size);
  return (
    <g data-room-window={time} transform={`translate(${x} ${y})`}>
      <rect width={92} height={56} rx={2} className={styles.frame} />
      <rect x={4} y={4} width={84} height={26} className={SKY[time]} />
      {time !== 'day' && <circle cx={time === 'dusk' ? 30 : 66} cy={30} r={7} className={styles.sun} />}
      <rect x={4} y={30} width={84} height={22} className={styles.sea} />
      <rect x={45} y={4} width={2} height={48} className={styles.frame} />
    </g>
  );
}

/** The wall clock: the days pass under it. */
function WallClock() {
  return (
    <g data-wall-clock transform="translate(26 44)">
      <circle r={10} className={styles.clockFace} />
      <line x1={0} y1={0} x2={0} y2={-6} className={styles.clockHand} />
      <line x1={0} y1={0} x2={4.5} y2={2} className={styles.clockHand} />
    </g>
  );
}

export interface ControlRoomProps {
  /** The room's drawing space; the comic panels' 300 by 180 room, floor at 158, when left out. */
  readonly size?: RoomSize;
  /** The hour the window onto the deck shows, or `false` for a bare wall. */
  readonly time?: RoomTime | false;
  /** The wall clock at the left; `false` leaves it off. */
  readonly clock?: boolean;
  /** The Scene's own cast, console and props, drawn in front of the room and standing on `size.floor`. */
  readonly children?: ReactNode;
}

/**
 * The control room the pilot's console stands in (design-ADR 0025, "Scene figures are deep modules"): a faceted wall
 * lit from the upper left, the floor, the window onto the deck at its hour and the wall clock. Scenery only: it draws
 * no figure; a Scene places its cast and the `Console` as children on the floor line, and draws its own props (a
 * pinned card, a binder) the same way. An SVG group with no motion, placed in the Scene's own `<svg>`.
 */
export function ControlRoom({ size = ROOM, time = 'day', clock = true, children }: ControlRoomProps) {
  return (
    <g data-control-room className={styles.room}>
      {roomFacets(size).map(({ tone, points }) => (
        <polygon key={points} data-tone={tone} points={points} />
      ))}
      {time !== false && <RoomWindow time={time} size={size} />}
      {clock && <WallClock />}
      {children}
    </g>
  );
}
