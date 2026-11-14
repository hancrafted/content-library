import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './depth-gauge.module.css';
import { ZoneCard } from './zone-card';
import { ZoneLabel } from './zone-label';
import type { ZoneLabelWords } from './zone-words.pure';
import { ZONES, zoneToken, type Zone } from './zones.pure';

export interface DepthGaugeProps {
  /** The zone the Slide sits in: its segment is marked and its name shown. */
  readonly zone: Zone;
  /** That zone's words, read by the Slide from its own `i18n/` (`zoneWordsFrom`). */
  readonly words: ZoneLabelWords;
  /** The gauge's name for assistive tech: `Depth gauge`. */
  readonly label: string;
  /** The Slide places the gauge, such as at its right edge. */
  readonly className?: string;
}

/** The five zone colours from the Surface down, the current one marked; decoration only. */
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

/**
 * The slim depth gauge the Title slide and every section slide show at their right edge (design guide, Iceberg): the
 * five zone colours as one thin strip from the Surface down, the current zone's segment marked, and only that zone
 * named beside it in its plain word, a button whose popover gives the depth and the ocean term, like a page Slide's
 * zone label. No Section tiles: the table of contents names the Sections. The strip is decoration; assistive tech
 * reads the gauge's name and the zone's. The gauge's own box is the current zone's mark: the caller places that point,
 * and the strip hangs above and below it by depth, so the name sits in the same place on every Slide.
 */
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
