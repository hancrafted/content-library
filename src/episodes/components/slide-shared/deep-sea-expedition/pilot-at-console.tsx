import { Character } from '../character/character';
import { pilot } from './cast';
import { Console } from './console';
import { consoleLayout } from './console.pure';

export interface PilotAtConsoleProps {
  /** The console's width in its own units; the Slide places and scales the group around it. */
  readonly width: number;
  /** How far forward of the console's seat the pilot sits, so the hands reach the desk. */
  readonly reach: number;
}

/** The pilot seated at a console: one group a control-room Slide places, scales and leaves as drawn. */
export function PilotAtConsole({ width, reach }: PilotAtConsoleProps) {
  const { seat } = consoleLayout({ width });
  return (
    <>
      <Console width={width} />
      <g transform={`translate(${seat.x + reach} ${seat.y})`}>
        <Character preset={pilot} pose="sit" />
      </g>
    </>
  );
}
