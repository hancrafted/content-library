import styles from '@/components/episodes/slide-master/parts/grid-1x1.module.css';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('slide-master');

// One feature cell across the whole Foreground: a tall poster tile, title and caption set bottom-left over a drifting
// gradient. Hover lifts it one elevation step; the motion is CSS only, so no client widget.
export const grid1x1 = slide({
  slug: 'grid-1x1',
  notes: [{ slug: 'layout', target: 'grid' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div {...target('grid')} className="mt-10">
        <article
          aria-labelledby="grid-1x1-c1"
          className={`${styles.surface} group relative isolate flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-xl border border-border p-4 shadow-sm transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none sm:p-6 md:min-h-[32rem] md:p-10`}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 transition-colors duration-300 dark:group-hover:bg-white/[0.06] motion-reduce:transition-none"
          />
          <span aria-hidden className="font-mono text-xs tracking-[0.3em] text-muted-foreground tabular-nums">
            01 / 01
          </span>
          <div className="max-w-2xl">
            <h4
              id="grid-1x1-c1"
              className="text-4xl leading-[0.95] font-semibold tracking-tight text-balance text-foreground sm:text-6xl md:text-7xl"
            >
              {t('cells.c1.title')}
            </h4>
            <p className="mt-4 max-w-md text-base text-pretty text-muted-foreground md:text-lg">
              {t('cells.c1.caption')}
            </p>
          </div>
        </article>
      </div>
    </SlideFrame>
  ),
});
