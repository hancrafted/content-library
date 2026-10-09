'use client';

import styles from '@/components/landing/fieldnote-sketch.module.css';
import { useRevealedOnView } from '@/hooks/use-revealed-on-view';
import { cn } from '@/lib/utils';
import { useRef, type ReactNode } from 'react';

/** Transient, one-shot emphasis on the sketch; the text and final values stay visible. */
export function FieldnoteReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useRevealedOnView(ref);
  return (
    <div ref={ref} className={cn(styles.sketch, revealed === true && styles.revealed)} aria-hidden="true">
      {children}
    </div>
  );
}
