import type { ReactNode } from 'react';
import styles from './ai-capability.module.css';
import type { Ceiling, LevelWords } from './ai-capability.types';
import { TRACK_TICKS, trackPercent } from './rows.pure';
import type { Level } from './scene-frames.pure';

/*
 * The three rows the toolbar adds to a Level's column (pure views): Role, Ceiling and Mismatch. Each is one card in the
 * column's grid row, so the four Levels' cards of one row end level. The column decides which are shown.
 */

const CARD = 'relative rounded-2xl border border-border bg-card px-4 py-3';
const LABEL = 'text-caption font-medium tracking-wide text-muted-foreground uppercase';

/** One icon per role, from a single sheet to a building, growing with what the Level compares to. */
const ICONS: Record<Level, ReactNode> = {
  prompting: (
    <svg viewBox="0 0 24 30" className="h-6 w-auto" aria-hidden="true">
      <rect x="4" y="3" width="16" height="22" rx="2" className="fill-none stroke-current" strokeWidth="2" />
      <path d="M8 10h8M8 14h8M8 18h5" className="stroke-current" strokeWidth="2" />
    </svg>
  ),
  agents: (
    <svg viewBox="0 0 24 30" className="h-6 w-auto" aria-hidden="true">
      <circle cx="12" cy="9" r="5" className="fill-current" />
      <path d="M3 28c0-6 4-9 9-9s9 3 9 9z" className="fill-current" />
    </svg>
  ),
  workflows: (
    <svg viewBox="0 0 48 30" className="h-6 w-auto" aria-hidden="true">
      <circle cx="24" cy="8" r="5" className="fill-current" />
      <path d="M15 28c0-6 4-9 9-9s9 3 9 9z" className="fill-current" />
      <circle cx="9" cy="11" r="4" className="fill-current opacity-60" />
      <path d="M1 28c0-5 3-8 8-8s8 3 8 8z" className="fill-current opacity-60" />
      <circle cx="39" cy="11" r="4" className="fill-current opacity-60" />
      <path d="M31 28c0-5 3-8 8-8s8 3 8 8z" className="fill-current opacity-60" />
    </svg>
  ),
  factory: (
    <svg viewBox="0 0 40 30" className="h-6 w-auto" aria-hidden="true">
      <path
        d="M3 28V10l10-6v6l10-6v6l10-6v24z"
        className="fill-none stroke-current"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 18h4M16 18h4M24 18h4M8 23h4M16 23h4M24 23h4" className="stroke-current" strokeWidth="2" />
    </svg>
  ),
};

/** The Role row: what the Level is comparable to, a task up to an organisation. */
export function RoleCellView(props: { readonly level: Level; readonly label: string; readonly scale: string }) {
  return (
    <div data-row="role" className={`${CARD} ${styles.blend} flex items-center gap-3`}>
      <span className="text-(--tone)">{ICONS[props.level]}</span>
      <span className="flex flex-col">
        <span className={LABEL}>{props.label}</span>
        <span className="text-body font-medium">{props.scale}</span>
      </span>
    </div>
  );
}

/** A dashed tag that marks a claim no study backs yet. */
function Hypothesis({ children }: { readonly children: string }) {
  return (
    <span className="rounded-full border border-dashed border-muted-foreground px-2 text-caption text-muted-foreground">
      {children}
    </span>
  );
}

/** A range on the track, from its low end to its high end, as a left offset and a width in percent. */
const span = ([low, high]: readonly [number, number]) => {
  const left = trackPercent(low);
  return { left: `${left}%`, width: `${Math.max(trackPercent(high) - left, 1)}%` };
};

/** The last tick, the promise every ceiling is read against. */
const PROMISE = TRACK_TICKS[TRACK_TICKS.length - 1];

/** How each tick's label sits on its mark: 1× from the start, the promise ending at its tick. */
const TICK_ALIGN: Record<(typeof TRACK_TICKS)[number], string> = {
  1: '',
  20: '-translate-x-full',
};

