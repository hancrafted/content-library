'use client';

import { StoryCard, type StoryCardCopy } from '@/components/landing/story-card';
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
  axes: Record<Who | What, string>;
  spillNote: string;
}

interface StoryMatrixProps {
  cells: MatrixCell[];
  stories: Record<string, StoryCardCopy>;
  labels: MatrixLabels;
  locale: Locale;
}

/** Grid lines at `lg`: one row per who, one column per what; a missing axis spans the whole grid. */
function gridArea(crossing: Partial<Crossing>, stagger = 0): CSSProperties {
  const col = crossing.what ? WHAT.indexOf(crossing.what) + 1 : '1 / -1';
  const row = crossing.who ? WHO.indexOf(crossing.who) + 1 : '1 / -1';
  return { '--col': col, '--row': row, '--stagger': `${stagger}ms` } as CSSProperties;
}

/** Applies `gridArea` only at `lg`, so below it every node falls back into a plain list. */
const ON_GRID = 'lg:[grid-column:var(--col)] lg:[grid-row:var(--row)]';
/** Fade-in on first sight; the stagger delay only applies on the grid, where cells arrive together. */
const FADE_IN =
  'transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none lg:[transition-delay:var(--stagger)]';

interface BandProps {
  area: Partial<Crossing>;
  label: string;
  lit: boolean;
  labelAt: 'row' | 'column';
}

/** A highlighted row or column behind the cards, naming its axis value in the gap above it while lit. */
function Band({ area, label, lit, labelAt }: BandProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none relative -m-2 hidden rounded-3xl bg-foreground/[0.045] transition-opacity duration-200 lg:block',
        ON_GRID,
        !lit && 'opacity-0',
      )}
      style={gridArea(area)}
    >
      <span
        className={cn(
          'absolute -top-3 whitespace-nowrap rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background',
          labelAt === 'row' ? 'left-4' : 'left-1/2 -translate-x-1/2',
        )}
      >
        {label}
      </span>
    </div>
  );
}

function Bands({ lit, labels }: { lit: HighlightedAxes; labels: MatrixLabels }) {
  return (
    <>
      {WHO.map((who) => (
        <Band key={who} area={{ who }} label={labels.axes[who]} lit={lit.who === who} labelAt="row" />
      ))}
      {WHAT.map((what) => (
        <Band key={what} area={{ what }} label={labels.axes[what]} lit={lit.what === what} labelAt="column" />
      ))}
    </>
  );
}

function QuietCrossing({ cell, index, labels }: { cell: MatrixCell; index: number; labels: MatrixLabels }) {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useRevealedOnView(ref);
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'relative z-10 hidden min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border lg:flex',
        ON_GRID,
        FADE_IN,
        revealed === false && 'opacity-0',
      )}
      style={gridArea(cell, index * STAGGER_MS)}
    >
      <span className="text-lg text-muted-foreground/40">+</span>
      {cell.kind === 'spill' && <span className="text-xs text-muted-foreground/70">{labels.spillNote}</span>}
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
  const hover = (on: boolean) => (event: PointerEvent) => {
    if (event.pointerType === 'mouse') matrix.onHover(on ? cell : null);
  };
  return (
    <article
      ref={ref}
      data-story-cell={story.id}
      onPointerEnter={hover(true)}
      onPointerLeave={hover(false)}
      className={cn('relative z-10 flex flex-col gap-2', ON_GRID, FADE_IN, revealed === false && 'opacity-0')}
      style={gridArea(cell, delay)}
    >
      <p className="text-xs text-muted-foreground lg:sr-only">
        {matrix.labels.axes[cell.who]} × {matrix.labels.axes[cell.what]}
      </p>
      <StoryCard story={story} stat={formatStat(value, story.statDecimals, matrix.locale)} />
    </article>
  );
}

/**
 * The 3×2 story matrix: one row per who, one column per what. Below `lg` it is a plain list of story
 * cards, each tagged with its crossing; at `lg` the same nodes sit on the grid, empty crossings appear,
 * and hovering a story lights its row and column and names them.
 */
export function StoryMatrix(props: StoryMatrixProps) {
  const [hovered, setHovered] = useState<Crossing | null>(null);
  const lit = highlightedAxes(hovered);
  const matrix = { ...props, onHover: setHovered };
  return (
    <div
      data-story-matrix
      className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:grid-rows-3 lg:gap-x-4 lg:gap-y-8 lg:pt-4"
    >
      <Bands lit={lit} labels={props.labels} />
      {props.cells.map((cell, index) => {
        const story = cell.kind === 'story' ? props.stories[cell.storyId] : undefined;
        const key = `${cell.who}-${cell.what}`;
        if (!story) return <QuietCrossing key={key} cell={cell} index={index} labels={props.labels} />;
        return <StoryCell key={key} cell={cell} index={index} story={story} matrix={matrix} />;
      })}
    </div>
  );
}
