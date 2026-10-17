'use client';

import { cn } from '@/lib/utils';
import { Blocks, Compass, Layers, Orbit, Sparkles, Waypoints, type LucideIcon } from 'lucide-react';
import { useId } from 'react';
import { GRID_2X3_CELLS, GRID_2X3_TONES, type Grid2x3Cell, type Grid2x3Tone } from './grid-2x3.pure';

const ICONS: Record<Grid2x3Cell, LucideIcon> = {
  c1: Blocks,
  c2: Compass,
  c3: Sparkles,
  c4: Layers,
  c5: Orbit,
  c6: Waypoints,
};

const TONE_CLASSES: Record<Grid2x3Tone, { card: string; chip: string }> = {
  primary: { card: 'bg-primary/10 hover:bg-primary/15', chip: 'bg-primary' },
  foreground: { card: 'bg-foreground/10 hover:bg-foreground/15', chip: 'bg-foreground' },
};

type Grid2x3Copy = Record<Grid2x3Cell, { title: string; caption: string }>;

/** One filled tonal card: icon chip, then title and caption. `card-hover--raise` lifts it on hover; it is not a control. */
function Card({ cell, title, caption }: { cell: Grid2x3Cell; title: string; caption: string }) {
  const id = `grid-2x3-${useId()}`;
  const Icon = ICONS[cell];
  const tone = TONE_CLASSES[GRID_2X3_TONES[cell]];
  return (
    <article
      aria-labelledby={id}
      className={cn(
        'card-hover card-hover--raise flex h-full flex-col gap-(--grid-2x3-gap) rounded-3xl p-(--grid-2x3-gap) transition-[translate,box-shadow,background-color] duration-300 ease-out motion-reduce:transition-none',
        tone.card,
      )}
    >
      <span aria-hidden className={cn('grid size-11 place-items-center rounded-2xl text-background', tone.chip)}>
        <Icon className="size-5" strokeWidth={2.25} />
      </span>
      <div className="mt-auto">
        <h4 id={id} className="text-body font-semibold tracking-tight text-balance text-foreground">
          {title}
        </h4>
        <p className="mt-1.5 text-body text-pretty text-muted-foreground">{caption}</p>
      </div>
    </article>
  );
}

/** Six filled tonal cards in 2 rows × 3 columns (2 then 1 column on narrower screens), one gap token for gap and padding. */
export function Grid2x3({ copy }: { copy: Grid2x3Copy }) {
  return (
    <ul className="grid grid-cols-1 gap-(--grid-2x3-gap) [--grid-2x3-gap:--spacing(5)] sm:grid-cols-2 md:[--grid-2x3-gap:--spacing(6)] lg:grid-cols-3">
      {GRID_2X3_CELLS.map((cell) => (
        <li key={cell}>
          <Card cell={cell} {...copy[cell]} />
        </li>
      ))}
    </ul>
  );
}
