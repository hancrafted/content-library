import type { ReactNode } from 'react';
import styles from './stages-of-sale.module.css';

/** A paper note in a lane: a step and title with a line of text, a list, chips or a signature; a title alone is a strip. */
export interface StageNote {
  slug: string;
  step?: string;
  title: string;
  text?: ReactNode;
  kind?: 'neutral' | 'cash';
  /** The small mono word over a cash note's title. */
  kindLabel?: string;
  list?: { slug: string; company: string; contact: string }[];
  chips?: string[];
  signature?: string;
}

/** One stage as a lane under a dark pill; `primary` rings it, `faint` dashes it as the wait after the sale. */
export interface Lane {
  slug: string;
  label: string;
  span: 3;
  emphasis?: 'primary' | 'faint';
  notes: StageNote[];
  footnote?: string;
  target?: string;
}

const TILT = ['-rotate-1', 'rotate-1', 'rotate-2', '-rotate-2'] as const;

/** The strip of tape on a Leads note, or the pin on any other full note. */
function Fastener({ tape, index }: { tape: boolean; index: number }) {
  return tape ? (
    <span
      aria-hidden="true"
      className={`absolute -top-3 left-1/2 h-5 w-14 -translate-x-1/2 bg-muted-foreground/20 ${index % 2 ? '-rotate-3' : 'rotate-2'}`}
    />
  ) : (
    <span
      aria-hidden="true"
      className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-foreground/70 shadow-sm"
    />
  );
}

/** The invented lead list: company left, contact right, dashed rules between. */
function LeadList({ list }: { list: NonNullable<StageNote['list']> }) {
  return (
    <ul role="list" className="mt-3 flex flex-col text-caption text-foreground">
      {list.map((row) => (
        <li
          key={row.slug}
          className="flex flex-wrap justify-between gap-x-2 border-b border-dashed border-border py-1 last:border-b-0"
        >
          <span>{row.company}</span>
          <span className="text-muted-foreground">{row.contact}</span>
        </li>
      ))}
    </ul>
  );
}

/** The ways to make first contact, as outlined chips. */
function Chips({ chips }: { chips: string[] }) {
  return (
    <ul role="list" className="mt-3 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li key={chip} className="rounded-full border border-foreground/30 px-3 py-0.5 text-caption text-foreground">
          {chip}
        </li>
      ))}
    </ul>
  );
}

/** A drawn signature on a line, its word under it. */
function Signature({ label }: { label: string }) {
  return (
    <>
      <svg viewBox="0 0 200 50" className="mt-4 w-full" aria-hidden="true">
        <path
          d="M8 34 C 20 6, 34 6, 30 30 C 28 44, 46 16, 58 26 C 68 34, 74 18, 86 24 C 98 30, 108 12, 124 22 C 136 30, 150 26, 168 18"
          className="fill-none stroke-foreground"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M4 44 H196" className="fill-none stroke-muted-foreground" strokeWidth="1" />
      </svg>
      <p className="font-mono text-caption text-muted-foreground">{label}</p>
    </>
  );
}

/** The cash at the end of the wait: a yellow note with its kind, its title and when it arrives. */
function CashNote({ note, tilt }: { note: StageNote; tilt: string }) {
  return (
    <li className={`${styles.cash} mt-auto p-4 shadow-md ${tilt}`}>
      <p className="font-mono text-caption text-foreground/70 uppercase">{note.kindLabel}</p>
      <p className="text-body font-semibold text-foreground">{note.title}</p>
      {note.text ? <p className="text-caption text-muted-foreground">{note.text}</p> : null}
    </li>
  );
}

/** A note with a title alone, as a strip: paper, or dashed in the faint lane. */
function Strip({ note, tilt, faint }: { note: StageNote; tilt: string; faint: boolean }) {
  const strip = faint
    ? 'border border-dashed border-border bg-card/60 px-4 py-3 text-caption text-muted-foreground'
    : 'bg-card px-4 py-2.5 text-caption font-medium text-foreground shadow-md';
  return <li className={`${strip} ${tilt}`}>{note.title}</li>;
}

/** A full note: fastened, its step and title, a line of text and whatever it carries. */
function FullNote({ note, index, tilt, tape }: { note: StageNote; index: number; tilt: string; tape: boolean }) {
  return (
    <li className={`relative bg-card p-4 shadow-md ${tilt}`}>
      <Fastener tape={tape} index={index} />
      {note.step ? <p className="font-mono text-caption text-muted-foreground">{note.step}</p> : null}
      <p className="text-body font-semibold text-foreground">{note.title}</p>
      {note.text ? <p className="mt-1 text-caption text-muted-foreground">{note.text}</p> : null}
      {note.list ? <LeadList list={note.list} /> : null}
      {note.chips ? <Chips chips={note.chips} /> : null}
      {note.signature ? <Signature label={note.signature} /> : null}
    </li>
  );
}

/** One note of a lane, drawn by what it carries. */
export function Note({ note, index, lane }: { note: StageNote; index: number; lane: Lane }) {
  const tilt = TILT[index % TILT.length];
  if (note.kind === 'cash') return <CashNote note={note} tilt={tilt} />;
  if (note.text === undefined && note.step === undefined) {
    return <Strip note={note} tilt={tilt} faint={lane.emphasis === 'faint'} />;
  }
  return <FullNote note={note} index={index} tilt={tilt} tape={lane.emphasis === 'primary'} />;
}
