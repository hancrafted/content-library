import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './board-arrow.module.css';

export interface BoardArrowProps {
  direction: 'left' | 'right';
  /** A pill centred on the shaft; without one the arrow is decoration and hidden from assistive tech. */
  label?: ReactNode;
  /** A path not taken yet: a dashed shaft, the head stays solid. */
  dashed?: boolean;
  target?: TargetProps;
  /** A `text-*` class recolours head, shaft and label pill together; layout classes place it. */
  className?: string;
  /** Carries `--i` for a motion. */
  style?: CSSProperties;
}

function Head() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 20" className={styles.head} fill="currentColor">
      <path d="M16 0 L0 10 L16 20 Z" />
    </svg>
  );
}

function Shaft({ dashed }: { dashed?: boolean }) {
  return (
    <span
      data-arrow-shaft=""
      className={cn(
        'h-2 flex-1 rounded-full',
        dashed ? 'h-0 border-t-2 border-dashed border-current bg-transparent' : 'bg-current',
      )}
    />
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span
      data-arrow-label=""
      className={cn(styles.label, 'rounded-full bg-current px-3 py-1 text-body font-semibold whitespace-nowrap')}
    >
      <span className="text-background">{children}</span>
    </span>
  );
}

/**
 * A drawn stroke with a head, filling the box it is placed in: standalone on a Slide's own layout, or placed by
 * CashflowBoard. Everything is currentColor, so one `text-*` class recolours it. A server part (FE-007 §5.2).
 */
export function BoardArrow({ direction, label, dashed, target, className, style }: BoardArrowProps) {
  return (
    <div
      {...target}
      data-board-arrow=""
      data-direction={direction}
      data-dashed={dashed ? '' : undefined}
      aria-hidden={label === undefined ? true : undefined}
      style={style}
      className={cn(styles.arrow, 'flex items-center text-foreground', className)}
    >
      {direction === 'left' ? <Head /> : null}
      <Shaft dashed={dashed} />
      {direction === 'right' ? <Head /> : null}
      {label === undefined ? null : <Label>{label}</Label>}
    </div>
  );
}
