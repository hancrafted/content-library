import { ArrowRight } from 'lucide-react';

import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('slide-master');

interface BannerProps {
  id: string;
  index: string;
  title: string;
  caption: string;
}

// One full-width banner row, list-card style: index and title on the left, caption on the right (stacked below md).
// Hover tints the row and slides the arrow in from the left. CSS only, so no client widget.
function Banner({ id, index, title, caption }: BannerProps) {
  return (
    <article
      aria-labelledby={id}
      className="group relative grid grid-cols-1 items-end gap-4 overflow-hidden rounded-2xl bg-background px-5 py-8 ring-1 ring-border transition-colors duration-300 ease-out hover:bg-ai/10 motion-reduce:transition-none sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:gap-10 md:px-10 md:py-12"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 origin-left bg-ai transition-[width] duration-300 ease-out group-hover:w-2 motion-reduce:transition-none"
      />
      <div className="flex items-baseline gap-5">
        <span aria-hidden className="font-mono text-xs tracking-[0.3em] text-muted-foreground tabular-nums">
          {index}
        </span>
        <h4
          id={id}
          className="text-3xl leading-[0.95] font-semibold tracking-tight text-balance text-foreground sm:text-5xl"
        >
          {title}
        </h4>
      </div>
      <p className="max-w-md text-base text-pretty text-muted-foreground md:justify-self-end md:text-right">
        {caption}
      </p>
      <ArrowRight
        aria-hidden
        className="hidden size-8 -translate-x-4 text-ai opacity-0 transition-[translate,opacity] duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none md:block"
      />
    </article>
  );
}

// Two stacked banner rows across the Foreground, read top to bottom like an editorial list.
export const grid2x1 = slide({
  slug: 'grid-2x1',
  notes: [{ slug: 'layout', target: 'grid' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div {...target('grid')} className="mt-10 flex flex-col gap-4">
        <Banner id="grid-2x1-c1" index="01" title={t('cells.c1.title')} caption={t('cells.c1.caption')} />
        <Banner id="grid-2x1-c2" index="02" title={t('cells.c2.title')} caption={t('cells.c2.caption')} />
      </div>
    </SlideFrame>
  ),
});
