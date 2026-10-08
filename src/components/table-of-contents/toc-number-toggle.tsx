import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/** Spring with a slight overshoot, so the arc lands rather than stops. */
const SPRING = 'ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-[220ms]';
/** The section number's slot; sections without slides show the bare number in it. */
export const SECTION_NUMBER = '-my-0.5 grid size-9 shrink-0 place-items-center rounded-full font-mono text-[0.7rem]';

interface NumberToggleProps {
  open: boolean;
  controls: string;
  label: string;
  testId: string;
  /** Motion stays off until the first observation has painted. */
  settled: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** Closed: the arc covers the ring's east quarter. Open: it swings to the south one. */
function QuarterArc({ open, settled }: { open: boolean; settled: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute inset-1 rounded-full border-2 border-transparent border-r-current motion-reduce:transition-none',
        settled ? `transition-transform ${SPRING}` : 'transition-none',
        open && 'rotate-90',
      )}
    />
  );
}

/**
 * The section number doubles as the disclosure: a quarter arc on its ring
 * points east while the section is closed and swings south once it opens.
 */
export function NumberToggle(props: NumberToggleProps) {
  return (
    <button
      type="button"
      aria-label={props.label}
      aria-expanded={props.open}
      aria-controls={props.controls}
      data-testid={props.testId}
      className={cn(
        SECTION_NUMBER,
        'relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
      onClick={props.onToggle}
    >
      <span aria-hidden className="absolute inset-1 rounded-full border-2 border-border" />
      <QuarterArc open={props.open} settled={props.settled} />
      <span aria-hidden>{props.children}</span>
    </button>
  );
}
