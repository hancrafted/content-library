import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { cn } from '@/lib/utils';
import { useId } from 'react';
import { GridBentoLoop } from './grid-bento-loop.client';
import styles from './grid-bento.module.css';
import { BENTO_TILES, type GridBentoCell } from './grid-bento.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

// Literal span classes per tile, so Tailwind sees them; the footprints themselves live in `BENTO_TILES`.
const SPAN: Record<GridBentoCell, string> = {
  c1: 'sm:col-span-2 sm:row-span-2',
  c2: 'sm:col-span-2',
  c3: '',
  c4: 'sm:row-span-2',
  c5: '',
  c6: 'sm:col-span-2',
};

// A small accent mark per supporting tile; the lead carries the gradient instead.
const MARK: Record<GridBentoCell, string> = {
  c1: '',
  c2: 'bg-machine',
  c3: 'bg-human',
  c4: 'bg-ai',
  c5: 'bg-foreground',
  c6: 'bg-machine',
};

// Hovering a tile lifts it and dims its siblings; the motion is CSS only. Reduced motion keeps the dim, drops the lift.
const TILE =
  'relative isolate flex flex-col overflow-hidden rounded-2xl border border-border p-5 transition-[translate,box-shadow,opacity] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 group-has-[[data-bento-tile]:hover]/bento:[&:not(:hover)]:opacity-60 md:p-6';

// A bento grid on four columns (two from `sm`, one on phones): a 2×2 lead tile with a slowly turning gradient, then
// five supporting tiles of varied spans that pack the grid with no hole (`packTiles` proves it). The lead's gradient
// plays only while the Slide is active and rests under reduced motion.
export const gridBento = slide({
  slug: 'grid-bento',
  messages: { en, de },
  notes: [{ slug: 'layout', target: 'grid' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => {
    const copy: Record<GridBentoCell, { title: string; caption: string }> = {
      c1: { title: t('cells.c1.title'), caption: t('cells.c1.caption') },
      c2: { title: t('cells.c2.title'), caption: t('cells.c2.caption') },
      c3: { title: t('cells.c3.title'), caption: t('cells.c3.caption') },
      c4: { title: t('cells.c4.title'), caption: t('cells.c4.caption') },
      c5: { title: t('cells.c5.title'), caption: t('cells.c5.caption') },
      c6: { title: t('cells.c6.title'), caption: t('cells.c6.caption') },
    };
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption>{t('caption')}</SlideCaption>
        <ul
          {...target('grid')}
          className="group/bento mt-10 grid auto-rows-[minmax(10rem,auto)] grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-4"
        >
          {BENTO_TILES.map(({ cell }, index) => (
            <li key={cell} className={`grid ${SPAN[cell]}`}>
              {cell === 'c1' ? <LeadTile {...copy[cell]} /> : <SupportTile cell={cell} index={index} {...copy[cell]} />}
            </li>
          ))}
        </ul>
      </SlideFrame>
    );
  },
});

/** The 2×2 lead: a large title set bottom-left over the drifting gradient. Not a control. */
function LeadTile({ title, caption }: { title: string; caption: string }) {
  const id = `grid-bento-${useId()}`;
  return (
    <article
      data-bento-tile
      aria-labelledby={id}
      className={cn(TILE, 'min-h-72 justify-end bg-muted md:min-h-0 md:p-8')}
    >
      <GridBentoLoop className={styles.bloom} />
      <h4
        id={id}
        className="max-w-md text-3xl leading-tight font-semibold tracking-tight text-balance text-foreground md:text-5xl"
      >
        {title}
      </h4>
      <p className="mt-3 max-w-sm text-base text-pretty text-foreground/80 md:text-lg">{caption}</p>
    </article>
  );
}

/** A supporting tile: an accent mark and a faint index on top, title and caption at the bottom. Not a control. */
function SupportTile(props: { cell: GridBentoCell; index: number; title: string; caption: string }) {
  const { cell, index, title, caption } = props;
  const id = `grid-bento-${useId()}`;
  return (
    <article data-bento-tile aria-labelledby={id} className={cn(TILE, 'gap-6 bg-background')}>
      <div aria-hidden className="flex items-center justify-between">
        <span className={`h-1.5 w-8 rounded-full ${MARK[cell]}`} />
        <span className="font-mono text-xs tracking-widest text-muted-foreground tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="mt-auto">
        <h4 id={id} className="text-lg font-semibold tracking-tight text-balance text-foreground">
          {title}
        </h4>
        <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{caption}</p>
      </div>
    </article>
  );
}
