import { Character } from '@/episodes/components/slide-shared/character/character';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import {
  CONSOLE_DESK_HEIGHT,
  consoleLayout,
} from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { StuffedBinder } from './stage-art';

const SIZE = { width: 240, height: 200, floor: 196 } as const;
const FLOOR = SIZE.floor;
const CONSOLE = { x: 96, width: 140 } as const;
const BINDER = { x: 168, scale: 0.6 } as const;
const PILOT_REACH = 24;

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
export function ConsoleCorner({ label }: { readonly label: string }) {
  const { seat } = consoleLayout({ width: CONSOLE.width, screens: 1 });
  const deskTop = FLOOR - CONSOLE_DESK_HEIGHT;
  return (
    <svg viewBox={`0 0 ${SIZE.width} ${SIZE.height}`} role="img" aria-label={label} className="block h-auto w-full">
      <Console width={CONSOLE.width} screens={1} transform={`translate(${CONSOLE.x} ${deskTop})`} />
      <g transform={`translate(${CONSOLE.x + seat.x + PILOT_REACH} ${FLOOR})`}>
        <Character preset={pilot} pose="sit" mood="confused" />
      </g>
      <StuffedBinder x={BINDER.x} y={deskTop} scale={BINDER.scale} />
    </svg>
  );
}
