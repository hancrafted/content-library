import tints from '@/episodes/components/slide-shared/note-tints/note-tints.module.css';
import { cn } from '@/lib/utils';
import type { DealSlot } from './deal-board.pure';
import { checkDealEcho } from './deal-echo.pure';
import { slotOutline } from './deal-slot';

const TILT = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1'] as const;

/** A note on the echo: a blank paper slip, a word on paper, or a square tinted as cash or revenue. */
export interface EchoNote {
  readonly slug: string;
  readonly text?: string;
  readonly tint?: 'cash' | 'revenue';
}

/** A number standing for a lane's notes, in `primary` when it carries the Section's point. */
export interface EchoCount {
  readonly value: string;
  readonly primary?: boolean;
}

/** One stage of the echo: its notes or its count, then its slot, the deal board's dashed slot drawn small. */
export interface EchoLane {
  readonly slug: string;
  readonly notes?: readonly EchoNote[];
  readonly count?: EchoCount;
  readonly slot?: DealSlot;
  /** The one lane that changed on this section slide, ringed in `primary`. */
  readonly ringed?: boolean;
}

export interface DealEchoProps {
  readonly lanes: readonly EchoLane[];
  /** The cycle under every lane: a `primary` bracket and its text. */
  readonly cycle?: string;
}

function Note({ note, index }: { note: EchoNote; index: number }) {
  const tilt = TILT[index % TILT.length];
  if (note.tint) {
    return (
      <span
        data-echo="note"
        data-tint={note.tint}
        className={cn(
          'flex size-12 items-center justify-center text-caption font-semibold text-foreground shadow-sm',
          tints[note.tint],
          tilt,
        )}
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
  const { count, slot } = lane;
  return (
    <li
      data-echo="lane"
      data-ringed={lane.ringed ? 'true' : undefined}
      className={cn(
        'flex min-h-20 flex-wrap content-center items-center justify-center gap-1.5 rounded-lg bg-muted p-2',
        lane.ringed && 'ring-2 ring-primary',
      )}
    >
      {count ? (
        <span className={cn('text-subheading font-semibold', count.primary ? 'text-primary' : 'text-foreground')}>
          {count.value}
        </span>
      ) : null}
      {(lane.notes ?? []).map((note, index) => (
        <Note key={note.slug} note={note} index={index} />
      ))}
      {slot ? <span data-echo="slot" data-kind={slot.kind} className={cn('size-10', slotOutline(slot))} /> : null}
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
 * Title slide's lanes drawn small and unlabelled, in the state that Section brings the pipeline to, at most the one
 * lane that changed ringed. It keeps its own distance below the Slide header. Decoration: hidden from assistive tech,
 * since the Slide's title and caption carry its words.
 */
export function DealEcho({ lanes, cycle }: DealEchoProps) {
  checkDealEcho(lanes);
  return (
    <div
      data-slot="deal-echo"
      aria-hidden="true"
      className="mt-6 flex w-full max-w-3xl flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm"
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
