import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { useId } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

interface QuadrantCopy {
  id: string;
  index: string;
  title: string;
  caption: string;
  /** Where the title sits: the quadrant's outer corner. */
  place: string;
  /** Where the faint index sits: the inner corner by the origin. */
  indexPlace: string;
  tint: string;
  dot: string;
}

// One quadrant of the matrix; the id labels it.
function Quadrant({ quadrant }: { quadrant: QuadrantCopy }) {
  const id = `grid-2x2-${useId()}`;
  return (
    <article
      data-quadrant={quadrant.id}
      aria-labelledby={id}
      className={`${quadrant.place} ${quadrant.tint} relative flex flex-col rounded-xl border border-border p-5 sm:border-transparent transition-colors duration-300 motion-reduce:transition-none sm:min-h-60 sm:p-6 md:min-h-72 md:p-8`}
    >
      <span
        aria-hidden
        className={`${quadrant.indexPlace} absolute top-4 right-5 font-mono text-body tracking-[0.3em] text-muted-foreground tabular-nums`}
      >
        <span className={`${quadrant.dot} mr-2 inline-block size-1.5 rounded-full align-middle`} />
        {quadrant.index}
      </span>
      <h4 id={id} className="max-w-[16ch] text-subheading font-semibold tracking-tight text-balance text-foreground">
        {quadrant.title}
      </h4>
      <p className="mt-2 max-w-xs text-body text-pretty text-muted-foreground">{quadrant.caption}</p>
    </article>
  );
}

// A consulting quadrant matrix inside an outlined card: an axis cross splits four quadrants, and each quadrant sets its
// title and caption in its outer corner with a faint index in the inner corner by the origin. Hovering a quadrant tints
// it and lights the two axis arms that border it; the motion is CSS only, so no client widget. Below `sm` the quadrants
// stack as outlined cards and the axis cross hides.
export const grid2x2 = slide({
  slug: 'grid-2x2',
  messages: { en, de },
  notes: [{ slug: 'layout', target: 'grid' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => {
    const quadrants = [
      {
        id: 'c1',
        index: '01',
        title: t('cells.c1.title'),
        caption: t('cells.c1.caption'),
        place: 'sm:justify-start sm:text-left',
        indexPlace: 'sm:top-auto sm:right-4 sm:bottom-3',
        tint: 'hover:bg-machine/10 hover:border-machine/40',
        dot: 'bg-machine',
      },
      {
        id: 'c2',
        index: '02',
        title: t('cells.c2.title'),
        caption: t('cells.c2.caption'),
        place: 'sm:items-end sm:justify-start sm:text-right',
        indexPlace: 'sm:top-auto sm:right-auto sm:bottom-3 sm:left-4',
        tint: 'hover:bg-human/10 hover:border-human/40',
        dot: 'bg-human',
      },
      {
        id: 'c3',
        index: '03',
        title: t('cells.c3.title'),
        caption: t('cells.c3.caption'),
        place: 'sm:justify-end sm:text-left',
        indexPlace: 'sm:top-3 sm:right-4',
        tint: 'hover:bg-ai/10 hover:border-ai/40',
        dot: 'bg-ai',
      },
      {
        id: 'c4',
        index: '04',
        title: t('cells.c4.title'),
        caption: t('cells.c4.caption'),
        place: 'sm:items-end sm:justify-end sm:text-right',
        indexPlace: 'sm:top-3 sm:right-auto sm:left-4',
        tint: 'hover:bg-foreground/[0.06] hover:border-foreground/30',
        dot: 'bg-foreground',
      },
    ];
    // Each arm of the axis cross lights in the colour of whichever neighbouring quadrant is hovered.
    const arm =
      'pointer-events-none absolute hidden bg-foreground/15 transition-colors duration-300 motion-reduce:transition-none sm:block';
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption>{t('caption')}</SlideCaption>
        <div
          {...target('grid')}
          className="group/matrix relative mt-10 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-background p-3 sm:auto-rows-fr sm:grid-cols-2 sm:gap-8 sm:p-4"
        >
          <span
            aria-hidden
            className={`${arm} top-0 left-1/2 h-1/2 w-px -translate-x-1/2 group-has-[[data-quadrant=c1]:hover]/matrix:bg-machine group-has-[[data-quadrant=c2]:hover]/matrix:bg-human`}
          />
          <span
            aria-hidden
            className={`${arm} bottom-0 left-1/2 h-1/2 w-px -translate-x-1/2 group-has-[[data-quadrant=c3]:hover]/matrix:bg-ai group-has-[[data-quadrant=c4]:hover]/matrix:bg-foreground`}
          />
          <span
            aria-hidden
            className={`${arm} top-1/2 left-0 h-px w-1/2 -translate-y-1/2 group-has-[[data-quadrant=c1]:hover]/matrix:bg-machine group-has-[[data-quadrant=c3]:hover]/matrix:bg-ai`}
          />
          <span
            aria-hidden
            className={`${arm} top-1/2 right-0 h-px w-1/2 -translate-y-1/2 group-has-[[data-quadrant=c2]:hover]/matrix:bg-human group-has-[[data-quadrant=c4]:hover]/matrix:bg-foreground`}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 z-10 hidden size-3 -translate-1/2 rounded-full border border-foreground/30 bg-background transition-colors duration-300 group-hover/matrix:border-foreground group-hover/matrix:bg-foreground motion-reduce:transition-none sm:block"
          />
          {quadrants.map((quadrant) => (
            <Quadrant key={quadrant.id} quadrant={quadrant} />
          ))}
        </div>
      </SlideFrame>
    );
  },
});
