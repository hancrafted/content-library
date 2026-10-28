'use client';

import { prefersReducedMotion } from '@/shared/hooks/prefers-reduced-motion';
import { useId, type PointerEvent } from 'react';
import { cellNumber, GRID_3X2_CELLS, spotlightPoint, type Grid3x2Cell } from './grid-3x2.pure';

type Grid3x2Copy = Record<Grid3x2Cell, { title: string; caption: string }>;

/** Moves the card's spotlight to the pointer through two CSS variables; under reduced motion the light stays put. */
function trackSpotlight(event: PointerEvent<HTMLElement>) {
  const card = event.currentTarget;
  if (prefersReducedMotion()) return;
  const point = spotlightPoint({ x: event.clientX, y: event.clientY }, card.getBoundingClientRect());
  card.style.setProperty('--grid-3x2-x', `${point.x}px`);
  card.style.setProperty('--grid-3x2-y', `${point.y}px`);
}

/** The light: a 1px ring masked out of a radial gradient centred on the pointer, plus a faint wash inside. */
function Spotlight() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[inherit] border border-transparent bg-[radial-gradient(14rem_circle_at_var(--grid-3x2-x)_var(--grid-3x2-y),var(--color-primary),transparent_70%)] opacity-0 transition-opacity duration-300 motion-reduce:transition-none [mask:linear-gradient(#000_0_0)_padding-box_exclude,linear-gradient(#000_0_0)_border-box] group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(18rem_circle_at_var(--grid-3x2-x)_var(--grid-3x2-y),color-mix(in_oklch,var(--color-primary)_8%,transparent),transparent_70%)] opacity-0 transition-opacity duration-300 motion-reduce:transition-none group-hover:opacity-100"
      />
    </>
  );
}

/** One outlined card: decorative index, title, caption. It reacts to the pointer but is not a control. */
function Card({ index, title, caption }: { index: number; title: string; caption: string }) {
  const id = `grid-3x2-${useId()}`;
  return (
    <article
      aria-labelledby={id}
      onPointerMove={trackSpotlight}
      className="group relative flex h-full flex-col gap-6 rounded-xl border border-border bg-background p-5 shadow-xs [--grid-3x2-x:50%] [--grid-3x2-y:0%] md:p-6"
    >
      <Spotlight />
      <span aria-hidden className="font-mono text-body tracking-widest text-muted-foreground tabular-nums">
        {cellNumber(index)}
      </span>
      <div className="relative mt-auto">
        <h4 id={id} className="text-body font-semibold tracking-tight text-balance text-foreground">
          {title}
        </h4>
        <p className="mt-1 text-body text-pretty text-muted-foreground">{caption}</p>
      </div>
    </article>
  );
}

/**
 * Six outlined cards in 3 rows × 2 columns (one column on phones) on a dotted surface.
 * A spotlight follows the pointer along each card's border; under reduced motion it rests at the top edge.
 */
export function Grid3x2({ copy }: { copy: Grid3x2Copy }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/60 bg-[radial-gradient(var(--color-border)_1px,transparent_1.5px)] bg-size-[18px_18px] p-3 sm:p-6 md:p-8">
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {GRID_3X2_CELLS.map((cell, index) => (
          <li key={cell}>
            <Card index={index} {...copy[cell]} />
          </li>
        ))}
      </ol>
    </div>
  );
}
