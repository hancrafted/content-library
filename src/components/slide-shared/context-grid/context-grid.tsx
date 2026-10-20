import { cn } from '@/lib/utils';

/*
 * The /context grid drawn static: a window as a hundred boxes, ten to a row, each box a share of it, coloured by what
 * fills it. The Title slide sets it as the Hero motif and every section slide of ai-attention-span echoes it. Plain
 * props, no words of its own: a Slide hands it its runs of boxes and its label. The cornerstone's Technical view is
 * the live grid; this one is a static server-only motif, no model, chat data or Preset, and draws only the runs it
 * is given.
 */

/** What a box holds: a category of the window, or a lit or dimmed minute of the call. */
export type GridTone = 'instructions' | 'memory' | 'messages' | 'tools' | 'faded' | 'free' | 'buffer' | 'lit' | 'dim';

/** A ring around a run: `point` picks out one box, `span` outlines a block of them. */
export type GridRing = 'point' | 'span';

/** A run of neighbouring boxes in one tone. */
export interface GridRun {
  readonly tone: GridTone;
  readonly count: number;
  readonly ring?: GridRing;
}

export type GridSize = 'lg' | 'md' | 'sm';

export interface ContextGridProps {
  readonly runs: readonly GridRun[];
  readonly size: GridSize;
  /** What the grid shows, for assistive technology: the boxes themselves carry no text. */
  readonly label: string;
  readonly className?: string;
}

const TONE: Record<GridTone, string> = {
  instructions: 'bg-machine',
  memory: 'bg-machine/45',
  messages: 'bg-human',
  // Tool results: the cornerstone's read tint once its Shared visual lands; the success token stands in until then.
  tools: 'bg-(--success)/60',
  faded: 'bg-muted-foreground/25',
  free: 'border border-dashed border-border',
  buffer: 'bg-muted',
  lit: 'bg-primary',
  dim: 'bg-muted-foreground/20',
};

const BOX: Record<GridSize, string> = { lg: 'size-7', md: 'size-4', sm: 'size-2.5' };
const GAP: Record<GridSize, string> = { lg: 'gap-1.5', md: 'gap-1', sm: 'gap-0.5' };

function ringOf(ring: GridRing | undefined, size: GridSize): string | undefined {
  if (ring === 'span') return 'ring-1 ring-primary';
  if (ring === 'point') return cn('ring-2 ring-primary', size !== 'sm' && 'ring-offset-2 ring-offset-card');
  return undefined;
}

/** The cross on a box kept free for summaries. */
function Cross() {
  return (
    <svg viewBox="0 0 10 10" className="size-full" aria-hidden="true">
      <path d="M2 2l6 6M8 2l-6 6" className="fill-none stroke-muted-foreground/60" strokeWidth="1.2" />
    </svg>
  );
}

/** A legend row's swatch in the tone of its boxes. */
export function GridSwatch({ tone }: { tone: GridTone }) {
  return <span className={cn('block size-3 shrink-0 rounded-sm', TONE[tone])}>{tone === 'buffer' && <Cross />}</span>;
}

export function ContextGrid({ runs, size, label, className }: ContextGridProps) {
  const boxes = runs.flatMap((run, index) =>
    Array.from({ length: run.count }, (_, unit) => ({ key: `${index}-${unit}`, run })),
  );
  return (
    <ol className={cn('grid w-fit shrink-0 grid-cols-10', GAP[size], className)} aria-label={label}>
      {boxes.map(({ key, run }) => (
        <li key={key} className={cn('rounded-sm', BOX[size], TONE[run.tone], ringOf(run.ring, size))}>
          {run.tone === 'buffer' && <Cross />}
        </li>
      ))}
    </ol>
  );
}
