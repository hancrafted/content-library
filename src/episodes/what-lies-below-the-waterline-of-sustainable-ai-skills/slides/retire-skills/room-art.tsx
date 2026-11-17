import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import { CRATE_BACK, CRATE_BOX, CRATE_FRONT, PORT_RIM, PORT_SEA, PORTHOLE, RETIRED_CARDS } from './crate-facets';
import styles from './retire.module.css';
import {
  AFTER_BOX,
  AFTER_PAPER,
  BEFORE_BOX,
  BEFORE_PAPER,
  CLIP,
  CLIP_BOX,
  LOG_BOX,
  LOG_PAPER,
  NIGHT,
  PIN,
  PIN_BOX,
  type Facet,
} from './room-facets';

const ROOM_STRETCH = `scale(${1200 / 1000} ${800 / 590})`;

export function NightWall() {
  return (
    <g aria-hidden data-room-art transform={ROOM_STRETCH} className={styles.art}>
      <ToneFacets facets={NIGHT} />
    </g>
  );
}

export type Sheet = 'before' | 'log' | 'after';

const SHEETS: Record<Sheet, { readonly box: string; readonly paper: readonly Facet[] }> = {
  before: { box: BEFORE_BOX, paper: BEFORE_PAPER },
  log: { box: LOG_BOX, paper: LOG_PAPER },
  after: { box: AFTER_BOX, paper: AFTER_PAPER },
};

export function SheetPaper({ sheet }: { readonly sheet: Sheet }) {
  const { box, paper } = SHEETS[sheet];
  const hold =
    sheet === 'after' ? (
      <svg viewBox={PIN_BOX} className={cn(styles.art, 'absolute -top-1.5 left-1/2 size-3.5 -translate-x-1/2')}>
        <ToneFacets facets={PIN} />
      </svg>
    ) : (
      <svg viewBox={CLIP_BOX} className={cn(styles.art, 'absolute -top-5 left-1/2 h-10 w-17 -translate-x-1/2')}>
        <ToneFacets facets={CLIP} />
      </svg>
    );
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <svg viewBox={box} preserveAspectRatio="none" className={cn(styles.art, 'absolute inset-0 size-full')}>
        <ToneFacets facets={paper} />
      </svg>
      {hold}
    </span>
  );
}

export function CrateArt({ label }: { readonly label: ReactNode }) {
  return (
    <div className="relative aspect-[266/147] w-full">
      <svg aria-hidden viewBox={CRATE_BOX} className={cn(styles.art, 'absolute inset-0 size-full')}>
        <ToneFacets facets={CRATE_BACK} />
        {RETIRED_CARDS.map((card, n) => (
          <g key={card[0]?.[1]} className={styles.drop} style={{ '--n': n } as CSSProperties}>
            <ToneFacets facets={card} />
          </g>
        ))}
        <ToneFacets facets={CRATE_FRONT} />
      </svg>
      <div className="absolute top-[41.5%] left-[9.4%] flex h-[49%] w-[75.2%] flex-col items-center justify-center text-center">
        {label}
      </div>
    </div>
  );
}

export function PortholeArt({ clipId, robot }: { readonly clipId: string; readonly robot: ReactNode }) {
  return (
    <g aria-hidden className={styles.art}>
      <clipPath id={clipId}>
        <circle cx={PORTHOLE.x} cy={PORTHOLE.y} r={PORTHOLE.r} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <ToneFacets facets={PORT_SEA} />
        {robot}
      </g>
      <ToneFacets facets={PORT_RIM} />
    </g>
  );
}
