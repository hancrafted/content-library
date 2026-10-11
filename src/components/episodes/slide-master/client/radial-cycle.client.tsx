'use client';

import { useSlideZone } from '@/hooks/use-slide-zone';

import { useState } from 'react';
import { NowHand, PhaseRing, type PhaseCopy, type PhaseHandlers } from './radial-cycle-ring.client';
import { CYCLE_ITEMS, RING, type CycleItem } from './radial-cycle.pure';

/** The centre disc's width as a share of the face: it fills the ring's hole. */
const DISC_SHARE = `${((2 * (RING.radius - RING.stroke / 2) - 16) / RING.size) * 100}%`;

/** Plays once: the first time the Slide reaches the reading line, the ring draws in. */
function useDrawn(zone: ReturnType<typeof useSlideZone>): boolean {
  const [drawn, setDrawn] = useState(false);
  if (!drawn && zone === 'active') setDrawn(true);
  return drawn;
}

/** A click or focus selects a phase; a hover previews another without losing the selection. */
function useShownPhase(): { shown: CycleItem; handlers: PhaseHandlers } {
  const [selected, setSelected] = useState<CycleItem>(CYCLE_ITEMS[0]);
  const [preview, setPreview] = useState<CycleItem | null>(null);
  return { shown: preview ?? selected, handlers: { onSelect: setSelected, onPreview: setPreview } };
}

/** The shown phase's number, title and caption, inside the ring. */
function CentreDisc({ index, copy }: { index: number; copy: PhaseCopy }) {
  return (
    <div
      aria-hidden="true"
      style={{ width: DISC_SHARE }}
      className="pointer-events-none absolute top-1/2 left-1/2 grid aspect-square -translate-1/2 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm"
    >
      <div
        key={index}
        className="flex max-w-[78%] flex-col items-center gap-1 text-center transition-opacity duration-300 motion-safe:starting:opacity-0"
      >
        <span className="font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground tabular-nums">
          {String(index + 1).padStart(2, '0')} / {String(CYCLE_ITEMS.length).padStart(2, '0')}
        </span>
        <span className="text-xs font-medium text-brand-accent tabular-nums sm:text-sm">{copy.date}</span>
        <p className="text-lg leading-tight font-semibold tracking-tight sm:text-2xl">{copy.title}</p>
        <p className="hidden text-sm leading-snug text-muted-foreground sm:block">{copy.caption}</p>
      </div>
    </div>
  );
}

/** The same phases as plain text for screen readers. */
function PhaseList({ label, items }: { label: string; items: Record<CycleItem, PhaseCopy> }) {
  return (
    <ol aria-label={label} className="sr-only">
      {CYCLE_ITEMS.map((item) => (
        <li key={item}>
          {items[item].date}: {items[item].title}. {items[item].caption}
        </li>
      ))}
    </ol>
  );
}

/** Six phases of a repeating cycle around a clock face; the shown phase pops out and fills the centre. */
export function RadialCycle({ label, items }: { label: string; items: Record<CycleItem, PhaseCopy> }) {
  const zone = useSlideZone();
  const drawn = useDrawn(zone);
  const { shown, handlers } = useShownPhase();
  const index = CYCLE_ITEMS.indexOf(shown);
  return (
    <div data-slot="radial-cycle" data-drawn={drawn} className="mx-auto w-full max-w-[34rem]">
      <div className="relative">
        <svg
          viewBox={`0 0 ${RING.size} ${RING.size}`}
          role="group"
          aria-label={label}
          className="block h-auto w-full overflow-visible"
        >
          <PhaseRing items={items} shown={shown} drawn={drawn} handlers={handlers} />
          <NowHand zone={zone} />
        </svg>
        <CentreDisc index={index} copy={items[shown]} />
      </div>
      <p aria-hidden="true" className="mt-4 text-center text-sm leading-snug text-muted-foreground sm:hidden">
        {items[shown].caption}
      </p>
      <PhaseList label={label} items={items} />
    </div>
  );
}
