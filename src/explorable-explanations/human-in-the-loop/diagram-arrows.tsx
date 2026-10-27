import { fanGeometry, TITLE_Y, type Connector as ConnectorKind } from './diagram-layout.pure';

/*
 * The hairlines both diagram views share: the arrow into a stage, the fans of a repeated stage's rounds and the
 * quarter-turned arrow where the stages stack.
 */

export const STRAIGHT = (
  <svg viewBox="0 0 24 10" className="h-2.5 w-6" aria-hidden="true">
    <path d="M0 5h20" className="fill-none stroke-muted-foreground" strokeWidth="1.5" />
    <path d="M18 1.5 23 5l-5 3.5z" className="fill-muted-foreground" />
  </svg>
);

function Fan({ direction, branches }: { direction: 'out' | 'in'; branches: number }) {
  const { height, lines, heads } = fanGeometry(direction, branches);
  return (
    <svg viewBox={`0 0 24 ${height}`} data-fan={direction} className="w-6" style={{ height }} aria-hidden="true">
      <path d={lines} className="fill-none stroke-muted-foreground" strokeWidth="1.5" />
      <path d={heads} className="fill-muted-foreground" />
    </svg>
  );
}

/**
 * The hairline into a stage where the row runs across: straight, fanning out to its rounds, or fanning them back in.
 * It sits in the gap before the stage's lane, measured from the lane's top where the cards stand: a straight arrow
 * meets the stage's title line, a fan meets each round card.
 */
export function Connector({ kind }: { kind: ConnectorKind }) {
  const straight = kind.kind === 'straight';
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-full hidden w-6 justify-center @2xl:flex"
      style={{ top: straight ? TITLE_Y - 5 : 0 }}
    >
      {straight ? STRAIGHT : <Fan direction={kind.kind} branches={kind.branches} />}
    </div>
  );
}

/** Where the stages stack: a straight arrow turned a quarter, above the stage, since the cards then stack too. */
export function ArrowDown() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full left-6 flex h-6 w-6 items-center justify-center @2xl:hidden"
    >
      <div className="rotate-90">{STRAIGHT}</div>
    </div>
  );
}

/** The arrow into a job card from the one above it, laid in the gap between the two cards. */
export function JobArrow() {
  return (
    <div
      aria-hidden="true"
      data-job-arrow=""
      className="pointer-events-none absolute inset-x-0 bottom-full flex h-4 items-center justify-center"
    >
      <div className="rotate-90">{STRAIGHT}</div>
    </div>
  );
}
