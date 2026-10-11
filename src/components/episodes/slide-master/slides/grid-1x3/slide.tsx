import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { useId } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

interface ColumnCopy {
  id: string;
  index: string;
  accent: string;
  title: string;
  caption: string;
}

// One column: its accent stub on the hairline, the numeral, then title and caption; the id labels the column.
function Column({ cell }: { cell: ColumnCopy }) {
  const id = `grid-1x3-${useId()}`;
  return (
    <article aria-labelledby={id} className="group relative border-t border-border pt-8 md:pt-10">
      <span
        aria-hidden
        className={`${cell.accent} absolute -top-px left-0 h-1 w-full origin-left scale-x-[0.18] rounded-full transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-x-100 motion-reduce:transition-none`}
      />
      <span
        aria-hidden
        className="block text-heading leading-none font-normal tracking-tighter text-muted-foreground/50 tabular-nums transition-colors duration-500 group-hover:text-foreground motion-reduce:transition-none"
      >
        {cell.index}
      </span>
      <h4 id={id} className="mt-6 text-subheading font-semibold tracking-tight text-balance text-foreground">
        {cell.title}
      </h4>
      <p className="mt-3 max-w-xs text-body text-pretty text-muted-foreground">{cell.caption}</p>
    </article>
  );
}

// Three feature columns, each on its own hairline: each column carries an oversized numeral, then its title and caption.
// A short accent stub sits on the hairline above each column and runs the full column width on hover. The motion is
// CSS only, so no client widget; under reduced motion the bar jumps.
export const grid1x3 = slide({
  slug: 'grid-1x3',
  messages: { en, de },
  notes: [{ slug: 'layout', target: 'grid' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => {
    const cells = [
      { id: 'c1', index: '01', accent: 'bg-machine', title: t('cells.c1.title'), caption: t('cells.c1.caption') },
      { id: 'c2', index: '02', accent: 'bg-human', title: t('cells.c2.title'), caption: t('cells.c2.caption') },
      { id: 'c3', index: '03', accent: 'bg-ai', title: t('cells.c3.title'), caption: t('cells.c3.caption') },
    ];
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption>{t('caption')}</SlideCaption>
        <div
          {...target('grid')}
          className="mt-10 grid grid-cols-1 gap-y-12 md:grid-cols-3 md:gap-x-10 md:gap-y-0 lg:gap-x-14"
        >
          {cells.map((cell) => (
            <Column key={cell.id} cell={cell} />
          ))}
        </div>
      </SlideFrame>
    );
  },
});
