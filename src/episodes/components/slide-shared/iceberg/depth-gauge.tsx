import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './depth-gauge.module.css';
import { ZoneCard } from './zone-card';
import { ZoneLabel } from './zone-label';
import type { ZoneLabelWords } from './zone-words.pure';
import { ZONES, zoneToken, type Zone } from './zones.pure';

export interface DepthGaugeProps {
  readonly zone: Zone;
  readonly words: ZoneLabelWords;
  readonly label: string;
  readonly className?: string;
}

function GaugeStrip({ zone }: { readonly zone: Zone }) {
  return (
    <span aria-hidden="true" data-gauge-strip className={styles.strip}>
      {ZONES.map((each) => (
        <span
          key={each}
          data-gauge-zone={each}
          data-current={each === zone ? '' : undefined}
          style={{ '--zone': zoneToken(each) } as CSSProperties}
          className={styles.segment}
        />
      ))}
    </span>
  );
}

export function DepthGauge({ zone, words, label, className }: DepthGaugeProps) {
  return (
    <div
      role="group"
      aria-label={label}
      data-depth-gauge
      data-zone={zone}
      style={{ '--at': ZONES.indexOf(zone) } as CSSProperties}
      className={cn(styles.gauge, className)}
    >
      <div className={styles.body}>
        <GaugeStrip zone={zone} />
        <ZoneCard data-gauge-reading className={cn(styles.reading, 'text-caption')}>
          <ZoneLabel words={words} className={cn(styles.label, 'font-semibold')} />
        </ZoneCard>
      </div>
    </div>
  );
}
