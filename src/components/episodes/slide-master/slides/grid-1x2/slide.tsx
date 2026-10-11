import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { useId } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

interface HalfProps {
  index: string;
  title: string;
  caption: string;
  side: 'start' | 'end';
}

// One half of the split: the two halves face each other across the hairline (mirrored alignment from md up), and
// hovering one dims the other through the parent `group`. CSS only, so no client widget.
function Half({ index, title, caption, side }: HalfProps) {
  const id = `grid-1x2-${useId()}`;
  const facing = side === 'start' ? 'md:items-end md:text-right md:pr-10' : 'md:items-start md:text-left md:pl-10';
  const accent = side === 'start' ? 'bg-human' : 'bg-machine';
  return (
    <article
      aria-labelledby={id}
      className={`flex min-h-56 flex-col justify-between gap-10 py-8 transition-opacity duration-300 ease-out group-hover:[&:not(:hover)]:opacity-30 motion-reduce:transition-none md:min-h-80 md:py-4 ${facing}`}
    >
      <span aria-hidden className="flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-muted-foreground">
        <span className={`size-2 rounded-full ${accent}`} />
        {index}
      </span>
      <div className="max-w-sm">
        <h4
          id={id}
          className="text-4xl leading-[0.95] font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl"
        >
          {title}
        </h4>
        <p className="mt-4 text-base text-pretty text-muted-foreground">{caption}</p>
      </div>
    </article>
  );
}

// Split comparison: two equal halves divided by a single vertical hairline instead of boxed cards (dividers over
// cards when cards would add noise). Stacks below md, where the hairline turns horizontal.
export const grid1x2 = slide({
  slug: 'grid-1x2',
  messages: { en, de },
  notes: [{ slug: 'layout', target: 'grid' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div
        {...target('grid')}
        className="group mt-10 grid grid-cols-1 divide-y divide-border border-y border-border md:grid-cols-2 md:divide-x md:divide-y-0"
      >
        <Half index="01" side="start" title={t('cells.c1.title')} caption={t('cells.c1.caption')} />
        <Half index="02" side="end" title={t('cells.c2.title')} caption={t('cells.c2.caption')} />
      </div>
    </SlideFrame>
  ),
});
