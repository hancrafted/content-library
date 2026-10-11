'use client';

import { useSlideZone } from '@/hooks/use-slide-zone';
import { cn } from '@/lib/utils';
import { Blocks, Compass, Layers, Orbit, Sparkles, Waypoints, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import {
  GRID_2X3_CELLS,
  GRID_2X3_TONES,
  isRevealed,
  staggerDelayMs,
  type Grid2x3Cell,
  type Grid2x3Tone,
} from './grid-2x3.pure';

const ICONS: Record<Grid2x3Cell, LucideIcon> = {
  c1: Blocks,
  c2: Compass,
  c3: Sparkles,
  c4: Layers,
  c5: Orbit,
  c6: Waypoints,
};

const TONE_CLASSES: Record<Grid2x3Tone, { card: string; chip: string }> = {
  machine: { card: 'bg-machine/10 hover:bg-machine/15', chip: 'bg-machine' },
  human: { card: 'bg-human/10 hover:bg-human/15', chip: 'bg-human' },
  ai: { card: 'bg-ai/10 hover:bg-ai/15', chip: 'bg-ai' },
};

type Grid2x3Copy = Record<Grid2x3Cell, { title: string; caption: string }>;

/** One filled tonal card: icon chip, then title and caption. Hover lifts it; it is not a control. */
function Card({ cell, title, caption }: { cell: Grid2x3Cell; title: string; caption: string }) {
  const Icon = ICONS[cell];
  const tone = TONE_CLASSES[GRID_2X3_TONES[cell]];
  return (
    <article
      aria-labelledby={`grid-2x3-${cell}`}
      className={cn(
        'flex h-full flex-col gap-(--grid-2x3-gap) rounded-3xl p-(--grid-2x3-gap) transition-[translate,box-shadow,background-color] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        tone.card,
      )}
    >
      <span aria-hidden className={cn('grid size-11 place-items-center rounded-2xl text-background', tone.chip)}>
        <Icon className="size-5" strokeWidth={2.25} />
      </span>
      <div className="mt-auto">
        <h4 id={`grid-2x3-${cell}`} className="text-lg font-semibold tracking-tight text-balance text-foreground">
          {title}
        </h4>
        <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{caption}</p>
      </div>
    </article>
  );
}

/**
 * Six filled tonal cards in 2 rows × 3 columns (2 then 1 column on narrower screens), one gap token for gap and padding.
 * The cells stagger-fade in once when the Slide first becomes `active`; under reduced motion they are simply there.
 */
export function Grid2x3({ copy }: { copy: Grid2x3Copy }) {
  const zone = useSlideZone();
  const [revealed, setRevealed] = useState(false);
  if (!revealed && isRevealed(revealed, zone)) setRevealed(true);
  return (
    <ul
      data-revealed={revealed}
      className="grid grid-cols-1 gap-(--grid-2x3-gap) [--grid-2x3-gap:--spacing(5)] sm:grid-cols-2 md:[--grid-2x3-gap:--spacing(6)] lg:grid-cols-3"
    >
      {GRID_2X3_CELLS.map((cell, index) => (
        <li
          key={cell}
          style={{ transitionDelay: `${staggerDelayMs(index)}ms` }}
          className={cn(
            'motion-safe:transition-[opacity,translate] motion-safe:duration-500 motion-safe:ease-out',
            !revealed && 'motion-safe:translate-y-4 motion-safe:opacity-0',
          )}
        >
          <Card cell={cell} {...copy[cell]} />
        </li>
      ))}
    </ul>
  );
}