/** The log track from 1× to past the promise: the claimed range, the measured one under it, and the promise's tick. */
function Track({ ceiling, promise }: { readonly ceiling: Ceiling; readonly promise: string }) {
  return (
    <>
      <div aria-hidden="true" className="relative h-5">
        <span className="absolute inset-x-0 top-2 h-1 rounded-full bg-muted" />
        <span className={`${styles.claimed} absolute top-1.5 h-2 rounded-full`} style={span(ceiling.claimed)} />
        {ceiling.measured && (
          <span className="absolute top-4 h-1 rounded-full bg-foreground" style={span(ceiling.measured)} />
        )}
        <span
          className="absolute inset-y-0 border-l-2 border-dotted border-destructive"
          style={{ left: `${trackPercent(PROMISE)}%` }}
        />
      </div>
      <p aria-hidden="true" className="relative h-5 text-caption text-muted-foreground tabular-nums">
        {TRACK_TICKS.map((tick) => (
          <span
            key={tick}
            className={`absolute whitespace-nowrap ${TICK_ALIGN[tick]} ${tick === PROMISE ? 'text-destructive' : ''}`}
            style={{ left: `${trackPercent(tick)}%` }}
          >
            {tick === PROMISE ? promise : `${tick}×`}
          </span>
        ))}
      </p>
    </>
  );
}

/** The Ceiling row: the claimed range, labelled a hypothesis, on a log track to the 20× promise, and what was measured. */
export function CeilingCellView(props: {
  readonly words: Pick<LevelWords, 'ceiling' | 'measured'>;
  readonly ceiling: Ceiling;
  readonly labels: { readonly hypothesis: string; readonly measured: string; readonly promise: string };
}) {
  const { ceiling, labels } = props;
  return (
    <div data-row="ceiling" className={`${CARD} ${styles.blend} flex flex-col gap-1.5`}>
      <p className="flex flex-wrap items-baseline gap-2">
        <span className="text-body font-semibold text-(--tone) tabular-nums">{props.words.ceiling}</span>
        <Hypothesis>{labels.hypothesis}</Hypothesis>
      </p>
      <Track ceiling={ceiling} promise={labels.promise} />
      <p className="text-caption text-muted-foreground">
        <span className="font-medium text-foreground">{labels.measured}</span> {props.words.measured}
      </p>
    </div>
  );
}

/** Which marker a Level carries on the gap band: most people at its start, what leaders expect at its end. */
export type GapEnd = 'here' | 'expect' | null;

/**
 * The Mismatch row: one dashed band across the four Levels, from where most people are to what leaders expect, with
 * this Level's evidence and its source under its stretch of the band.
 */
export function MismatchCellView(props: {
  readonly words: Pick<LevelWords, 'gap' | 'gapSource'>;
  readonly end: GapEnd;
  readonly labels: { readonly here: string; readonly expect: string; readonly hypothesis: string };
}) {
  const { end, labels } = props;
  return (
    <div data-row="mismatch" data-gap-end={end ?? undefined} className={`${CARD} ${styles.blend} pt-8`}>
      <span
        aria-hidden="true"
        className={`${styles.band} absolute top-3.5 border-t-3 border-dashed border-destructive/60`}
      />
      {end !== null && <span aria-hidden="true" className={`${styles.pin} absolute top-1.5 size-5 rounded-full`} />}
      {end === 'here' && <p className="text-body font-semibold">{labels.here}</p>}
      {end === 'expect' && (
        <p className="flex flex-wrap items-baseline gap-2 text-body font-semibold">
          {labels.expect}
          <Hypothesis>{labels.hypothesis}</Hypothesis>
        </p>
      )}
      <p className="text-caption">{props.words.gap}</p>
      <p className="text-caption text-muted-foreground">{props.words.gapSource}</p>
    </div>
  );
}
