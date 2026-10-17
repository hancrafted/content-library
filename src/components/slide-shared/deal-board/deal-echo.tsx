import { cn } from '@/lib/utils';
import styles from './deal-board.module.css';

const TILT = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1'] as const;

/** A note on the echo: a blank paper slip, a word on paper, or a tinted square for the cash a lane holds. */
export interface EchoNote {
  readonly slug: string;
  readonly text?: string;
  readonly tone?: 'warning' | 'success';
}

/** One stage of the echo: its notes, or one number standing for them, and a dashed slot for money still to come. */
export interface EchoLane {
  readonly slug: string;
  readonly notes?: readonly EchoNote[];
  readonly count?: string;
  readonly slot?: boolean;
  /** The one lane that changed on this section slide, ringed in `primary`. */
  readonly ringed?: boolean;
}

export interface DealEchoProps {
  readonly lanes: readonly EchoLane[];
  /** The cycle under every lane: a `primary` bracket and its text. */
  readonly cycle?: string;
}

const TONE = {
  warning: cn(styles.warningNote, 'justify-center font-semibold'),
  success: styles.successNote,
} as const;

function Note({ note, index }: { note: EchoNote; index: number }) {
  const tilt = TILT[index % TILT.length];
  if (note.tone) {
    return (
      <span
        data-echo="note"
        data-tone={note.tone}
        className={cn('flex size-12 items-center text-caption text-foreground shadow-sm', TONE[note.tone], tilt)}
      >
        {note.text}
      </span>
    );
  }
  return (
    <span
      data-echo="note"
      className={cn('border bg-card text-caption text-foreground shadow-sm', note.text ? 'px-2' : 'h-4 w-8', tilt)}
    >
      {note.text}
    </span>
  );
}

function Lane({ lane }: { lane: EchoLane }) {
  return (
    <li
      data-echo="lane"
      data-ringed={lane.ringed ? 'true' : undefined}
      className={cn(
        'flex min-h-20 flex-wrap content-center items-center justify-center gap-1.5 rounded-lg bg-muted p-2',
        lane.ringed && 'ring-2 ring-primary',
      )}
    >
      {lane.count === undefined ? null : (
        <span className={cn('text-subheading font-semibold', lane.ringed ? 'text-primary' : 'text-foreground')}>
          {lane.count}
        </span>
      )}
      {(lane.notes ?? []).map((note, index) => (
        <Note key={note.slug} note={note} index={index} />
      ))}
      {lane.slot ? (
        <span data-echo="slot" className={cn('size-10 border-2 border-dashed', styles.successSlot)} />
      ) : null}
    </li>
  );
}

/** The cycle under the lanes: one `primary` bracket across all of them and its text. */
function Cycle({ text }: { text: string }) {
  return (
    <div data-echo="cycle" className="flex flex-col gap-1">
      <svg viewBox="0 0 240 14" preserveAspectRatio="none" className="h-3.5 w-full">
        <path
          d="M2 2 V10 H238 V2"
          className="fill-none stroke-primary"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="text-center text-caption font-semibold text-primary">{text}</p>
    </div>
  );
}

/**
 * The deal board's echo on a section slide (the Hero motif of "Why it's never too early to start with sales"): the
 * Title slide's lanes drawn small and unlabelled, in the state that Section brings the pipeline to, the one lane that
 * changed ringed. Decoration: hidden from assistive tech, since the Slide's title and caption carry its words.
 */
export function DealEcho({ lanes, cycle }: DealEchoProps) {
  const ringed = lanes.filter((lane) => lane.ringed).length;
  if (ringed > 1) throw new Error(`The deal echo rings ${ringed} lanes; ring only the one lane that changed.`);
  return (
    <div
      data-slot="deal-echo"
      aria-hidden="true"
      className="flex w-full max-w-3xl flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm"
    >
      <ol role="list" className="grid gap-2" style={{ gridTemplateColumns: `repeat(${lanes.length}, minmax(0, 1fr))` }}>
        {lanes.map((lane) => (
          <Lane key={lane.slug} lane={lane} />
        ))}
      </ol>
      {cycle ? <Cycle text={cycle} /> : null}
    </div>
  );
}
