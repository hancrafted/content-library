import type { ReactNode } from 'react';
import styles from './control-room.module.css';

/** The room's drawing space; the floor line, where figures stand, runs at `FLOOR`. */
export const ROOM_WIDTH = 300;
export const ROOM_HEIGHT = 180;
export const FLOOR = 158;

/** The hour the window shows: the interview in the afternoon, the writing at dusk, the next morning at dawn. */
export type RoomTime = 'day' | 'dusk' | 'dawn';

const SKY: Record<RoomTime, string | undefined> = {
  day: styles.skyDay,
  dusk: styles.skyDusk,
  dawn: styles.skyDawn,
};

/** Wall and floor facets, lit from the upper left. Copied from Slide 8's control room. */
const FACETS: readonly { readonly points: string; readonly tone: string }[] = [
  { points: '0,0 130,0 70,84 0,64', tone: 'lit' },
  { points: '130,0 300,0 300,56 196,96', tone: 'mid' },
  { points: '130,0 196,96 70,84', tone: 'lit' },
  { points: '0,64 70,84 36,158 0,158', tone: 'mid' },
  { points: '70,84 196,96 160,158 36,158', tone: 'lit' },
  { points: '196,96 300,56 300,158 160,158', tone: 'shade' },
  { points: `0,${FLOOR} ${ROOM_WIDTH},${FLOOR} ${ROOM_WIDTH},${ROOM_HEIGHT} 0,${ROOM_HEIGHT}`, tone: 'floor' },
  { points: `0,${FLOOR} 140,${FLOOR} 96,${ROOM_HEIGHT} 0,${ROOM_HEIGHT}`, tone: 'floor-lit' },
];

/** The window onto the deck at its hour: sky, a low sun at dusk and dawn, sea, frame and mullion. */
function RoomWindow({ time }: { readonly time: RoomTime }) {
  return (
    <g data-room-window={time}>
      <rect x={196} y={10} width={92} height={56} rx={2} className={styles.frame} />
      <rect x={200} y={14} width={84} height={26} className={SKY[time]} />
      {time !== 'day' && <circle cx={time === 'dusk' ? 226 : 262} cy={40} r={7} className={styles.sun} />}
      <rect x={200} y={40} width={84} height={22} className={styles.sea} />
      <rect x={241} y={14} width={2} height={48} className={styles.frame} />
    </g>
  );
}

/** The wall clock. */
function WallClock() {
  return (
    <g data-wall-clock transform="translate(26 44)">
      <circle r={10} className={styles.clockFace} />
      <line x1={0} y1={0} x2={0} y2={-6} className={styles.clockHand} />
      <line x1={0} y1={0} x2={4.5} y2={2} className={styles.clockHand} />
    </g>
  );
}

/** The written card, pinned to the wall: the skill, still there the next morning. */
export function PinnedCard({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g data-pinned-card transform={`translate(${x} ${y})`}>
      <rect width={26} height={34} className={styles.paper} />
      {[9, 15, 21, 27].map((lineY) => (
        <line key={lineY} x1={5} y1={lineY} x2={21} y2={lineY} className={styles.paperLine} />
      ))}
      <circle cx={13} cy={3} r={2.2} className={styles.pin} />
    </g>
  );
}

/**
 * The control room the day's panels play in: faceted wall and floor, the window at its hour and the wall clock.
 * Scenery only: the cast and the console come from the shared figures and stand on `FLOOR`.
 */
export function ControlRoom({ time, children }: { readonly time: RoomTime; readonly children?: ReactNode }) {
  return (
    <g data-control-room className={styles.room}>
      {FACETS.map(({ points, tone }) => (
        <polygon key={points} data-tone={tone} points={points} />
      ))}
      <RoomWindow time={time} />
      <WallClock />
      {children}
    </g>
  );
}
