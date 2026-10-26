import type { CSSProperties } from 'react';
import styles from './deal-board.module.css';
import type { DealBracket } from './deal-board.types';

/** The `primary` annotation over the emphasised lane: its label and a drawn arrow bending down into the lane. */
export function Annotation({ text }: { text: string }) {
  return (
    <div data-deal="annotation" className={styles.annotationRow}>
      <p className={styles.annotation}>
        <span className="pb-1 font-mono text-caption font-semibold tracking-widest text-primary uppercase">{text}</span>
        <svg viewBox="0 0 80 48" className="w-16 flex-none overflow-visible" aria-hidden="true">
          <path
            data-deal="annotation-stroke"
            d="M70 6 C 70 30, 50 40, 20 42"
            pathLength={1}
            className="fill-none stroke-primary"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M30 34 L18 42 L30 48"
            className="fill-none stroke-primary"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </p>
    </div>
  );
}

/** The dashed flow arrow under the lanes, from a name on the list to a signed contract. */
export function Ends({ ends: [first, last] }: { ends: readonly [string, string] }) {
  return (
    <div data-deal="ends" className="flex flex-col gap-2">
      <svg viewBox="0 0 1100 16" preserveAspectRatio="none" className="h-4 w-full" aria-hidden="true">
        <g className="fill-none stroke-muted-foreground" strokeWidth="2" strokeLinejoin="round">
          <path d="M4 8 H1086" strokeDasharray="8 6" vectorEffect="non-scaling-stroke" />
          <path d="M1078 2 L1094 8 L1078 14" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
      <p className="flex justify-between gap-4 font-mono text-caption text-muted-foreground">
        <span>{first}</span>
        <span className="text-right">{last}</span>
      </p>
    </div>
  );
}

/** The label under the emphasised lane and the bracket under the lanes sales works. */
export function Bracket({ bracket, emphasis }: { bracket: DealBracket; emphasis: number }) {
  return (
    <>
      <p
        data-deal="bracket"
        style={{ '--n': emphasis } as CSSProperties}
        className={`${styles.stage} text-center font-mono text-caption font-semibold tracking-widest text-balance text-primary uppercase`}
      >
        {bracket.stage}
      </p>
      <div
        style={{ '--from': bracket.from, '--to': bracket.to + 1 } as CSSProperties}
        className={`${styles.bracket} flex flex-col gap-1`}
      >
        <svg viewBox="0 0 400 20" preserveAspectRatio="none" className="h-4 w-full" aria-hidden="true">
          <path
            d="M2 2 V10 Q2 16 8 16 H392 Q398 16 398 10 V2"
            className="fill-none stroke-muted-foreground"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <p className="text-center font-mono text-caption tracking-widest text-balance text-muted-foreground uppercase">
          {bracket.label}
        </p>
      </div>
    </>
  );
}
