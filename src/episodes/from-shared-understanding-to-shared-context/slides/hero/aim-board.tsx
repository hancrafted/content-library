import { Dartboard } from '@/episodes/components/slide-shared/dartboard/dartboard';
import { Darts, type Point } from '@/episodes/components/slide-shared/dartboard/darts';

export interface AimBoardProps {
  /** The SVG's accessible name. */
  readonly label: string;
  /** What you hand the agent, one line per `\n`. */
  readonly handover: string;
  readonly aim: string;
  readonly ai: string;
  readonly speed: string;
  readonly intent: string;
  /** Where each document lands, by its top-left corner. */
  readonly hits: readonly Point[];
}

const BOARD = { cx: 364, cy: 220, r: 150, rings: 4, bull: 14 } as const;
const HANDOVER_LINE = 18;
/** The work order's text lines: each one's top and width. */
const WORK_ORDER_LINES = [
  [166, 44],
  [182, 56],
  [198, 48],
  [214, 34],
] as const;

/** The work order you hand the agent, raised on hover so the presenter can point at it, and its label. */
function Handover({ handover, aim }: Pick<AimBoardProps, 'handover' | 'aim'>) {
  return (
    <>
      <g data-handover className="card-hover card-hover--raise">
        <path
          d="M14 130 H70 L94 154 V236 H14 Z"
          className="fill-card stroke-primary"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d="M70 130 V154 H94" className="fill-none stroke-primary" strokeWidth={3} strokeLinejoin="round" />
        {WORK_ORDER_LINES.map(([y, width]) => (
          <rect key={y} x={26} y={y} width={width} height={6} rx={3} className="fill-primary" />
        ))}
      </g>
      <text textAnchor="middle" className="fill-primary text-caption font-semibold">
        {handover.split('\n').map((line, index) => (
          <tspan key={line} x={54} y={266 + index * HANDOVER_LINE}>
            {line}
          </tspan>
        ))}
      </text>
      <text x={54} y={112} textAnchor="middle" className="fill-muted-foreground text-caption">
        {aim}
      </text>
    </>
  );
}

/** The aim line from the work order to the board, and the AI badge on it that speeds every throw. */
function Throw({ ai, speed }: Pick<AimBoardProps, 'ai' | 'speed'>) {
  return (
    <>
      <path d="M104 183 H344" className="stroke-primary" strokeWidth={3} strokeDasharray="10 8" />
      <circle data-ai cx={150} cy={183} r={22} className="fill-ai" />
      <text x={150} y={189} textAnchor="middle" className="fill-card text-caption font-semibold">
        {ai}
      </text>
      <text x={150} y={146} textAnchor="middle" className="fill-ai text-caption font-semibold">
        {speed}
      </text>
    </>
  );
}

/**
 * The Title slide's Hero motif (picked Option 0c): the work order you hand the agent sets the aim, the AI badge
 * speeds the throw, and every document lands on the bull of the dartboard, the intent. One inline SVG; its words
 * arrive as props from the Slide's own text.
 */
export function AimBoard({ label, handover, aim, ai, speed, intent, hits }: AimBoardProps) {
  return (
    <svg viewBox="0 0 520 440" className="w-full" role="img" aria-label={label}>
      <Dartboard {...BOARD} tone="hero" />
      <text x={BOARD.cx} y={400} textAnchor="middle" className="fill-foreground text-body font-semibold">
        {intent}
      </text>
      <Handover handover={handover} aim={aim} />
      <Throw ai={ai} speed={speed} />
      <g>
        <Darts points={hits} tone="primary" shape="document" edge />
      </g>
    </svg>
  );
}
