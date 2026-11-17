import type { ReactNode } from 'react';
import styles from './ai-capability.module.css';
import type { LevelWords, Productivity } from './ai-capability.types';
import { TRACK_TICKS, trackPercent } from './rows.pure';
import type { Level } from './scene-frames.pure';

const CARD = 'relative rounded-2xl border border-border bg-card px-4 py-3';
const LABEL = 'text-caption font-medium tracking-wide text-muted-foreground uppercase';

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

export function EffortCellView(props: { readonly level: Level; readonly label: string; readonly scale: string }) {
  return (
    <div data-row="effort" className={`${CARD} ${styles.blend} flex items-center gap-3`}>
      <span className="text-(--tone)">{ICONS[props.level]}</span>
      <span className="flex flex-col">
        <span className={LABEL}>{props.label}</span>
        <span className="text-body font-medium">{props.scale}</span>
      </span>
    </div>
  );
}

export function Hypothesis({ children }: { readonly children: string }) {
  return (
    <span className="rounded-full border border-dashed border-muted-foreground px-2 text-caption text-muted-foreground">
      {children}
    </span>
  );
}

const spanInPercent = ([low, high]: readonly [number, number]) => {
  const left = trackPercent(low);
  return { left: `${left}%`, width: `${Math.max(trackPercent(high) - left, 1)}%` };
};

const PROMISE = TRACK_TICKS[TRACK_TICKS.length - 1];

const TICK_ALIGN: Record<(typeof TRACK_TICKS)[number], string> = {
  1: '',
  20: '-translate-x-full',
};

function Track({ range, promise }: { readonly range: Productivity; readonly promise: string }) {
  return (
    <>
      <div aria-hidden="true" className="relative h-5">
        <span className="absolute inset-x-0 top-2 h-1 rounded-full bg-muted" />
        <span className={`${styles.claimed} absolute top-1.5 h-2 rounded-full`} style={spanInPercent(range.claimed)} />
        {range.measured && (
          <span className="absolute top-4 h-1 rounded-full bg-foreground" style={spanInPercent(range.measured)} />
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

export function ProductivityCellView(props: {
  readonly words: Pick<LevelWords, 'productivity' | 'measured'>;
  readonly range: Productivity;
  readonly labels: { readonly hypothesis: string; readonly measured: string; readonly promise: string };
}) {
  const { range, labels } = props;
  return (
    <div data-row="productivity" className={`${CARD} ${styles.blend} flex flex-col gap-1.5`}>
      <p className="flex flex-wrap items-baseline gap-2">
        <span className="text-body font-semibold text-(--tone) tabular-nums">{props.words.productivity}</span>
        <Hypothesis>{labels.hypothesis}</Hypothesis>
      </p>
      <Track range={range} promise={labels.promise} />
      <p className="text-caption text-muted-foreground">
        <span className="font-medium text-foreground">{labels.measured}</span> {props.words.measured}
      </p>
    </div>
  );
}

export interface AdoptionLabels {
  readonly noData: string;
  readonly hypothesis: string;
  readonly expect: string;
  readonly expectation: string;
  readonly expectationSource: string;
}

function Expectation({ labels }: { readonly labels: AdoptionLabels }) {
  return (
    <p className="mt-1 flex flex-col gap-1 border-t border-dashed border-border pt-2 text-caption">
      <span className="flex flex-wrap items-baseline gap-2 font-semibold">
        <span aria-hidden="true" className="text-destructive">
          ◆
        </span>
        {labels.expect}
        <Hypothesis>{labels.hypothesis}</Hypothesis>
      </span>
      <span>{labels.expectation}</span>
      <span className="text-muted-foreground">{labels.expectationSource}</span>
    </p>
  );
}

export function AdoptionCellView(props: {
  readonly words: LevelWords['adoption'];
  readonly expected: boolean;
  readonly labels: AdoptionLabels;
}) {
  const { words, labels } = props;
  return (
    <div data-row="adoption" className={`${CARD} ${styles.blend} flex flex-col gap-1`}>
      {words.stat ? (
        <>
          <span className="text-subheading font-semibold text-(--tone) tabular-nums">{words.stat}</span>
          <span className="text-caption">{words.what}</span>
        </>
      ) : (
        <span className="text-body font-medium text-muted-foreground">{labels.noData}</span>
      )}
      <span className="w-fit rounded-full bg-muted px-2 text-caption">{words.population}</span>
      {words.source ? <span className="text-caption text-muted-foreground">{words.source}</span> : null}
      {props.expected ? <Expectation labels={labels} /> : null}
    </div>
  );
}
