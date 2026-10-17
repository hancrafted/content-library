import type { CSSProperties, ReactNode } from 'react';
import { Note, type Lane } from './stage-notes';
import styles from './stages-of-sale.module.css';

/** A bracket over the lanes `from` to `to`, counted from 1. */
export interface Bracket {
  slug: string;
  label: ReactNode;
  from: number;
  to: number;
  emphasis: 'primary' | 'muted';
}

interface Props {
  lanes: Lane[];
  brackets: Bracket[];
  axis: { slug: string; label: string; emphasis?: boolean }[];
}

/** The arrow to the next lane: right in a row, down when the lanes stack; dashed into the wait after the sale. */
function NextArrow({ dashed }: { dashed: boolean }) {
  const stroke = dashed ? 'fill-none stroke-muted-foreground' : 'fill-none stroke-foreground';
  return (
    <svg viewBox="0 0 32 24" className={styles.next} aria-hidden="true">
      <path
        d="M2 12 H24"
        className={stroke}
        strokeWidth="3"
        strokeDasharray={dashed ? '4 4' : undefined}
        strokeLinecap="round"
      />
      <path d="M18 4 L28 12 L18 20" className={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const LANE_SHAPE = {
  primary: 'bg-muted ring-2 ring-primary ring-offset-4 ring-offset-background',
  faint: 'border-2 border-dashed border-border',
  none: 'bg-muted',
} as const;

/** One stage: its pill, its notes, its footnote and the arrow on to the next stage. */
function StageLane({ lane, last, nextFaint }: { lane: Lane; last: boolean; nextFaint: boolean }) {
  const faint = lane.emphasis === 'faint';
  const pill = faint
    ? 'border border-foreground/30 bg-background text-muted-foreground'
    : 'bg-foreground text-background';
  return (
    <li
      data-target={lane.target}
      className={`focus-group__item relative flex flex-col gap-4 rounded-xl px-5 pt-12 pb-6 ${LANE_SHAPE[lane.emphasis ?? 'none']}`}
    >
      <h4
        className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-8 py-1.5 text-caption font-medium whitespace-nowrap ${pill}`}
      >
        {lane.label}
      </h4>
      <ul role="list" className={`flex flex-1 flex-col ${faint ? 'gap-3' : 'gap-4'}`}>
        {lane.notes.map((note, index) => (
          <Note key={note.slug} note={note} index={index} lane={lane} />
        ))}
      </ul>
      {lane.footnote ? (
        <p className="font-mono text-caption tracking-widest text-muted-foreground uppercase">{lane.footnote}</p>
      ) : null}
      {last ? null : <NextArrow dashed={nextFaint} />}
    </li>
  );
}

/** One bracket: its label over a drawn bracket, solid `primary` or dashed and muted. */
function BracketMark({ bracket }: { bracket: Bracket }) {
  const primary = bracket.emphasis === 'primary';
  return (
    <div
      style={{ '--from': bracket.from, '--to': bracket.to + 1 } as CSSProperties}
      className={`${styles.bracket} flex flex-col gap-1`}
    >
      <span
        className={`font-mono text-caption font-semibold tracking-widest uppercase ${primary ? 'text-primary' : 'text-muted-foreground'}`}
      >
        {bracket.label}
      </span>
      <svg viewBox="0 0 300 20" preserveAspectRatio="none" className="h-4 w-full" aria-hidden="true">
        <path
          d="M2 19 V7 Q2 2 7 2 H293 Q298 2 298 7 V19"
          className={primary ? 'fill-none stroke-primary' : 'fill-none stroke-muted-foreground'}
          strokeWidth={primary ? 3 : 2}
          strokeDasharray={primary ? undefined : '6 6'}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/** The brackets over the lanes: what is in your hands, and the calendar time after it. */
function Brackets({ brackets }: { brackets: Bracket[] }) {
  return (
    <div className={styles.brackets}>
      {brackets.map((bracket) => (
        <BracketMark key={bracket.slug} bracket={bracket} />
      ))}
    </div>
  );
}

/** The axis line: a start dot in `primary` and an arrowhead at the end. */
function AxisLine() {
  return (
    <div className="relative" aria-hidden="true">
      <svg viewBox="0 0 1100 16" preserveAspectRatio="none" className="h-4 w-full">
        <path
          d="M4 8 H1086 M1078 2 L1094 8 L1078 14"
          className="fill-none stroke-foreground"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="absolute top-1/2 left-0 size-3 -translate-y-1/2 rounded-full bg-primary" />
    </div>
  );
}

/** The time axis under the lanes, one label per lane. */
function Axis({ axis }: { axis: Props['axis'] }) {
  return (
    <div className="flex flex-col gap-2 pt-6">
      <AxisLine />
      <ol role="list" className={`${styles.axis} font-mono text-caption text-muted-foreground`}>
        {axis.map((tick) => (
          <li key={tick.slug} className={tick.emphasis ? 'font-semibold text-primary' : undefined}>
            {tick.label}
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * The stages of a sale as board lanes, left to right: Leads ringed in `primary` under its "in your hands" bracket,
 * Opportunities and Closing under the calendar-time bracket, and the dashed After-sale lane ending in the cash note; a
 * time axis under them all. Pointing at a lane dims the others. The lanes stand in a row when the Scene is wide enough;
 * narrower, they stack, the arrows turn down and the brackets drop.
 */
export function StageLanes({ lanes, brackets, axis }: Props) {
  return (
    <div className={`${styles.stages} flex flex-col gap-3`}>
      <Brackets brackets={brackets} />
      <ol role="list" className={`${styles.lanes} focus-group focus-group--dim-others`}>
        {lanes.map((lane, index) => (
          <StageLane
            key={lane.slug}
            lane={lane}
            last={index === lanes.length - 1}
            nextFaint={lanes[index + 1]?.emphasis === 'faint'}
          />
        ))}
      </ol>
      <Axis axis={axis} />
    </div>
  );
}
