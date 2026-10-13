import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './four-ways-to-onboard-ai.module.css';

type RingId = 'prompt' | 'context' | 'harness' | 'graph';

interface Ring {
  id: RingId;
  short: string;
  name: string;
  line: string;
  tag?: string;
  target?: { 'data-target': string };
}

interface DisciplineRingsProps {
  task: string;
  figureLabel: string;
  rings: readonly Ring[];
}

/** Each ring's inset from the figure's edge and its stroke: the newest discipline, graph, outermost and dashed. */
const RING_STYLE: Record<RingId, { inset: string; stroke: string }> = {
  prompt: { inset: '36%', stroke: 'border-border' },
  context: { inset: '24%', stroke: 'border-border' },
  harness: { inset: '12%', stroke: 'border-border' },
  graph: { inset: '0%', stroke: 'border-dashed border-muted-foreground' },
};

/** The rings around the task, each with its short name on its stroke at 12 o'clock; the task is a disc at the centre. */
function RingFigure({ task, figureLabel, rings }: DisciplineRingsProps) {
  return (
    <figure aria-label={figureLabel} className="relative aspect-square w-full max-w-[22rem]">
      {rings.map((ring, index) => (
        <div
          key={ring.id}
          aria-hidden
          style={{ inset: RING_STYLE[ring.id].inset, '--i': index + 1 } as CSSProperties}
          className={cn('absolute rounded-full border-2', RING_STYLE[ring.id].stroke, styles.ring)}
        >
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background px-2 text-caption font-medium whitespace-nowrap">
            {ring.short}
          </span>
        </div>
      ))}
      <div
        style={{ inset: '41%', '--i': 0 } as CSSProperties}
        className={`text-caption font-semibold ${cn('absolute grid place-items-center rounded-full bg-primary text-center text-primary-foreground', styles.ring)}`}
      >
        {task}
      </div>
    </figure>
  );
}

/** The key: each ring numbered with its name and one line, and its tag as a dashed pill that echoes its ring. */
function RingKey({ rings }: Pick<DisciplineRingsProps, 'rings'>) {
  return (
    <ol className="space-y-5">
      {rings.map((ring, index) => (
        <li
          key={ring.id}
          {...ring.target}
          style={{ '--i': index + 1 } as CSSProperties}
          className={cn('grid grid-cols-[2rem_1fr]', styles.key)}
        >
          <span aria-hidden className="text-body font-semibold text-muted-foreground tabular-nums">
            {index + 1}
          </span>
          <div>
            <p className="text-body font-semibold">{ring.name}</p>
            <p className="text-caption text-muted-foreground">{ring.line}</p>
            {ring.tag !== undefined && (
              <p className="mt-2 w-fit rounded-full border border-dashed border-border px-2.5 py-0.5 text-caption text-muted-foreground">
                {ring.tag}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * The four disciplines as rings nested around the task, each wrapping the one inside it, beside a key naming each
 * ring with its one line. `rings` run from the task outwards; each ring and key item carries its place as `--i` (the
 * task is 0), so the Slide draws them from the centre out. The two columns open only when the Foreground is 42rem wide.
 */
export function DisciplineRings(props: DisciplineRingsProps) {
  return (
    <div className="@container mt-10">
      <div className="grid gap-10 @2xl:grid-cols-[minmax(0,22rem)_1fr] @2xl:items-center">
        <RingFigure {...props} />
        <RingKey rings={props.rings} />
      </div>
    </div>
  );
}
