import { isDarkZone, zoneToken, type Zone } from '@/episodes/components/slide-shared/iceberg/ruler.pure';
import { depthBands, WHOLE_DEPTH } from '@/episodes/components/slide-shared/iceberg/zone-scene.pure';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './iceberg.module.css';
import { NODES, passesAt } from './rise';

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

const TOPS = new Map(depthBands().map(({ zone, top }) => [zone, top]));
const NODE_Y = new Map(NODES.map(({ zone, y }) => [zone, y]));

/**
 * A step's chip: `primary`, the focal colour, on light water; inverted to the page background on water dark in both
 * themes (Midnight), where `primary` would sink into it.
 */
function StepChip({ zone, step }: { readonly zone: Zone; readonly step: number }) {
  const chip = isDarkZone(zone) ? 'inverse' : 'primary';
  return (
    <span data-step-marker={zone} data-chip={chip} className={cn(styles.chip, 'text-caption font-semibold')}>
      {step}
    </span>
  );
}

/** One zone's takeaway, written straight on its water: the zone's name, then its two lines, each led by its step. */
function Row({ row: { zone, name, lines, marker } }: { readonly row: TakeawayRow }) {
  const place = {
    '--top': TOPS.get(zone),
    '--row-water': zoneToken(zone),
    '--light-delay': `${passesAt(NODE_Y.get(zone) ?? 0)}ms`,
  } as CSSProperties;
  return (
    <li
      data-takeaway={zone}
      data-ink={isDarkZone(zone) ? 'deep' : 'shallow'}
      style={place}
      className={cn('focus-group__item', styles.row)}
    >
      <span className={cn(styles.name, 'text-caption font-semibold')}>
        <span aria-hidden className={styles.tile} />
        {name}
      </span>
      <span className={cn(styles.lines, styles.light, 'text-caption')}>
        {lines.map(({ text, step }, index) => (
          <span key={text} className={cn(styles.line, index === 0 && 'font-semibold')}>
            <span className={styles.chipSlot}>{step === undefined ? null : <StepChip zone={zone} step={step} />}</span>
            {text}
            {index === lines.length - 1 ? marker : null}
          </span>
        ))}
      </span>
    </li>
  );
}

/**
 * Each Section's takeaway at its depth (Option 26a): on a wide Scene, every row sits on its own zone's water in the
 * one picture, beside the trail's node, in light ink where the water is dark; on a narrow one the rows follow the
 * picture, each on its zone's water. Each row lights as the robot rises past it, the Abyss first.
 */
export function TakeawayRows({ label, rows }: { readonly label: string; readonly rows: readonly TakeawayRow[] }) {
  return (
    <ol
      aria-label={label}
      style={{ '--units': WHOLE_DEPTH.width, '--band': WHOLE_DEPTH.band } as CSSProperties}
      className={cn('focus-group focus-group--dim-others', styles.rows)}
    >
      {rows.map((row) => (
        <Row key={row.zone} row={row} />
      ))}
    </ol>
  );
}
