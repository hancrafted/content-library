import { Character } from '@/episodes/components/slide-shared/character/character';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { Travel } from '@/episodes/components/slide-shared/iceberg/travel';
import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import type { ReactNode } from 'react';
import { ControlRoom } from './room';

/** The order things arrive in during the dive: the card first, then what the robot sends up. */
export const ARRIVALS = ['card', 'frames', 'sonar', 'logs'] as const;
export type Arrival = (typeof ARRIVALS)[number];
/** When each arrival starts, in milliseconds after the Slide turns active; the window's blocks keep the same beat. */
export const ARRIVAL_DELAY: Readonly<Record<Arrival, number>> = { card: 200, frames: 900, sonar: 1600, logs: 2300 };
const ARRIVAL_MS = 700;

/** Where an overlay word sits over the drawing, in the Scene's 1200 by 800 units. */
export const at = (x: number, y: number) => ({
  left: `${(x / SCENE_WIDTH) * 100}%`,
  top: `${(y / SCENE_HEIGHT) * 100}%`,
});

const FEED = { x: 50, y: 50, width: 580, height: 330 } as const;
const DESK_TOP = 560;
const FLOOR = 720;
export const CARD = { x: 470, y: 420, width: 220, height: 140 } as const;

/** The robot at the seabed on the wall screen's live feed: the twilight water shows through, with the sediment below. */
function CameraFeed() {
  const bed = FEED.y + FEED.height - 50;
  return (
    <g data-camera-feed>
      <polygon
        points={`${FEED.x},${bed + 10} ${FEED.x + 200},${bed - 6} ${FEED.x + 420},${bed + 8} ${FEED.x + FEED.width},${bed - 4} ${FEED.x + FEED.width},${FEED.y + FEED.height} ${FEED.x},${FEED.y + FEED.height}`}
        className="fill-(--seabed)"
      />
      {[40, 70, 100].map((r) => (
        <path
          key={r}
          d={`M${330 - r} ${bed - 20 + r / 3} Q330 ${bed + r / 2} ${330 + r} ${bed - 20 + r / 3}`}
          strokeWidth={4}
          className="fill-none stroke-(--ping)"
        />
      ))}
      <line x1={330} y1={FEED.y} x2={330} y2={bed - 140} strokeWidth={3} className="stroke-(--frame)" />
      <g transform={`translate(330 ${bed - 140}) scale(1.6)`}>
        <Robot aim="down" lamp />
      </g>
    </g>
  );
}

/** The project brief pinned on the wall, its words the overlay's. */
function WallBrief() {
  return (
    <g data-wall-brief>
      <rect x={706} y={76} width={170} height={250} className="fill-(--paper-shade)" />
      <rect x={700} y={70} width={170} height={250} className="fill-(--paper)" />
      {[150, 180, 210, 240, 270].map((y) => (
        <rect key={y} x={720} y={y} width={120} height={5} className="fill-(--ink)" />
      ))}
      <rect x={778} y={60} width={14} height={16} className="fill-(--pin)" />
    </g>
  );
}

/** The manual on its small shelf, its index page turned out. */
function ManualShelf() {
  const tabs = ['fill-(--tab-a)', 'fill-(--tab-b)', 'fill-(--tab-c)'] as const;
  return (
    <g data-manual-shelf>
      <rect x={920} y={320} width={220} height={14} className="fill-(--wood)" />
      {[0, 1, 2, 3].map((n) => (
        <g key={n}>
          <rect x={930 + n * 30} y={170} width={24} height={150} className="fill-(--paper-shade)" />
          <rect x={934 + n * 30} y={160} width={12} height={12} className={tabs[n % 3]} />
        </g>
      ))}
      <rect x={1052} y={160} width={80} height={160} className="fill-(--paper)" />
      {[200, 225, 250, 275].map((y, n) => (
        <rect key={y} x={1062} y={y} width={10} height={10} className={tabs[n % 3]} />
      ))}
    </g>
  );
}

/** One arrival dropping onto the desk on its beat. */
function Lands({ arrival, children }: { readonly arrival: Arrival; readonly children: ReactNode }) {
  return (
    <Travel from="0 -40%" duration={ARRIVAL_MS} delay={ARRIVAL_DELAY[arrival]}>
      <g data-arrival={arrival}>{children}</g>
    </Travel>
  );
}

/** What the robot sends up later: the sonar trace on its recorder, then the logs on their clipboard. */
function Readings() {
  return (
    <>
      <Lands arrival="sonar">
        <rect x={860} y={510} width={90} height={50} className="fill-(--recorder)" />
        <rect x={878} y={440} width={54} height={72} className="fill-(--paper)" />
        <polyline
          points="884,490 894,470 902,500 910,460 918,488 926,476"
          strokeWidth={3}
          className="fill-none stroke-(--trace)"
        />
      </Lands>
      <Lands arrival="logs">
        <rect x={985} y={440} width={100} height={120} className="fill-(--wood)" />
        <rect x={995} y={455} width={80} height={98} className="fill-(--paper)" />
        <rect x={1015} y={432} width={40} height={14} className="fill-(--wood-shade)" />
        {[475, 495, 515, 535].map((y) => (
          <rect key={y} x={1005} y={y} width={56} height={4} className="fill-(--ink)" />
        ))}
      </Lands>
    </>
  );
}

/** Everything the dive brings in, landing on the desk one after another: the card, the frames, the sonar trace, the logs. */
function Arrivals() {
  return (
    <>
      <Lands arrival="card">
        <rect x={CARD.x + 6} y={CARD.y + 6} width={CARD.width} height={CARD.height} className="fill-(--paper-shade)" />
        <rect x={CARD.x} y={CARD.y} width={CARD.width} height={CARD.height} className="fill-(--paper)" />
        <rect x={CARD.x} y={CARD.y} width={CARD.width} height={8} className="fill-(--tab-a)" />
      </Lands>
      <Lands arrival="frames">
        <rect x={720} y={505} width={80} height={55} className="fill-(--paper)" />
        <rect x={727} y={511} width={66} height={43} className="fill-(--photo)" />
        <rect x={745} y={490} width={80} height={55} className="fill-(--paper)" />
        <rect x={752} y={496} width={66} height={43} className="fill-(--photo)" />
      </Lands>
      <Readings />
    </>
  );
}

/**
 * The control room at the end of the dive, as one drawing inside `ZoneScene`: the wall screen with the robot's live
 * feed, where the twilight water shows; the project brief and the manual on the wall; the pilot at the desk with his
 * notebook; and, landing one after another, everything the dive brought in.
 */
export function ControlRoomArt() {
  return (
    <>
      <ControlRoom floor={FLOOR} openings={[{ ...FEED, framed: true }]} />
      <CameraFeed />
      <WallBrief />
      <ManualShelf />
      <rect x={330} y={DESK_TOP} width={850} height={18} className="fill-(--desk)" />
      <rect x={350} y={DESK_TOP + 18} width={810} height={FLOOR - DESK_TOP - 18} className="fill-(--desk-shade)" />
      <g transform={`translate(240 ${FLOOR}) scale(2.2)`}>
        <Character preset={pilot} pose="sit" />
      </g>
      <polygon points="360,560 450,560 444,540 366,540" className="fill-(--tab-a)" />
      <Arrivals />
    </>
  );
}
