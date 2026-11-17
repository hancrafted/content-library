import { Character } from '@/episodes/components/slide-shared/character/character';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { robotAt } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import { useId, type ReactNode } from 'react';
import art from './room-art.json';
import styles from './slide.module.css';

export const ROOM = { width: 720, height: 560 } as const;
const SCALE = SCENE_HEIGHT / ROOM.height;
const LEFT = (SCENE_WIDTH - ROOM.width * SCALE) / 2;

export const ARRIVALS = ['card', 'frames', 'sonar', 'logs'] as const;
export type Arrival = (typeof ARRIVALS)[number];
export const ARRIVAL_DELAY_MILLISECONDS: Readonly<Record<Arrival, number>> = {
  card: 200,
  frames: 900,
  sonar: 1600,
  logs: 2300,
};
const ARRIVAL_MILLISECONDS = 700;

export const at = (x: number, y: number) => ({
  left: `${(x / ROOM.width) * 100}%`,
  top: `${(y / ROOM.height) * 100}%`,
});

export const CARD = { x: 280, y: 258, width: 168, height: 94 } as const;
const ROBOT = { x: 206, y: 144, scale: 1.15 } as const;
const PILOT = { x: 124, y: 486, scale: 1.5 } as const;
const SCREEN = { x: 36, y: 34, width: 368, height: 212 } as const;

function Lands({ arrival, children }: { readonly arrival: Arrival; readonly children: ReactNode }) {
  return (
    <Travel from="0 -40%" duration={ARRIVAL_MILLISECONDS} delay={ARRIVAL_DELAY_MILLISECONDS[arrival]}>
      <g data-arrival={arrival}>{children}</g>
    </Travel>
  );
}

function CameraFeed() {
  const clip = useId();
  return (
    <g data-camera-feed clipPath={`url(#${clip})`}>
      <clipPath id={clip}>
        <rect {...SCREEN} />
      </clipPath>
      <ToneFacets toneAttribute="data-lp" part="feed-water" facets={art.feedWater} />
      <g transform={`translate(${ROBOT.x} ${ROBOT.y}) scale(${ROBOT.scale})`}>
        <Robot state={robotAt('skills-are-dynamic-context').state} aim="down" lamp />
      </g>
      <ToneFacets toneAttribute="data-lp" part="feed-life" facets={art.feedLife} />
    </g>
  );
}

function Arrivals() {
  return (
    <>
      <Lands arrival="card">
        <ToneFacets toneAttribute="data-lp" part="card" facets={art.card} />
      </Lands>
      <Lands arrival="frames">
        <ToneFacets toneAttribute="data-lp" part="frames" facets={art.frames} />
      </Lands>
      <Lands arrival="sonar">
        <ToneFacets toneAttribute="data-lp" part="sonar" facets={art.sonar} />
      </Lands>
      <Lands arrival="logs">
        <ToneFacets toneAttribute="data-lp" part="logs" facets={art.logs} />
      </Lands>
    </>
  );
}

export function ControlRoomArt() {
  return (
    <g transform={`translate(${LEFT} 0) scale(${SCALE})`} className={styles.art}>
      <ToneFacets toneAttribute="data-lp" part="room" facets={art.room} />
      <CameraFeed />
      <ToneFacets toneAttribute="data-lp" part="wall" facets={art.wall} />
      <ToneFacets toneAttribute="data-lp" part="desk" facets={art.desk} />
      <g transform={`translate(${PILOT.x} ${PILOT.y}) scale(${PILOT.scale})`}>
        <Character preset={pilot} pose="sit" />
      </g>
      <ToneFacets toneAttribute="data-lp" part="notebook" facets={art.notebook} />
      <Arrivals />
    </g>
  );
}
