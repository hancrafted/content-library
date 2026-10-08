import { CONTEXT_REF_ATTR, type SpeakerNoteItem } from '@/lib/context-drawer.pure';
import { targetAnchor } from '@/lib/episode.pure';
import type { ReactNode } from 'react';
import { checkedNote } from './context-drawer-input.pure';

/*
 * The phrase underline grows from the left on hover and focus. Under reduced
 * motion it simply shows. In print the button is plain text (FE-010 §2).
 */
const PHRASE =
  'underline decoration-dotted decoration-1 underline-offset-4 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-[position:0_100%] bg-no-repeat transition-[background-size] duration-300 group-hover/ref:bg-[length:100%_1.5px] group-focus-visible/ref:bg-[length:100%_1.5px] motion-reduce:transition-none print:no-underline print:bg-none';
const BUTTON =
  'group/ref inline cursor-pointer rounded-sm p-0 text-left align-baseline focus-visible:outline-2 focus-visible:outline-offset-2 print:cursor-auto';

/**
 * A context reference (FE-010 §4): a phrase in Slide text that names one Speaker
 * note. The wrapper carries the id `<slide anchor>--<note>`, so the note's
 * `target` resolves to it; the native button inside is what the drawer's
 * delegated listener hears. It is only the underlined phrase, with no number.
 * Rendered on the server: without JavaScript the phrase still reads, and print
 * shows it as plain text.
 */
export function ContextRef(props: {
  anchor: string;
  notes: readonly SpeakerNoteItem[];
  note: string;
  /** Said to assistive tech after the phrase, e.g. `opens speaker note`. */
  label: string;
  children: ReactNode;
}) {
  checkedNote(props.notes, props.note);
  return (
    <span id={targetAnchor(props.anchor, props.note)} className="rounded-sm">
      <button type="button" {...{ [CONTEXT_REF_ATTR]: props.note }} className={BUTTON}>
        <span className={PHRASE}>{props.children}</span>
        <span className="sr-only"> ({props.label})</span>
      </button>
    </span>
  );
}

/** What `t.rich` calls for a `<ref>` tag: the chunks wrapped in a `ContextRef` to one named note. */
export type ContextRefOf = (
  context: { readonly anchor: string; readonly notes: readonly SpeakerNoteItem[] },
  note: string,
) => (chunks: ReactNode) => ReactNode;

/** Binds the localized label once per Episode render, so a Slide builder writes `ref(ctx, 'note')`. */
export function contextRefOf(label: string): ContextRefOf {
  return (context, note) => (chunks) => (
    <ContextRef anchor={context.anchor} notes={context.notes} note={note} label={label}>
      {chunks}
    </ContextRef>
  );
}
