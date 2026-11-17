import { CONTEXT_REF_ATTR } from '@/shared/lib/context-link.pure';
import type { ReactNode } from 'react';

// decision: FE-010 §2
const PHRASE =
  'underline decoration-dotted decoration-1 underline-offset-4 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-[position:0_100%] bg-no-repeat transition-[background-size] duration-300 group-hover/ref:bg-[length:100%_1.5px] group-focus-visible/ref:bg-[length:100%_1.5px] motion-reduce:transition-none print:no-underline print:bg-none';
const BUTTON =
  'group/ref inline cursor-pointer rounded-sm p-0 text-left align-baseline focus-visible:outline-2 focus-visible:outline-offset-2 print:cursor-auto';

// decision: FE-010 §4
function RefButton({ note, label, children }: { note: string; label: string; children: ReactNode }) {
  return (
    <button type="button" {...{ [CONTEXT_REF_ATTR]: note }} className={BUTTON}>
      <span className={PHRASE}>{children}</span>
      <span className="sr-only"> ({label})</span>
    </button>
  );
}

// decision: FE-010 §4
export function ContextRef(props: { note: string; label: string; children: ReactNode }) {
  return (
    <RefButton note={props.note} label={props.label}>
      {props.children}
    </RefButton>
  );
}
