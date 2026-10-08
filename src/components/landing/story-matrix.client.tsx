'use client';

import { StoryCard, type CardVariant, type PairLabels, type StoryCardCopy } from '@/components/landing/story-card';
import { useCountUp } from '@/hooks/use-count-up';
import { useRevealedOnView } from '@/hooks/use-revealed-on-view';
import type { Locale } from '@/lib/locale.pure';
import {
  formatStat,
  highlightedAxes,
  WHAT,
  WHO,
  type Crossing,
  type HighlightedAxes,
  type MatrixCell,
  type What,
  type Who,
} from '@/lib/story-matrix.pure';
import { cn } from '@/lib/utils';
import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';

const STAGGER_MS = 70;

export interface MatrixLabels {
  axes: Record<Who | What | 'whoLabel' | 'whatLabel', string>;
  pair: PairLabels;
  spillNote: string;
}

interface StoryMatrixProps {
  cells: MatrixCell[];
  stories: Record<string, StoryCardCopy>;
  labels: MatrixLabels;
  locale: Locale;
}

/** Grid line of a crossing at `lg`: row 1 and column 1 hold the axis heads. */
function placement(crossing: Partial<Crossing>, extra: CSSProperties = {}): CSSProperties {
  const col = crossing.who ? WHO.indexOf(crossing.who) + 2 : '1 / -1';
  const row = crossing.what ? WHAT.indexOf(crossing.what) + 2 : '1 / -1';
  return { '--col': col, '--row': row, ...extra } as CSSProperties;
}

const PLACED = 'lg:[grid-column:var(--col)] lg:[grid-row:var(--row)]';

function Bands({ lit }: { lit: HighlightedAxes }) {
  const band = 'pointer-events-none hidden rounded-2xl bg-foreground/[0.045] transition-opacity duration-200 lg:block';
  return (
    <>
      {WHO.map((who) => (
        <div
          key={who}
          aria-hidden
          className={cn(band, PLACED, lit.who !== who && 'opacity-0')}
          style={placement({ who })}
        />
      ))}
      {WHAT.map((what) => (
        <div
          key={what}
          aria-hidden
          className={cn(band, PLACED, lit.what !== what && 'opacity-0')}
          style={placement({ what })}
        />
      ))}
    </>
  );
}

const HEAD = 'hidden font-mono text-xs uppercase tracking-wider transition-colors duration-200 lg:block';
const tone = (on: boolean) => (on ? 'text-foreground font-semibold' : 'text-muted-foreground');

function AxisCorner({ labels }: { labels: MatrixLabels }) {
  return (
    <div
      aria-hidden
      className={cn(HEAD, 'self-end pb-3 text-[0.65rem] text-muted-foreground/70', PLACED)}
      style={placement({}, { '--col': 1, '--row': 1 } as CSSProperties)}
    >
      <span className="block">{labels.axes.whoLabel} →</span>
      <span className="block">{labels.axes.whatLabel} ↓</span>
    </div>
  );
}

function AxisHeads({ labels, lit }: { labels: MatrixLabels; lit: HighlightedAxes }) {
  return (
    <>
      <AxisCorner labels={labels} />
      {WHO.map((who) => (
        <div
          key={who}
          className={cn(HEAD, 'self-end px-4 pb-3', PLACED, tone(lit.who === who))}
          style={placement({ who }, { '--row': 1 } as CSSProperties)}
        >
          {labels.axes[who]}
        </div>
      ))}
      {WHAT.map((what) => (
        <div
          key={what}
          className={cn(HEAD, 'self-center pr-3 text-right leading-relaxed', PLACED, tone(lit.what === what))}
          style={placement({ what }, { '--col': 1 } as CSSProperties)}
        >
          {labels.axes[what]}
        </div>
      ))}
    </>
  );
}

const ENTER =
  'transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none lg:[transition-delay:var(--stagger)]';

function QuietCrossing({ cell, index, labels }: { cell: MatrixCell; index: number; labels: MatrixLabels }) {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useRevealedOnView(ref);
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'relative z-10 hidden min-h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 lg:flex',
        cell.kind === 'spill' && 'border-foreground/25',
        PLACED,
        ENTER,
        revealed === false && 'opacity-0',
      )}
      style={placement(cell, { '--stagger': `${index * STAGGER_MS}ms` } as CSSProperties)}
    >
      <span className="font-mono text-lg text-muted-foreground/40">+</span>
      {cell.kind === 'spill' && (
        <span className="absolute bottom-3 font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground/60">
          {labels.spillNote}
        </span>
      )}
    </div>
  );
}

interface StoryCellProps {
  cell: MatrixCell;
  index: number;
  story: StoryCardCopy;
  matrix: StoryMatrixProps & { onHover: (crossing: Crossing | null) => void };
}

function StoryCell({ cell, index, story, matrix }: StoryCellProps) {
  const ref = useRef<HTMLElement>(null);
  const revealed = useRevealedOnView(ref);
  const delay = index * STAGGER_MS;
  const value = useCountUp(story.statValue, revealed, delay);
  const stat = formatStat(value, story.statDecimals, matrix.locale);
  const variant: CardVariant = index % 2 === 0 ? 'stat-first' : 'story-first';
  const hover = (on: boolean) => (event: PointerEvent) => {
    if (event.pointerType === 'mouse') matrix.onHover(on ? cell : null);
  };
  return (
    <article
      ref={ref}
      data-story-cell={story.id}
      onPointerEnter={hover(true)}
      onPointerLeave={hover(false)}
      className={cn('relative z-10 flex flex-col gap-2', PLACED, ENTER, revealed === false && 'scale-[0.97] opacity-0')}
      style={placement(cell, { '--stagger': `${delay}ms` } as CSSProperties)}
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground lg:hidden">
        {matrix.labels.axes[cell.who]} × {matrix.labels.axes[cell.what]}
      </p>
      <StoryCard story={story} stat={stat} pair={matrix.labels.pair} variant={variant} />
    </article>
  );
}

/**
 * The 2×3 story matrix. Below `lg` it is a plain list of story cards, each tagged with its crossing;
 * at `lg` the same nodes are placed on the grid, empty crossings appear, and hovering a story lights its row and column.
 */
export function StoryMatrix(props: StoryMatrixProps) {
  const [hovered, setHovered] = useState<Crossing | null>(null);
  const lit = highlightedAxes(hovered);
  const matrix = { ...props, onHover: setHovered };
  return (
    <div
      data-story-matrix
      className="flex flex-col gap-10 lg:grid lg:grid-cols-[6.5rem_repeat(3,minmax(0,1fr))] lg:grid-rows-[auto_repeat(2,minmax(0,1fr))] lg:gap-3"
    >
      <Bands lit={lit} />
      <AxisHeads labels={props.labels} lit={lit} />
      {props.cells.map((cell, index) => {
        const story = cell.kind === 'story' ? props.stories[cell.storyId] : undefined;
        const key = `${cell.who}-${cell.what}`;
        if (!story) return <QuietCrossing key={key} cell={cell} index={index} labels={props.labels} />;
        return <StoryCell key={key} cell={cell} index={index} story={story} matrix={matrix} />;
      })}
    </div>
  );
}
