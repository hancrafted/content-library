'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { nextSpineLevel, SPINE_LEVELS, type SpineLevel } from './spine-stepper.pure';

/** A tiny interactive Canvas element: one button highlights the next level of the spine. Copy it as a starting point for a visualisation. */
export function SpineStepper({ labels, button }: { labels: Record<SpineLevel, string>; button: string }) {
  const [level, setLevel] = useState<SpineLevel>('episode');
  return (
    <div data-slot="spine-stepper" data-level={level} className="flex flex-wrap items-center gap-4">
      <ol className="flex gap-2">
        {SPINE_LEVELS.map((each) => (
          <li
            key={each}
            aria-current={each === level}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm',
              each === level ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground',
            )}
          >
            {labels[each]}
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => setLevel(nextSpineLevel)}
        className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
      >
        {button}
      </button>
    </div>
  );
}
