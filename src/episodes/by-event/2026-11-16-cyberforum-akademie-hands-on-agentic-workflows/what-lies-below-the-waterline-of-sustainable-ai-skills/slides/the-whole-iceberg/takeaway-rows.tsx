import { depthBands, WHOLE_DEPTH } from '@/episodes/components/slide-shared/iceberg/zone-scene.pure';
import { isDarkZone, zoneToken, type Zone } from '@/episodes/components/slide-shared/iceberg/zones.pure';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './iceberg.module.css';
import { NODES, passesAt } from './rise';

export interface TakeawayLine {
  readonly text: string;
  readonly step?: 1 | 2 | 3;
}

export interface TakeawayRow {
  readonly zone: Zone;
  readonly name: string;
  readonly lines: readonly TakeawayLine[];
  readonly marker?: ReactNode;
}

const TOPS = new Map(depthBands().map(({ zone, top }) => [zone, top]));
const NODE_Y = new Map(NODES.map(({ zone, y }) => [zone, y]));

function StepChip({ zone, step }: { readonly zone: Zone; readonly step: number }) {
  const chip = isDarkZone(zone) ? 'inverse' : 'primary';
  return (
    <span data-step-marker={zone} data-chip={chip} className={cn(styles.chip, 'text-caption font-semibold')}>
      {step}
    </span>
  );
}

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
