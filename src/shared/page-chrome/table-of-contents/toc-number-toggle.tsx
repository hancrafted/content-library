import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

const SPRING = 'ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-[220ms]';
export const SECTION_NUMBER =
  'grid size-8 shrink-0 place-items-center rounded-full text-caption leading-none tabular-nums';

interface NumberToggleProps {
  open: boolean;
  controls: string;
  label: string;
  testId: string;
  settled: boolean;
  onToggle: () => void;
  children: ReactNode;
}

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
