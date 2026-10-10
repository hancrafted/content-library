'use client';

import styles from '@/components/landing/fieldnote-sketch.module.css';
import { useRevealedOnView } from '@/hooks/use-revealed-on-view';
import { cn } from '@/lib/utils';
import { useRef, type ReactNode } from 'react';

/** One-shot story motion for the sketch; before it is seen the strokes wait, and the text is never touched. */
export function FieldnoteReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useRevealedOnView(ref);
  return (
    <div
      ref={ref}
      className={cn(styles.sketch, revealed === true && styles.revealed, revealed === false && styles.waiting)}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
