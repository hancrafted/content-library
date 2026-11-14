import type { Zone } from '@/episodes/components/slide-shared/iceberg/ruler.pure';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './iceberg.module.css';

export interface TakeawayLine {
  readonly text: string;
  /** The Actionable this line carries, numbered as the step cards below are. */
  readonly step?: 1 | 2 | 3;
}

export interface TakeawayRow {
  readonly zone: Zone;
  readonly name: string;
  readonly lines: readonly TakeawayLine[];
  /** A Context marker after the row, where the picked Option shows one. */
  readonly marker?: ReactNode;
}

const ZONES = 5;

function StepMarker({ zone, step }: { readonly zone: Zone; readonly step: number }) {
  return (
    <span
      data-step-marker={zone}
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-primary-foreground"
    >
      {step}
    </span>
  );
}

/** A takeaway's two lines, each led by the step it carries, if any. */
function Lines({ zone, lines }: Pick<TakeawayRow, 'zone' | 'lines'>) {
  return (
    <span className="flex min-w-0 flex-1 flex-col">
      {lines.map(({ text, step }) => (
        <span key={text} className="flex items-start gap-2 text-caption">
          {step === undefined ? null : <StepMarker zone={zone} step={step} />}
          <span>{text}</span>
        </span>
      ))}
    </span>
  );
}

/** One zone's row: its own water, the zone's name and the takeaway, lit when the robot passes. */
function Row({ row: { zone, name, lines, marker }, rise }: { readonly row: TakeawayRow; readonly rise: number }) {
  return (
    <li data-takeaway={zone} className="focus-group__item">
      <ZoneScene
        zone={zone}
        iceberg="none"
        className="px-3 py-2.5 @3xl:px-5"
        overlay={
          <div className={cn('flex items-center gap-3', styles.light)} style={{ '--rise': rise } as CSSProperties}>
            <span aria-hidden className={cn('size-2.5 shrink-0', styles.node)} />
            <ZoneCard className="flex min-w-0 flex-1 flex-col gap-1 rounded-lg px-3 py-1.5 @3xl:flex-row @3xl:items-center @3xl:gap-4">
              <span className="w-28 shrink-0 text-caption font-semibold">{name}</span>
              <Lines zone={zone} lines={lines} />
              {marker}
            </ZoneCard>
          </div>
        }
      />
    </li>
  );
}

/**
 * The whole depth below the Surface (Option 26a): one row per zone, each over its own zone's water, holding the
 * Section's takeaway at its depth with the three steps numbered where they surfaced. Each row lights as the robot
 * passes it, the Abyss first.
 */
export function TakeawayRows({ label, rows }: { readonly label: string; readonly rows: readonly TakeawayRow[] }) {
  return (
    <ol aria-label={label} className={cn('focus-group focus-group--dim-others flex flex-col', styles.rows)}>
      {rows.map((row, depth) => (
        <Row key={row.zone} row={row} rise={ZONES - 1 - depth} />
      ))}
    </ol>
  );
}
