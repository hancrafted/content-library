import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import { Clamp, type ClampIcon } from './clamp';
import styles from './loan.module.css';

export interface StatementEntry {
  readonly key: ClampIcon;
  readonly month: string;
  readonly term: string;
  /** The scene beneath the AI term; day one has none. */
  readonly scene: string;
  readonly chat: string;
  readonly coding: { readonly lead: string; readonly code: readonly string[] };
  readonly iconLabel: string;
  readonly focal?: boolean;
}

export interface CableStepperProps {
  readonly label: string;
  readonly entries: readonly StatementEntry[];
  readonly next: { readonly label: string; readonly count: string };
  readonly robotLabel: string;
}

const stepOf = (step: number) => ({ '--step': step }) as CSSProperties;

/** An entry's words: its AI term and when, the scene beneath, and what it costs in each view. */
function EntryBody({ entry }: { readonly entry: StatementEntry }) {
  const { key, month, term, scene, chat, coding, focal } = entry;
  const soft = focal ? 'text-muted-foreground' : styles.soft;
  return (
    <>
      <p className="flex items-baseline justify-between gap-4">
        <span className="text-body font-semibold">{term}</span>
        <span className={cn('shrink-0 text-caption tabular-nums', soft)}>{month}</span>
      </p>
      {scene === '' ? null : <p className={cn('text-caption', soft)}>{scene}</p>}
      <InView view="chat" as="p" className="mt-1 text-body">
        {chat}
      </InView>
      <InView view="coding" as="div">
        <p className={cn('mt-1', key === 'written' ? 'text-body' : cn('font-mono text-caption', soft))}>
          {coding.lead}
        </p>
        <code translate="no" className={cn('mt-2 block rounded-md px-3 py-2 font-mono text-caption', styles.code)}>
          {coding.code.map((line) => (
            <span key={line} className="block break-words whitespace-pre-wrap">
              {line}
            </span>
          ))}
        </code>
      </InView>
    </>
  );
}

/** An entry's card: glass over the water, or paper for the focal entry, appearing at its step. */
function EntryCard({ entry, step }: { readonly entry: StatementEntry; readonly step: number }) {
  const frame = 'min-w-0 flex-1 rounded-xl p-4';
  return entry.focal ? (
    <ZoneCard className={cn(frame, 'shadow-md', styles.arrive)} style={stepOf(step)}>
      <EntryBody entry={entry} />
    </ZoneCard>
  ) : (
    <div className={cn(frame, styles.glass, styles.arrive)} style={stepOf(step)}>
      <EntryBody entry={entry} />
    </div>
  );
}

/** The robot at the cable's end, its lamp on, drawn by the shared `Robot` in a small drawing of its own. */
function CableEnd({ label }: { readonly label: string }) {
  return (
    <svg viewBox="-55 -40 140 150" role="img" aria-label={label} className="relative z-10 w-24 shrink-0">
      <line x1={0} y1={-40} x2={0} y2={0} className={styles.robotCable} />
      <g transform="scale(1.1)">
        <Robot aim="down" />
      </g>
    </svg>
  );
}

/** The cable's end: the robot with its lamp on, beside a dashed entry for the next fix, still to come. */
function NextEntry({
  next,
  robotLabel,
  step,
}: Pick<CableStepperProps, 'next' | 'robotLabel'> & { readonly step: number }) {
  return (
    <li className="relative -ml-5 flex items-start gap-2">
      <CableEnd label={robotLabel} />
      <p
        className={cn(
          'mt-8 flex flex-1 items-baseline justify-between gap-4 rounded-xl p-4',
          styles.glass,
          styles.next,
          styles.arrive,
        )}
        style={stepOf(step)}
      >
        <span className={cn('text-body font-semibold', styles.soft)}>{next.label}</span>
        <span className={cn('text-caption', styles.soft)}>{next.count}</span>
      </p>
    </li>
  );
}

/**
 * The skill's running statement (Option 23b), a copy of the `vertical-stepper` master: its spine is the robot's cable,
 * each step a clamp with its glyph, every entry open at rest, the latest the focal mark on paper. The robot hangs at
 * the cable's end beside a dashed entry for the next fix.
 */
export function CableStepper({ label, entries, next, robotLabel }: CableStepperProps) {
  return (
    <ol aria-label={label} className="focus-group focus-group--dim-others relative flex flex-col gap-5">
      <span aria-hidden className={cn('absolute top-6 bottom-24 left-6 w-2', styles.cable)} />
      {entries.map((entry, step) => (
        <li
          key={entry.key}
          data-entry={entry.key}
          data-focal={entry.focal ? '' : undefined}
          className="focus-group__item relative flex gap-4"
        >
          <span className={styles.arrive} style={stepOf(step)}>
            <Clamp icon={entry.key} label={entry.iconLabel} />
          </span>
          <EntryCard entry={entry} step={step} />
        </li>
      ))}
      <NextEntry next={next} robotLabel={robotLabel} step={entries.length} />
    </ol>
  );
}
