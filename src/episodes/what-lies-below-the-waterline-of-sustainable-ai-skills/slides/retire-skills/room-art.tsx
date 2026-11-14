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

/*
 * The drawing lifted from the approved Spec's Option 25b (feedback 3, decision 46): the night wall, each sheet's
 * faceted paper with its clipboard clip or pin, the archive crate with the retired cards standing in it, and the
 * porthole's rim and the water it shows. Facets keep the Spec's numbers; their tones are this Slide's tokens in
 * `retire.module.css`. The pilot, the console and the robot stay the shared figures; the sheets' words stay real text.
 * The Spec's flat paper shadows (`drop`) stay out: the Episode draws no drop shadows (feedback 2, decision 19).
 */

/** The Spec's room, 1000 by 590, stretched to the Scene's 1200 by 800 drawing. */
const ROOM_STRETCH = `scale(${1200 / 1000} ${800 / 590})`;

function Facets({ facets }: { readonly facets: readonly Facet[] }) {
  return facets.map(([tone, d]) => <path key={`${tone} ${d}`} data-tone={tone} d={d} />);
}

/** The night wall over the whole Scene, in the Scene's own drawing. */
export function NightWall() {
  return (
    <g aria-hidden data-room-art transform={ROOM_STRETCH} className={styles.art}>
      <Facets facets={NIGHT} />
    </g>
  );
}

export type Sheet = 'before' | 'log' | 'after';

const SHEETS: Record<Sheet, { readonly box: string; readonly paper: readonly Facet[] }> = {
  before: { box: BEFORE_BOX, paper: BEFORE_PAPER },
  log: { box: LOG_BOX, paper: LOG_PAPER },
  after: { box: AFTER_BOX, paper: AFTER_PAPER },
};

/** A sheet's faceted paper, stretched to the HTML sheet it backs, with its clip or its pin above the top edge. */
export function SheetPaper({ sheet }: { readonly sheet: Sheet }) {
  const { box, paper } = SHEETS[sheet];
  const hold =
    sheet === 'after' ? (
      <svg viewBox={PIN_BOX} className={cn(styles.art, 'absolute -top-1.5 left-1/2 size-3.5 -translate-x-1/2')}>
        <Facets facets={PIN} />
      </svg>
    ) : (
      <svg viewBox={CLIP_BOX} className={cn(styles.art, 'absolute -top-5 left-1/2 h-10 w-17 -translate-x-1/2')}>
        <Facets facets={CLIP} />
      </svg>
    );
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <svg viewBox={box} preserveAspectRatio="none" className={cn(styles.art, 'absolute inset-0 size-full')}>
        <Facets facets={paper} />
      </svg>
      {hold}
    </span>
  );
}

/**
 * The archive crate: the retired cards standing in it, each dropping in at its turn, in front of them the crate's
 * planks and the label's paper; the label's words sit over the paper.
 */
export function CrateArt({ label }: { readonly label: ReactNode }) {
  return (
    <div className="relative aspect-[266/147] w-full">
      <svg aria-hidden viewBox={CRATE_BOX} className={cn(styles.art, 'absolute inset-0 size-full')}>
        <Facets facets={CRATE_BACK} />
        {RETIRED_CARDS.map((card, n) => (
          <g key={card[0]?.[1]} className={styles.drop} style={{ '--n': n } as CSSProperties}>
            <Facets facets={card} />
          </g>
        ))}
        <Facets facets={CRATE_FRONT} />
      </svg>
      {/* The label's paper, from 375, 426 to 575, 498 in the crate's box. */}
      <div className="absolute top-[41.5%] left-[9.4%] flex h-[49%] w-[75.2%] flex-col items-center justify-center text-center">
        {label}
      </div>
    </div>
  );
}

/** The porthole onto the Abyss: the water it shows, clipped to the glass, the robot inside, and the rim over it. */
export function PortholeArt({ clipId, robot }: { readonly clipId: string; readonly robot: ReactNode }) {
  return (
    <g aria-hidden className={styles.art}>
      <clipPath id={clipId}>
        <circle cx={PORTHOLE.x} cy={PORTHOLE.y} r={PORTHOLE.r} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <Facets facets={PORT_SEA} />
        {robot}
      </g>
      <Facets facets={PORT_RIM} />
    </g>
  );
}
