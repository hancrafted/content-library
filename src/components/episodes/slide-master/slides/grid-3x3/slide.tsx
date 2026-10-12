import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { useId } from 'react';
import styles from './grid-3x3.module.css';
import de from './i18n/de.json';
import en from './i18n/en.json';

const cellIds = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'] as const;
// Each column carries one accent on its coordinate tick, so a column still reads as one after the wall reflows.
const columnTick = ['bg-machine', 'bg-human', 'bg-ai'] as const;

interface TileProps {
  row: number;
  col: number;
  title: string;
  caption: string;
}

// One 4:3 dashboard tile: a mono row·column coordinate top-left, a small title and a two-line caption at the bottom.
// Tiles alternate background and muted like a checkerboard; hover scales the tile a hair above its neighbours.
function Tile({ row, col, title, caption }: TileProps) {
  const id = `grid-3x3-${useId()}`;
  const tone = (row + col) % 2 === 0 ? 'bg-background' : 'bg-muted dark:bg-muted/50';
  return (
    <article
      data-row={row}
      data-col={col}
      aria-labelledby={id}
      className={`${tone} relative flex aspect-[4/3] flex-col justify-between p-4 transition-[scale,background-color,box-shadow] duration-200 ease-out hover:z-10 hover:scale-[1.03] hover:bg-background hover:shadow-lg hover:ring-1 hover:ring-machine/50 motion-reduce:transition-none motion-reduce:hover:scale-100 md:p-5`}
    >
      <span aria-hidden className="font-mono text-body tracking-[0.2em] text-muted-foreground tabular-nums">
        <span className={`${columnTick[col - 1]} mr-2 inline-block h-2.5 w-0.5 align-[-1px]`} />
        {`R${row}·C${col}`}
      </span>
      <div>
        <h4 id={id} className="text-body font-semibold tracking-tight text-foreground">
          {title}
        </h4>
        <p className="mt-1 line-clamp-2 text-body text-pretty text-muted-foreground">{caption}</p>
      </div>
    </article>
  );
}

// A dense 3 × 3 tile wall on a hairline grid, collapsing 3 → 2 → 1 columns with each tile keeping its 4:3 shape.
// Hovering a tile lights its row and column (the crosshair, CSS `:has()` in its CSS module), so no client widget.
export const grid3x3 = slide({
  slug: 'grid-3x3',
  messages: { en, de },
  notes: [{ slug: 'layout', target: 'grid' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div
        {...target('grid')}
        className={`${styles.wall} mt-10 grid grid-cols-1 gap-px overflow-clip rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3`}
      >
        {cellIds.map((cellId, index) => (
          <Tile
            key={cellId}
            row={Math.floor(index / 3) + 1}
            col={(index % 3) + 1}
            title={t(`cells.${cellId}.title`)}
            caption={t(`cells.${cellId}.caption`)}
          />
        ))}
      </div>
    </SlideFrame>
  ),
});
