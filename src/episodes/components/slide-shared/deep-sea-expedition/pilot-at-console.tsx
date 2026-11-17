import { Character } from '../character/character';
import { pilot } from './cast';
import { Console } from './console';
import { consoleLayout } from './console.pure';

export interface PilotAtConsoleProps {
  readonly width: number;
  readonly reach: number;
}

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
