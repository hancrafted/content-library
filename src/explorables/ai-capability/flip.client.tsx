'use client';

import { useMotion } from '@/shared/hooks/use-motion';
import type { ReactNode } from 'react';
import styles from './ai-capability.module.css';

/**
 * One face: what it shows, and over it the stretched button that turns the card, so no positioned content covers the
 * button; a link, a marker or a gloss on the face sits above it (`z-10`). Inert while it faces away.
 */
function Face(props: {
  readonly away: boolean;
  readonly back?: boolean;
  readonly label: string;
  readonly expanded?: boolean;
  readonly onFlip: () => void;
  readonly children: ReactNode;
}) {
  return (
    <div className={`${styles.face} ${props.back ? styles.back : ''} relative`} inert={props.away}>
      {props.children}
      <button
        type="button"
        aria-label={props.label}
        aria-expanded={props.expanded}
        onClick={props.onFlip}
        className="absolute inset-0 z-0 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-(--tone)"
      />
    </div>
  );
}

/**
 * A card that turns over: the front faces the reader until the stretched button turns it, the back shows what the front
 * names. The hidden face is inert, so its link is never reached by Tab while it faces away. The parent owns `flipped`.
 */
export function Flip(props: {
  readonly flipped: boolean;
  readonly onFlip: () => void;
  readonly label: string;
  readonly front: ReactNode;
  readonly back: ReactNode;
  readonly className?: string;
}) {
  const motion = useMotion(props.flipped);
  return (
    <div data-flipped={props.flipped} className={`${styles.flip} relative ${props.className ?? ''}`}>
      <div {...motion} className={styles.inner}>
        <Face away={props.flipped} label={props.label} expanded={props.flipped} onFlip={props.onFlip}>
          {props.front}
        </Face>
        <Face away={!props.flipped} back label={props.label} onFlip={props.onFlip}>
          {props.back}
        </Face>
      </div>
    </div>
  );
}
