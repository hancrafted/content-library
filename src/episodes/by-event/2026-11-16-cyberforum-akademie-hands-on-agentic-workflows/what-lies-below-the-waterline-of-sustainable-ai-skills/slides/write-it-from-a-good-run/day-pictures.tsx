import type { Mood } from '@/episodes/components/slide-shared/character/actor';
import { Character, type Pose } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { CONSOLE_DESK_HEIGHT } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { robotAt } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import type { CSSProperties } from 'react';
import { DiveArt, RoomArt, WrittenCard, type RoomHour } from './day-art';
import { FIGURE_SCALE, GREETING_BUBBLE, GREETING_SAYS_SCALE, MORNING_PILOT } from './greeting.pure';
import { PANEL_ART } from './room-facets';

const FLOOR = PANEL_ART.floor;
const DESK_TOP = FLOOR - CONSOLE_DESK_HEIGHT;
const ROBOT = { x: 150, y: 110, scale: 1.25 } as const;
const CARD_DROP = -6;

const viewBox = `0 0 ${PANEL_ART.width} ${PANEL_ART.height}`;

export function RunPicture({ label, depth }: { readonly label: string; readonly depth: string }) {
  return (
    <div className="relative">
      <svg viewBox={viewBox} role="img" aria-label={label} data-zone="sunlit" className="block h-auto w-full">
        <DiveArt>
          <g transform={`translate(${ROBOT.x} ${ROBOT.y}) scale(${ROBOT.scale})`}>
            <Robot state={robotAt('write-it-from-a-good-run').state} aim="down" />
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
  readonly flip?: boolean;
}

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
    pilot: { x: MORNING_PILOT.x, flip: true },
    pilotMood: MORNING_PILOT.mood,
    captain: { x: 62, pose: 'stand' },
    morning: true,
  },
};

interface RoomPictureProps {
  readonly panel: RoomPanel;
  readonly label: string;
  readonly greeting?: string;
}

function RoomCast({ panel, greeting }: { readonly panel: RoomPanel; readonly greeting?: string }) {
  const own = ROOM_PANELS[panel];
  return (
    <>
      <Console width={own.console.width} mugs={1} transform={`translate(${own.console.x} ${DESK_TOP})`} />
      <g transform={`translate(${own.pilot.x} ${FLOOR}) scale(${FIGURE_SCALE})`}>
        <Character
          preset={pilot}
          pose="sit"
          motion={panel === 'interview' ? 'turn-to' : undefined}
          mood={own.pilotMood}
          flip={own.pilot.flip}
          says={greeting}
          bubble={greeting ? GREETING_BUBBLE : undefined}
        />
      </g>
      {own.captain && (
        <g transform={`translate(${own.captain.x} ${FLOOR}) scale(${FIGURE_SCALE})`}>
          <Character preset={captain} pose={own.captain.pose} />
        </g>
      )}
    </>
  );
}

export function RoomPicture({ panel, label, greeting }: RoomPictureProps) {
  const own = ROOM_PANELS[panel];
  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={label}
      data-room-panel={panel}
      className="block h-auto w-full"
      style={{ '--says-scale': GREETING_SAYS_SCALE } as CSSProperties}
    >
      <RoomArt
        hour={own.hour}
        clock={own.morning}
        pinnedCard={own.morning}
        front={panel === 'writing' ? <WrittenCard dy={CARD_DROP} /> : undefined}
      >
        <RoomCast panel={panel} greeting={greeting} />
      </RoomArt>
    </svg>
  );
}
