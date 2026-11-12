import { AiIcon } from '@/episodes/components/slide-shared/factory-line/icons';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './speed-the-whole-line-can-carry.module.css';

/** One station's pace, in documents a day, before AI and with it. */
export interface Pace {
  readonly id: string;
  readonly label: string;
  readonly before: number;
  readonly after: number;
}

/** The chart's face: one 200-wide slot per station, 200 high, 8 units of height per document a day. */
const SLOT = 200;
const BASE = 200;
const PER_DOCUMENT = 8;

const heightOf = (pace: number) => pace * PER_DOCUMENT;

/** The axis name, and the key to the two dashed lines: the old pace and the line speed with AI. */
function Legend({ axis, before, after }: { axis: string; before: string; after: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-caption text-muted-foreground">
      <span>{axis}</span>
      <span className="inline-flex flex-wrap items-center gap-4">
        <span className="inline-flex items-center gap-1">
          <span className="h-0.5 w-6 bg-muted-foreground" />
          {before}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-primary">
          <span className="h-0.5 w-6 bg-primary" />
          {after}
        </span>
      </span>
    </div>
  );
}

/** One station's slot: the dashed outline of its old pace, and its bar at the new one, which grows from the old. */
function Bar({ pace, slot }: { pace: Pace; slot: number }) {
  const centre = SLOT * slot + SLOT / 2;
  return (
    <g>
      <rect
        x={centre - 40}
        y={BASE - heightOf(pace.before)}
        width={80}
        height={heightOf(pace.before)}
        rx={6}
        className="fill-none stroke-muted-foreground"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
      <rect
        data-pace-bar=""
        x={centre - 30}
        y={BASE - heightOf(pace.after) + 2}
        width={60}
        height={heightOf(pace.after) - 2}
        rx={6}
        style={{ '--from': pace.before / pace.after } as CSSProperties}
        className={cn('fill-ai/25 stroke-ai', styles.bar)}
        strokeWidth={2}
      />
    </g>
  );
}

/** The station chips under the bars, each with its pace; pointing at one dims the rest. */
function Chips({ paces, unit, label }: { paces: readonly Pace[]; unit: string; label: string }) {
  return (
    <ol aria-label={label} className="focus-group focus-group--dim-others grid grid-cols-5 text-center">
      {paces.map((pace) => (
        <li key={pace.id} className="focus-group__item flex min-w-0 flex-col items-center gap-1">
          <span className="inline-flex items-center gap-1 rounded-full px-1 py-1 text-caption font-semibold text-ai @xl:bg-ai/10 @xl:px-3">
            <AiIcon className="hidden @xl:block" />
            <span className="hyphens-auto">{pace.label}</span>
          </span>
          <span className="text-caption text-muted-foreground">{unit}</span>
        </li>
      ))}
    </ol>
  );
}

/** The bars on their face: the line speed and the old pace as dashed lines across, over the baseline. */
function Chart({ paces }: { paces: readonly Pace[] }) {
  const width = SLOT * paces.length;
  const lineSpeed = BASE - heightOf(paces[0]?.after ?? 0);
  const oldSpeed = BASE - heightOf(paces[0]?.before ?? 0);
  return (
    <svg viewBox={`0 0 ${width} ${BASE}`} className="w-full" aria-hidden="true">
      <path d={`M0 ${lineSpeed}H${width}`} className="stroke-primary" strokeWidth={2.5} strokeDasharray="10 6" />
      <path d={`M0 ${oldSpeed}H${width}`} className="stroke-muted-foreground" strokeWidth={1.5} strokeDasharray="6 6" />
      <path d={`M0 ${BASE - 1}H${width}`} className="stroke-foreground" strokeWidth={2} />
      {paces.map((pace, slot) => (
        <Bar key={pace.id} pace={pace} slot={slot} />
      ))}
    </svg>
  );
}

/** What `PaceBars` shows: the paces, and the words of its legend and chips. */
export interface PaceBarsProps {
  readonly paces: readonly Pace[];
  readonly axis: string;
  readonly before: string;
  readonly after: string;
  /** The pace under each chip: "20 a day". */
  readonly unit: string;
  /** The chips' accessible name. */
  readonly label: string;
}

/**
 * Balance drawn as a chart: each station's bar at its pace with AI, in `ai`, over a dashed outline of its old pace,
 * under one dashed line, the line speed, in `primary`; the station chips under it name the bars. Under `[data-play]`
 * every bar grows from the old level to the new one, all together.
 */
export function PaceBars({ paces, axis, before, after, unit, label }: PaceBarsProps) {
  return (
    <div className="flex flex-col gap-2">
      <Legend axis={axis} before={before} after={after} />
      <Chart paces={paces} />
      <Chips paces={paces} unit={unit} label={label} />
    </div>
  );
}
