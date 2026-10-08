'use client';

import { useSlideZone } from '@/hooks/use-slide-zone';
import { isPlaying } from '@/lib/slide-zone.pure';
import { useEffect, useState } from 'react';

const CELLS = 8;
const TICK_MS = 400;

/**
 * A looping demo island: a session fills cell by cell, then starts over blank.
 * A good citizen (FE-009 §6): it ticks only while its Slide is `active`, so
 * off-screen it costs nothing, and it resumes where it stopped when the reader
 * returns to the Slide.
 */
export function SessionLoop({ caption }: { caption: string }) {
  const playing = isPlaying(useSlideZone());
  const [filled, setFilled] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setFilled((count) => (count + 1) % (CELLS + 1)), TICK_MS);
    return () => clearInterval(timer);
  }, [playing]);
  return (
    <figure data-slot="session-loop" data-playing={playing} data-filled={filled} className="pb-10">
      <div className="flex gap-2" aria-hidden>
        {Array.from({ length: CELLS }, (_, cell) => (
          <span key={cell} className={cell < filled ? 'size-6 rounded bg-primary' : 'size-6 rounded bg-muted'} />
        ))}
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
