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

/*
 * The control room at the end of the dive, lifted facet by facet from the approved Spec's Option 5b (feedback 3,
 * decision 46): `room-art.json` holds its drawing as rows of tone and outline, in the Spec's 720 by 560 units and its
 * paint order. The Scene's box keeps that ratio, so the room fills it, scaled to the Scene's height and centred; every
 * place below is in the Spec's units. The Spec's own pilot and robot are left out: the shared cast and Robot stand in
 * their place.
 */

/** The room's size in the Spec's units; the Scene's box keeps its ratio. */
export const ROOM = { width: 720, height: 560 } as const;
const SCALE = SCENE_HEIGHT / ROOM.height;
const LEFT = (SCENE_WIDTH - ROOM.width * SCALE) / 2;

/** The order things arrive in during the dive: the card first, then what the robot sends up. */
export const ARRIVALS = ['card', 'frames', 'sonar', 'logs'] as const;
export type Arrival = (typeof ARRIVALS)[number];
/** When each arrival starts, in milliseconds after the Slide turns active; the window's blocks keep the same beat. */
export const ARRIVAL_DELAY: Readonly<Record<Arrival, number>> = { card: 200, frames: 900, sonar: 1600, logs: 2300 };
const ARRIVAL_MILLISECONDS = 700;

/** Where an overlay word sits over the room, in the Spec's units, as percentages of the visible box. */
export const at = (x: number, y: number) => ({
  left: `${(x / ROOM.width) * 100}%`,
  top: `${(y / ROOM.height) * 100}%`,
});

/** The pulled card propped on the desk, its title the overlay's. */
export const CARD = { x: 280, y: 258, width: 168, height: 94 } as const;
/** Where the robot hangs on its tether in the camera feed, the tether's end; the floor the pilot's chair stands on. */
const ROBOT = { x: 206, y: 144, scale: 1.15 } as const;
const PILOT = { x: 124, y: 486, scale: 1.5 } as const;
/** The wall screen's glass, which the feed's drawing and the robot's beam stay inside. */
const SCREEN = { x: 36, y: 34, width: 368, height: 212 } as const;

/** One arrival dropping onto the desk on its beat. */
function Lands({ arrival, children }: { readonly arrival: Arrival; readonly children: ReactNode }) {
  return (
    <Travel from="0 -40%" duration={ARRIVAL_MILLISECONDS} delay={ARRIVAL_DELAY[arrival]}>
      <g data-arrival={arrival}>{children}</g>
    </Travel>
  );
}

/**
 * The wall screen's live feed: Sunlit shallows with light rays over a seabed of sediment and stones, the robot hanging
 * on its tether in the water (decision 59) with its lamp on the bed, its sonar rings, a core marker, a few fish and a jelly. The glass clips
 * it, the beam too; its `clipPath` id comes from `useId`, so a copied Slide repeats none.
 */
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

/** Everything the dive brings in, landing on the desk one after another: the card, the frames, the sonar trace, the logs. */
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

/**
 * The control room at the end of the dive, as one drawing inside `ZoneScene`: the wall screen with the robot's live
 * feed; the project brief and the manual on the wall; the pilot at the desk with his notebook; and, landing one after
 * another, everything the dive brought in.
 */
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
