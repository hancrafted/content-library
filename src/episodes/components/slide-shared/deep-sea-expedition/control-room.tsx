import type { ReactNode } from 'react';
import { Art } from '../art/art';
import { artName } from '../art/art.pure';
import styles from './control-room.module.css';
import { ROOM, roomFacets, windowAt, type RoomSize } from './control-room.pure';

export type RoomTime = 'day' | 'dusk' | 'dawn';

const SKY: Record<RoomTime, string | undefined> = {
  day: styles.skyDay,
  dusk: styles.skyDusk,
  dawn: styles.skyDawn,
};

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
  readonly size?: RoomSize;
  readonly time?: RoomTime | false;
  readonly clock?: boolean;
  readonly children?: ReactNode;
}

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
export function ControlRoom({ size = ROOM, time = 'day', clock = true, children }: ControlRoomProps) {
  return (
    <g data-control-room className={styles.room}>
      <Art name={artName('control-room', size)}>
        {roomFacets(size).map(({ tone, points }) => (
          <polygon key={points} data-tone={tone} points={points} />
        ))}
      </Art>
      {time !== false && <RoomWindow time={time} size={size} />}
      {clock && <WallClock />}
      {children}
    </g>
  );
}
