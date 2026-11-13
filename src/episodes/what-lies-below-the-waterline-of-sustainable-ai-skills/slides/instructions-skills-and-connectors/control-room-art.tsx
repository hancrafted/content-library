import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { ControlRoom } from './room';
import { Cable, LabRack, Manual, Notebook, Sonar, WallBrief } from './things';

/** The Scene shows its lower part, from here to the floor: the box is twice as wide as tall. */
const VIEW_TOP = 200;

/** Where an overlay word sits over the drawing, in the Scene's units, as percentages of the visible box. */
export const at = (x: number, y: number) => ({ left: `${x / 12}%`, top: `${((y - VIEW_TOP) / 600) * 100}%` });

/** The four things the room shows, in the order the Slide reads them. */
export const THINGS = ['personal', 'project', 'skills', 'connectors'] as const;
export type Thing = (typeof THINGS)[number];

/** Where each thing's numbered pill touches it in the room. */
export const PILLS: Readonly<Record<Thing, { readonly x: number; readonly y: number }>> = {
  personal: { x: 150, y: 640 },
  project: { x: 360, y: 450 },
  skills: { x: 740, y: 450 },
  connectors: { x: 1000, y: 470 },
};

const FLOOR = 720;
const BULKHEAD = { x: 960, width: 26 } as const;
const CONSOLE = { x: 620, y: 580, width: 140, scale: 2 } as const;

/** The captain standing with the notebook held forward. */
function CaptainWithNotebook({ x, scale }: { readonly x: number; readonly scale: number }) {
  return (
    <g>
      <g transform={`translate(${x} ${FLOOR}) scale(${scale})`}>
        <Character preset={captain} pose="hold" />
      </g>
      <Notebook x={x + 22 * scale} y={FLOOR - 52 * scale} scale={scale / 2.4} />
    </g>
  );
}

/** The pilot at the console, the manual standing on its right end. */
function PilotAtConsole({
  x,
  y,
  width,
  scale,
}: {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly scale: number;
}) {
  const { seat } = consoleLayout({ width });
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Console width={width} />
      <g transform={`translate(${seat.x} ${seat.y})`}>
        <Character preset={pilot} pose="sit" />
      </g>
      <Manual x={width - 34} y={-2} scale={0.5} />
    </g>
  );
}

/** Through the bulkhead: the cable from the console up to the lab database and down into the sea to the sonar. */
function NextRoom() {
  const shaft = BULKHEAD.x + 60;
  return (
    <>
      <rect x={BULKHEAD.x} y={0} width={BULKHEAD.width} height={800} className="fill-(--bulk)" />
      <rect x={BULKHEAD.x + BULKHEAD.width} y={432} width={1200} height={8} className="fill-(--bulk)" />
      <LabRack x={1040} y={240} />
      <Cable
        points={[
          [CONSOLE.x + CONSOLE.width * CONSOLE.scale - 10, 700],
          [shaft, 700],
          [shaft, 380],
          [1040, 380],
        ]}
      />
      <Cable
        points={[
          [shaft, 600],
          [1080, 640],
        ]}
      />
      <Sonar x={1070} y={650} />
    </>
  );
}

/**
 * The control room in side view, inside `ZoneScene`: you, the captain, with your notebook; the project brief on the
 * wall; the pilot at the console with the manual; and through the bulkhead the cable up to the lab database and down
 * into the sea, where the Surface's water shows through, to the sonar.
 */
export function ControlRoomArt() {
  return (
    <>
      <ControlRoom
        floor={FLOOR}
        openings={[
          { x: 560, y: 300, width: 240, height: 160, framed: true },
          { x: BULKHEAD.x + BULKHEAD.width, y: 440, width: 1200 - BULKHEAD.x - BULKHEAD.width, height: 360 },
        ]}
      />
      <WallBrief x={360} y={250} />
      <NextRoom />
      <CaptainWithNotebook x={200} scale={2.4} />
      <PilotAtConsole {...CONSOLE} />
    </>
  );
}

/** The thing alone, cut out of the room for its panel. */
function TileThing({ thing }: { readonly thing: Thing }) {
  switch (thing) {
    case 'personal':
      return <CaptainWithNotebookTile />;
    case 'project':
      return <WallBrief x={250} y={14} scale={0.55} />;
    case 'skills':
      return <PilotAtConsole x={250} y={56} width={80} scale={0.85} />;
    case 'connectors':
      return (
        <>
          <Cable
            points={[
              [0, 40],
              [200, 40],
              [230, 90],
              [300, 96],
            ]}
          />
          <LabRack x={330} y={8} scale={0.35} />
          <Sonar x={290} y={92} scale={0.5} />
        </>
      );
  }
}

/** The captain with the notebook, at the panel's scale. */
function CaptainWithNotebookTile() {
  return (
    <>
      <g transform="translate(290 116) scale(0.9)">
        <Character preset={captain} pose="hold" />
      </g>
      <Notebook x={310} y={70} scale={0.38} />
    </>
  );
}

/** One cartoon panel: the thing alone, cut out of the room, 400 by 116 units. */
export function ThingTile({ thing, label }: { readonly thing: Thing; readonly label: string }) {
  return (
    <svg viewBox="0 0 400 116" role="img" aria-label={label} className="block h-auto w-full rounded-lg">
      <rect width={400} height={116} className="fill-(--room-wall)" />
      <polygon points="0,0 220,0 120,116 0,116" className="fill-(--room-wall-lit)" />
      <TileThing thing={thing} />
    </svg>
  );
}
