import { Character } from '@/episodes/components/slide-shared/character/character';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import {
  CONSOLE_DESK_HEIGHT,
  consoleLayout,
} from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { StuffedBinder } from './stage-art';

/** The corner's drawing space: the pilot and his console, the stage's wall showing through behind them. */
const SIZE = { width: 240, height: 200, floor: 196 } as const;
const FLOOR = SIZE.floor;
const CONSOLE = { x: 96, width: 140 } as const;
/** The Spec's binder, about 130 stage units wide, brought down to the corner's console. */
const BINDER = { x: 168, scale: 0.46 } as const;

/**
 * The control-room corner of Slide 9: the pilot at his console with the stuffed binder on the desk. The pilot and the
 * console are the shared figures (design-ADR 0025); the binder is lifted from Spec Option 9a, and the wall behind
 * is the stage's own (`WallArt`).
 */
export function ConsoleCorner({ label }: { readonly label: string }) {
  const { seat } = consoleLayout({ width: CONSOLE.width, screens: 1 });
  const deskTop = FLOOR - CONSOLE_DESK_HEIGHT;
  return (
    <svg viewBox={`0 0 ${SIZE.width} ${SIZE.height}`} role="img" aria-label={label} className="block h-auto w-full">
      <Console width={CONSOLE.width} screens={1} transform={`translate(${CONSOLE.x} ${deskTop})`} />
      <g transform={`translate(${CONSOLE.x + seat.x} ${FLOOR})`}>
        <Character preset={pilot} pose="sit" mood="confused" />
      </g>
      <StuffedBinder x={BINDER.x} y={deskTop} scale={BINDER.scale} />
    </svg>
  );
}
