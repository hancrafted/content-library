import type { Mood } from '@/episodes/components/slide-shared/character/actor';
import { Character, type Pose } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { CONSOLE_DESK_HEIGHT } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { DiveArt, PANEL_ART, RoomArt, WrittenCard, type RoomHour } from './day-art';

const FLOOR = PANEL_ART.floor;
const DESK_TOP = FLOOR - CONSOLE_DESK_HEIGHT;
/** The figures at the Spec's size in its 300 by 236 panel. */
const FIGURE_SCALE = 1.2;
/** The robot on its cable, 2 m above the seabed, at the Spec's size. */
const ROBOT = { x: 150, y: 110, scale: 1.25 } as const;
/** The written card on the evening console: the Spec drew it on a lower desk, so it drops onto ours. */
const CARD_DROP = -6;

const viewBox = `0 0 ${PANEL_ART.width} ${PANEL_ART.height}`;

/** Panel 1: this morning's run went well, the robot holding 2 m over the seabed, lamp down. */
export function RunPicture({ label, depth }: { readonly label: string; readonly depth: string }) {
  return (
    <div className="relative">
      <svg viewBox={viewBox} role="img" aria-label={label} data-zone="sunlit" className="block h-auto w-full">
        <DiveArt>
          <g transform={`translate(${ROBOT.x} ${ROBOT.y}) scale(${ROBOT.scale})`}>
            <Robot aim="down" />
          </g>
        </DiveArt>
      </svg>
      <span
        data-depth-bracket
        className="absolute right-[14%] bottom-[12%] border-y-2 border-r-2 border-foreground px-1 text-caption font-semibold"
      >
        {depth}
      </span>
    </div>
  );
}

export type RoomPanel = 'interview' | 'writing' | 'next-morning';

interface Figure {
  readonly x: number;
  /** Faces left, towards the captain. */
  readonly flip?: boolean;
}

/**
 * Each room panel's hour and cast, as Spec Option 10b stands them: in the afternoon the pilot turns from his console
 * to ask the captain why; at dusk he writes the card alone at his console; the next morning the card hangs on the wall
 * by the clock and he greets the captain as a stranger.
 */
const ROOM_PANELS: Record<
  RoomPanel,
  {
    hour: RoomHour;
    console: { x: number; width: number };
    pilot: Figure;
    pilotMood: Mood;
    captain?: { x: number; pose: Pose };
    morning: boolean;
  }
> = {
  interview: {
    hour: 'afternoon',
    console: { x: 226, width: 74 },
    pilot: { x: 206, flip: true },
    pilotMood: 'confused',
    captain: { x: 70, pose: 'point' },
    morning: false,
  },
  writing: {
    hour: 'dusk',
    console: { x: 186, width: 106 },
    pilot: { x: 146 },
    pilotMood: 'thinking',
    morning: false,
  },
  'next-morning': {
    hour: 'dawn',
    console: { x: 226, width: 74 },
    pilot: { x: 212, flip: true },
    pilotMood: 'blank',
    captain: { x: 62, pose: 'stand' },
    morning: true,
  },
};

/** The pilot's greeting the next morning, a speech bubble over the picture by his head. */
function Greeting({ children }: { readonly children: string }) {
  return (
    <p
      data-says="pilot"
      className="absolute top-[34%] right-2 max-w-[60%] rounded-2xl rounded-br-none border-2 border-ai bg-card px-2.5 py-0.5 text-caption font-medium text-card-foreground"
    >
      {children}
    </p>
  );
}

interface RoomPictureProps {
  readonly panel: RoomPanel;
  readonly label: string;
  /** What the pilot says, in the next morning's panel only. */
  readonly greeting?: string;
}

/**
 * Panels 2 to 4, in the control room. The room is this Slide's own drawing (`RoomArt`, Spec Option 10b); the people
 * and the console are the shared figures. The next morning's greeting is the panel's own HTML speech, over the picture.
 */
export function RoomPicture({ panel, label, greeting }: RoomPictureProps) {
  const own = ROOM_PANELS[panel];
  const motion = panel === 'interview' ? 'turn-to' : undefined;
  return (
    <div className="relative">
      <svg viewBox={viewBox} role="img" aria-label={label} data-room-panel={panel} className="block h-auto w-full">
        <RoomArt
          hour={own.hour}
          clock={own.morning}
          pinnedCard={own.morning}
          front={panel === 'writing' ? <WrittenCard dy={CARD_DROP} /> : undefined}
        >
          <Console width={own.console.width} mugs={1} transform={`translate(${own.console.x} ${DESK_TOP})`} />
          <g transform={`translate(${own.pilot.x} ${FLOOR}) scale(${FIGURE_SCALE})`}>
            <Character preset={pilot} pose="sit" motion={motion} mood={own.pilotMood} flip={own.pilot.flip} />
          </g>
          {own.captain && (
            <g transform={`translate(${own.captain.x} ${FLOOR}) scale(${FIGURE_SCALE})`}>
              <Character preset={captain} pose={own.captain.pose} />
            </g>
          )}
        </RoomArt>
      </svg>
      {greeting && <Greeting>{greeting}</Greeting>}
    </div>
  );
}
