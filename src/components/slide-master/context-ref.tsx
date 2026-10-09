import { CONTEXT_REF_ATTR } from '@/lib/context-link.pure';
import type { ReactNode } from 'react';

/*
 * The phrase underline grows from the left on hover and focus. Under reduced
 * motion it simply shows. In print the button is plain text (FE-010 §2).
 */
const PHRASE =
  'underline decoration-dotted decoration-1 underline-offset-4 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-[position:0_100%] bg-no-repeat transition-[background-size] duration-300 group-hover/ref:bg-[length:100%_1.5px] group-focus-visible/ref:bg-[length:100%_1.5px] motion-reduce:transition-none print:no-underline print:bg-none';
const BUTTON =
  'group/ref inline cursor-pointer rounded-sm p-0 text-left align-baseline focus-visible:outline-2 focus-visible:outline-offset-2 print:cursor-auto';

/** The underlined phrase: a native button the drawer's delegated listener hears (FE-010 §4). */
function RefButton({ note, label, children }: { note: string; label: string; children: ReactNode }) {
  return (
    <button type="button" {...{ [CONTEXT_REF_ATTR]: note }} className={BUTTON}>
      <span className={PHRASE}>{children}</span>
      <span className="sr-only"> ({label})</span>
    </button>
  );
}

/**
 * A context reference (FE-010 §4): a phrase in Slide text that names one
 * Speaker note of its Slide, by slug. The drawer finds the note inside the
 * Slide that holds the phrase, so it carries no id. Its wrapper is also the
 * target named after the note, so a note may point at its own phrase. It is
 * only the underlined phrase, with no number. Rendered on the server: without
 * JavaScript the phrase still reads, and print shows it as plain text. A Slide
 * reaches it through its kit's `ref`.
 */
export function ContextRef(props: {
  note: string;
  /** Said to assistive tech after the phrase, e.g. `opens speaker note`. */
  label: string;
  children: ReactNode;
}) {
  return (
    <span data-target={props.note} className="rounded-sm">
      <RefButton note={props.note} label={props.label}>
        {props.children}
      </RefButton>
    </span>
  );
}
