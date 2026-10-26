import {
  CallBubble,
  type CallLight,
  type CallWho,
} from '@/episodes/components/slide-shared/call-transcript/call-transcript';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { externalHref } from '@/shared/lib/external-link.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** The four effects the call leaves: the start and end stay sharp, the middle blurs, the standout survives. */
export type CallEffect = 'start' | 'middle' | 'standout' | 'end';

/** One effect's words in the margin, its Context marker and the note target it carries. */
export interface EffectCopy {
  /** The effect in plain words, e.g. "The start stays sharp". */
  readonly title: string;
  /** The cognitive-science term, linked to its Wikipedia article. */
  readonly term: string;
  readonly termHref: string;
  /** The short plain explanation after the term. */
  readonly explanation: string;
  /** The screen-reader hint that the link opens in a new tab. */
  readonly newTabHint: string;
  readonly marker: ReactNode;
  readonly target: TargetProps;
}

export interface PhoneCallCopy {
  readonly name: string;
  readonly duration: string;
  /** The ten lines of the call, in order. */
  readonly bubbles: readonly string[];
  readonly punchline: string;
  readonly effects: Readonly<Record<CallEffect, EffectCopy>>;
}

interface CallRow {
  readonly effect: CallEffect;
  /** Whether the bracket carries the effect's label; the faded line after the cake carries none. */
  readonly labelled: boolean;
  readonly lines: readonly { readonly who: CallWho; readonly light: CallLight }[];
}

/** The call in rows, each a run of lines under one bracket: who speaks each line and how it reads at rest. */
const ROWS: readonly CallRow[] = [
  {
    effect: 'start',
    labelled: true,
    lines: [
      { who: 'you', light: 'lit' },
      { who: 'sister', light: 'lit' },
    ],
  },
  {
    effect: 'middle',
    labelled: true,
    lines: [
      { who: 'you', light: 'faded' },
      { who: 'sister', light: 'faded' },
      { who: 'you', light: 'faded' },
      { who: 'sister', light: 'faded' },
    ],
  },
  { effect: 'standout', labelled: true, lines: [{ who: 'sister', light: 'standout' }] },
  { effect: 'middle', labelled: false, lines: [{ who: 'you', light: 'faded' }] },
  {
    effect: 'end',
    labelled: true,
    lines: [
      { who: 'sister', light: 'lit' },
      { who: 'you', light: 'lit' },
    ],
  },
];

const LINE_COUNT = ROWS.reduce((count, row) => count + row.lines.length, 0);

/** The bracket in the margin: solid primary where the call stays sharp, dashed and muted where it blurs. */
function EffectBracket({ effect }: { effect: CallEffect }) {
  const blurred = effect === 'middle';
  return (
    <span
      aria-hidden="true"
      className={cn(
        'w-1 shrink-0 rounded-full @xl:w-4 @xl:rounded-none @xl:rounded-r-md @xl:border-y-2 @xl:border-r-2 @xl:bg-transparent',
        blurred
          ? 'bg-muted-foreground/50 @xl:border-dashed @xl:border-muted-foreground/50'
          : 'bg-primary @xl:border-primary',
      )}
    />
  );
}

function EffectLabel({ copy }: { copy: EffectCopy }) {
  return (
    <div data-effect-label="" {...copy.target} className="flex flex-col gap-0.5 self-center">
      <span className="flex items-center gap-1 text-body font-semibold text-foreground">
        <span data-title="">{copy.title}</span>
        {copy.marker}
      </span>
      <p data-term-line="" className="text-caption text-muted-foreground">
        <strong className="font-semibold text-foreground">
          <a
            href={externalHref(copy.termHref)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {copy.term}
            <span className="sr-only"> ({copy.newTabHint})</span>
          </a>
          :
        </strong>{' '}
        <span data-explanation="">{copy.explanation}</span>
      </p>
    </div>
  );
}

/** Each row's first line index into the call's ten lines. */
const ROW_STARTS = ROWS.reduce<number[]>(
  (starts, row, i) => [...starts, i === 0 ? 0 : starts[i - 1] + ROWS[i - 1].lines.length],
  [],
);

function CallHeader({ name, duration }: { name: string; duration: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border pb-3">
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-full bg-muted text-caption font-semibold text-foreground"
      >
        {name.charAt(0)}
      </span>
      <div className="flex flex-col">
        <span className="text-body font-semibold">{name}</span>
        <span className="text-caption text-muted-foreground">{duration}</span>
      </div>
      <svg viewBox="0 0 24 24" className="ml-auto size-5" aria-hidden="true">
        <path
          d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"
          className="fill-none stroke-muted-foreground"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** One run of lines under its bracket: the bubbles at the left, the bracket and its label in the margin. */
function Row({ row, start, copy }: { row: CallRow; start: number; copy: PhoneCallCopy }) {
  return (
    <div data-effect={row.effect} className="grid grid-cols-12 gap-x-4 gap-y-2 @xl:gap-x-8">
      <ol className="col-span-12 flex flex-col gap-2 @xl:col-span-7">
        {row.lines.map((line, l) => (
          <CallBubble key={start + l} who={line.who} light={line.light} index={start + l}>
            {copy.bubbles[start + l]}
          </CallBubble>
        ))}
      </ol>
      <div className="col-span-12 flex items-stretch gap-3 @xl:col-span-5 @xl:gap-5">
        <EffectBracket effect={row.effect} />
        {row.labelled ? <EffectLabel copy={copy.effects[row.effect]} /> : null}
      </div>
    </div>
  );
}

/**
 * The call with your sister as one messenger thread, its effects bracketed in the margin and the punchline as the
 * brightest bubble (Spec Option 1a). Everything is shown at rest: no step, replay or entrance of its own beyond the
 * Slide's. Pointing at a bubble dims the other bubbles; the margin and the punchline stay as they are.
 */
export function PhoneCall({ copy }: { copy: PhoneCallCopy }) {
  if (copy.bubbles.length !== LINE_COUNT) {
    throw new Error(`The phone call needs ten lines, one per bubble; got ${copy.bubbles.length}.`);
  }
  return (
    <div className="@container flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-md @xl:p-8">
      <CallHeader name={copy.name} duration={copy.duration} />
      <div className="focus-group focus-group--dim-others flex flex-col gap-4">
        {ROWS.map((row, r) => (
          <Row key={r} row={row} start={ROW_STARTS[r]} copy={copy} />
        ))}
        <div className="flex justify-end pt-4">
          <p
            data-punchline=""
            className="rounded-2xl rounded-br-md bg-primary px-5 py-3 text-subheading font-semibold text-primary-foreground shadow-lg"
          >
            {copy.punchline}
          </p>
        </div>
      </div>
    </div>
  );
}
