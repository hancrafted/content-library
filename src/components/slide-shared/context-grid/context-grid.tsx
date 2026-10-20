import { cn } from '@/lib/utils';

/*
 * The /context grid drawn static: a window as at most a hundred boxes, ten to a row, each box a share of it, coloured
 * by what fills it. A static server-only motif, no model, chat data or Preset: a Slide hands it its runs of boxes and
 * its label, and it owns no words of its own.
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

/** The most boxes a window holds: one per 1% of it. */
const WINDOW_BOXES = 100;

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

/** One box in its tone, as a grid item or a legend swatch; a box kept free for summaries is crossed. */
function GridBox({ as: Element, tone, className }: { as: 'li' | 'span'; tone: GridTone; className?: string }) {
  return (
    <Element className={cn('rounded-sm', TONE[tone], className)}>
      {tone === 'buffer' && (
        <svg viewBox="0 0 10 10" className="size-full" aria-hidden="true">
          <path d="M2 2l6 6M8 2l-6 6" className="fill-none stroke-muted-foreground/60" strokeWidth="1.2" />
        </svg>
      )}
    </Element>
  );
}

/** A legend row's swatch in the tone of its boxes. */
export function GridSwatch({ tone }: { tone: GridTone }) {
  return <GridBox as="span" tone={tone} className="block size-3 shrink-0" />;
}

/** The grid; runs that add up to more boxes than a window holds are refused, so a miscount fails the build. */
export function ContextGrid({ runs, size, label, className }: ContextGridProps) {
  const boxes = runs.flatMap((run, index) =>
    Array.from({ length: run.count }, (_, unit) => ({ key: `${index}-${unit}`, run })),
  );
  if (boxes.length > WINDOW_BOXES) {
    throw new Error(
      `ContextGrid "${label}" draws ${boxes.length} boxes, more than ${WINDOW_BOXES} boxes a window holds`,
    );
  }
  return (
    <ol className={cn('grid w-fit shrink-0 grid-cols-10', GAP[size], className)} aria-label={label}>
      {boxes.map(({ key, run }) => (
        <GridBox key={key} as="li" tone={run.tone} className={cn(BOX[size], ringOf(run.ring, size))} />
      ))}
    </ol>
  );
}
